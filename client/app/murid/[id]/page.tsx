import { getSession } from "@/lib/session";
import StudentProfile from "@/components/StudentProfile";

export const dynamic = "force-dynamic";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return null;
  return <StudentProfile id={id} />;
}
