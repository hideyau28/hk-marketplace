"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/lib/i18n";

export default function AdminPreviewBanner({ locale }: { locale: Locale }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/tenant-admin/me")
      .then((res) => {
        if (res.ok) setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  if (!isAdmin) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[60] bg-zinc-900 text-white flex items-center justify-center gap-3 h-8 text-xs">
        <span>Preview Mode</span>
        <a
          href={`/${locale}/admin`}
          className="underline underline-offset-2 hover:text-zinc-300 transition-colors"
        >
          Back to Edit
        </a>
      </div>
      {/* Spacer to push content below the fixed banner */}
      <div className="h-8" />
    </>
  );
}
