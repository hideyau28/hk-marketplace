import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Translations } from "@/lib/translations";
import { Instagram, Facebook } from "lucide-react";

export default function Footer({ locale, t }: { locale: Locale; t: Translations }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">HK•Market</h3>
            <p className="text-zinc-400 text-sm">{t.footer.desc}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-zinc-400 hover:text-olive-400 text-sm transition-colors"
                >
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-zinc-400 hover:text-olive-400 text-sm transition-colors"
                >
                  {t.footer.contact}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-zinc-400 hover:text-olive-400 text-sm transition-colors"
                >
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="text-zinc-400 hover:text-olive-400 text-sm transition-colors"
                >
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4">{t.footer.follow}</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-olive-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-olive-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-zinc-800 mt-8 pt-8 text-center">
          <p className="text-zinc-500 text-sm">
            © {currentYear} HK•Market.{" "}
            {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
