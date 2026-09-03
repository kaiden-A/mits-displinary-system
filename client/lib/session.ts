import { cookies } from "next/headers";
import { getSessionFromCookies, SESSION_COOKIE, PW_COOKIE, type Session } from "@/lib/auth";

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  return getSessionFromCookies(
    cookieStore.get(SESSION_COOKIE)?.value,
    cookieStore.get(PW_COOKIE)?.value
  );
}

export function getApiToken(session: Session | null): string | null {
  if (!session) return null;
  if (session.authType === "staff") return session.access_token;
  return session.sub; // pengawas token = its own JWT is in the cookie; proxy route re-reads the cookie
}