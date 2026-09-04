// DEV ONLY — local staff login to simulate roles (pentadbir / guru_disiplin / guru_biasa).
// DELETE AFTER TESTING. Production login is via Zitadel OIDC at /login.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Button, Icon } from "@/components/ui";

const DEV_ROLES = [
  { role: "pentadbir", email: "pentadbir@mits.edu.my", label: "Pentadbir", icon: "shield" as const, home: "/dashboard", helper: "Semua kes, tandatangan, akaun pengawas" },
  { role: "guru_disiplin", email: "guru_disiplin@mits.edu.my", label: "Guru Disiplin", icon: "search" as const, home: "/dashboard", helper: "Semua kes, siasatan B02, B04" },
  { role: "guru_biasa", email: "guru_biasa@mits.edu.my", label: "Guru Biasa", icon: "user" as const, home: "/aduan", helper: "Aduan sendiri (B01), B02 kes sendiri" },
];

export default function DevLoginPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<(typeof DEV_ROLES)[number] | null>(null);
  const [password, setPassword] = useState("dev123456");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selected.email, password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.detail || "Log masuk gagal.");
        return;
      }
      router.push(selected.home);
      router.refresh();
    } catch {
      setError("Pelayan tidak dapat dihubungi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-950 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-300/40 bg-brand-700 text-gold-100"><Icon name="key" size={26} /></div>
          <h1 className="mt-4 font-display text-3xl font-semibold">Log masuk pembangunan</h1>
          <p className="mt-1 text-sm text-brand-200">Simulasi peranan staf · akaun tempatan</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface p-6 shadow-xl sm:p-8">
          <p className="mb-4 flex items-center gap-2 rounded-lg border border-gold-300/40 bg-gold-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-gold-800"><Icon name="warning" size={14} />DEV ONLY — padam selepas ujian</p>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-700">Pilih peranan</p>
          <div className="mt-3 space-y-2">
            {DEV_ROLES.map((item) => (
              <button key={item.role} type="button" onClick={() => setSelected(item)} className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${selected?.role === item.role ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/50"}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selected?.role === item.role ? "bg-brand-700 text-gold-100" : "bg-brand-50 text-brand-700"}`}><Icon name={item.icon} size={17} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-brand-950">{item.label}</span>
                  <span className="block text-xs text-ink-600">{item.helper}</span>
                </span>
                <span className={`font-mono text-[11px] font-semibold ${selected?.role === item.role ? "text-brand-800" : "text-ink-400"}`}>{item.email}</span>
              </button>
            ))}
          </div>
          {selected ? (
            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-800">Email</span>
                <input readOnly value={selected.email} className="h-11 w-full rounded-lg border border-ink-200 bg-ink-50 px-3 text-sm text-ink-700" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-800">Kata laluan</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" />
              </label>
              {error ? <Alert tone="danger">{error}</Alert> : null}
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Log masuk…" : `Log masuk sebagai ${selected.label}`}</Button>
            </form>
          ) : null}
          <p className="mt-5 text-center text-xs text-ink-500">Akaun dibuat oleh <code className="font-mono">scripts/seed_dev_users.py</code> · kata laluan lalai <code className="font-mono">dev123456</code></p>
          <p className="mt-3 text-center text-xs"><Link href="/login" className="font-bold text-brand-700 hover:text-gold-700">← Kembali ke log masuk rasmi</Link></p>
        </div>
      </div>
    </div>
  );
}