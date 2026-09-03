import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromCookies, SESSION_COOKIE, PW_COOKIE } from "@/lib/auth";

const API_URL = process.env.API_URL || "http://localhost:8000";

async function handle(request: NextRequest, method: string) {
  const session = await getSessionFromCookies(
    request.cookies.get(SESSION_COOKIE)?.value,
    request.cookies.get(PW_COOKIE)?.value
  );
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const token = session.authType === "staff" ? session.access_token : request.cookies.get(PW_COOKIE)!.value;
  const path = request.nextUrl.pathname.replace(/^\/api\/proxy/, "");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(await request.json().catch(() => ({})));
  }

  try {
    const res = await fetch(`${API_URL}${path}?${request.nextUrl.searchParams.toString()}`, {
      method,
      headers,
      body,
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ detail: "API server unreachable." }, { status: 502 });
  }
}

export async function GET(request: NextRequest) {
  return handle(request, "GET");
}
export async function POST(request: NextRequest) {
  return handle(request, "POST");
}
export async function PATCH(request: NextRequest) {
  return handle(request, "PATCH");
}