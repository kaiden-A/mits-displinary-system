import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromCookies, SESSION_COOKIE, PW_COOKIE } from "@/lib/auth";
import { canAccessRoute } from "@/lib/permissions";

export async function proxy(request: NextRequest) {
  const session = await getSessionFromCookies(
    request.cookies.get(SESSION_COOKIE)?.value,
    request.cookies.get(PW_COOKIE)?.value
  );

  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname === "/login-pengawas") {
    if (session) {
      return NextResponse.redirect(new URL(session.authType === "pengawas" ? "/kad" : "/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/") || pathname === "/" || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (!session) {
    const redirectTarget = pathname === "/kad" ? "/login-pengawas" : "/login";
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  if (!canAccessRoute(session, pathname)) {
    const home = session.authType === "pengawas" ? "/kad" : "/dashboard";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}