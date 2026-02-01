import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Translations } from "@/lib/translations";
import { Instagram, Facebook } from "lucide-react";

export default function Footer({ locale, t }: { locale: Locale; t: Translations }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900 text-zinc-100 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="px-6 py-8 text-center">
        {/* Brand */}
        <h3 className="text-lg font-bold mb-3">HK•Market</h3>

        {/* Links - No section titles */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4 text-sm">
          <Link
            href={`/${locale}/about`}
            className="text-zinc-400 hover:text-olive-400 transition-colors"
          >
            {t.footer.about}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="text-zinc-400 hover:text-olive-400 transition-colors"
          >
            {t.footer.contact}
          </Link>
          <Link
            href={`/${locale}/privacy`}
            className="text-zinc-400 hover:text-olive-400 transition-colors"
          >
            {t.footer.privacy}
          </Link>
          <Link
            href={`/${locale}/terms`}
            className="text-zinc-400 hover:text-olive-400 transition-colors"
          >
            {t.footer.terms}
          </Link>
        </div>

        {/* Social Media - No section title */}
        <div className="flex justify-center gap-3 mb-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-olive-600 transition-colors dark:bg-zinc-900"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-olive-600 transition-colors dark:bg-zinc-900"
            aria-label="Facebook"
          >
            <Facebook size={18} />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-zinc-500 text-xs">
          © {currentYear} HK•Market. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
