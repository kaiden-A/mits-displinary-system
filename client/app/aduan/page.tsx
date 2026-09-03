"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clientApi } from "@/lib/client-api";
import type { Student } from "@/lib/types";

interface OffenceOption {
  code: string;
  name: string;
  min_points: number;
  max_points: number;
}

interface PickedOffence {
  code: string;
  name: string;
  points: number;
  min_points: number;
  max_points: number;
}

export default function AduanPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [offences, setOffences] = useState<OffenceOption[]>([]);
  const [tingkatan, setTingkatan] = useState("");
  const [kelas, setKelas] = useState("");
  const [studentId, setStudentId] = useState("");
  const [selected, setSelected] = useState<PickedOffence[]>([]);
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    clientApi<Student[]>("/students?limit=200").then(setStudents).catch(() => setStudents([]));
    clientApi<OffenceOption[]>("/offences").then(setOffences).catch(() => setOffences([]));
  }, []);

  const tingkatanList = [...new Set(students.map((s) => s.tingkatan))].sort();
  const kelasList = [...new Set(students.filter((s) => s.tingkatan === Number(tingkatan)).map((s) => s.kelas))].sort();
  const studentList = students
    .filter((s) => s.tingkatan === Number(tingkatan) && s.kelas === kelas)
    .sort((a, b) => a.name.localeCompare(b.name));
  const catKeys = [...new Set(offences.map((o) => o.code[0]))];

  const total = selected.reduce((sum, o) => sum + o.points, 0);

  function addOffence(code: string) {
    const off = offences.find((o) => o.code === code);
    if (!off || selected.some((s) => s.code === code)) return;
    setSelected((prev) => [...prev, { ...off, points: off.max_points }]);
  }

  function removeOffence(code: string) {
    setSelected((prev) => prev.filter((s) => s.code !== code));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const caseData = await clientApi<{ id: number; seq: number }>("/cases", {
        method: "POST",
        body: JSON.stringify({
          source: "COMPLAINT",
          student_source_id: Number(studentId),
          offences: selected.map((s) => ({ code: s.code, name: s.name, points: s.points })),
          details,
          docs: {},
        }),
      });
      router.push(`/kes/${caseData.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold text-slate-800">Buat Aduan Salahlaku (B01)</h1>
      <p className="text-sm text-slate-500 mb-4">
        Aduan 5 mata ke bawah direkod terus dalam B04; melebihi 5 mata melalui siasatan (B02).
      </p>

      {error ? <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p> : null}

      <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tingkatan *</label>
            <select
              value={tingkatan}
              onChange={(e) => {
                setTingkatan(e.target.value);
                setKelas("");
                setStudentId("");
              }}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">— Pilih Tingkatan —</option>
              {tingkatanList.map((t) => (
                <option key={t} value={t}>
                  Tingkatan {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Kelas *</label>
            <select
              value={kelas}
              onChange={(e) => {
                setKelas(e.target.value);
                setStudentId("");
              }}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">— Pilih Kelas —</option>
              {kelasList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Murid *</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">— Pilih Murid —</option>
            {studentList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Kesalahan * (pilih kategori, kemudian kesalahan)
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {catKeys.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  const first = offences.find((o) => o.code.startsWith(cat));
                  if (first) addOffence(first.code);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-emerald-300"
              >
                {cat}
              </button>
            ))}
          </div>
          <select
            onChange={(e) => {
              if (e.target.value) addOffence(e.target.value);
              e.target.value = "";
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">Pilih kesalahan…</option>
            {offences.map((o) => (
              <option key={o.code} value={o.code}>
                {o.code} — {o.name} ({o.min_points === o.max_points ? o.max_points : `${o.min_points}-${o.max_points}`} mata)
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2 mt-2">
            {selected.map((s) => (
              <span
                key={s.code}
                className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-2.5 py-1 text-xs"
              >
                <span className="font-mono font-bold">{s.code}</span>
                {s.name}
                {s.min_points !== s.max_points ? (
                  <select
                    value={s.points}
                    onChange={(e) =>
                      setSelected((prev) =>
                        prev.map((p) => (p.code === s.code ? { ...p, points: Number(e.target.value) } : p))
                      )
                    }
                    className="text-xs rounded border border-emerald-200 bg-white px-1"
                  >
                    {[s.min_points, s.max_points].map((p) => (
                      <option key={p} value={p}>
                        {p} mata
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="font-bold">{s.points} mata</span>
                )}
                <button type="button" onClick={() => removeOffence(s.code)} className="text-red-400 font-bold">
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="text-sm mt-2 font-semibold text-emerald-700">Jumlah mata SPSM: {total}</div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Butiran Aduan *</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            rows={3}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={busy || selected.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg px-5 py-2.5"
        >
          {busy ? "Menghantar…" : "Hantar Aduan"}
        </button>
      </form>
    </div>
  );
}