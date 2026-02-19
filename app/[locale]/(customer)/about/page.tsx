import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
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
    title: isZh ? `關於我們 - ${storeName}` : `About Us - ${storeName}`,
    description: isZh
      ? `了解更多關於 ${storeName}`
      : `Learn more about ${storeName}`,
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const storeName = await getStoreName();
  const isZh = locale === "zh-HK";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-32">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        {isZh ? "關於我們" : "About Us"}
      </h1>

      <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {isZh ? "我們嘅使命" : "Our Mission"}
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {isZh
              ? `${storeName} 致力為香港顧客提供優質嘅產品同購物體驗。我們精心挑選每一件商品，確保品質同性價比。`
              : `${storeName} is dedicated to providing quality products and an excellent shopping experience for customers in Hong Kong. We carefully curate every item to ensure quality and value.`}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {isZh ? "點解揀我哋？" : "Why Choose Us?"}
          </h2>
          <ul className="list-disc pl-5 text-zinc-700 dark:text-zinc-300 space-y-1">
            <li>{isZh ? "正品保證" : "100% authentic products"}</li>
            <li>{isZh ? "快速本地送貨" : "Fast local delivery"}</li>
            <li>{isZh ? "貼心客戶服務" : "Dedicated customer service"}</li>
            <li>{isZh ? "安全付款方式" : "Secure payment methods"}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {isZh ? "聯絡我們" : "Get in Touch"}
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {isZh ? "如有任何查詢，歡迎聯絡我們：" : "For any enquiries, feel free to contact us:"}
          </p>
          <ul className="list-disc pl-5 text-zinc-700 dark:text-zinc-300 space-y-1">
            <li>
              {isZh ? "電郵：" : "Email: "}
              <a
                href="mailto:wowlix@flowstudiohk.com"
                className="underline"
              >
                wowlix@flowstudiohk.com
              </a>
            </li>
            <li>
              {isZh ? "網站：" : "Website: "}
              <a
                href="https://wowlix.com"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://wowlix.com
              </a>
            </li>
          </ul>
        </section>

        <p className="text-xs text-zinc-400 dark:text-zinc-500 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          {isZh
            ? "本平台由 Wowlix 提供技術支援，由 Flow Studio HK 營運。"
            : "This Platform is powered by Wowlix and operated by Flow Studio HK."}
        </p>
      </div>
    </div>
  );
}
