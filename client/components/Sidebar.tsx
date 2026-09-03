"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarProps {
  name: string;
  roles: string[];
  authType: string;
}

const NAV: Record<string, { href: string; label: string; icon: string }[]> = {
  guru_biasa: [
    { href: "/aduan", label: "Buat Aduan", icon: "fa-pen-to-square" },
    { href: "/katalog", label: "Katalog Kesalahan", icon: "fa-book" },
  ],
  pengawas: [{ href: "/kad", label: "Kad Peringatan", icon: "fa-triangle-exclamation" }],
  guru_disiplin: [
    { href: "/dashboard", label: "Papan Pemuka", icon: "fa-gauge-high" },
    { href: "/aduan", label: "Buat Aduan", icon: "fa-pen-to-square" },
    { href: "/murid", label: "Senarai Murid", icon: "fa-users" },
    { href: "/katalog", label: "Katalog Kesalahan", icon: "fa-book" },
  ],
  pentadbir: [
    { href: "/dashboard", label: "Papan Pemuka", icon: "fa-gauge-high" },
    { href: "/aduan", label: "Buat Aduan", icon: "fa-pen-to-square" },
    { href: "/murid", label: "Senarai Murid", icon: "fa-users" },
    { href: "/pengawas-accounts", label: "Akaun Pengawas", icon: "fa-user-shield" },
    { href: "/katalog", label: "Katalog Kesalahan", icon: "fa-book" },
  ],
  super_admin: [
    { href: "/dashboard", label: "Papan Pemuka", icon: "fa-gauge-high" },
    { href: "/aduan", label: "Buat Aduan", icon: "fa-pen-to-square" },
    { href: "/kad", label: "Kad Peringatan", icon: "fa-triangle-exclamation" },
    { href: "/murid", label: "Senarai Murid", icon: "fa-users" },
    { href: "/pengawas-accounts", label: "Akaun Pengawas", icon: "fa-user-shield" },
    { href: "/katalog", label: "Katalog Kesalahan", icon: "fa-book" },
  ],
};

export default function Sidebar({ name, roles, authType }: SidebarProps) {
  const pathname = usePathname();
  const role = roles[0] || "guru_biasa";
  const items = NAV[role] || NAV.guru_biasa;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col z-40 no-print">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-sm shrink-0">
          <i className="fa-solid fa-shield-halved text-lg" />
        </div>
        <div>
          <div className="font-bold leading-tight text-sm">MAAHAD INTEGRASI TAHFIZ SELANGOR</div>
          <div className="text-[11px] text-slate-400">Sistem Pembangunan Sahsiah Murid</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                active ? "bg-emerald-600 text-white shadow" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="text-xs font-semibold truncate">{name}</div>
        <div className="text-[10px] text-slate-500 truncate">
          {authType === "pengawas" ? "Pengawas" : role} ·{" "}
          <a href="/api/auth/logout" className="text-slate-400 hover:text-white underline">
            Log keluar
          </a>
        </div>
      </div>
    </aside>
  );
}