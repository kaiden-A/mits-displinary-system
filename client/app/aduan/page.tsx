"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clientApi } from "@/lib/client-api";
import type { Student } from "@/lib/types";
import StudentPicker from "@/components/StudentPicker";
import OffencePicker, { type OffenceChoice } from "@/components/OffencePicker";
import { Alert, Button, Card, Icon, PageHeader, PointsBadge } from "@/components/ui";

const steps = ["Pilih murid", "Butiran kes", "Semak & hantar"];

export default function AduanPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [student, setStudent] = useState<Student | null>(null);
  const [offences, setOffences] = useState<OffenceChoice[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [details, setDetails] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const total = offences.reduce((sum, offence) => sum + offence.max_points, 0);
  function next() {
    setError("");
    if (step === 0 && !student) return setError("Pilih seorang murid untuk meneruskan.");
    if (step === 1 && (!date || !offences.length || !details.trim())) return setError("Lengkapkan tarikh kejadian, sekurang-kurangnya satu kesalahan, dan butiran aduan.");
    setStep((value) => Math.min(2, value + 1));
  }
  async function submit() {
    if (!student) return;
    setBusy(true); setError("");
    try {
      const result = await clientApi<{ id: number }>("/cases", { method: "POST", body: JSON.stringify({ source: "COMPLAINT", student_source_id: student.id, offences: offences.map((item) => ({ code: item.code, name: item.name, points: item.max_points })), details, docs: { b01: { tarikhKejadian: date, masaKejadian: time, aduan: details, cadangan: suggestion, lokasi: location } } }) });
      router.push(`/kes/${result.id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Aduan tidak berjaya dihantar."); } finally { setBusy(false); }
  }

  return <div className="mx-auto max-w-[1000px]"><PageHeader eyebrow="Borang B01" title="Buat aduan salah laku" description="Catat perkara yang berlaku dengan jelas. Kes 5 mata dan ke bawah akan direkod terus dalam B04; kes melebihi 5 mata akan melalui siasatan B02." actions={<PointsBadge points={total} />} />
    <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">{steps.map((label, index) => <div key={label} className={`relative border-t-2 pt-3 ${index <= step ? "border-gold-500" : "border-ink-200"}`}><div className={`font-mono text-[10px] font-bold ${index <= step ? "text-gold-800" : "text-ink-400"}`}>0{index + 1}</div><div className={`mt-1 text-xs font-semibold sm:text-sm ${index === step ? "text-brand-950" : "text-ink-500"}`}>{label}</div></div>)}</div>
    {error ? <Alert tone="danger" className="mb-5">{error}</Alert> : null}
    <Card className="p-5 sm:p-7">
      {step === 0 ? <section aria-labelledby="student-title"><div className="mb-5"><h2 id="student-title" className="font-display text-2xl font-semibold text-brand-950">Siapa yang terlibat?</h2><p className="mt-1 text-sm text-ink-600">Cari nama murid atau tapis mengikut tingkatan dan kelas.</p></div><StudentPicker value={student} onChange={setStudent} /></section> : null}
      {step === 1 ? <section aria-labelledby="details-title"><div className="mb-5"><h2 id="details-title" className="font-display text-2xl font-semibold text-brand-950">Butiran kejadian</h2><p className="mt-1 text-sm text-ink-600">Tarikh dan butiran kejadian membantu Guru Disiplin memahami laporan dengan tepat.</p></div><div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3"><div className="flex items-center gap-3"><Icon name="user" size={18} className="text-brand-700" /><span className="font-semibold text-brand-950">{student?.name}</span><span className="text-sm text-ink-600">{student?.tingkatan} · {student?.kelas}</span></div></div><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Tarikh kejadian <span className="text-danger-700">*</span></span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Masa kejadian</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label></div><label className="mt-4 block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Lokasi kejadian <span className="font-normal text-ink-500">(pilihan)</span></span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Contoh: Dorm Ibnu Kathir…" className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><div className="mt-4"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Kesalahan <span className="text-danger-700">*</span></span><OffencePicker onChange={setOffences} /></div><label className="mt-4 block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Butiran aduan <span className="text-danger-700">*</span></span><textarea value={details} onChange={(event) => setDetails(event.target.value)} rows={5} placeholder="Huraikan apa yang berlaku…" className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><label className="mt-4 block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Cadangan tindakan <span className="font-normal text-ink-500">(pilihan)</span></span><textarea value={suggestion} onChange={(event) => setSuggestion(event.target.value)} rows={3} placeholder="Contoh: amaran bertulis atau khidmat sosial…" className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label></section> : null}
      {step === 2 ? <section aria-labelledby="review-title"><div className="mb-5"><h2 id="review-title" className="font-display text-2xl font-semibold text-brand-950">Semak sebelum hantar</h2><p className="mt-1 text-sm text-ink-600">Pastikan maklumat laporan ini tepat sebelum ia dihantar kepada Guru Disiplin.</p></div><div className="space-y-4"><ReviewRow label="Murid" value={`${student?.name || "-"} · Tingkatan ${student?.tingkatan}, ${student?.kelas}`} /><ReviewRow label="Kejadian" value={`${date || "-"}${time ? ` · ${time}` : ""}${location ? ` · ${location}` : ""}`} /><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-500">Kesalahan</p><div className="mt-2 space-y-2">{offences.map((offence) => <div key={offence.code} className="flex items-start justify-between gap-3 rounded-lg border border-ink-100 px-3 py-2 text-sm"><span><strong className="font-mono text-brand-700">{offence.code}</strong> · {offence.name}</span><span className="font-mono font-semibold text-gold-800">{offence.max_points}</span></div>)}</div></div><ReviewRow label="Butiran aduan" value={details} multiline /><ReviewRow label="Cadangan" value={suggestion || "Tiada cadangan diberikan."} multiline /></div></section> : null}
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-ink-100 pt-5 sm:flex-row sm:justify-between"><Button variant="ghost" onClick={() => { setError(""); setStep((value) => Math.max(0, value - 1)); }} disabled={step === 0}>Kembali</Button>{step < 2 ? <Button onClick={next}>Teruskan <Icon name="chevronRight" size={16} /></Button> : <Button disabled={busy} onClick={submit}>{busy ? "Menghantar…" : "Hantar aduan"}<Icon name="check" size={16} /></Button>}</div>
    </Card>
  </div>;
}

function ReviewRow({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) { return <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-500">{label}</p><p className={`mt-1 text-sm leading-6 text-ink-800 ${multiline ? "whitespace-pre-wrap" : ""}`}>{value}</p></div>; }
