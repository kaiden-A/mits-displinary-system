import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildLogoutUrl, SESSION_COOKIE } from "@/lib/auth-oidc";
import { getSessionFromRequest, PW_COOKIE } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const idTokenHint = request.cookies.get("id_token_hint")?.value;

  const clearCookies = (response: NextResponse) => {
    response.cookies.delete(SESSION_COOKIE);
    response.cookies.delete(PW_COOKIE);
    response.cookies.delete("id_token_hint");
    response.cookies.delete("oidc-state");
    return response;
  };

  if (session?.authType === "staff" && session.sub) {
    const logoutUrl = await buildLogoutUrl(request.nextUrl.origin, idTokenHint || undefined);
    return clearCookies(NextResponse.redirect(logoutUrl));
  }

  return clearCookies(NextResponse.redirect(new URL("/login", request.nextUrl)));
}