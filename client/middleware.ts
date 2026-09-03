import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromCookies, SESSION_COOKIE, PW_COOKIE } from "@/lib/auth";
import { canAccessRoute, isManager } from "@/lib/permissions";

export async function middleware(request: NextRequest) {
  const session = await getSessionFromCookies(
    request.cookies.get(SESSION_COOKIE)?.value,
    request.cookies.get(PW_COOKIE)?.value
  );

  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname === "/login-pengawas") {
    if (session) {
      return NextResponse.redirect(new URL(homePath(session), request.url));
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
    return NextResponse.redirect(new URL(homePath(session), request.url));
  }

  return NextResponse.next();
}

function homePath(session: NonNullable<Awaited<ReturnType<typeof getSessionFromCookies>>>): string {
  if (session.authType === "pengawas") return "/kad";
  return isManager(session) ? "/dashboard" : "/aduan";
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}