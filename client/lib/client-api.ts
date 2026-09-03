export async function clientApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(`${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export const STATUS_LABELS: Record<string, string> = {
  REPORTED: "Dilaporkan / Menunggu Semakan",
  INVESTIGATING: "Dalam Siasatan",
  CONFIRMED: "Disahkan Berasas",
  DISMISSED: "Tidak Berasas / Ditolak",
  RECORDED: "Direkod dalam B04",
  STUDENT_ACK: "Pengakuan Murid",
  ACTION_PREPARED: "Tindakan Disediakan",
  PRINCIPAL_APPROVAL: "Menunggu Tandatangan Pentadbir",
  EXECUTED: "Hukuman Dilaksanakan",
  PARENT_NOTIFIED: "Ibu Bapa Dimaklumkan",
  MEETING: "Pertemuan Ibu Bapa",
  CLOSED: "Tamat",
};

export const SOURCE_LABELS: Record<string, string> = {
  COMPLAINT: "Aduan (B01)",
  PREFECT_WARNING: "Kad Peringatan (B03)",
  SPOT_CHECK: "Spot Check",
};

export function statusBadge(status: string): string {
  return `<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-slate-100 text-slate-700 border-slate-200">${STATUS_LABELS[status] || status}</span>`;
}