"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clientApi } from "@/lib/client-api";
import type { CaseSummary, Student } from "@/lib/types";
import { CaseTable } from "@/components/case-ui";
import { Card, Icon, PageHeader, StatCard } from "@/components/ui";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("ALL");
  const [className, setClassName] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState("");
  useEffect(() => { Promise.all([clientApi<{ total: number; items: Student[] }>("/students?limit=200"), clientApi<CaseSummary[]>("/cases?limit=200")]).then(([studentData, caseData]) => { setStudents(studentData.items); setCases(caseData); }).catch((reason) => setError(reason instanceof Error ? reason.message : "Data murid tidak dapat dimuatkan.")).finally(() => setLoading(false)); }, []);
  async function syncStudents() {
    setSyncing(true);
    setSyncNotice("");
    setError("");
    try {
      const result = await clientApi<{ synced: number }>("/students/sync", { method: "POST" });
      setSyncNotice(`${result.synced} murid telah disegerakkan.`);
      const studentData = await clientApi<{ total: number; items: Student[] }>("/students?limit=200");
      setStudents(studentData.items);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Data murid tidak dapat disegerakkan.");
    } finally {
      setSyncing(false);
    }
  }
  const grades = useMemo(() => [...new Set(students.map((student) => student.tingkatan))].sort((a, b) => a - b), [students]);
  const classes = useMemo(() => [...new Set(students.filter((student) => grade === "ALL" || student.tingkatan === Number(grade)).map((student) => student.kelas))].sort(), [students, grade]);
  const rows = useMemo(() => students.filter((student) => { const q = query.toLowerCase(); return (!q || student.name.toLowerCase().includes(q) || student.ic_number.toLowerCase().includes(q)) && (grade === "ALL" || student.tingkatan === Number(grade)) && (className === "ALL" || student.kelas === className); }).map((student) => { const studentCases = cases.filter((item) => item.student_source_id === student.id && item.status !== "DISMISSED"); return { student, cases: studentCases, points: studentCases.filter((item) => item.status !== "REPORTED" && item.status !== "INVESTIGATING").reduce((sum, item) => sum + item.points, 0) }; }), [students, cases, query, grade, className]);
  return <div className="mx-auto max-w-[1440px]"><PageHeader eyebrow="Rekod murid" title="Murid" description="Cari profil murid dan lihat rekod kes secara berasingan. Jumlah sejarah ialah maklumat rujukan sahaja." actions={<button type="button" onClick={syncStudents} disabled={syncing} className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"><Icon name="refresh" size={16} />{syncing ? "Menyegerakkan…" : "Segerakkan data murid"}</button>} />{error ? <div role="alert" className="mb-5 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800">{error}</div> : null}{syncNotice ? <div role="status" className="mb-5 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800">{syncNotice}</div> : null}<div className="mb-6 grid gap-3 sm:grid-cols-3"><StatCard label="Jumlah murid" value={students.length} helper={loading ? "Memuatkan…" : "Dalam pangkalan data"} icon="users" /><StatCard label="Murid berrekod" value={new Set(cases.filter((item) => item.status !== "DISMISSED").map((item) => item.student_source_id)).size} helper="Kes yang telah direkod" icon="folder" tone="gold" /><StatCard label="Kes direkod" value={cases.filter((item) => item.status !== "REPORTED" && item.status !== "INVESTIGATING" && item.status !== "DISMISSED").length} helper="Tidak termasuk kes menunggu" icon="archive" tone="blue" /></div><Card className="mb-5 p-4"><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px_220px_auto]"><label className="relative"><span className="sr-only">Cari murid</span><Icon name="search" size={17} className="pointer-events-none absolute left-3 top-3.5 text-ink-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau No. K/P…" className="h-11 w-full rounded-lg border border-ink-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><select value={grade} onChange={(event) => { setGrade(event.target.value); setClassName("ALL"); }} className="h-11 rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"><option value="ALL">Semua tingkatan</option>{grades.map((item) => <option key={item} value={item}>Tingkatan {item}</option>)}</select><select value={className} onChange={(event) => setClassName(event.target.value)} className="h-11 rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"><option value="ALL">Semua kelas</option>{classes.map((item) => <option key={item} value={item}>{item}</option>)}</select><button type="button" onClick={() => { setQuery(""); setGrade("ALL"); setClassName("ALL"); }} className="min-h-11 cursor-pointer rounded-lg border border-brand-200 bg-white px-4 text-sm font-semibold text-brand-800 hover:bg-brand-50">Set semula</button></div>{error ? <p className="mt-3 text-xs font-semibold text-danger-800">{error}</p> : null}</Card><Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-brand-50 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-600"><tr><th className="px-5 py-3">Murid</th><th className="px-5 py-3">Tingkatan / kelas</th><th className="px-5 py-3">Kes</th><th className="px-5 py-3">Mata sejarah</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y divide-ink-100">{rows.map((row) => <tr key={row.student.id} className="hover:bg-brand-50/50"><td className="px-5 py-4"><Link href={`/murid/${row.student.id}`} className="font-semibold text-brand-950 hover:text-brand-700">{row.student.name}</Link><span className="mt-1 block text-xs text-ink-500">{row.student.ic_number}</span></td><td className="px-5 py-4 text-sm text-ink-700">Tingkatan {row.student.tingkatan}<span className="block text-xs text-ink-500">{row.student.kelas}</span></td><td className="px-5 py-4 font-mono text-sm tabular-nums text-ink-800">{row.cases.length}</td><td className="px-5 py-4"><span className="font-mono text-sm font-semibold text-gold-800">{row.points}</span><span className="ml-1 text-xs text-ink-500">mata</span></td><td className="px-5 py-4 text-right"><Link href={`/murid/${row.student.id}`} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-xs font-bold text-brand-700 hover:bg-brand-100">Buka profil <Icon name="chevronRight" size={15} /></Link></td></tr>)}</tbody></table>{!loading && !rows.length ? <div className="px-5 py-10 text-center text-sm text-ink-500">Tiada murid sepadan.</div> : null}</div></Card></div>;
}
