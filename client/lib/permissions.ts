import { ROLES, type Session } from "@/lib/auth";
import { ADMIN_ROLES, MANAGER_ROLES, STAFF_ROLES } from "@/lib/roles";

export function hasAny(session: Pick<Session, "roles"> | null, roles: string[]): boolean {
  if (!session) return false;
  return session.roles.some((r) => roles.includes(r));
}

export function isManager(session: Session | null): boolean {
  return hasAny(session, MANAGER_ROLES);
}

export function isAdministrator(session: Session | null): boolean {
  return hasAny(session, ADMIN_ROLES);
}

/** Port of sample canAct — who may perform a workflow action. */
const ACTION_ROLES: Record<string, string[]> = {
  startInvestigation: MANAGER_ROLES,
  confirm: MANAGER_ROLES,
  dismiss: MANAGER_ROLES,
  approveWarning: MANAGER_ROLES,
  rejectWarning: MANAGER_ROLES,
  record: MANAGER_ROLES,
  ack: MANAGER_ROLES,
  prepare: MANAGER_ROLES,
  approve: MANAGER_ROLES,
  sign: ADMIN_ROLES,
  execute: MANAGER_ROLES,
  notify: MANAGER_ROLES,
  meeting: MANAGER_ROLES,
  close: MANAGER_ROLES,
};

export function canAct(session: Pick<Session, "roles"> | null, action: string): boolean {
  const roles = ACTION_ROLES[action];
  return roles ? hasAny(session, roles) : false;
}

/** Port of sample canAccessRoute. */
export function canAccessRoute(session: Session | null, pathname: string): boolean {
  if (!session) return false;
  const view = pathname.split("/")[1] || "dashboard";

  if (session.authType === "pengawas") return view === "kad";
  if (view === "kad") return hasAny(session, [ROLES.superAdmin]);
  if (view === "aduan") return hasAny(session, STAFF_ROLES);
  if (view === "spot-check" || view === "murid" || view === "rekod-b04") return isManager(session);
  if (view === "pengawas-accounts") return isAdministrator(session);
  if (view === "dashboard") return isManager(session);
  if (view === "kes" || view === "katalog" || view === "notifikasi") return session.authType === "staff";
  if (view === "login" || view === "login-pengawas") return false;
  return true;
}
