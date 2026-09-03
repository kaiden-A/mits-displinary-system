import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      auth_type: session.authType,
      name: session.name,
      email: session.email,
      roles: session.roles,
    },
  });
}