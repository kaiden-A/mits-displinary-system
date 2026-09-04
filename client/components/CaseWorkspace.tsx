"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clientApi, CASE_PATH, formatDate, formatDateTime, roleLabel, sourceLabel, STATUS_DETAIL_LABELS, STATUS_LABELS } from "@/lib/client-api";
import type { B02Form, CaseDetail, CaseStep } from "@/lib/types";
import { canAct } from "@/lib/permissions";
import { Alert, Button, Card, EmptyState, Icon, PageHeader, PointsBadge, SectionTitle, StatusBadge } from "@/components/ui";

const ACTION_LABELS: Record<string, string> = {
  startInvestigation: "Mulakan siasatan",
  confirm: "Sahkan aduan",
  dismiss: "Tolak kes",
  approveWarning: "Terima & rekod B04",
  rejectWarning: "Tolak kad",
  record: "Rekod dalam B04",
  ack: "Rekod pengakuan murid",
  prepare: "Sediakan dokumen",
  approve: "Hantar untuk tandatangan",
  sign: "Tandatangan dokumen",
  execute: "Rekod tindakan selesai",
  notify: "Rekod makluman ibu bapa",
  meeting: "Rekod pertemuan",
  close: "Tutup kes",
};

const ACTION_HELP: Record<string, string> = {
  startInvestigation: "Kes ini memerlukan B02 kerana jumlah mata melebihi 5 atau datang daripada spot check.",
  approveWarning: "Semak maklumat kad sebelum merekodkannya dalam B04.",
  sign: "Pentadbir ialah pihak berkuasa menandatangani buat masa ini.",
  execute: "Sahkan bahawa tindakan disiplin telah dijalankan mengikut Modul SPSM.",
  notify: "Rekod cara surat atau makluman disampaikan kepada ibu bapa atau penjaga.",
  meeting: "Rekod keputusan sama ada pertemuan ibu bapa diperlukan.",
};

const B02_FIELDS = [
  ["aduan", "Aduan"], ["tarikhAduan", "Tarikh aduan"], ["butiranPengadu", "Butiran pengadu"], ["diterimaOleh", "Diterima oleh"],
  ["tarikhMasa", "Tarikh / masa"], ["isu", "Isu"], ["laporan", "Laporan siasatan"], ["punca", "Punca masalah"], ["penambahbaikan", "Penambahbaikan"],
  ["saksi", "Saksi (jika ada)"], ["bukti", "Bahan sokongan / bukti (jika ada)"],
] as const;

const DOCS = [
  ["b01", "B01", "Borang aduan"], ["b02", "B02", "Laporan siasatan"], ["b03", "B03", "Kad peringatan"], ["b04", "B04", "Rekod disiplin"],
  ["b05", "B05", "Pengakuan murid"], ["b06", "B06", "Surat pemberitahuan / amaran"], ["b07", "B07", "Barang rampasan"], ["b08", "B08", "Surat akujanji"], ["kad", "Kad SPSM", "Rekod pembangunan sahsiah"],
] as const;

export default function CaseWorkspace({ id, roles, authType, name }: { id: string; roles: string[]; authType: "staff" | "pengawas"; name: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [steps, setSteps] = useState<CaseStep[]>([]);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [docFields, setDocFields] = useState<Record<string, string>>({});
  const [meetingFields, setMeetingFields] = useState<Record<string, string>>({});
  const [counsellingFields, setCounsellingFields] = useState<Record<string, string>>({});
  const [punishmentFields, setPunishmentFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const activeTab = params.get("tab") || "overview";
  const fakeSession = { authType, roles } as Parameters<typeof canAct>[0];

  async function load() {
    setLoading(true);
    try {
      const data = await clientApi<CaseDetail>(`/cases/${id}`);
      setCaseData(data);
      const next = await clientApi<CaseStep[]>(`/cases/${id}/steps`);
      setSteps(next);
      const b06 = data.docs.find((doc) => doc.doc_code === "b06")?.data;
      if (b06) setDocFields(Object.fromEntries(Object.entries(b06).map(([key, value]) => [key, String(value ?? "")] )));
      if (data.meeting) setMeetingFields(Object.fromEntries(Object.entries(data.meeting).map(([key, value]) => [key, String(value ?? "")] )));
      if (data.punishment) setPunishmentFields(Object.fromEntries(Object.entries(data.punishment).map(([key, value]) => [key, String(value ?? "")] )));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Kes tidak dapat dimuatkan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  function switchTab(tab: string) {
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  }

  async function runAction(action: string) {
    if (["dismiss", "rejectWarning"].includes(action) && !window.confirm("Tolak kes ini? Rekod yang ditolak tidak akan masuk ke B04.")) return;
    setBusy(action);
    setError("");
    try {
      await clientApi(`/cases/${id}/transitions`, { method: "POST", body: JSON.stringify({ action }) });
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Tindakan tidak berjaya."); } finally { setBusy(""); }
  }

  async function saveB02() {
    setBusy("b02");
    try { await clientApi(`/cases/${id}/b02`, { method: "POST", body: JSON.stringify({ fields }) }); setFields({}); await load(); switchTab("investigation"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "B02 tidak berjaya disimpan."); } finally { setBusy(""); }
  }

  async function reviewB02(formId: number) {
    setBusy(`review-${formId}`);
    try { await clientApi(`/cases/${id}/b02/${formId}/review`, { method: "POST" }); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Semakan B02 tidak berjaya."); } finally { setBusy(""); }
  }

  async function saveDocument(docCode: string, data: Record<string, string>) {
    setBusy(docCode);
    try { await clientApi(`/cases/${id}/docs`, { method: "PATCH", body: JSON.stringify({ doc_code: docCode, data }) }); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Dokumen tidak berjaya disimpan."); } finally { setBusy(""); }
  }

  async function saveMeeting() {
    setBusy("meeting");
    try { await clientApi(`/cases/${id}/meeting`, { method: "PATCH", body: JSON.stringify({ meeting: meetingFields }) }); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Rekod pertemuan tidak berjaya disimpan."); } finally { setBusy(""); }
  }

  async function saveCounselling() {
    setBusy("counselling");
    try { await clientApi(`/cases/${id}/counselling`, { method: "POST", body: JSON.stringify({ meeting: counsellingFields }) }); setCounsellingFields({}); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Sesi kaunseling tidak berjaya direkodkan."); } finally { setBusy(""); }
  }

  async function savePunishment() {
    setBusy("punishment");
    try { await clientApi(`/cases/${id}/punishment`, { method: "PATCH", body: JSON.stringify({ meeting: punishmentFields }) }); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Hukuman tidak berjaya direkodkan."); } finally { setBusy(""); }
  }

  if (loading && !caseData) return <div className="mx-auto max-w-[1100px]"><div className="h-8 w-48 animate-pulse rounded bg-ink-100" /><div className="mt-6 h-48 animate-pulse rounded-xl bg-ink-100" /></div>;
  if (error && !caseData) return <div className="mx-auto max-w-[760px]"><Alert tone="danger">{error} Cuba kembali ke <Link href="/kes" className="font-bold underline">senarai kes</Link> dan buka semula rekod ini.</Alert></div>;
  if (!caseData) return null;
  const c = caseData;
  const path = casePath(c.source, c.points);
  const requiredDocs = requiredDocuments(c);
  const currentStep = steps.find((step) => step.action && canAct(fakeSession, step.action));
  const sourcePrintId = c.source === "PREFECT_WARNING" ? "b03" : c.source === "SPOT_CHECK" ? "b02" : "b01";

  return <div className="mx-auto max-w-[1240px]">
    <div className="mb-5 flex items-center gap-2 text-sm text-ink-600"><Link href="/kes" className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-brand-700 hover:bg-brand-50"><Icon name="arrowLeft" size={17} />Kes disiplin</Link><Icon name="chevronRight" size={15} className="text-ink-400" /><span className="font-mono text-xs text-ink-500">K-{String(c.seq).padStart(4, "0")}</span></div>
    <PageHeader eyebrow={sourceLabel(c.source)} title={`Kes K-${String(c.seq).padStart(4, "0")}`} description={`${STATUS_DETAIL_LABELS[c.status] || STATUS_LABELS[c.status] || c.status} · Dibuka ${formatDate(c.created_at)}`} actions={<><PointsBadge points={c.points} /><Link href={`/kes/${c.id}/cetak/${sourcePrintId}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 text-sm font-semibold text-brand-800 hover:bg-brand-50"><Icon name="printer" size={17} />Cetak borang utama</Link></>} />
    {error ? <Alert tone="danger" className="mb-5">{error}</Alert> : null}
    {c.points >= 41 ? <div role="status" className="mb-5 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-800">Peringkat 6 (41–50 mata): murid dinasihatkan berpindah sekolah.</div> : null}
    <Card className="mb-5 overflow-hidden">
      <div className="grid gap-4 border-b border-ink-100 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className="flex min-w-0 items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon name="user" size={23} /></div><div className="min-w-0"><p className="truncate font-display text-2xl font-semibold text-brand-950">{c.student_snapshot?.name || "Murid tidak diketahui"}</p><p className="mt-1 text-sm text-ink-600">{c.student_snapshot?.kelas_label || "-"}{c.student_snapshot?.ic_number ? ` · ${c.student_snapshot.ic_number}` : ""}</p></div></div><div className="sm:text-right"><div className="flex items-center justify-end gap-2">{c.tier ? <span className="rounded-full border border-gold-200 bg-gold-50 px-2.5 py-1 text-[11px] font-bold text-gold-800">{c.tier_label}</span> : null}<StatusBadge status={c.status} /></div><p className="mt-2 text-xs text-ink-500">Dilaporkan oleh {c.reporter_name} · {roleLabel(c.reporter_role)}</p></div></div>
      <div className="overflow-x-auto px-5 py-6"><div className="flex min-w-[780px] items-start">{path.map((status, index) => { const current = status === c.status; const complete = path.indexOf(c.status) >= index; return <div key={status} className="flex min-w-[110px] flex-1 flex-col items-center text-center"><div className="flex w-full items-center"><span className={`h-0.5 flex-1 ${index === 0 ? "bg-transparent" : complete ? "bg-gold-500" : "bg-ink-200"}`} /><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-bold ${current ? "border-gold-500 bg-brand-700 text-gold-100 ring-4 ring-gold-100" : complete ? "border-gold-500 bg-gold-100 text-gold-800" : "border-ink-200 bg-white text-ink-400"}`}>{complete && !current ? <Icon name="check" size={16} /> : index + 1}</span><span className={`h-0.5 flex-1 ${index === path.length - 1 ? "bg-transparent" : complete && path.indexOf(c.status) > index ? "bg-gold-500" : "bg-ink-200"}`} /></div><span className={`mt-2 max-w-[100px] text-[11px] leading-4 ${current ? "font-bold text-brand-800" : complete ? "text-ink-700" : "text-ink-400"}`}>{STATUS_LABELS[status]}</span></div>; })}</div></div>
    </Card>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <Card className="mb-5 p-5"><SectionTitle title="Tindakan seterusnya" description={currentStep ? "Satu tindakan utama dipaparkan supaya kes bergerak tanpa kekeliruan." : "Status kes ini sedang menunggu pihak lain atau telah selesai."} />{currentStep?.action && canAct(fakeSession, currentStep.action) ? <div className="rounded-xl border border-gold-200 bg-gold-50 p-4"><div className="flex items-start gap-3"><div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-800"><Icon name="clock" size={18} /></div><div className="min-w-0 flex-1"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-800">Perlu tindakan anda</p><h3 className="mt-1 font-display text-2xl font-semibold text-brand-950">{currentStep.text}</h3><p className="mt-1 text-sm leading-6 text-ink-700">{ACTION_HELP[currentStep.action] || `Pelaksana: ${currentStep.actor || "Pihak berkuasa berkaitan"}.`}</p><Button variant={currentStep.action === "sign" ? "gold" : "primary"} className="mt-4" disabled={busy === currentStep.action} onClick={() => runAction(currentStep.action)}>{busy === currentStep.action ? "Menyimpan…" : ACTION_LABELS[currentStep.action] || currentStep.action}</Button>{["dismiss", "rejectWarning"].includes(currentStep.action) ? <button type="button" onClick={() => runAction(currentStep.action)} className="ml-3 min-h-11 cursor-pointer px-2 text-sm font-semibold text-danger-800 hover:underline">Tolak</button> : null}</div></div></div> : <div className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-4 text-sm leading-6 text-ink-700"><Icon name={c.status === "CLOSED" ? "circleCheck" : "clock"} size={18} className="mr-2 inline text-brand-700" />{c.status === "CLOSED" ? "Kes ini telah ditutup." : currentStep ? `${currentStep.text} Pelaksana: ${currentStep.actor || "pihak berkuasa berkaitan"}.` : "Tiada tindakan seterusnya pada masa ini."}</div>}{steps.length ? <ol className="mt-5 space-y-2">{steps.map((step, index) => <li key={`${step.text}-${index}`} className="flex items-start gap-3 rounded-lg border border-ink-100 px-3 py-3 text-sm"><span className="font-mono text-xs font-semibold text-ink-400">{String(index + 1).padStart(2, "0")}</span><span className="flex-1 leading-6 text-ink-700">{step.text}{step.actor ? <span className="mt-0.5 block text-xs text-ink-500">Pelaksana: {step.actor}</span> : null}</span>{step.action && canAct(fakeSession, step.action) ? <span className="rounded-full bg-success-50 px-2 py-1 text-[10px] font-bold text-success-800">Boleh dibuat</span> : null}</li>)}</ol> : null}</Card>
        <div className="mb-5 flex gap-1 overflow-x-auto border-b border-ink-200 pb-px" role="tablist" aria-label="Bahagian kes">{[["overview", "Ringkasan"], ["investigation", "Siasatan"], ["documents", "Dokumen"], ["timeline", "Kronologi"]].map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={activeTab === key} onClick={() => switchTab(key)} className={`min-h-11 shrink-0 cursor-pointer border-b-2 px-3 text-sm font-semibold transition-colors ${activeTab === key ? "border-gold-500 text-brand-800" : "border-transparent text-ink-600 hover:text-brand-700"}`}>{label}</button>)}</div>
        {activeTab === "overview" ? <OverviewPanel caseData={c} /> : null}
        {activeTab === "investigation" ? <InvestigationPanel caseData={c} fields={fields} setFields={setFields} busy={busy} onSave={saveB02} name={name} roles={roles} canReview={canAct(fakeSession, "startInvestigation")} onReview={reviewB02} /> : null}
        {activeTab === "documents" ? <DocumentsPanel caseData={c} requiredDocs={requiredDocs} docFields={docFields} setDocFields={setDocFields} meetingFields={meetingFields} setMeetingFields={setMeetingFields} counsellingFields={counsellingFields} setCounsellingFields={setCounsellingFields} punishmentFields={punishmentFields} setPunishmentFields={setPunishmentFields} busy={busy} onSaveDocument={saveDocument} onSaveMeeting={saveMeeting} onSaveCounselling={saveCounselling} onSavePunishment={savePunishment} /> : null}
        {activeTab === "timeline" ? <TimelinePanel events={c.events} /> : null}
      </div>
      <aside className="space-y-5">
        <Card className="p-5"><SectionTitle title="Ringkasan kes" /><dl className="space-y-3 text-sm"><div><dt className="text-xs font-bold uppercase tracking-[0.12em] text-ink-500">Sumber</dt><dd className="mt-1 text-ink-800">{sourceLabel(c.source)}</dd></div><div><dt className="text-xs font-bold uppercase tracking-[0.12em] text-ink-500">Mata kes</dt><dd className="mt-1 font-mono text-lg font-semibold text-brand-800">{c.points}</dd></div><div><dt className="text-xs font-bold uppercase tracking-[0.12em] text-ink-500">Tarikh dibuka</dt><dd className="mt-1 text-ink-800">{formatDateTime(c.created_at)}</dd></div><div><dt className="text-xs font-bold uppercase tracking-[0.12em] text-ink-500">Pelapor</dt><dd className="mt-1 text-ink-800">{c.reporter_name}</dd></div></dl></Card>
        <Card className="p-5"><SectionTitle title="Dokumen kes" description="Keperluan ditentukan oleh jenis sumber dan mata kes." /><div className="space-y-2">{requiredDocs.map((doc) => <button key={doc.code} type="button" onClick={() => switchTab("documents")} className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg border border-ink-100 px-3 text-left hover:border-brand-200 hover:bg-brand-50"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${doc.filled ? "bg-success-50 text-success-800" : "bg-ink-50 text-ink-400"}`}>{doc.filled ? <Icon name="check" size={15} /> : <Icon name="file" size={15} />}</span><span className="min-w-0 flex-1"><span className="block font-mono text-xs font-semibold text-brand-800">{doc.code}</span><span className="block truncate text-xs text-ink-600">{doc.name}</span></span><Icon name="chevronRight" size={15} className="text-ink-400" /></button>)}</div></Card>
      </aside>
    </div>
  </div>;
}

function OverviewPanel({ caseData }: { caseData: CaseDetail }) {
  return <div className="space-y-5"><Card className="p-5"><SectionTitle title="Apa yang berlaku?" /><p className="whitespace-pre-wrap text-sm leading-7 text-ink-800">{caseData.details || "Tiada butiran diberikan."}</p></Card><Card className="p-5"><SectionTitle title="Kesalahan direkodkan" description="Mata di bawah adalah jumlah untuk kes ini sahaja." /><div className="space-y-2">{caseData.offences.map((offence) => <div key={offence.code} className="flex items-start gap-3 rounded-lg border border-ink-100 px-4 py-3"><span className="rounded-md bg-brand-50 px-2 py-1 font-mono text-xs font-semibold text-brand-800">{offence.code}</span><span className="flex-1 text-sm leading-6 text-ink-800">{offence.name}</span><span className="whitespace-nowrap font-mono text-sm font-semibold text-gold-800">{offence.points} mata</span></div>)}</div></Card></div>;
}

function InvestigationPanel({ caseData, fields, setFields, busy, onSave, name, roles, canReview, onReview }: { caseData: CaseDetail; fields: Record<string, string>; setFields: (value: Record<string, string>) => void; busy: string; onSave: () => void; name: string; roles: string[]; canReview: boolean; onReview: (formId: number) => void }) {
  const canAdd = ["REPORTED", "INVESTIGATING"].includes(caseData.status);
  const [selected, setSelected] = useState<B02Form | null>(null);
  const fillRole = ["super_admin", "pentadbir", "guru_disiplin", "guru_biasa"].find((role) => roles.includes(role)) || "";
  return <div className="space-y-5"><Card className="p-5"><SectionTitle title="Borang siasatan B02" description="Setiap borang disimpan dengan nama dan peranan pengisi. Satu kes boleh mempunyai lebih daripada satu B02. Pilih borang untuk membaca laporan penuh." />{caseData.b02_forms.length ? <div className="mb-5 space-y-2">{caseData.b02_forms.map((form) => <button key={form.id} type="button" onClick={() => setSelected(form)} className="group flex w-full cursor-pointer items-start gap-3 rounded-lg border border-success-200 bg-success-50/60 px-4 py-3 text-left transition-colors hover:border-success-400 hover:bg-success-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-500"><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-xs font-semibold text-success-800">B02-{form.id}</span><span className="text-xs font-semibold text-success-800">Disimpan {formatDateTime(form.filled_at)}</span></span><span className="mt-1 block text-sm text-ink-800">Diisi oleh <strong>{form.fill_by}</strong> · {roleLabel(form.fill_role)}</span>{form.fields.isu ? <span className="mt-1 block text-xs text-ink-600">Isu: {form.fields.isu}</span> : null}<span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-success-800 group-hover:text-success-900">Buka laporan <Icon name="chevronRight" size={13} /></span></span><Icon name="eye" size={17} className="mt-0.5 shrink-0 text-success-700" /></button>)}</div> : <EmptyState icon="search" title="Belum ada laporan siasatan" description="Tambah B02 selepas perbualan, semakan saksi, atau pemeriksaan bukti." />}{canAdd ? <div className="border-t border-ink-100 pt-5"><p className="mb-4 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm text-ink-700">Disediakan oleh: <strong>{name}</strong> · {roleLabel(fillRole)}</p><p className="mb-4 text-sm leading-6 text-ink-700">Lengkapkan hanya maklumat yang diketahui. Medan saksi dan bahan sokongan adalah pilihan.</p><div className="grid gap-4 md:grid-cols-2">{B02_FIELDS.map(([key, label]) => <label key={key} className="block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">{label}{["aduan", "tarikhAduan", "isu", "laporan"].includes(key) ? <span className="ml-1 text-danger-700">*</span> : null}</span>{["laporan", "punca", "penambahbaikan", "saksi", "bukti", "isu", "butiranPengadu"].includes(key) ? <textarea value={fields[key] || ""} onChange={(event) => setFields({ ...fields, [key]: event.target.value })} rows={key === "laporan" ? 4 : 2} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /> : <input type={key.toLowerCase().includes("tarikh") ? "date" : "text"} value={fields[key] || ""} onChange={(event) => setFields({ ...fields, [key]: event.target.value })} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" />}</label>)}</div><Button className="mt-5" disabled={busy === "b02"} onClick={onSave}>{busy === "b02" ? "Menyimpan…" : "Simpan B02"}</Button></div> : null}{selected ? <B02DetailModal form={selected} onClose={() => setSelected(null)} canReview={canReview} onReview={onReview} busy={busy} /> : null}</Card></div>;
}

function B02DetailModal({ form, onClose, canReview, onReview, busy }: { form: B02Form; onClose: () => void; canReview: boolean; onReview: (formId: number) => void; busy: string }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  const signature = [
    ["Disediakan oleh", [["disediakanOleh", "Nama"], ["disediakanJawatan", "Jawatan"], ["disediakanTarikh", "Tarikh"]]],
    ["Disemak / disahkan oleh", [["disemakOleh", "Nama"], ["disemakJawatan", "Jawatan"], ["disemakTarikh", "Tarikh"]]],
  ] as const;
  return <div role="dialog" aria-modal="true" aria-label={`Laporan siasatan B02-${form.id}`} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <button type="button" aria-label="Tutup" onClick={onClose} className="absolute inset-0 cursor-pointer bg-brand-950/40" />
    <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-ink-100 bg-surface shadow-card">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-ink-100 bg-surface px-5 py-4"><div><p className="font-mono text-xs font-semibold text-success-800">B02-{form.id}</p><h2 className="font-display text-xl font-semibold text-brand-950">Laporan siasatan</h2></div><button ref={closeRef} type="button" onClick={onClose} aria-label="Tutup" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"><Icon name="close" size={18} /></button></div>
      <div className="space-y-5 px-5 py-5">
        <p className="text-sm text-ink-700">Diisi oleh <strong>{form.fill_by}</strong> · {roleLabel(form.fill_role)} · <span className="whitespace-nowrap">{formatDateTime(form.filled_at)}</span></p>
        <div className="space-y-4">{B02_FIELDS.map(([key, label]) => <div key={key}><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink-800">{form.fields[key]?.trim() ? form.fields[key] : "—"}</p></div>)}</div>
        <div className="grid gap-5 border-t border-ink-100 pt-5 sm:grid-cols-2">{signature.map(([title, fields]) => <div key={title}><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">{title}</p>{fields.map(([key, label]) => <p key={key} className="mt-1.5 text-sm text-ink-800"><span className="font-semibold">{label}: </span>{form.fields[key]?.trim() ? form.fields[key] : "—"}</p>)}</div>)}</div>
        {canReview ? <div className="border-t border-ink-100 pt-5"><Button variant="gold" disabled={busy === `review-${form.id}`} onClick={() => onReview(form.id)}>{busy === `review-${form.id}` ? "Menyimpan…" : form.fields.disemakOleh?.trim() ? "Tandakan disemak semula" : "Tandakan disemak"}</Button></div> : null}
      </div>
    </div>
  </div>;
}

function DocumentsPanel({ caseData, requiredDocs, docFields, setDocFields, meetingFields, setMeetingFields, counsellingFields, setCounsellingFields, punishmentFields, setPunishmentFields, busy, onSaveDocument, onSaveMeeting, onSaveCounselling, onSavePunishment }: { caseData: CaseDetail; requiredDocs: { id: string; code: string; name: string; filled: boolean }[]; docFields: Record<string, string>; setDocFields: (value: Record<string, string>) => void; meetingFields: Record<string, string>; setMeetingFields: (value: Record<string, string>) => void; counsellingFields: Record<string, string>; setCounsellingFields: (value: Record<string, string>) => void; punishmentFields: Record<string, string>; setPunishmentFields: (value: Record<string, string>) => void; busy: string; onSaveDocument: (code: string, data: Record<string, string>) => void; onSaveMeeting: () => void; onSaveCounselling: () => void; onSavePunishment: () => void }) {
  const b06Required = requiredDocs.some((doc) => doc.code === "B06");
  const b07Required = requiredDocs.some((doc) => doc.code === "B07");
  const b08Required = requiredDocs.some((doc) => doc.code === "B08");
  return <div className="space-y-5"><Card className="p-5"><SectionTitle title="Dokumen dan cetakan" description="Maklumat yang disimpan di sini akan digunakan dalam paparan cetakan rasmi." /><div className="grid gap-3 sm:grid-cols-2">{requiredDocs.map((doc) => <div key={doc.code} className="flex items-start gap-3 rounded-lg border border-ink-100 bg-ink-50/50 p-4"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${doc.filled ? "bg-success-50 text-success-800" : "bg-white text-ink-400"}`}>{doc.filled ? <Icon name="circleCheck" size={18} /> : <Icon name="file" size={18} />}</div><div className="min-w-0 flex-1"><p className="font-mono text-xs font-semibold text-brand-800">{doc.code}</p><p className="mt-1 text-sm font-semibold text-ink-800">{doc.name}</p><Link href={`/kes/${caseData.id}/cetak/${doc.id}`} className="mt-2 inline-flex min-h-10 cursor-pointer items-center gap-1 text-xs font-bold text-brand-700 hover:text-gold-700">Cetak dokumen <Icon name="printer" size={13} /></Link></div></div>)}</div></Card>{b06Required ? <Card className="p-5"><SectionTitle title="Surat pemberitahuan / amaran B06" description="Pentadbir ialah pihak berkuasa menandatangani buat masa ini." /><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Peringkat amaran</span>{caseData.points >= 31 ? <input type="text" value="Terakhir" readOnly className="h-11 w-full rounded-lg border border-ink-200 bg-ink-50 px-3 text-sm font-semibold text-ink-700" /> : <select value={docFields.warningLevel || caseData.warning_level || "Pertama"} onChange={(event) => setDocFields({ ...docFields, warningLevel: event.target.value })} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"><option>Pertama</option><option>Kedua</option><option>Ketiga</option></select>}</label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Tarikh surat</span><input type="date" value={docFields.tarikhSurat || ""} onChange={(event) => setDocFields({ ...docFields, tarikhSurat: event.target.value })} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Tarikh pertemuan</span><input type="date" value={docFields.tarikhJumpa || ""} onChange={(event) => setDocFields({ ...docFields, tarikhJumpa: event.target.value })} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Masa pertemuan</span><input type="time" value={docFields.masaJumpa || ""} onChange={(event) => setDocFields({ ...docFields, masaJumpa: event.target.value })} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label></div><Button variant="secondary" className="mt-5" disabled={busy === "b06"} onClick={() => onSaveDocument("b06", docFields)}>{busy === "b06" ? "Menyimpan…" : "Simpan maklumat B06"}</Button></Card> : null}{b07Required ? <Card className="p-5"><SectionTitle title="Barang rampasan B07" description="Lengkapkan jika kesalahan melibatkan barang yang dirampas atau disita." /><label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Barang yang dirampas</span><input value={String(caseData.b07?.barang || "")} onChange={(event) => setDocFields({ ...docFields, barang: event.target.value })} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><Button variant="secondary" className="mt-5" disabled={busy === "b07"} onClick={() => onSaveDocument("b07", { barang: docFields.barang || "" })}>{busy === "b07" ? "Menyimpan…" : "Simpan B07"}</Button></Card> : null}{b08Required ? <Card className="p-5"><SectionTitle title="Surat akujanji B08" description="Dokumen ini diperlukan untuk kes 21 mata ke atas (Peringkat 4–6)." /><label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Catatan surat</span><textarea value={docFields.catatanB08 || ""} onChange={(event) => setDocFields({ ...docFields, catatanB08: event.target.value })} rows={3} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><Button variant="secondary" className="mt-5" disabled={busy === "b08"} onClick={() => onSaveDocument("b08", { catatan: docFields.catatanB08 || "" })}>{busy === "b08" ? "Menyimpan…" : "Simpan B08"}</Button></Card> : null}<Card className="p-5"><SectionTitle title="Rekod pertemuan ibu bapa" description="Simpan hasil pertemuan dalam rekod kes. Maklumat ini hanya tersedia untuk staf berkuasa." /><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Tarikh</span><input type="date" value={meetingFields.tarikh || ""} onChange={(event) => setMeetingFields({ ...meetingFields, tarikh: event.target.value })} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Masa</span><input type="time" value={meetingFields.masa || ""} onChange={(event) => setMeetingFields({ ...meetingFields, masa: event.target.value })} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Nama ibu bapa / penjaga</span><input value={meetingFields.nama || ""} onChange={(event) => setMeetingFields({ ...meetingFields, nama: event.target.value })} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Hasil dan catatan</span><textarea value={meetingFields.catatan || ""} onChange={(event) => setMeetingFields({ ...meetingFields, catatan: event.target.value })} rows={3} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label></div><Button variant="secondary" className="mt-5" disabled={busy === "meeting"} onClick={onSaveMeeting}>{busy === "meeting" ? "Menyimpan…" : "Simpan rekod pertemuan"}</Button></Card>{caseData.points >= 11 ? <Card className="p-5"><SectionTitle title="Sesi kaunseling" description="Wajib bagi Peringkat 3–5 (11–40 mata) sebelum kes ditutup. Setiap sesi direkod berasingan." />{(caseData.counselling || []).length ? <div className="mb-4 space-y-2">{(caseData.counselling || []).map((session, index) => <div key={index} className="rounded-lg border border-brand-200 bg-brand-50/60 px-4 py-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold text-brand-800">Sesi {index + 1}</span><span className="text-xs text-ink-600">{session.tarikh || ""}{session.kaunselor ? ` · ${session.kaunselor}` : ""}</span></div>{session.catatan ? <p className="mt-1 text-sm text-ink-700">{session.catatan}</p> : null}</div>)}</div> : null}<div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Tarikh sesi</span><input type="date" value={counsellingFields.tarikh || ""} onChange={(event) => setCounsellingFields({ ...counsellingFields, tarikh: event.target.value })} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Kaunselor</span><input value={counsellingFields.kaunselor || ""} onChange={(event) => setCounsellingFields({ ...counsellingFields, kaunselor: event.target.value })} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Catatan</span><textarea value={counsellingFields.catatan || ""} onChange={(event) => setCounsellingFields({ ...counsellingFields, catatan: event.target.value })} rows={3} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label></div><Button variant="secondary" className="mt-5" disabled={busy === "counselling"} onClick={onSaveCounselling}>{busy === "counselling" ? "Menyimpan…" : "Rekod sesi kaunseling"}</Button></Card> : null}{caseData.points >= 31 && caseData.points <= 40 ? <Card className="p-5"><SectionTitle title="Hukuman Peringkat 5" description="Rekod hukuman gantung asrama / gantung sekolah / rotan mengikut Modul SPSM." />{caseData.punishment ? <div className="mb-4 rounded-lg border border-danger-200 bg-danger-50/60 px-4 py-3"><p className="text-sm font-semibold text-danger-800">Hukuman: {caseData.punishment.jenis || "-"}</p>{caseData.punishment.catatan ? <p className="mt-1 text-sm text-ink-700">{caseData.punishment.catatan}</p> : null}</div> : null}<div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Jenis hukuman</span><select value={punishmentFields.jenis || ""} onChange={(event) => setPunishmentFields({ ...punishmentFields, jenis: event.target.value })} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"><option value="">Pilih hukuman</option><option>Gantung Asrama</option><option>Gantung Sekolah</option><option>Rotan</option><option>Lain-lain</option></select></label><label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-ink-800">Catatan</span><textarea value={punishmentFields.catatan || ""} onChange={(event) => setPunishmentFields({ ...punishmentFields, catatan: event.target.value })} rows={2} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label></div><Button variant="danger" className="mt-5" disabled={busy === "punishment"} onClick={onSavePunishment}>{busy === "punishment" ? "Menyimpan…" : "Simpan hukuman"}</Button></Card> : null}</div>;
}

function TimelinePanel({ events }: { events: CaseDetail["events"] }) {
  return <Card className="p-5"><SectionTitle title="Kronologi kes" description="Setiap perubahan direkod untuk rujukan dan audit." />{events.length ? <div className="space-y-5">{[...events].reverse().map((event, index) => <div key={`${event.ts}-${index}`} className="flex gap-3"><div className="flex flex-col items-center"><span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${index === 0 ? "bg-gold-500 ring-4 ring-gold-100" : "bg-ink-300"}`} />{index < events.length - 1 ? <span className="mt-1 w-px flex-1 bg-ink-200" /> : null}</div><div className="min-w-0 pb-1"><p className="text-sm leading-6 text-ink-800">{event.text}</p><p className="mt-1 text-xs text-ink-500">{formatDateTime(event.ts)} · {event.by_name || "Sistem"}{event.by_role ? ` · ${roleLabel(event.by_role)}` : ""}</p></div></div>)}</div> : <EmptyState icon="clock" title="Belum ada kronologi" description="Aktiviti kes akan muncul selepas laporan atau tindakan direkodkan." />}</Card>;
}

function casePath(source: string, points: number) {
  if (source === "SPOT_CHECK" || (source === "COMPLAINT" && points > 5)) return CASE_PATH;
  return ["REPORTED", "RECORDED", ...(points >= 6 ? ["STUDENT_ACK", "ACTION_PREPARED", "PRINCIPAL_APPROVAL"] : []), "EXECUTED", ...(points >= 6 ? ["PARENT_NOTIFIED", "MEETING"] : []), "CLOSED"];
}

function requiredDocuments(caseData: CaseDetail) {
  const existing = new Set(caseData.docs.map((doc) => doc.doc_code));
  const codes = ["b01", "b04"];
  if (caseData.source === "PREFECT_WARNING") codes.splice(1, 0, "b03");
  if (caseData.source === "SPOT_CHECK" || (caseData.source === "COMPLAINT" && caseData.points > 5)) codes.splice(1, 0, "b02");
  if (caseData.points >= 6) codes.push("b05", "b06");
  if (caseData.points >= 21) codes.push("b08");
  if (caseData.offences.some((offence) => ["D02", "D03", "J01", "J06", "L09", "L13", "L15"].includes(offence.code))) codes.push("b07");
  codes.push("kad");
  return codes.map((code) => {
    const item = DOCS.find(([id]) => id === code);
    const names: Record<string, string> = {
      b06: caseData.points >= 31 ? "Surat Pemberitahuan / Surat Amaran Terakhir" : "Surat Pemberitahuan / Amaran",
      b08: caseData.points >= 31 ? "Surat Akujanji" : "Surat Perjanjian",
    };
    return { id: code, code: item?.[1] || code.toUpperCase(), name: names[code] || item?.[2] || code, filled: existing.has(code) || (code === "b02" && caseData.b02_forms.length > 0) || (code === "b04" && !["REPORTED", "DISMISSED"].includes(caseData.status)) };
  });
}
