import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "My Orders - HK•Market",
    description: "View and track your orders at HK•Market.",
    openGraph: {
      title: "My Orders - HK•Market",
      description: "View and track your orders at HK•Market.",
      type: "website",
      locale: locale === "zh-HK" ? "zh_HK" : "en_US",
    },
  };
}

export default async function OrdersListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;

  return (
    <div className="px-4 py-6 pb-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-zinc-900">{l === "zh-HK" ? "我的訂單" : "My Orders"}</h1>
        <p className="mt-2 text-zinc-600 text-sm">
          {l === "zh-HK" ? "（暫時：可從結帳成功頁進入單一訂單）」" : "(Temporary: order list TBD)"}
        </p>
        <div className="mt-6">
          <Link href={`/${l}`} className="text-[var(--primary)] underline">
            {l === "zh-HK" ? "返回首頁" : "Back to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
