import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/session";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "SPSM · MITS — Sistem Pembangunan Sahsiah Murid",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="ms">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {session ? <AppShell session={session}>{children}</AppShell> : <main id="main-content" className="min-h-dvh">{children}</main>}
      </body>
    </html>
  );
}
