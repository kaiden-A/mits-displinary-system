import { jwtVerify } from "jose";

const SESSION_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
const PW_SECRET = new TextEncoder().encode(process.env.APP_SECRET!);

export const SESSION_COOKIE = "session";
export const PW_COOKIE = "pw_session";

export const ROLES = {
  guruBiasa: "guru_biasa",
  pengawas: "pengawas",
  guruDisiplin: "guru_disiplin",
  pentadbir: "pentadbir",
  superAdmin: "super_admin",
} as const;

export interface StaffSession {
  authType: "staff";
  sub: string;
  name: string;
  email: string;
  access_token: string;
  expires_at: number;
  roles: string[];
}

export interface PengawasSession {
  authType: "pengawas";
  sub: string;
  name: string;
  email: string;
  roles: string[];
}

export type Session = StaffSession | PengawasSession;

async function decodeStaff(token: string): Promise<StaffSession | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET, { algorithms: ["HS256"] });
    return {
      authType: "staff",
      sub: (payload.sub as string) || "",
      name: (payload.name as string) || "",
      email: (payload.email as string) || "",
      access_token: (payload.access_token as string) || "",
      expires_at: (payload.exp as number) || 0,
      roles: (payload.roles as string[]) || [],
    };
  } catch {
    return null;
  }
}

async function decodePengawas(token: string): Promise<PengawasSession | null> {
  try {
    const { payload } = await jwtVerify(token, PW_SECRET, { algorithms: ["HS256"] });
    return {
      authType: "pengawas",
      sub: (payload.sub as string) || "",
      name: (payload.name as string) || "",
      email: (payload.email as string) || "",
      roles: ["pengawas"],
    };
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(
  sessionToken: string | undefined,
  pwToken: string | undefined
): Promise<Session | null> {
  if (sessionToken) {
    const staff = await decodeStaff(sessionToken);
    if (staff) return staff;
  }
  if (pwToken) {
    const pw = await decodePengawas(pwToken);
    if (pw) return pw;
  }
  return null;
}

export async function getSessionFromRequest(request: Request): Promise<Session | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );
  return getSessionFromCookies(cookies[SESSION_COOKIE], cookies[PW_COOKIE]);
}