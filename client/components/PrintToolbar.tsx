"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";

export default function PrintToolbar({ backHref }: { backHref: string }) {
  return (
    <div className="no-print mx-auto flex max-w-3xl items-center justify-between gap-3 border-b border-gray-200 px-6 py-4">
      <Link href={backHref} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-gray-700">
        <Icon name="arrowLeft" size={17} />Kembali ke kes
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white"
      >
        <Icon name="printer" size={16} />Cetak
      </button>
    </div>
  );
}