import type { Metadata } from "next";
import { getStoreName } from "@/lib/get-store-name";
import { getTenantInfo } from "@/lib/get-tenant-info";
import { getReturnsContent } from "@/lib/tenant-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const storeName = await getStoreName();
  const isZh = locale === "zh-HK";
  const title = isZh ? `退貨政策 - ${storeName}` : `Returns Policy - ${storeName}`;
  const description = isZh
    ? `${storeName} 退貨政策`
    : `Returns policy for ${storeName}`;

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

export default async function ReturnsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const storeName = await getStoreName();
  const tenant = await getTenantInfo();
  const content = getReturnsContent(tenant.slug);
  const isZh = locale === "zh-HK";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-32">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        {isZh ? "退貨政策" : "Returns Policy"}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        {content.intro}
      </p>

      <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {isZh ? "退貨政策" : "Policy"}
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {content.policy}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {isZh ? "接受退貨嘅情況" : "Accepted Return Reasons"}
          </h2>
          <ul className="list-disc pl-5 text-zinc-700 dark:text-zinc-300 space-y-1">
            {content.acceptedReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {isZh ? "退貨條件" : "Conditions"}
          </h2>
          <ul className="list-disc pl-5 text-zinc-700 dark:text-zinc-300 space-y-1">
            {content.conditions.map((condition) => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {isZh ? "如何申請退貨" : "How to Initiate a Return"}
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {content.contactNote}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {isZh ? "退款時間" : "Refund Timeline"}
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {content.refundTimeline}
          </p>
        </section>
      </div>
    </div>
  );
}
