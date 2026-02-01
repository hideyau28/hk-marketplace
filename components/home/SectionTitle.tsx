import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export default function SectionTitle({
  title,
  viewAllText,
  viewAllHref,
}: {
  title: string;
  viewAllText?: string;
  viewAllHref?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
      {viewAllText && viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-olive-600 hover:text-olive-700 dark:text-olive-500 dark:hover:text-olive-400"
        >
          {viewAllText}
        </Link>
      )}
    </div>
  );
}
