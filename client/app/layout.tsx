import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "SPSM · MITS — Sistem Pembangunan Sahsiah Murid",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const showSidebar = !!session;

  return (
    <html lang="ms">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>
      <body>
        {showSidebar && session ? (
          <Sidebar name={session.name} roles={session.roles} authType={session.authType} />
        ) : null}
        <main className={showSidebar ? "ml-64 max-w-6xl p-6 min-h-screen" : "min-h-screen"}>{children}</main>
      </body>
    </html>
  );
}