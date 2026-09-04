// DEV ONLY — local staff login to simulate roles (pentadbir / guru_disiplin / guru_biasa).
// DELETE AFTER TESTING. Production login is via Zitadel OIDC (/login).
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth-oidc";

const API_URL = process.env.API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const body = await request.json();

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/dev/login`, {
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
    return NextResponse.json(data, { status: res.status });
  }

  const data = await res.json();
  const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
  const sessionToken = await createSessionToken({
    sub: `dev:${data.user.email}`,
    name: data.user.name,
    email: data.user.email,
    access_token: data.token,
    expires_at: expiresAt,
    roles: data.user.roles,
  });

  const response = NextResponse.json({ ok: true, user: data.user });
  response.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: data.expires_in,
  });
  return response;
}