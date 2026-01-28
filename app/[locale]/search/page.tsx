import type { Locale } from "@/lib/i18n";

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;

  return (
    <div className="px-4 py-6 pb-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-zinc-900">{l === "zh-HK" ? "搜尋" : "Search"}</h1>
        <p className="mt-2 text-zinc-600 text-sm">{l === "zh-HK" ? "（下一步：做搜尋功能）" : "(Next: implement search)"}</p>
      </div>
    </div>
  );
}
