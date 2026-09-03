"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { clientApi, STATUS_LABELS, SOURCE_LABELS } from "@/lib/client-api";
import type { CaseDetail, CaseStep } from "@/lib/types";

const ACTION_LABELS: Record<string, string> = {
  startInvestigation: "Buka Siasatan",
  confirm: "Sahkan Berasas",
  dismiss: "Tolak / Tutup",
  approveWarning: "Terima & Rekod B04",
  rejectWarning: "Tolak Kad",
  record: "Rekod B04",
  ack: "Pengakuan B05",
  prepare: "Sediakan Surat",
  approve: "Hantar untuk Tandatangan",
  sign: "Tandatangan B06",
  execute: "Laksanakan Hukuman",
  notify: "Maklum Ibu Bapa",
  meeting: "Panggil Ibu Bapa",
  close: "Tutup Kes",
};

const B02_FIELDS = ["aduan", "tarikhAduan", "diterimaOleh", "isu", "laporan", "punca", "penambahbaikan"];

export default function KesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [steps, setSteps] = useState<CaseStep[]>([]);
  const [error, setError] = useState("");
  const [b02Fields, setB02Fields] = useState<Record<string, string>>({});

  async function load() {
    try {
      const data = await clientApi<CaseDetail>(`/cases/${id}`);
      setCaseData(data);
      const s = await clientApi<CaseStep[]>(`/cases/${id}/steps`).catch(() => []);
      setSteps(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function runAction(action: string) {
    if (action === "dismiss" || action === "rejectWarning") {
      if (!confirm("Tutup kes ini?")) return;
    }
    try {
      await clientApi(`/cases/${id}/transitions`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function saveB02() {
    try {
      await clientApi(`/cases/${id}/b02`, {
        method: "POST",
        body: JSON.stringify({ fields: b02Fields }),
      });
      setB02Fields({});
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (error) {
    return <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>;
  }
  if (!caseData) return <p className="text-sm text-slate-400">Memuatkan…</p>;

  const c = caseData;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Kes K-{c.seq}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {SOURCE_LABELS[c.source]} · Dilaporkan oleh {c.reporter_name} ({c.reporter_role})
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-emerald-700">{c.points}</div>
          <div className="text-xs text-slate-400 font-semibold uppercase">Mata SPSM</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-3">
          <div>
            <span className="text-slate-400 text-xs">MURID</span>
            <div className="font-semibold">{c.student_snapshot?.name}</div>
            <div className="text-xs text-slate-400">{c.student_snapshot?.kelas_label}</div>
          </div>
          <div>
            <span className="text-slate-400 text-xs">KESALAHAN</span>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {c.offences.map((o) => (
                <span key={o.code} className="bg-slate-100 rounded-lg px-2 py-1 text-xs">
                  <b className="font-mono">{o.code}</b> · {o.name} ({o.points})
                </span>
              ))}
            </div>
          </div>
        </div>
        <div>
          <span className="text-slate-400 text-xs">STATUS</span>
          <div className="font-semibold text-emerald-700">{STATUS_LABELS[c.status]}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
        <h2 className="font-semibold text-slate-800 mb-3">Langkah Seterusnya</h2>
        <ol className="space-y-2">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start justify-between gap-3 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5">
              <div className="text-sm text-slate-700">
                {i + 1}. {s.text}
                {s.actor ? <div className="text-xs text-slate-400 mt-0.5">Pelaksana: {s.actor}</div> : null}
              </div>
              {s.action ? (
                <button
                  onClick={() => runAction(s.action)}
                  className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
                >
                  {ACTION_LABELS[s.action] || s.action}
                </button>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      {c.source !== "PREFECT_WARNING" && (c.source === "SPOT_CHECK" || c.points > 5) ? (
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-4 mb-4">
          <h2 className="font-semibold text-slate-800 mb-3">Borang Siasatan (B02)</h2>
          <p className="text-xs text-sky-800 bg-sky-50 border border-sky-200 rounded-lg p-3 mb-3">
            Borang ini boleh diisi oleh sesiapa (guru pengadu, Guru Disiplin atau pentadbir). Setiap borang disimpan
            dengan nama pengisi — satu kes boleh mempunyai banyak Borang Siasatan.
          </p>
          <div className="space-y-2 mb-3">
            {c.b02_forms.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada Borang Siasatan.</p>
            ) : (
              c.b02_forms.map((f) => (
                <div key={f.id} className="rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-sm">
                  <span className="font-mono text-xs font-bold text-amber-700">B02-{f.id}</span> — Diisi oleh{" "}
                  <b>{f.fill_by}</b> ({f.fill_role})
                  <div className="text-xs text-slate-500 mt-0.5">
                    {f.fields.isu ? `Isu: ${f.fields.isu}` : ""} · {new Date(f.filled_at).toLocaleString("ms-MY")}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            {B02_FIELDS.map((f) => (
              <div key={f}>
                <label className="block text-xs font-semibold text-slate-600 mb-1 capitalize">{f.replace(/([A-Z])/g, " $1")}</label>
                <textarea
                  value={b02Fields[f] || ""}
                  onChange={(e) => setB02Fields((prev) => ({ ...prev, [f]: e.target.value }))}
                  rows={f === "laporan" || f === "punca" || f === "penambahbaikan" ? 2 : 1}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
          <button onClick={saveB02} className="mt-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 py-1.5 text-xs font-semibold">
            Simpan Borang Siasatan
          </button>
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
        <h2 className="font-semibold text-slate-800 mb-3">Kronologi Kes</h2>
        <div className="space-y-2">
          {[...c.events].reverse().map((e, i) => (
            <div key={i} className="text-sm">
              <span className="text-slate-700">{e.text}</span>
              <div className="text-xs text-slate-400">
                {new Date(e.ts).toLocaleString("ms-MY")} · {e.by_name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}