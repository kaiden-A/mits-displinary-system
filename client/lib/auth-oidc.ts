import { SignJWT, jwtVerify, createRemoteJWKSet } from "jose";
import { createHash, randomBytes } from "crypto";

export const SESSION_COOKIE = "session";

const ISSUER = process.env.ZITADEL_ISSUER!;
const CLIENT_ID = process.env.ZITADEL_CLIENT_ID!;
const ALLOWED_ORG_ID = process.env.ZITADEL_ALLOWED_ORG_ID!;
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
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "openid",
      "profile",
      "email",
      `urn:zitadel:iam:org:id:${ALLOWED_ORG_ID}`,
      "urn:zitadel:iam:user:resourceowner",
    ].join(" "),
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

/** Best-effort role extraction from token claims (Zitadel project roles). */
export function extractRoles(payload: Record<string, unknown>): string[] {
  const roles: string[] = [];
  const claimKeys = [
    `urn:zitadel:iam:org:project:${process.env.ZITADEL_CLIENT_ID}:roles`,
    "urn:zitadel:iam:org:project:roles",
  ];
  for (const key of claimKeys) {
    const value = payload[key];
    if (value && typeof value === "object") {
      roles.push(...Object.keys(value as Record<string, unknown>));
    } else if (Array.isArray(value)) {
      roles.push(...value.map(String));
    }
  }
  return roles;
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