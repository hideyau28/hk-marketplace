import type { Locale } from "@/lib/i18n";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;

  return (
    <div className="px-4 py-6 pb-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-zinc-900">{l === "zh-HK" ? "我的" : "Profile"}</h1>
        <p className="mt-2 text-zinc-600 text-sm">{l === "zh-HK" ? "（下一步：個人資料/登入）" : "(Next: auth/profile)"}</p>
      </div>
    </div>
  );
}
