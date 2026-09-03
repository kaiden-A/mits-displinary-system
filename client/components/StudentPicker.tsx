"use client";

import { useEffect, useMemo, useState } from "react";
import type { Student } from "@/lib/types";
import { clientApi } from "@/lib/client-api";
import { Icon } from "@/components/ui";

export default function StudentPicker({ value, onChange, id = "student" }: { value: Student | null; onChange: (student: Student | null) => void; id?: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [tingkatan, setTingkatan] = useState("ALL");
  const [kelas, setKelas] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const search = query.trim() ? `&q=${encodeURIComponent(query.trim())}` : "";
      clientApi<{ total: number; items: Student[] }>(`/students?limit=100${search}`).then((data) => setStudents(data.items)).catch(() => setError("Senarai murid tidak dapat dimuatkan.")).finally(() => setLoading(false));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  const grades = useMemo(() => [...new Set(students.map((student) => student.tingkatan))].sort((a, b) => a - b), [students]);
  const classes = useMemo(() => [...new Set(students.filter((student) => tingkatan === "ALL" || student.tingkatan === Number(tingkatan)).map((student) => student.kelas))].sort(), [students, tingkatan]);
  const filtered = useMemo(() => students.filter((student) => (tingkatan === "ALL" || student.tingkatan === Number(tingkatan)) && (kelas === "ALL" || student.kelas === kelas)).slice(0, 40), [students, tingkatan, kelas]);

  if (value) return <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-gold-100"><Icon name="user" size={18} /></div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-brand-950">{value.name}</p><p className="mt-0.5 text-xs text-ink-600">Tingkatan {value.tingkatan} · {value.kelas}</p></div><button type="button" aria-label="Tukar murid" onClick={() => { onChange(null); setOpen(true); }} className="min-h-10 cursor-pointer rounded-lg px-3 text-xs font-bold text-brand-700 hover:bg-brand-100">Tukar</button></div>;

  return <div className="relative" id={id}>
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px_180px]"><label className="relative block"><span className="sr-only">Cari nama atau nombor murid</span><Icon name="search" size={17} className="pointer-events-none absolute left-3 top-3.5 text-ink-400" /><input value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} placeholder="Cari nama murid…" autoComplete="off" className="h-11 w-full rounded-lg border border-ink-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><label><span className="sr-only">Tingkatan murid</span><select value={tingkatan} onChange={(event) => { setTingkatan(event.target.value); setKelas("ALL"); setOpen(true); }} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"><option value="ALL">Semua tingkatan</option>{grades.map((grade) => <option key={grade} value={grade}>Tingkatan {grade}</option>)}</select></label><label><span className="sr-only">Kelas murid</span><select value={kelas} onChange={(event) => { setKelas(event.target.value); setOpen(true); }} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"><option value="ALL">Semua kelas</option>{classes.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div>
    {open ? <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-ink-200 bg-white p-2 shadow-lg" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>{loading ? <p className="px-3 py-4 text-sm text-ink-500">Memuatkan murid…</p> : error ? <p className="px-3 py-4 text-sm text-danger-800">{error}</p> : filtered.length ? filtered.map((student) => <button key={student.id} type="button" onClick={() => { onChange(student); setOpen(false); }} className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left hover:bg-brand-50"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{student.name.slice(0, 1)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-brand-950">{student.name}</span><span className="block text-xs text-ink-500">{student.tingkatan} · {student.kelas} · {student.ic_number}</span></span><Icon name="chevronRight" size={16} className="text-ink-400" /></button>) : <p className="px-3 py-4 text-sm text-ink-500">Tiada murid sepadan. Cuba nama lain.</p>}</div> : null}
  </div>;
}
