import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PW_COOKIE } from "@/lib/auth";

const API_URL = process.env.API_URL || "http://localhost:8000";
const PW_SESSION_MINUTES = 15;

export async function POST(request: NextRequest) {
  const body = await request.json();

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/pengawas/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Server unavailable." }, { status: 502 });
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const status = res.status === 423 ? 423 : 401;
    return NextResponse.json(data, { status });
  }

  const data = await res.json();
  const response = NextResponse.json({ ok: true, user: data.user, session_minutes: data.session_minutes });
  response.cookies.set(PW_COOKIE, data.token, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: PW_SESSION_MINUTES * 60,
  });
  return response;
}