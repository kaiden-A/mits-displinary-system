import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isManager } from "@/lib/permissions";

export default async function Home() {
  const session = await getSession();
  if (session) {
    redirect(homePath(session));
  }
  redirect("/login");
}

function homePath(session: NonNullable<Awaited<ReturnType<typeof getSession>>>): string {
  if (session.authType === "pengawas") return "/kad";
  return isManager(session) ? "/dashboard" : "/aduan";
}