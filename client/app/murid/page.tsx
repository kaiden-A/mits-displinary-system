"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { clientApi } from "@/lib/client-api";
import type { CaseSummary, Student } from "@/lib/types";

export default function MuridPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [q, setQ] = useState("");
  const [tingkatan, setTingkatan] = useState("ALL");
  const [kelas, setKelas] = useState("ALL");
  const [error, setError] = useState("");

  useEffect(() => {
    clientApi<{ total: number; items: Student[] }>("/students?limit=200")
      .then((d) => setStudents(d.items))
      .catch(() => setStudents([]));
    clientApi<CaseSummary[]>("/cases").then(setCases).catch(() => setCases([]));
  }, []);

  const tingkatanList = useMemo(() => [...new Set(students.map((s) => s.tingkatan))].sort(), [students]);
  const kelasList = useMemo(() => [...new Set(students.map((s) => s.kelas))].sort(), [students]);

  const stats = useMemo(() => {
    const withRecords = new Set(cases.map((c) => c.student_source_id));
    const totalPoints = cases.reduce((sum, c) => sum + c.points, 0);
    return { withRecords: withRecords.size, totalPoints };
  }, [cases]);

  const rows = useMemo(() => {
    const query = q.toLowerCase();
    return students
      .filter((s) => {
        if (tingkatan !== "ALL" && s.tingkatan !== Number(tingkatan)) return false;
        if (kelas !== "ALL" && s.kelas !== kelas) return false;
        if (query && !s.name.toLowerCase().includes(query) && !s.ic_number.includes(query)) return false;
        return true;
      })
      .map((s) => {
        const sc = cases.filter((c) => c.student_source_id === s.id);
        return {
          student: s,
          caseCount: sc.length,
          total: sc.reduce((sum, c) => sum + c.points, 0),
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [students, cases, q, tingkatan, kelas]);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800">Senarai Murid & Rekod Kesalahan</h1>
      <p className="text-sm text-slate-500 mb-4">
        {students.length} murid · {stats.withRecords} ada rekod · {stats.totalPoints} jumlah mata
      </p>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
        <div className="grid md:grid-cols-3 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama / No. K/P…"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <select value={tingkatan} onChange={(e) => setTingkatan(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="ALL">Semua Tingkatan</option>
            {tingkatanList.map((t) => (
              <option key={t} value={t}>
                Tingkatan {t}
              </option>
            ))}
          </select>
          <select value={kelas} onChange={(e) => setKelas(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="ALL">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2">Murid</th>
                <th className="px-3 py-2">Tingkatan / Kelas</th>
                <th className="px-3 py-2 text-center">Kes</th>
                <th className="px-3 py-2 text-center">Mata</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.student.id} className="hover:bg-slate-50 border-t border-slate-100">
                  <td className="px-3 py-2.5">
                    <Link href={`/murid/${r.student.id}`} className="font-medium text-slate-800 hover:text-emerald-700">
                      {r.student.name}
                    </Link>
                    <div className="text-xs text-slate-400">{r.student.ic_number}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    {r.student.tingkatan} {r.student.kelas}
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold">{r.caseCount}</td>
                  <td className="px-3 py-2.5 text-center font-bold">{r.total}</td>
                  <td className="px-3 py-2.5 text-right">
                    <Link href={`/murid/${r.student.id}`} className="text-xs font-semibold text-emerald-700 hover:underline">
                      Profil →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}