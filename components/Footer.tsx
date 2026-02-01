import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Translations } from "@/lib/translations";
import { Instagram, Facebook } from "lucide-react";

export default function Footer({ locale, t }: { locale: Locale; t: Translations }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900 text-zinc-100 pb-24 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="px-6 py-8 text-center">
        {/* Brand */}
        <h3 className="text-lg font-bold mb-3">HK•Market</h3>

        {/* Links - Single line with · separator */}
        <div className="flex justify-center items-center gap-1 mb-4 text-[11px]">
          <Link
            href={`/${locale}/about`}
            className="text-zinc-400 hover:text-olive-400 transition-colors"
          >
            {t.footer.about}
          </Link>
          <span className="text-zinc-600">·</span>
          <Link
            href={`/${locale}/contact`}
            className="text-zinc-400 hover:text-olive-400 transition-colors"
          >
            {t.footer.contact}
          </Link>
          <span className="text-zinc-600">·</span>
          <Link
            href={`/${locale}/privacy`}
            className="text-zinc-400 hover:text-olive-400 transition-colors"
          >
            {t.footer.privacy}
          </Link>
          <span className="text-zinc-600">·</span>
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
            className="w-10 h-10 rounded-full bg-zinc-700 dark:bg-zinc-600 flex items-center justify-center hover:bg-olive-600 transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={20} className="text-white" />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-zinc-700 dark:bg-zinc-600 flex items-center justify-center hover:bg-olive-600 transition-colors"
            aria-label="Facebook"
          >
            <Facebook size={20} className="text-white" />
          </a>
          <a
            href="https://wa.me/85212345678"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-zinc-700 dark:bg-zinc-600 flex items-center justify-center hover:bg-[#25D366] transition-colors"
            aria-label="WhatsApp"
          >
            <svg viewBox="0 0 32 32" className="h-5 w-5 text-white" fill="currentColor" aria-hidden="true">
              <path d="M16 2.4c-7.5 0-13.6 6.1-13.6 13.6 0 2.4.6 4.8 1.8 6.9L2 30l7.3-2.1c2 1.1 4.3 1.7 6.7 1.7 7.5 0 13.6-6.1 13.6-13.6S23.5 2.4 16 2.4zm7.9 19.1c-.3.9-1.5 1.6-2.5 1.8-.7.1-1.6.2-4.7-.9-4.2-1.5-6.8-5.2-7-5.5-.2-.3-1.7-2.2-1.7-4.2s1-3 1.3-3.4c.3-.4.7-.5 1-.5h.7c.2 0 .5 0 .7.6.3.7.9 2.4 1 2.6.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.4-.5.5-.2.2-.4.4-.2.7.2.3.9 1.5 1.9 2.4 1.3 1.2 2.5 1.6 2.9 1.8.4.2.6.2.8 0 .2-.2 1-1.1 1.3-1.5.3-.4.5-.3.9-.2.4.1 2.5 1.2 2.9 1.4.4.2.7.3.8.5.1.2.1.9-.2 1.8z" />
            </svg>
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
