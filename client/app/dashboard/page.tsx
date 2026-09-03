import Link from "next/link";
import { getSession } from "@/lib/session";
import { apiFetch } from "@/lib/api";
import type { CaseSummary } from "@/lib/types";
import { CaseTable, QueueCard } from "@/components/case-ui";
import { PageHeader, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || session.authType !== "staff") return null;
  let cases: CaseSummary[] = [];
  let error = "";
  try { cases = await apiFetch<CaseSummary[]>("/cases?limit=200", session.access_token); } catch (reason) { error = reason instanceof Error ? reason.message : "Data tidak dapat dimuatkan."; }
  const review = cases.filter((item) => item.source === "PREFECT_WARNING" && item.status === "REPORTED");
  const investigation = cases.filter((item) => item.status === "REPORTED" && (item.source === "SPOT_CHECK" || (item.source === "COMPLAINT" && item.points > 5)));
  const signing = cases.filter((item) => item.status === "PRINCIPAL_APPROVAL");
  const active = cases.filter((item) => !["CLOSED", "DISMISSED"].includes(item.status));
  const role = session.roles.includes("pentadbir") || session.roles.includes("super_admin") ? "Pentadbir" : "Guru disiplin";

  return <div className="mx-auto max-w-[1440px]">
    <PageHeader eyebrow={`Selamat datang, ${session.name}`} title={`Ringkasan ${role}`} description="Mulakan dengan tindakan yang memerlukan perhatian anda hari ini." actions={<><Link href="/aduan" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-200 bg-white px-4 text-sm font-semibold text-brand-800 hover:bg-brand-50">Buat aduan</Link><Link href="/spot-check" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800">Rekod spot check</Link></>} />
    {error ? <div role="alert" className="mb-5 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800">Sambungan ke sistem gagal: {error}</div> : null}
    <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Menunggu semakan" value={review.length} helper="Kad Peringatan B03" icon="warning" tone="gold" /><StatCard label="Menunggu siasatan" value={investigation.length} helper="Perlu Borang B02" icon="search" tone="blue" /><StatCard label="Menunggu tandatangan" value={signing.length} helper="Pentadbir" icon="pen" tone="gold" /><StatCard label="Kes aktif" value={active.length} helper={`${cases.length} kes keseluruhan`} icon="folder" tone="green" /></div>
    <div className="mb-7 grid gap-5 xl:grid-cols-3"><QueueCard title="Semakan Kad Peringatan" description="Sahkan atau tolak laporan B03 daripada pengawas." cases={review} actionLabel="Lihat semua semakan" /><QueueCard title="Siasatan baharu" description="Kes yang melebihi 5 mata memerlukan B02." cases={investigation} actionLabel="Lihat semua siasatan" /><QueueCard title="Menunggu tandatangan" description="Dokumen yang memerlukan pengesahan Pentadbir." cases={signing} actionLabel="Lihat semua dokumen" /></div>
    <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="font-display text-2xl font-semibold text-brand-950">Kes terkini</h2><p className="mt-1 text-sm text-ink-600">Kes anda dipaparkan mengikut rekod paling baharu.</p></div><Link href="/kes" className="text-sm font-bold text-brand-700 hover:text-gold-700">Buka senarai penuh</Link></div>
    <CaseTable cases={cases.slice(0, 8)} emptyTitle="Belum ada kes" emptyDescription="Apabila laporan baharu diterima, ia akan muncul di sini." />
  </div>;
}
