"use client";

import type { Locale } from "@/lib/i18n";
import { defaultStore } from "@/lib/store";
import { useMemo, useState } from "react";

export default async function AdminSettings({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const initial = useMemo(() => defaultStore, []);
  const [storeName, setStoreName] = useState(initial.storeName);
  const [tagline, setTagline] = useState(initial.tagline);

  return (
    <div className="px-4 pb-16 pt-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-white/60 text-sm">Admin</div>
          <h1 className="mt-1 text-2xl font-semibold text-white">Settings</h1>
          <div className="mt-2 text-white/60 text-sm">Single-shop storefront settings (MVP).</div>
        </div>

        <button
          onClick={() => alert("MVP: settings are not persisted yet. Next step: save to DB.")}
          className="rounded-2xl bg-white px-4 py-3 text-black font-semibold hover:bg-white/90"
        >
          Save
        </button>
      </div>

      <div className="mt-6 grid gap-4 max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-white font-medium">Store name</div>
          <div className="mt-2 text-white/60 text-sm">Shown in TopNav / branding.</div>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="e.g. Yau Store"
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-white font-medium">Tagline</div>
          <div className="mt-2 text-white/60 text-sm">Shown on homepage hero.</div>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="e.g. Curated picks, easy checkout"
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-white font-medium">Policies (placeholder)</div>
          <div className="mt-2 text-white/60 text-sm">Returns / shipping policy will live here later.</div>
          <textarea
            rows={6}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="Return policy..."
          />
        </div>
      </div>
    </div>
  );
}
