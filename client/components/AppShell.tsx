"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@/lib/auth";
import { Icon } from "@/components/ui";
import { navigationFor, navLabel } from "@/lib/navigation";

export default function AppShell({ session, children }: { session: Session; children: React.ReactNode }) {
  if (session.authType === "pengawas") return <KioskShell session={session}>{children}</KioskShell>;
  return <StaffShell session={session}>{children}</StaffShell>;
}

function StaffShell({ session, children }: { session: Session; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const groups = navigationFor(session);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", open);
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main-content" className="skip-link">Langkau ke kandungan utama</a>
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] border-r border-brand-800 bg-brand-950 text-white transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold-300/40 bg-brand-700 text-gold-200"><Icon name="shield" size={23} /></div>
              <div className="min-w-0">
                <p className="font-display text-xl font-semibold leading-none text-white">SPSM</p>
                <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.14em] text-brand-200">MITS Selangor</p>
              </div>
              <button type="button" aria-label="Tutup menu" onClick={() => setOpen(false)} className="ml-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-brand-200 hover:bg-white/10 lg:hidden"><Icon name="close" /></button>
            </div>
            <div className="mt-5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold-300">Akaun aktif</p>
              <p className="mt-1 truncate text-sm font-semibold text-white">{session.name}</p>
              <p className="mt-0.5 truncate text-xs text-brand-200">{roleLabel(session.roles)}</p>
              <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-2">
                <p className="min-w-0 flex-1 truncate font-mono text-[10px] text-brand-300" title={`ID pengguna: ${session.sub}`}>ID: {session.sub}</p>
                <button type="button" aria-label="Salin ID pengguna" onClick={() => { void navigator.clipboard.writeText(session.sub); }} className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-brand-300 hover:bg-white/10 hover:text-white"><Icon name="copy" size={13} /></button>
              </div>
            </div>
          </div>
          <nav aria-label="Navigasi utama" className="flex-1 overflow-y-auto px-3 py-5">
            {groups.map((group) => <div key={group.label} className="mb-6 last:mb-0">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-300">{group.label}</p>
              <div className="space-y-1">{group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`group flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors duration-150 ${active ? "bg-gold-500 text-brand-950" : "text-brand-100 hover:bg-white/10 hover:text-white"}`}>
                  <Icon name={item.icon} size={18} className={active ? "text-brand-950" : "text-brand-300 group-hover:text-gold-300"} />
                  <span className="min-w-0 truncate">{item.label}</span>
                  {item.href === "/notifikasi" ? <span className="ml-auto h-2 w-2 rounded-full bg-gold-400" title="Pemberitahuan baharu" /> : null}
                </Link>;
              })}</div>
            </div>)}
          </nav>
          <div className="border-t border-white/10 p-4">
            <a href="/api/auth/logout" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-brand-200 transition-colors hover:bg-danger-800/30 hover:text-white"><Icon name="close" size={18} /> Log keluar</a>
          </div>
        </div>
      </aside>
      {open ? <button type="button" aria-label="Tutup navigasi" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-pointer bg-brand-950/60 lg:hidden" /> : null}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-canvas/95 px-4 backdrop-blur lg:hidden">
        <button type="button" aria-label="Buka menu" onClick={() => setOpen(true)} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-brand-900 hover:bg-brand-50"><Icon name="menu" /></button>
        <div className="text-center"><p className="font-display text-lg font-semibold leading-none text-brand-950">{navLabel(pathname, session)}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-700">SPSM · MITS</p></div>
        <Link href="/notifikasi" aria-label="Buka notifikasi" className="relative flex h-11 w-11 items-center justify-center rounded-lg text-brand-900 hover:bg-brand-50"><Icon name="bell" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold-500" /></Link>
      </header>
      <main id="main-content" className="min-h-dvh px-4 py-6 sm:px-6 lg:ml-[280px] lg:px-10 lg:py-9">{children}</main>
    </div>
  );
}

function KioskShell({ session, children }: { session: Session; children: React.ReactNode }) {
  const router = useRouter();
  const expiry = session.authType === "pengawas" ? session.expires_at : undefined;
  const [seconds, setSeconds] = useState(() => expiry ? Math.max(0, expiry - Math.floor(Date.now() / 1000)) : 15 * 60);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (seconds === 0) router.push("/api/auth/pengawas-logout");
  }, [seconds, router]);

  const urgent = seconds <= 120;
  return <div className="min-h-dvh bg-canvas"><a href="#main-content" className="skip-link">Langkau ke kandungan utama</a><header className="border-b border-brand-800 bg-brand-950 text-white"><div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-300/40 bg-brand-700 text-gold-200"><Icon name="shield" size={21} /></div><div className="min-w-0"><p className="truncate font-display text-lg font-semibold leading-none">SPSM · MITS</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-200">Ruang pengawas</p><p className="mt-0.5 truncate font-mono text-[9px] text-brand-300" title={`ID pengguna: ${session.sub}`}>ID: {session.sub}</p></div></div><div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold tabular-nums ${urgent ? "border-danger-300 bg-danger-800 text-white" : "border-gold-300/40 bg-white/10 text-gold-100"}`}><Icon name="clock" size={17} /> Sesi {formatSeconds(seconds)}</div><a href="/api/auth/pengawas-logout" className="hidden min-h-11 items-center gap-2 rounded-lg border border-white/20 px-3 text-sm font-semibold text-white hover:bg-white/10 sm:inline-flex"><Icon name="close" size={17} /> Log keluar</a></div></header><main id="main-content" className="mx-auto min-h-[calc(100dvh-4rem)] max-w-6xl px-4 py-6 sm:px-6 sm:py-9">{children}</main></div>;
}

function roleLabel(roles: string[]) {
  if (roles.includes("super_admin")) return "Super admin";
  if (roles.includes("pentadbir")) return "Pentadbir";
  if (roles.includes("guru_disiplin")) return "Guru disiplin";
  if (roles.includes("guru_biasa")) return "Guru";
  return "Pengguna";
}

function formatSeconds(total: number) {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
