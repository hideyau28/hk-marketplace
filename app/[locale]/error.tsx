"use client";

import { usePathname } from "next/navigation";
import { getDict, type Locale } from "@/lib/i18n";

export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = pathname?.startsWith("/zh-HK") ? "zh-HK" : "en";
  const t = getDict(locale as Locale);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* WoWlix branding */}
        <div className="mb-6">
          <span className="text-2xl font-bold tracking-tight text-white">
            Wo<span className="text-orange-500">W</span>lix
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-8xl font-extrabold text-orange-500 mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-white mb-3">
            {t.errorPage.errorTitle}
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            {t.errorPage.errorDesc}
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="inline-block rounded-2xl bg-orange-500 px-8 py-4 text-white font-semibold hover:bg-orange-600 transition-colors cursor-pointer"
        >
          {t.errorPage.retry}
        </button>
      </div>
    </div>
  );
}
