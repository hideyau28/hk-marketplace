"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Translations } from "@/lib/translations";

export default function WhatsAppButton({ t }: { t: Translations }) {
  const pathname = usePathname();
  const [productName, setProductName] = useState<string | null>(null);

  useEffect(() => {
    if (!pathname?.includes("/product/")) {
      setProductName(null);
      return;
    }
    const el = document.querySelector("[data-product-name]");
    const name = el?.getAttribute("data-product-name");
    setProductName(name || null);
  }, [pathname]);

  const message = productName
    ? t.whatsapp.productMessage.replace("{name}", productName)
    : t.whatsapp.defaultMessage;
  const href = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M16 2.4c-7.5 0-13.6 6.1-13.6 13.6 0 2.4.6 4.8 1.8 6.9L2 30l7.3-2.1c2 1.1 4.3 1.7 6.7 1.7 7.5 0 13.6-6.1 13.6-13.6S23.5 2.4 16 2.4zm7.9 19.1c-.3.9-1.5 1.6-2.5 1.8-.7.1-1.6.2-4.7-.9-4.2-1.5-6.8-5.2-7-5.5-.2-.3-1.7-2.2-1.7-4.2s1-3 1.3-3.4c.3-.4.7-.5 1-.5h.7c.2 0 .5 0 .7.6.3.7.9 2.4 1 2.6.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.4-.5.5-.2.2-.4.4-.2.7.2.3.9 1.5 1.9 2.4 1.3 1.2 2.5 1.6 2.9 1.8.4.2.6.2.8 0 .2-.2 1-1.1 1.3-1.5.3-.4.5-.3.9-.2.4.1 2.5 1.2 2.9 1.4.4.2.7.3.8.5.1.2.1.9-.2 1.8z" />
      </svg>
    </a>
  );
}
