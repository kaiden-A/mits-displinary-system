import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PW_COOKIE } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login-pengawas", request.nextUrl));
  response.cookies.delete(PW_COOKIE);
  return response;
}