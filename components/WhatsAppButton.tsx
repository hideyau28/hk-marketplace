"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/85200000000"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl md:bottom-6"
      aria-label="WhatsApp客服"
    >
      <MessageCircle size={28} />
    </a>
  );
}
