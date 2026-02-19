import type { Metadata } from "next";
import { getStoreName } from "@/lib/get-store-name";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const storeName = await getStoreName();
  const isZh = locale === "zh-HK";
  return {
    title: isZh ? `聯絡我們 - ${storeName}` : `Contact Us - ${storeName}`,
    description: isZh
      ? `聯絡 ${storeName}，WhatsApp 或電郵查詢`
      : `Contact ${storeName} via WhatsApp or email`,
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const storeName = await getStoreName();
  const isZh = locale === "zh-HK";

  if (isZh) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 pb-32">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          聯絡我們
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          如有任何查詢，歡迎透過以下方式聯絡我們。
        </p>

        <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              WhatsApp
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              最快捷嘅聯絡方式，一般喺辦公時間內回覆。
            </p>
            <a
              href="https://wa.me/85298765432"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1da851] transition-colors"
            >
              <svg viewBox="0 0 32 32" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M16 2.4c-7.5 0-13.6 6.1-13.6 13.6 0 2.4.6 4.8 1.8 6.9L2 30l7.3-2.1c2 1.1 4.3 1.7 6.7 1.7 7.5 0 13.6-6.1 13.6-13.6S23.5 2.4 16 2.4zm7.9 19.1c-.3.9-1.5 1.6-2.5 1.8-.7.1-1.6.2-4.7-.9-4.2-1.5-6.8-5.2-7-5.5-.2-.3-1.7-2.2-1.7-4.2s1-3 1.3-3.4c.3-.4.7-.5 1-.5h.7c.2 0 .5 0 .7.6.3.7.9 2.4 1 2.6.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.4-.5.5-.2.2-.4.4-.2.7.2.3.9 1.5 1.9 2.4 1.3 1.2 2.5 1.6 2.9 1.8.4.2.6.2.8 0 .2-.2 1-1.1 1.3-1.5.3-.4.5-.3.9-.2.4.1 2.5 1.2 2.9 1.4.4.2.7.3.8.5.1.2.1.9-.2 1.8z" />
              </svg>
              WhatsApp 聯絡我們
            </a>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              電郵
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              如需詳細查詢或提交文件，可透過電郵聯絡：
            </p>
            <a
              href="mailto:wowlix@flowstudiohk.com"
              className="text-zinc-900 dark:text-zinc-100 underline hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              wowlix@flowstudiohk.com
            </a>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              辦公時間
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              星期一至五：10:00 - 18:00（公眾假期除外）
            </p>
          </section>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            本平台由 Wowlix 提供技術支援，由 Flow Studio HK 營運。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-32">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Contact Us
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        Have a question? Get in touch with us through any of the channels below.
      </p>

      <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            WhatsApp
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            The fastest way to reach us. We typically reply during business hours.
          </p>
          <a
            href="https://wa.me/85298765432"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1da851] transition-colors"
          >
            <svg viewBox="0 0 32 32" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M16 2.4c-7.5 0-13.6 6.1-13.6 13.6 0 2.4.6 4.8 1.8 6.9L2 30l7.3-2.1c2 1.1 4.3 1.7 6.7 1.7 7.5 0 13.6-6.1 13.6-13.6S23.5 2.4 16 2.4zm7.9 19.1c-.3.9-1.5 1.6-2.5 1.8-.7.1-1.6.2-4.7-.9-4.2-1.5-6.8-5.2-7-5.5-.2-.3-1.7-2.2-1.7-4.2s1-3 1.3-3.4c.3-.4.7-.5 1-.5h.7c.2 0 .5 0 .7.6.3.7.9 2.4 1 2.6.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.4-.5.5-.2.2-.4.4-.2.7.2.3.9 1.5 1.9 2.4 1.3 1.2 2.5 1.6 2.9 1.8.4.2.6.2.8 0 .2-.2 1-1.1 1.3-1.5.3-.4.5-.3.9-.2.4.1 2.5 1.2 2.9 1.4.4.2.7.3.8.5.1.2.1.9-.2 1.8z" />
            </svg>
            WhatsApp Us
          </a>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Email
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            For detailed enquiries or document submissions:
          </p>
          <a
            href="mailto:wowlix@flowstudiohk.com"
            className="text-zinc-900 dark:text-zinc-100 underline hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
          >
            wowlix@flowstudiohk.com
          </a>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Business Hours
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Monday to Friday: 10:00 AM - 6:00 PM (excluding public holidays)
          </p>
        </section>

        <p className="text-xs text-zinc-400 dark:text-zinc-500 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          This Platform is powered by Wowlix and operated by Flow Studio HK.
        </p>
      </div>
    </div>
  );
}
