"use client";

import { useEffect, useState } from "react";
import { clientApi } from "@/lib/client-api";
import type { Student } from "@/lib/types";

interface OffenceOption {
  code: string;
  name: string;
  min_points: number;
  max_points: number;
}

const MAX_POINTS = 5;
const SESSION_MINUTES = 15;

export default function KadPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [offences, setOffences] = useState<OffenceOption[]>([]);
  const [tingkatan, setTingkatan] = useState("");
  const [kelas, setKelas] = useState("");
  const [studentId, setStudentId] = useState("");
  const [selected, setSelected] = useState<OffenceOption[]>([]);
  const [reporterName, setReporterName] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(SESSION_MINUTES * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          window.location.href = "/api/auth/pengawas-logout";
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    clientApi<Student[]>("/students?limit=200").then(setStudents).catch(() => setStudents([]));
    clientApi<OffenceOption[]>("/offences/prefect-allowed").then(setOffences).catch(() => setOffences([]));
  }, []);

  const tingkatanList = [...new Set(students.map((s) => s.tingkatan))].sort();
  const kelasList = [...new Set(students.filter((s) => s.tingkatan === Number(tingkatan)).map((s) => s.kelas))].sort();
  const studentList = students
    .filter((s) => s.tingkatan === Number(tingkatan) && s.kelas === kelas)
    .sort((a, b) => a.name.localeCompare(b.name));
  const catKeys = [...new Set(offences.map((o) => o.code[0]))];
  const total = selected.reduce((sum, o) => sum + o.max_points, 0);

  function addOffence(code: string) {
    const off = offences.find((o) => o.code === code);
    if (!off || selected.some((s) => s.code === code)) return;
    if (total + off.max_points > MAX_POINTS) {
      setError(`Kad Peringatan tidak boleh melebihi ${MAX_POINTS} mata.`);
      return;
    }
    setError("");
    setSelected((prev) => [...prev, off]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await clientApi("/cases", {
        method: "POST",
        body: JSON.stringify({
          source: "PREFECT_WARNING",
          student_source_id: Number(studentId),
          offences: selected.map((s) => ({ code: s.code, name: s.name, points: s.max_points })),
          details,
          reporter_name_override: reporterName,
        }),
      });
      setSelected([]);
      setStudentId("");
      setReporterName("");
      setDetails("");
      alert("Kad Peringatan dihantar — menunggu semakan Guru Disiplin.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
        <div className="text-sm text-amber-800 font-semibold">
          <i className="fa-solid fa-clock mr-1.5" />
          Sesi tamat automatik selepas 15 minit
        </div>
        <div className="font-mono font-bold text-amber-800">
          {mm}:{ss}
        </div>
      </div>

      <h1 className="text-xl font-bold text-slate-800">Kad Peringatan (B03)</h1>
      <p className="text-sm text-slate-500 mb-4">
        Lapor kesalahan ringan (maksimum {MAX_POINTS} mata). Isikan nama pengawas yang membuat laporan — laporan boleh
        dimasukkan bagi pihak pengawas lain.
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
            Kesalahan * (maksimum {MAX_POINTS} mata)
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
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-amber-300"
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
            defaultValue=""
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Pilih kesalahan ringan…</option>
            {offences.map((o) => (
              <option key={o.code} value={o.code}>
                {o.code} — {o.name} ({o.max_points} mata)
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2 mt-2">
            {selected.map((s) => (
              <span
                key={s.code}
                className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-2.5 py-1 text-xs"
              >
                <span className="font-mono font-bold">{s.code}</span>
                {s.name} <span className="font-bold">{s.max_points} mata</span>
                <button type="button" onClick={() => setSelected((prev) => prev.filter((x) => x.code !== s.code))} className="text-red-400 font-bold">
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="text-sm mt-2 font-semibold text-amber-700">
            Jumlah mata SPSM: {total} / {MAX_POINTS}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pengawas yang Melapor *</label>
          <input
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Butiran Kesalahan *</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={busy || selected.length === 0}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg px-5 py-2.5"
        >
          {busy ? "Menghantar…" : "Hantar untuk Semakan"}
        </button>
      </form>
    </div>
  );
}