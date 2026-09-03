import type { Session } from "@/lib/auth";

export type IconName =
  | "arrowLeft" | "archive" | "bell" | "book" | "calendar" | "check" | "chevronDown" | "chevronRight"
  | "circleCheck" | "circleInfo" | "clock" | "close" | "copy" | "dashboard" | "download" | "eye" | "file" | "filter"
  | "folder" | "key" | "list" | "lock" | "menu" | "more" | "pen" | "plus" | "printer" | "refresh"
  | "search" | "shield" | "star" | "user" | "users" | "warning" | "x";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: IconName;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const management: NavItem[] = [
  { href: "/dashboard", label: "Ringkasan", description: "Tindakan yang perlu diberi perhatian", icon: "dashboard" },
  { href: "/kes", label: "Kes disiplin", description: "Semua kes yang sedang diurus", icon: "folder" },
  { href: "/murid", label: "Murid", description: "Profil dan rekod murid", icon: "users" },
  { href: "/rekod-b04", label: "Rekod B04", description: "Buku rekod disiplin", icon: "archive" },
];

export function navigationFor(session: Pick<Session, "authType" | "roles">): NavGroup[] {
  if (session.authType === "pengawas") return [];
  const roles = new Set(session.roles);
  const groups: NavGroup[] = [];

  if (roles.has("guru_biasa") && !["guru_disiplin", "pentadbir", "super_admin"].some((role) => roles.has(role))) {
    groups.push({ label: "Urusan saya", items: [
      { href: "/aduan", label: "Buat aduan", description: "Laporkan salah laku murid", icon: "pen" },
      { href: "/kes", label: "Aduan saya", description: "Jejak aduan yang dihantar", icon: "folder" },
    ] });
  } else {
    groups.push({ label: "Operasi", items: management });
    groups.push({ label: "Tindakan", items: [
      { href: "/aduan", label: "Buat aduan", description: "Laporkan salah laku murid", icon: "pen" },
      { href: "/spot-check", label: "Spot check", description: "Rekod kesalahan yang ditemui", icon: "search" },
    ] });
  }

  groups.push({ label: "Rujukan", items: [
    { href: "/katalog", label: "Katalog SPSM", description: "Kesalahan dan tindakan", icon: "book" },
    { href: "/notifikasi", label: "Notifikasi", description: "Pemberitahuan sistem", icon: "bell" },
  ] });

  if (roles.has("pentadbir") || roles.has("super_admin")) {
    groups.push({ label: "Pentadbiran", items: [
      { href: "/pengawas-accounts", label: "Akaun pengawas", description: "Urus akaun kiosk", icon: "key" },
    ] });
  }
  return groups;
}

export function navLabel(pathname: string, session: Pick<Session, "authType" | "roles">): string {
  for (const group of navigationFor(session)) {
    const item = group.items.find((candidate) => pathname === candidate.href || pathname.startsWith(`${candidate.href}/`));
    if (item) return item.label;
  }
  return session.authType === "pengawas" ? "Kad Peringatan" : "SPSM";
}
