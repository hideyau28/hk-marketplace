"use client";

import { useState, useEffect, useRef } from "react";
import type { ProductForBioLink } from "@/lib/biolink-helpers";
import { useTemplate } from "@/lib/template-context";

type Props = {
  products: ProductForBioLink[];
};

export default function SocialProofToast({ products }: Props) {
  const tmpl = useTemplate();
  const [toast, setToast] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (products.length === 0) return;

    const pickAndShow = () => {
      if (dismissRef.current) clearTimeout(dismissRef.current);
      const p = products[Math.floor(Math.random() * products.length)];
      setLeaving(false);
      setToast(p.title);
      // Auto-dismiss after 3 s
      dismissRef.current = setTimeout(() => {
        setLeaving(true);
        setTimeout(() => setToast(null), 320);
      }, 3000);
    };

    const scheduleNext = () => {
      const delay = 15000 + Math.random() * 15000; // 15–30 s
      scheduleRef.current = setTimeout(() => {
        pickAndShow();
        scheduleNext();
      }, delay);
    };

    // First toast after 8–12 s (page just loaded)
    scheduleRef.current = setTimeout(() => {
      pickAndShow();
      scheduleNext();
    }, 8000 + Math.random() * 4000);

    return () => {
      if (dismissRef.current) clearTimeout(dismissRef.current);
      if (scheduleRef.current) clearTimeout(scheduleRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // products is stable — server-rendered, won't change

  if (!toast) return null;

  return (
    <>
      <div
        className="fixed left-4 right-4 z-[55] max-w-[448px] mx-auto"
        style={{
          bottom: 96,
          animation: leaving
            ? "spToastOut 0.32s ease-in forwards"
            : "spToastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl"
          style={{
            backgroundColor: tmpl.card,
            border: `1px solid ${tmpl.subtext}20`,
          }}
        >
          <span className="text-lg flex-shrink-0" aria-hidden>🔥</span>
          <p className="text-sm leading-snug" style={{ color: tmpl.text }}>
            <span style={{ color: tmpl.subtext }}>剛剛有人買咗 </span>
            <span className="font-semibold">{toast}</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spToastIn {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes spToastOut {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(20px); opacity: 0; }
        }
      `}</style>
    </>
  );
}
