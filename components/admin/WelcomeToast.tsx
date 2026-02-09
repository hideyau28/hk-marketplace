"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function WelcomeToast() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("welcome") === "1") {
      setShow(true);
      // Clean up URL without reload
      window.history.replaceState({}, "", window.location.pathname);
      const timer = setTimeout(() => setShow(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-[#6B7A2F] px-6 py-3 text-white shadow-lg"
        >
          <span className="text-sm font-medium">
            商店建立成功！開始加商品啦 🎉
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
