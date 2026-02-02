"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "hk-market-welcome-shown";

export default function WelcomePopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasShown = localStorage.getItem(STORAGE_KEY);
    if (!hasShown) {
      const timer = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="mb-4 text-4xl">👟</div>
          <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            歡迎來到 HK•Market
          </h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            探索最新波鞋及運動裝備，正品保證！
          </p>
          <div className="mb-4 rounded-lg bg-olive-50 px-4 py-3 dark:bg-olive-900/20">
            <p className="text-sm font-medium text-olive-700 dark:text-olive-300">
              🎉 訂單滿 $600 免運費！
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-full rounded-lg bg-olive-600 py-3 font-semibold text-white hover:bg-olive-700"
          >
            開始購物
          </button>
        </div>
      </div>
    </div>
  );
}
