import Link from "next/link";
import type { CaseSummary } from "@/lib/types";
import { formatDate, roleLabel, sourceLabel } from "@/lib/client-api";
import { Card, EmptyState, Icon, StatusBadge } from "@/components/ui";

export function CaseTable({ cases, emptyTitle = "Tiada kes dijumpai", emptyDescription = "Cuba ubah penapis atau tunggu sehingga ada rekod baharu." }: { cases: CaseSummary[]; emptyTitle?: string; emptyDescription?: string }) {
  if (!cases.length) return <Card><EmptyState icon="folder" title={emptyTitle} description={emptyDescription} /></Card>;
  return <Card className="overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-brand-50 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-600">
          <tr>
            <th className="px-5 py-3">Kes</th><th className="px-5 py-3">Murid</th><th className="px-5 py-3">Sumber</th><th className="px-5 py-3">Mata</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Tarikh</th><th className="px-5 py-3"><span className="sr-only">Tindakan</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {cases.map((item) => <tr key={item.id} className="transition-colors duration-150 hover:bg-brand-50/50">
            <td className="whitespace-nowrap px-5 py-4"><Link href={`/kes/${item.id}`} className="font-mono text-xs font-semibold text-brand-700 hover:text-gold-700">K-{String(item.seq).padStart(4, "0")}</Link></td>
            <td className="max-w-[230px] px-5 py-4"><Link href={`/kes/${item.id}`} className="block truncate font-semibold text-brand-950 hover:text-brand-700">{item.student_snapshot?.name || "Murid tidak diketahui"}</Link><span className="mt-0.5 block text-xs text-ink-500">{item.student_snapshot?.kelas_label || "-"}</span></td>
            <td className="whitespace-nowrap px-5 py-4 text-xs text-ink-600">{sourceLabel(item.source)}</td>
            <td className="whitespace-nowrap px-5 py-4"><span className="font-mono text-sm font-semibold tabular-nums text-brand-950">{item.points}</span><span className="ml-1 text-xs text-ink-500">mata</span></td>
            <td className="px-5 py-4"><StatusBadge status={item.status} compact /></td>
            <td className="whitespace-nowrap px-5 py-4 text-xs text-ink-600">{formatDate(item.created_at)}</td>
            <td className="px-5 py-4 text-right"><Link href={`/kes/${item.id}`} aria-label={`Buka kes K-${item.seq}`} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-brand-700 hover:bg-brand-100"><Icon name="chevronRight" /></Link></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Card>;
}

export function QueueCard({ title, description, cases, actionLabel }: { title: string; description: string; cases: CaseSummary[]; actionLabel: string }) {
  return <Card className="overflow-hidden">
    <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4"><div><h2 className="font-display text-xl font-semibold text-brand-950">{title}</h2><p className="mt-1 text-xs leading-5 text-ink-600">{description}</p></div><span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-gold-100 px-2 font-mono text-sm font-semibold text-gold-900">{cases.length}</span></div>
    {cases.length ? <div className="divide-y divide-ink-100">{cases.slice(0, 4).map((item) => <Link key={item.id} href={`/kes/${item.id}`} className="group flex items-center gap-3 px-5 py-4 transition-colors duration-150 hover:bg-brand-50"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Icon name={item.source === "PREFECT_WARNING" ? "warning" : item.status === "PRINCIPAL_APPROVAL" ? "pen" : "search"} size={17} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[11px] font-semibold text-brand-700">K-{String(item.seq).padStart(4, "0")}</span><span className="truncate font-semibold text-brand-950">{item.student_snapshot?.name}</span></div><p className="mt-1 truncate text-xs text-ink-600">{sourceLabel(item.source)} · {item.points} mata · {roleLabel(item.reporter_role)}</p></div><Icon name="chevronRight" size={17} className="shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700" /></Link>)}</div> : <div className="px-5 py-8 text-center text-sm text-ink-500"><Icon name="circleCheck" size={24} className="mx-auto mb-2 text-success-700" />Tiada tindakan menunggu.</div>}
    {cases.length > 4 ? <div className="border-t border-ink-100 px-5 py-3 text-center"><Link href="/kes" className="text-xs font-bold text-brand-700 hover:text-gold-700">{actionLabel} ({cases.length - 4} lagi)</Link></div> : null}
  </Card>;
}
