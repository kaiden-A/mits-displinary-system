import { getSession } from "@/lib/session";
import CaseWorkspace from "@/components/CaseWorkspace";

export const dynamic = "force-dynamic";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return null;
  return <CaseWorkspace id={id} roles={session.roles} authType={session.authType} name={session.name} />;
}
