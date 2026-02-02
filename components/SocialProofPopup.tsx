"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

const SESSION_KEY = "hk_social_proof_dismissed";

type Product = {
  id: string;
  title: string;
};

// Message templates
const MESSAGE_TEMPLATES = [
  (name: string) => `2 小時前有人買咗 ${name}`,
  (name: string) => `15 分鐘前有 3 人瀏覽過 ${name}`,
  (name: string) => `今日已售出 2 對 ${name}`,
  (name: string) => `剛剛有人加入購物車: ${name}`,
  (name: string) => `${name} 好受歡迎!`,
];

export default function SocialProofPopup() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Load products on mount
  useEffect(() => {
    // Check if dismissed this session
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem(SESSION_KEY);
      if (dismissed === "true") {
        setIsDismissed(true);
        return;
      }
    }

    // Fetch products
    fetch("/api/products?limit=20")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data?.products) {
          setProducts(
            data.data.products.map((p: { id: string; title: string }) => ({
              id: p.id,
              title: p.title,
            }))
          );
        }
      })
      .catch(() => {
        // Silently fail
      });
  }, []);

  const generateMessage = useCallback(() => {
    if (products.length === 0) return "";
    const product = products[Math.floor(Math.random() * products.length)];
    const template =
      MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)];
    // Truncate product name if too long
    const truncatedName =
      product.title.length > 25
        ? product.title.slice(0, 25) + "..."
        : product.title;
    return template(truncatedName);
  }, [products]);

  // Show popup at random intervals
  useEffect(() => {
    if (isDismissed || products.length === 0) return;

    const showPopup = () => {
      const message = generateMessage();
      if (message) {
        setCurrentMessage(message);
        setIsVisible(true);

        // Hide after 4 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 4000);
      }
    };

    // Initial delay: 10-15 seconds after mount
    const initialDelay = 10000 + Math.random() * 5000;
    const initialTimer = setTimeout(() => {
      showPopup();

      // Then show every 45-60 seconds
      const interval = setInterval(() => {
        const delay = 45000 + Math.random() * 15000;
        setTimeout(showPopup, delay % 15000); // Stagger within interval
      }, 45000 + Math.random() * 15000);

      return () => clearInterval(interval);
    }, initialDelay);

    return () => clearTimeout(initialTimer);
  }, [isDismissed, products.length, generateMessage]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "true");
    }
  };

  if (isDismissed || !isVisible || !currentMessage) return null;

  return (
    <div
      className={`fixed left-4 z-[60] transition-all duration-500 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      style={{
        // Position above bottom tab on mobile (tab is ~60px)
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
      }}
    >
      <div className="relative flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-lg border border-zinc-200 max-w-[300px]">
        {/* Pulsing dot */}
        <div className="relative mt-1 flex-shrink-0">
          <span className="flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
          </span>
        </div>

        {/* Message */}
        <p className="text-sm text-zinc-700 pr-6 leading-snug">
          {currentMessage}
        </p>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
          aria-label="關閉"
        >
          <X size={14} />
        </button>
      </div>

      <style jsx>{`
        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
