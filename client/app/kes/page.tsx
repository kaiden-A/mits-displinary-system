"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clientApi, SOURCE_LABELS, STATUS_LABELS } from "@/lib/client-api";
import type { CaseSummary } from "@/lib/types";
import { CaseTable } from "@/components/case-ui";
import { Button, Card, Icon, PageHeader } from "@/components/ui";

export default function CasesPage() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [source, setSource] = useState("ALL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientApi<CaseSummary[]>("/cases?limit=200").then(setCases).catch((reason) => setError(reason instanceof Error ? reason.message : "Kes tidak dapat dimuatkan.")).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => cases.filter((item) => {
    const q = query.toLowerCase();
    const matchesQuery = !q || item.student_snapshot?.name?.toLowerCase().includes(q) || String(item.seq).includes(q) || item.details?.toLowerCase().includes(q);
    return matchesQuery && (status === "ALL" || item.status === status) && (source === "ALL" || item.source === source);
  }), [cases, query, status, source]);

  return <div className="mx-auto max-w-[1440px]">
    <PageHeader eyebrow="Operasi" title="Kes disiplin" description="Jejak setiap kes daripada laporan sehingga tindakan selesai." actions={<Link href="/aduan" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800"><Icon name="plus" size={17} />Buat aduan</Link>} />
    <Card className="mb-5 p-4"><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px_auto]"><label className="relative block"><span className="sr-only">Cari kes</span><Icon name="search" size={18} className="pointer-events-none absolute left-3 top-3.5 text-ink-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama murid, nombor kes, atau butiran…" className="h-11 w-full rounded-lg border border-ink-200 bg-white pl-10 pr-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-200" /></label><label><span className="sr-only">Tapis status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"><option value="ALL">Semua status</option>{Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label><span className="sr-only">Tapis sumber</span><select value={source} onChange={(event) => setSource(event.target.value)} className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"><option value="ALL">Semua sumber</option>{Object.entries(SOURCE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><Button variant="secondary" size="md" onClick={() => { setQuery(""); setStatus("ALL"); setSource("ALL"); }}><Icon name="refresh" size={16} />Set semula</Button></div><div className="mt-3 flex items-center justify-between gap-3 text-xs text-ink-500"><span>{loading ? "Memuatkan kes…" : `${filtered.length} daripada ${cases.length} kes`}</span>{error ? <span className="text-danger-800">{error}</span> : null}</div></Card>
    <CaseTable cases={filtered} emptyTitle={loading ? "Memuatkan kes…" : "Tiada kes sepadan"} emptyDescription={loading ? "Data sedang dimuatkan." : "Cuba ubah carian atau penapis anda."} />
  </div>;
}
