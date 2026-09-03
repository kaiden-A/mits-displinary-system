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
  REPORTED: "Menunggu semakan",
  INVESTIGATING: "Dalam siasatan",
  CONFIRMED: "Disahkan berasas",
  DISMISSED: "Ditolak / tidak berasas",
  RECORDED: "Direkod dalam B04",
  STUDENT_ACK: "Menunggu pengakuan murid",
  ACTION_PREPARED: "Tindakan disediakan",
  PRINCIPAL_APPROVAL: "Menunggu tandatangan",
  EXECUTED: "Tindakan dilaksanakan",
  PARENT_NOTIFIED: "Ibu bapa dimaklumkan",
  MEETING: "Pertemuan ibu bapa",
  CLOSED: "Kes ditutup",
};

export const STATUS_DETAIL_LABELS: Record<string, string> = {
  REPORTED: "Dilaporkan dan menunggu semakan",
  INVESTIGATING: "Borang siasatan sedang dilengkapkan",
  CONFIRMED: "Aduan disahkan berasas",
  DISMISSED: "Aduan ditolak atau didapati tidak berasas",
  RECORDED: "Kesalahan telah direkod dalam Buku Rekod Disiplin",
  STUDENT_ACK: "Menunggu pengakuan murid",
  ACTION_PREPARED: "Dokumen dan tindakan sedang disediakan",
  PRINCIPAL_APPROVAL: "Menunggu tandatangan Pentadbir",
  EXECUTED: "Tindakan disiplin telah dilaksanakan",
  PARENT_NOTIFIED: "Ibu bapa atau penjaga telah dimaklumkan",
  MEETING: "Menunggu atau sedang merekod pertemuan ibu bapa",
  CLOSED: "Semua langkah kes telah selesai",
};

export const SOURCE_LABELS: Record<string, string> = {
  COMPLAINT: "Aduan (B01)",
  PREFECT_WARNING: "Kad Peringatan (B03)",
  SPOT_CHECK: "Spot Check",
};

export const ROLE_LABELS: Record<string, string> = {
  guru_biasa: "Guru",
  guru_disiplin: "Guru disiplin",
  pentadbir: "Pentadbir",
  super_admin: "Super admin",
  pengawas: "Pengawas",
};

export const CASE_PATH = ["REPORTED", "INVESTIGATING", "CONFIRMED", "RECORDED", "STUDENT_ACK", "ACTION_PREPARED", "PRINCIPAL_APPROVAL", "EXECUTED", "PARENT_NOTIFIED", "MEETING", "CLOSED"];

export function statusTone(status: string): "green" | "gold" | "red" | "blue" | "neutral" {
  if (["CLOSED", "RECORDED", "EXECUTED", "CONFIRMED"].includes(status)) return "green";
  if (["REPORTED", "STUDENT_ACK", "ACTION_PREPARED", "PRINCIPAL_APPROVAL", "PARENT_NOTIFIED", "MEETING"].includes(status)) return "gold";
  if (status === "DISMISSED") return "red";
  if (status === "INVESTIGATING") return "blue";
  return "neutral";
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ms-MY", { dateStyle: "medium" }).format(new Date(value));
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ms-MY", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function roleLabel(role: string) {
  return ROLE_LABELS[role] || role;
}

export function sourceLabel(source: string) {
  return SOURCE_LABELS[source] || source;
}

export function statusBadge(status: string): string {
  return STATUS_LABELS[status] || status;
}
