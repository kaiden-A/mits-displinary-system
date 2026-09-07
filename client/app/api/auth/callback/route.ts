import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createSessionToken,
  exchangeCodeForTokens,
  extractRoles,
  fetchUserinfoRoles,
  SESSION_COOKIE,
  verifyIdToken,
} from "@/lib/auth-oidc";
import { STAFF_ROLES } from "@/lib/roles";

function redirectToLogin(request: NextRequest, error: string) {
  const response = NextResponse.redirect(new URL(`/login?error=${error}`, request.nextUrl));
  response.cookies.delete("oidc-state");
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state || searchParams.get("error")) {
    return redirectToLogin(request, "access_denied");
  }

  const oidcState = JSON.parse(
    request.cookies.get("oidc-state")?.value
      ? decodeURIComponent(request.cookies.get("oidc-state")!.value)
      : "{}"
  ) as { state?: string; nonce?: string; code_verifier?: string };

  if (!oidcState.state || oidcState.state !== state || !oidcState.nonce || !oidcState.code_verifier) {
    return redirectToLogin(request, "invalid_state");
  }

  const redirectUri = `${request.nextUrl.origin}/api/auth/callback`;

  let tokens: Awaited<ReturnType<typeof exchangeCodeForTokens>>;
  try {
    tokens = await exchangeCodeForTokens(code, oidcState.code_verifier, redirectUri);
  } catch {
    return redirectToLogin(request, "token_exchange_failed");
  }

  let claims: Awaited<ReturnType<typeof verifyIdToken>>;
  try {
    claims = await verifyIdToken(tokens.id_token, oidcState.nonce);
  } catch (e) {
    return redirectToLogin(
      request,
      e instanceof Error && e.message === "forbidden_org" ? "forbidden_org" : "invalid_token"
    );
  }

  const expiresIn = Math.max(tokens.expires_in || 12 * 60 * 60, 60);
  const idTokenRoles = extractRoles(claims as Record<string, unknown>);
  const userinfoRoles = await fetchUserinfoRoles(tokens.access_token);
  const roles = [...new Set([...idTokenRoles, ...userinfoRoles])];
  const allowedRoles = roles.filter((role) => STAFF_ROLES.includes(role));
  if (!allowedRoles.length) {
    return redirectToLogin(request, "forbidden_role");
  }

  const sessionToken = await createSessionToken({
    sub: (claims.sub as string) || "",
    name: (claims.name as string) || (claims.preferred_username as string) || "",
    email: (claims.email as string) || "",
    access_token: tokens.access_token,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    roles: allowedRoles,
  });

  const response = NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  response.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn,
  });
  response.cookies.set("id_token_hint", tokens.id_token, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn,
  });
  response.cookies.delete("oidc-state");
  return response;
}