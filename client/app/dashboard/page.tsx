import Link from "next/link";
import { getSession } from "@/lib/session";
import { apiFetch } from "@/lib/api";
import { isManager } from "@/lib/permissions";
import type { CaseSummary } from "@/lib/types";
import { SOURCE_LABELS, STATUS_LABELS } from "@/lib/client-api";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || session.authType !== "staff") return null;
  const token = session.access_token;

  let cases: CaseSummary[] = [];
  let error = "";
  try {
    cases = await apiFetch<CaseSummary[]>("/cases", token);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const pending = cases.filter((c) => c.status === "REPORTED");
  const investigating = cases.filter((c) => c.status === "INVESTIGATING");
  const approval = cases.filter((c) => c.status === "PRINCIPAL_APPROVAL");
  const manager = isManager(session);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800">Papan Pemuka</h1>
      <p className="text-sm text-slate-500 mb-6">
        Log masuk sebagai: {session.name} · {session.roles.join(", ")}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Menunggu Semakan / Aduan" value={pending.length} />
        <StatCard label="Dalam Siasatan" value={investigating.length} />
        <StatCard label="Menunggu Tandatangan" value={approval.length} />
        <StatCard label="Jumlah Kes" value={cases.length} />
      </div>

      {manager && pending.length > 0 ? (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-4 mb-6">
          <h2 className="font-semibold text-red-700 mb-3">Aduan / Kad Menunggu Tindakan</h2>
          <div className="space-y-2">
            {pending.map((c) => (
              <Link
                key={c.id}
                href={`/kes/${c.id}`}
                className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2 hover:bg-red-100"
              >
                <span className="text-sm">
                  <span className="font-mono text-xs text-red-600 font-semibold">K-{c.seq}</span> —{" "}
                  {c.student_snapshot?.name} · {SOURCE_LABELS[c.source]} · {c.points} mata
                </span>
                <span className="text-xs font-semibold text-red-700">Buka →</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 font-semibold text-slate-800">
          Senarai Kes {!manager ? "(kes anda sahaja)" : ""}
        </div>
        {error ? (
          <div className="px-4 py-6 text-sm text-red-600">{error} — pastikan API berjalan & pastikan /students/sync dilaksanakan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2">Kes</th>
                  <th className="px-3 py-2">Murid</th>
                  <th className="px-3 py-2">Kesalahan</th>
                  <th className="px-3 py-2 text-center">Mata</th>
                  <th className="px-3 py-2">Sumber</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 border-t border-slate-100">
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold text-emerald-700">K-{c.seq}</td>
                    <td className="px-3 py-2.5">
                      <Link href={`/kes/${c.id}`} className="font-medium text-slate-800 hover:text-emerald-700">
                        {c.student_snapshot?.name}
                      </Link>
                      <div className="text-xs text-slate-400">{c.student_snapshot?.kelas_label}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{c.points > 0 ? `${c.points} mata` : "-"}</td>
                    <td className="px-3 py-2.5 text-center font-bold">{c.points}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{SOURCE_LABELS[c.source]}</td>
                    <td className="px-3 py-2.5">{STATUS_LABELS[c.status]}</td>
                    <td className="px-3 py-2.5 text-right">
                      <Link href={`/kes/${c.id}`} className="text-xs font-semibold text-emerald-700 hover:underline">
                        Buka →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="text-2xl font-bold leading-none">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}