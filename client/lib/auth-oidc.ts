import { SignJWT, jwtVerify, createRemoteJWKSet } from "jose";
import { createHash, randomBytes } from "crypto";

export const SESSION_COOKIE = "session";

const ISSUER = process.env.ZITADEL_ISSUER!;
const CLIENT_ID = process.env.ZITADEL_CLIENT_ID!;
const ALLOWED_ORG_ID = process.env.ZITADEL_ALLOWED_ORG_ID!;
const PROJECT_ID = process.env.ZITADEL_PROJECT_ID;
const SESSION_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

interface Discovery {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint: string;
  jwks_uri: string;
}

let discoveryPromise: Promise<Discovery> | null = null;

export function getDiscovery(): Promise<Discovery> {
  if (!discoveryPromise) {
    discoveryPromise = fetch(`${ISSUER}/.well-known/openid-configuration`).then((res) =>
      res.json()
    );
  }
  return discoveryPromise;
}

export function generatePKCE() {
  const code_verifier = Buffer.from(randomBytes(32)).toString("base64url");
  const code_challenge = createHash("sha256").update(code_verifier).digest("base64url");
  return { code_verifier, code_challenge };
}

export async function buildAuthorizeUrl(
  redirectUri: string,
  codeChallenge: string,
  state: string,
  nonce: string
) {
  const discovery = await getDiscovery();
  const scopes = [
    "openid",
    "profile",
    "email",
    `urn:zitadel:iam:org:id:${ALLOWED_ORG_ID}`,
    "urn:zitadel:iam:user:resourceowner",
    "urn:zitadel:iam:org:roles",
    "urn:zitadel:iam:org:project:roles",
  ];
  if (PROJECT_ID) {
    scopes.push(
      `urn:zitadel:iam:org:project:id:${PROJECT_ID}:aud`,
      `urn:zitadel:iam:org:project:${PROJECT_ID}:roles`
    );
  }
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${discovery.authorization_endpoint}?${params}`;
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<{ access_token: string; id_token: string; expires_in?: number }> {
  const discovery = await getDiscovery();
  const res = await fetch(discovery.token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function verifyIdToken(idToken: string, nonce: string) {
  const discovery = await getDiscovery();
  const jwks = createRemoteJWKSet(new URL(discovery.jwks_uri));
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: ISSUER,
    algorithms: ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "EdDSA"],
  });
  if (payload.nonce !== nonce) {
    throw new Error("ID token nonce mismatch");
  }
  const orgId = payload["urn:zitadel:iam:user:resourceowner:id"] as string | undefined;
  if (!orgId || orgId !== ALLOWED_ORG_ID) {
    throw new Error("forbidden_org");
  }
  return payload;
}

/** Best-effort role extraction from token claims (Zitadel org + project roles). */
export function extractRoles(payload: Record<string, unknown>): string[] {
  const roles = new Set<string>();

  for (const value of [
    payload["urn:zitadel:iam:org:project:roles"],
    payload["urn:zitadel:iam:org:roles"],
  ]) {
    collectRoleKeys(value, roles);
  }

  // Zitadel may assert per-project claims: urn:zitadel:iam:org:project:{projectId}:roles
  for (const [key, value] of Object.entries(payload)) {
    if (key.startsWith("urn:zitadel:iam:org:project:") && key.endsWith(":roles")) {
      collectRoleKeys(value, roles);
    }
  }

  const groups = payload.groups;
  if (Array.isArray(groups)) {
    groups.forEach((group) => roles.add(String(group)));
  }

  return [...roles];
}

/** Add role keys whose mapping shows the role is granted in the current context. */
function collectRoleKeys(value: unknown, roles: Set<string>): void {
  if (!value || typeof value !== "object") return;
  for (const [role, mapping] of Object.entries(value as Record<string, unknown>)) {
    // Zitadel maps each granted role to the org ids/domains it applies in;
    // roles with empty mappings are not granted in the current context.
    if (mapping && (typeof mapping === "object" || typeof mapping === "string")) {
      roles.add(role);
    }
  }
}

/**
 * Fetch roles from the userinfo endpoint. Zitadel asserts roles there when
 * the project's "Assert Roles on Authentication" is enabled, even if the
 * ID token does not carry them (that requires the app-level "User Roles
 * Inside ID Token" setting).
 */
export async function fetchUserinfoRoles(accessToken: string): Promise<string[]> {
  const discovery = await getDiscovery();
  const res = await fetch(discovery.userinfo_endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return [];
  return extractRoles((await res.json()) as Record<string, unknown>);
}

export async function buildLogoutUrl(postLogoutRedirectUri: string, idTokenHint?: string) {
  const discovery = await getDiscovery();
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    post_logout_redirect_uri: postLogoutRedirectUri,
  });
  if (idTokenHint) params.set("id_token_hint", idTokenHint);
  return `${discovery.end_session_endpoint}?${params}`;
}

export async function createSessionToken(session: {
  sub: string;
  name: string;
  email: string;
  access_token: string;
  expires_at: number;
  roles: string[];
}) {
  return new SignJWT({
    name: session.name,
    email: session.email,
    access_token: session.access_token,
    roles: session.roles,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.sub)
    .setIssuedAt()
    .setExpirationTime(session.expires_at)
    .sign(SESSION_SECRET);
}