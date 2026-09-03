"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clientApi, formatDateTime } from "@/lib/client-api";
import type { Notification } from "@/lib/types";
import { Card, EmptyState, Icon, PageHeader } from "@/components/ui";

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]); const [error, setError] = useState("");
  async function load() { try { setItems(await clientApi<Notification[]>("/notifications")); } catch (reason) { setError(reason instanceof Error ? reason.message : "Notifikasi tidak dapat dimuatkan."); } }
  useEffect(() => { load(); }, []);
  async function markRead(item: Notification) { if (item.read) return; await clientApi(`/notifications/${item.id}/read`, { method: "PATCH" }).catch(() => undefined); setItems((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, read: true } : candidate)); }
  return <div className="mx-auto max-w-[900px]"><PageHeader eyebrow="Pusat makluman" title="Notifikasi" description="Pemberitahuan berkaitan laporan, siasatan, dokumen, dan tindakan kes." />{error ? <p className="mb-4 text-sm text-danger-800">{error}</p> : null}<Card className="overflow-hidden">{items.length ? <div className="divide-y divide-ink-100">{items.map((item) => <div key={item.id} className={`flex items-start gap-4 px-5 py-5 ${item.read ? "bg-white" : "bg-gold-50/40"}`}><div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.read ? "bg-ink-50 text-ink-500" : "bg-gold-100 text-gold-800"}`}><Icon name={item.ntype === "CASE_TRANSITION" ? "refresh" : "bell"} size={18} /></div><div className="min-w-0 flex-1"><p className="text-sm leading-6 text-ink-800">{item.text}</p><p className="mt-1 text-xs text-ink-500">{formatDateTime(item.created_at)}</p><div className="mt-3 flex flex-wrap items-center gap-3">{item.case_id ? <Link href={`/kes/${item.case_id}`} onClick={() => markRead(item)} className="text-xs font-bold text-brand-700 hover:text-gold-700">Buka kes <Icon name="chevronRight" size={14} className="ml-1 inline" /></Link> : null}{!item.read ? <button type="button" onClick={() => markRead(item)} className="min-h-10 cursor-pointer text-xs font-semibold text-ink-600 hover:text-brand-700">Tandakan sudah dibaca</button> : null}</div></div>{!item.read ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold-500" title="Belum dibaca" /> : null}</div>)}</div> : <EmptyState icon="bell" title="Tiada notifikasi" description="Makluman baharu akan muncul di sini apabila ada tindakan terhadap kes anda." />}</Card></div>;
}
