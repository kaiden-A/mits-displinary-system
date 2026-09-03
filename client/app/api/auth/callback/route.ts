import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createSessionToken,
  exchangeCodeForTokens,
  extractRoles,
  SESSION_COOKIE,
  verifyIdToken,
} from "@/lib/auth-oidc";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state || searchParams.get("error")) {
    return NextResponse.redirect(new URL("/login?error=access_denied", request.nextUrl));
  }

  const oidcState = JSON.parse(
    request.cookies.get("oidc-state")?.value
      ? decodeURIComponent(request.cookies.get("oidc-state")!.value)
      : "{}"
  ) as { state?: string; nonce?: string; code_verifier?: string };

  if (!oidcState.state || oidcState.state !== state || !oidcState.nonce || !oidcState.code_verifier) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.nextUrl));
  }

  const redirectUri = `${request.nextUrl.origin}/api/auth/callback`;

  let tokens: Awaited<ReturnType<typeof exchangeCodeForTokens>>;
  try {
    tokens = await exchangeCodeForTokens(code, oidcState.code_verifier, redirectUri);
  } catch {
    return NextResponse.redirect(new URL("/login?error=token_exchange_failed", request.nextUrl));
  }

  let claims: Awaited<ReturnType<typeof verifyIdToken>>;
  try {
    claims = await verifyIdToken(tokens.id_token, oidcState.nonce);
  } catch (e) {
    return NextResponse.redirect(
      new URL(`/login?error=${e instanceof Error && e.message === "forbidden_org" ? "forbidden_org" : "invalid_token"}`, request.nextUrl)
    );
  }

  const expiresIn = Math.max(tokens.expires_in || 12 * 60 * 60, 60);
  const roles = extractRoles(claims as Record<string, unknown>);
  const spsmRoles = ["guru_biasa", "guru_disiplin", "pentadbir", "super_admin"];
  const allowedRoles = roles.filter((role) => spsmRoles.includes(role));
  if (!allowedRoles.length) {
    return NextResponse.redirect(new URL("/login?error=forbidden_role", request.nextUrl));
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
  response.cookies.delete("oidc-state");
  return response;
}