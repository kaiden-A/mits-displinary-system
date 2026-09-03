"use client";

import { useEffect, useState } from "react";
import { clientApi } from "@/lib/client-api";

interface Account {
  id: number;
  email: string;
  full_name: string;
  active: boolean;
  locked_until: string | null;
  failed_attempts: number;
}

export default function PengawasAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  async function load() {
    try {
      setAccounts(await clientApi<Account[]>("/accounts/pengawas"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    try {
      await clientApi("/accounts/pengawas", {
        method: "POST",
        body: JSON.stringify({ email, full_name: fullName, password }),
      });
      setEmail("");
      setFullName("");
      setPassword("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function resetPassword(id: number) {
    const newPassword = prompt("Kata laluan baharu (minimum 8 aksara):");
    if (!newPassword) return;
    try {
      await clientApi(`/accounts/pengawas/${id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ new_password: newPassword }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function toggleActive(id: number, active: boolean) {
    await clientApi(`/accounts/pengawas/${id}/toggle-active`, { method: "POST" });
    await load();
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800">Akaun Pengawas</h1>
      <p className="text-sm text-slate-500 mb-4">
        Akaun log masuk tempatan untuk pengawas (kiosk komputer awam, sesi 15 minit). Staf diurus melalui Zitadel console.
      </p>

      {error ? <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p> : null}

      <form onSubmit={create} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4 grid md:grid-cols-4 gap-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email pengawas"
          type="email"
          required
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nama penuh"
          required
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Kata laluan"
          type="password"
          minLength={8}
          required
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg px-4 py-2">
          Cipta Akaun
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Cubaan Gagal</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="px-3 py-2.5 font-medium">{a.full_name}</td>
                <td className="px-3 py-2.5">{a.email}</td>
                <td className="px-3 py-2.5 text-xs">
                  {!a.active ? (
                    <span className="text-red-600 font-semibold">Tidak aktif</span>
                  ) : a.locked_until ? (
                    <span className="text-amber-600 font-semibold">Dikunci</span>
                  ) : (
                    <span className="text-emerald-600 font-semibold">Aktif</span>
                  )}
                </td>
                <td className="px-3 py-2.5">{a.failed_attempts}</td>
                <td className="px-3 py-2.5 text-right space-x-2">
                  <button onClick={() => resetPassword(a.id)} className="text-xs font-semibold text-slate-500 hover:text-emerald-700">
                    Reset kata laluan
                  </button>
                  <button onClick={() => toggleActive(a.id, a.active)} className="text-xs font-semibold text-slate-500 hover:text-red-700">
                    {a.active ? "Nyahaktif" : "Aktifkan"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}