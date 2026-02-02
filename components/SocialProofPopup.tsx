"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  id: string;
  title: string;
};

type MessageTemplate = (productName: string) => string;

const messageTemplates: MessageTemplate[] = [
  (p) => `2 小時前有人買咗 ${p}`,
  (p) => `15 分鐘前有 3 人瀏覽過 ${p}`,
  (p) => `今日已售出 2 對 ${p}`,
];

export default function SocialProofPopup({ products }: { products: Product[] }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [dismissed, setDismissed] = useState(false);

  const showRandomMessage = useCallback(() => {
    if (products.length === 0 || dismissed) return;

    const product = products[Math.floor(Math.random() * products.length)];
    const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
    const shortTitle = product.title.length > 30 ? product.title.slice(0, 30) + "..." : product.title;
    setMessage(template(shortTitle));
    setVisible(true);

    // Hide after 4 seconds
    setTimeout(() => setVisible(false), 4000);
  }, [products, dismissed]);

  useEffect(() => {
    // Check if already dismissed this session
    if (typeof window !== "undefined") {
      const wasDismissed = sessionStorage.getItem("socialProofDismissed");
      if (wasDismissed) {
        setDismissed(true);
        return;
      }
    }

    // Initial delay before first popup (random 45-60 seconds)
    const initialDelay = 45000 + Math.random() * 15000;
    const initialTimer = setTimeout(() => {
      showRandomMessage();

      // Then repeat every 45-60 seconds
      const interval = setInterval(() => {
        showRandomMessage();
      }, 45000 + Math.random() * 15000);

      return () => clearInterval(interval);
    }, initialDelay);

    return () => clearTimeout(initialTimer);
  }, [showRandomMessage]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("socialProofDismissed", "true");
    }
  };

  if (dismissed || products.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed left-4 z-40 flex items-start gap-2 rounded-lg bg-white px-4 py-3 shadow-lg border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700"
          style={{ bottom: "calc(80px + env(safe-area-inset-bottom))" }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{message}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="關閉"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
