import { getSession } from "@/lib/session";
import { apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/client-api";
import type { CaseDetail, CaseSummary, StudentSummary } from "@/lib/types";
import PrintToolbar from "@/components/PrintToolbar";
import {
  B01Doc,
  B02Doc,
  B03Doc,
  B04Doc,
  B05Doc,
  B06Doc,
  B07Doc,
  B08Doc,
  GenericDoc,
  KadDoc,
  printTitle,
  PrintStyle,
  type PrefectOffence,
} from "@/components/print/print-docs";

export const dynamic = "force-dynamic";

export default async function PrintDocumentPage({ params }: { params: Promise<{ id: string; document: string }> }) {
  const { id, document } = await params;
  const session = await getSession();
  if (!session || session.authType !== "staff") return null;
  let data: CaseDetail;
  try {
    data = await apiFetch<CaseDetail>(`/cases/${id}`, session.access_token);
  } catch {
    return <p className="p-8 text-sm">Dokumen tidak dapat dimuatkan.</p>;
  }

  let register: CaseSummary[] = [];
  if (document === "b04") {
    try {
      register = await apiFetch<CaseSummary[]>("/cases/recorded", session.access_token);
    } catch {
      register = [data];
    }
  }

  let studentCases: CaseSummary[] = [];
  if (document === "kad") {
    try {
      const summary = await apiFetch<StudentSummary>(`/students/${data.student_source_id}/summary`, session.access_token);
      studentCases = summary.cases;
    } catch {
      /* ignore */
    }
  }

  let prefectCodes: PrefectOffence[] = [];
  if (document === "b03") {
    try {
      prefectCodes = await apiFetch<PrefectOffence[]>("/offences/prefect-allowed", session.access_token);
    } catch {
      /* ignore */
    }
  }

  const title = printTitle(document);
  return (
    <main className="min-h-dvh bg-white text-black">
      <PrintStyle />
      <PrintToolbar backHref={`/kes/${id}?tab=documents`} />
      <article className="print-page mx-auto max-w-3xl px-8 py-10 sm:px-14">
        {renderDocument(document, data, { register, studentCases, prefectCodes })}
        <footer className="mt-10 border-t border-black pt-3 text-[10px]">
          Dokumen dijana daripada SPSM · Kes K-{String(data.seq).padStart(4, "0")} · {title.code} · Dicetak{" "}
          {formatDateTime(new Date())}
        </footer>
      </article>
    </main>
  );
}

function renderDocument(
  document: string,
  data: CaseDetail,
  extra: { register: CaseSummary[]; studentCases: CaseSummary[]; prefectCodes: PrefectOffence[] }
) {
  switch (document) {
    case "b01":
      return <B01Doc c={data} />;
    case "b02":
      return <B02Doc c={data} />;
    case "b03":
      return <B03Doc c={data} codes={extra.prefectCodes} />;
    case "b04":
      return <B04Doc register={extra.register} />;
    case "b05":
      return <B05Doc c={data} />;
    case "b06":
      return <B06Doc c={data} />;
    case "b07":
      return <B07Doc c={data} />;
    case "b08":
      return <B08Doc c={data} />;
    case "kad":
      return <KadDoc c={data} cases={extra.studentCases} />;
    default:
      return <GenericDoc c={data} />;
  }
}