import type { Metadata } from "next";
import { getStoreName } from "@/lib/get-store-name";
import { getTenantInfo } from "@/lib/get-tenant-info";
import { getShippingContent } from "@/lib/tenant-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const storeName = await getStoreName();
  const isZh = locale === "zh-HK";
  const title = isZh ? `送貨政策 - ${storeName}` : `Shipping Policy - ${storeName}`;
  const description = isZh
    ? `${storeName} 送貨政策`
    : `Shipping policy for ${storeName}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: storeName,
      type: "website",
      locale: locale === "zh-HK" ? "zh_HK" : "en_US",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function ShippingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const storeName = await getStoreName();
  const tenant = await getTenantInfo();
  const content = getShippingContent(tenant.slug);
  const isZh = locale === "zh-HK";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-32">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        {isZh ? "送貨政策" : "Shipping Policy"}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        {content.intro}
      </p>

      <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {isZh ? "寄出地點" : "Ships From"}
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {content.shipsFrom}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {isZh ? "送貨方式" : "Shipping Options"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="text-left py-2 pr-4 font-medium text-zinc-800 dark:text-zinc-200">
                    {isZh ? "方式" : "Method"}
                  </th>
                  <th className="text-left py-2 pr-4 font-medium text-zinc-800 dark:text-zinc-200">
                    {isZh ? "時間" : "Delivery Time"}
                  </th>
                  <th className="text-left py-2 font-medium text-zinc-800 dark:text-zinc-200">
                    {isZh ? "價格" : "Price"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {content.options.map((option) => (
                  <tr
                    key={option.name}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                      {option.name}
                    </td>
                    <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                      {option.time}
                    </td>
                    <td className="py-2 text-zinc-700 dark:text-zinc-300">
                      {option.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {isZh ? "送貨範圍" : "Destinations"}
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {content.destinations}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {isZh ? "處理時間" : "Processing Time"}
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {content.processingTime}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {isZh ? "關稅及稅項" : "Import Duties & Taxes"}
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {content.dutiesNote}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {isZh ? "物流追蹤" : "Tracking"}
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {content.trackingNote}
          </p>
        </section>
      </div>
    </div>
  );
}
