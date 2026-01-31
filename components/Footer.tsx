import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { Instagram, Facebook } from "lucide-react";

export default function Footer({ locale }: { locale: Locale }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">HK•Market</h3>
            <p className="text-zinc-400 text-sm">
              {locale === "zh-HK"
                ? "香港優質運動產品專門店"
                : "Premium sports products in Hong Kong"}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">
              {locale === "zh-HK" ? "快速連結" : "Quick Links"}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-zinc-400 hover:text-olive-400 text-sm transition-colors"
                >
                  {locale === "zh-HK" ? "關於我們" : "About"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-zinc-400 hover:text-olive-400 text-sm transition-colors"
                >
                  {locale === "zh-HK" ? "聯絡我們" : "Contact"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-zinc-400 hover:text-olive-400 text-sm transition-colors"
                >
                  {locale === "zh-HK" ? "私隱政策" : "Privacy"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="text-zinc-400 hover:text-olive-400 text-sm transition-colors"
                >
                  {locale === "zh-HK" ? "條款及細則" : "Terms"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4">
              {locale === "zh-HK" ? "關注我們" : "Follow Us"}
            </h4>
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
            {locale === "zh-HK" ? "版權所有。" : "All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}
