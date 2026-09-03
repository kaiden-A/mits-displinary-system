import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildLogoutUrl, SESSION_COOKIE } from "@/lib/auth-oidc";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const response = NextResponse.redirect(new URL("/login", request.nextUrl));
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete("pw_session");

  if (session?.authType === "staff" && session.sub) {
    const logoutUrl = await buildLogoutUrl(request.nextUrl.origin);
    const logoutResponse = NextResponse.redirect(logoutUrl);
    logoutResponse.cookies.delete(SESSION_COOKIE);
    logoutResponse.cookies.delete("pw_session");
    return logoutResponse;
  }
  return response;
}