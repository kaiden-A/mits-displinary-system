export const ROLES = {
  guruBiasa: "guru_biasa",
  guruDisiplin: "guru_disiplin",
  pentadbir: "pentadbir",
  superAdmin: "super_admin",
  pengawas: "pengawas",
} as const;

export const STAFF_ROLES: string[] = [ROLES.guruBiasa, ROLES.guruDisiplin, ROLES.pentadbir, ROLES.superAdmin];
export const MANAGER_ROLES: string[] = [ROLES.guruDisiplin, ROLES.pentadbir, ROLES.superAdmin];
export const ADMIN_ROLES: string[] = [ROLES.pentadbir, ROLES.superAdmin];