"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PengawasLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/pengawas-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          res.status === 423
            ? "Akaun dikunci. Sila jumpa pentadbir."
            : data.detail || "Email atau kata laluan salah."
        );
        return;
      }
      router.push("/kad");
      router.refresh();
    } catch {
      setError("Server tidak dapat dihubungi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 w-full max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-amber-500 mx-auto flex items-center justify-center text-white mb-4">
          <i className="fa-solid fa-triangle-exclamation text-xl" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 text-center">Log Masuk Pengawas</h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          Kiosk komputer awam · sesi tamat selepas 15 minit
        </p>

        {error ? (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        ) : null}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Kata Laluan</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
          >
            {busy ? "Menghantar…" : "Log Masuk"}
          </button>
          <p className="text-[11px] text-slate-400 text-center">
            Akaun pengawas diurus oleh pentadbir. Sesi dilog keluar automatik selepas 15 minit.
          </p>
        </form>
      </div>
    </div>
  );
}