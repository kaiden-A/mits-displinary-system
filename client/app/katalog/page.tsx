"use client";

import { useEffect, useState } from "react";
import { clientApi } from "@/lib/client-api";
import type { LadderTier } from "@/lib/types";

interface OffenceOption {
  code: string;
  name: string;
  min_points: number;
  max_points: number;
  action: string;
}

export default function KatalogPage() {
  const [offences, setOffences] = useState<OffenceOption[]>([]);
  const [ladder, setLadder] = useState<LadderTier[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("ALL");

  useEffect(() => {
    clientApi<OffenceOption[]>("/offences").then(setOffences).catch(() => setOffences([]));
    clientApi<LadderTier[]>("/spsm/ladder").then(setLadder).catch(() => setLadder([]));
  }, []);

  const cats = [...new Set(offences.map((o) => o.code[0]))];
  const rows = offences.filter((o) => {
    if (cat !== "ALL" && !o.code.startsWith(cat)) return false;
    if (q && !o.name.toLowerCase().includes(q.toLowerCase()) && !o.code.toLowerCase().includes(q.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800">Katalog Kesalahan & Tindakan SPSM</h1>
      <p className="text-sm text-slate-500 mb-4">{offences.length} jenis kesalahan</p>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setCat("ALL")}
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${cat === "ALL" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}`}
            >
              Semua
            </button>
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${cat === c ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kesalahan (kod / nama)…"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm mb-3"
          />
          <div className="max-h-[560px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2">Kod</th>
                  <th className="px-3 py-2">Kesalahan</th>
                  <th className="px-3 py-2 text-center">Mata</th>
                  <th className="px-3 py-2">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.code} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs font-semibold text-emerald-700">{o.code}</td>
                    <td className="px-3 py-2 text-slate-700">{o.name}</td>
                    <td className="px-3 py-2 text-center font-bold">
                      {o.min_points === o.max_points ? o.max_points : `${o.min_points}-${o.max_points}`}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">{o.action || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-fit">
          <h2 className="font-semibold text-slate-800 mb-3">Langkah / Hukuman Mengikut Mata SPSM</h2>
          <div className="space-y-3">
            {ladder.map((t) => (
              <div key={t.tier} className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs font-bold text-emerald-700 uppercase">{t.label}</div>
                <ul className="mt-1.5 space-y-1">
                  {t.steps.map((s, i) => (
                    <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                      <span className="text-emerald-400">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}