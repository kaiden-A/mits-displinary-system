import { ROLES, type Session } from "@/lib/auth";

const MANAGER_ROLES = [ROLES.guruDisiplin, ROLES.pentadbir, ROLES.superAdmin];

export function hasAny(session: Pick<Session, "roles"> | null, roles: string[]): boolean {
  if (!session) return false;
  return session.roles.some((r) => roles.includes(r));
}

export function isManager(session: Session | null): boolean {
  return hasAny(session, MANAGER_ROLES);
}

export function isAdministrator(session: Session | null): boolean {
  return hasAny(session, [ROLES.pentadbir, ROLES.superAdmin]);
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
  sign: [ROLES.pentadbir, ROLES.superAdmin],
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
  if (view === "aduan") return hasAny(session, [ROLES.guruBiasa, ROLES.guruDisiplin, ROLES.pentadbir, ROLES.superAdmin]);
  if (view === "spot-check" || view === "murid" || view === "rekod-b04") return isManager(session);
  if (view === "pengawas-accounts") return isAdministrator(session);
  if (view === "dashboard") return isManager(session);
  if (view === "kes" || view === "katalog" || view === "notifikasi") return session.authType === "staff";
  if (view === "login" || view === "login-pengawas") return false;
  return true;
}

/** Port of sample visibleDocs — document print/edit visibility per role. */
export function visibleDocs(session: Session | null, caseData: { points: number; source: string }): string[] {
  if (!session) return [];
  if (session.authType === "pengawas") return ["b03"];
  if (hasAny(session, [ROLES.guruDisiplin, ROLES.pentadbir, ROLES.superAdmin])) {
    const docs = ["b01", "b04", "kad"];
    const needsB02 = caseData.source === "SPOT_CHECK" || (caseData.source === "COMPLAINT" && caseData.points > 5);
    if (needsB02) docs.splice(1, 0, "b02");
    if (caseData.source === "PREFECT_WARNING") docs.splice(1, 0, "b03");
    if (caseData.points >= 6) {
      docs.push("b05", "b06");
      if (caseData.points >= 21) docs.push("b08");
    }
    return docs;
  }
  if (session.roles.includes(ROLES.guruBiasa)) {
    const docs = ["b01"];
    if (caseData.source === "COMPLAINT" && caseData.points > 5) docs.push("b02");
    return docs;
  }
  return [];
}
