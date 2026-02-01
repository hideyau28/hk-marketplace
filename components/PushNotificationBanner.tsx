"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import {
  isPushSupported,
  getStoredPermission,
  requestPermission,
  storePermission,
  type PushPermissionStatus,
} from "@/lib/push-notifications";

export default function PushNotificationBanner({ t }: { t: any }) {
  const [show, setShow] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    // Check if we should show the banner
    const storedPermission = getStoredPermission();

    // Show banner if:
    // 1. Push is supported
    // 2. User hasn't made a decision yet (no stored permission)
    // 3. Or permission is still "default" (not granted/denied)
    if (
      isPushSupported() &&
      (!storedPermission || storedPermission === "default")
    ) {
      // Show after a short delay so it doesn't compete with page load
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    setRequesting(true);
    try {
      const status = await requestPermission();
      if (status === "granted") {
        setShow(false);
      }
    } finally {
      setRequesting(false);
    }
  };

  const handleDismiss = () => {
    storePermission("dismissed");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-4 md:w-96">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 rounded-full bg-olive-100 p-2 dark:bg-olive-900/30">
            <Bell size={20} className="text-olive-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {t.notifications.title}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {t.notifications.body}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleAllow}
                disabled={requesting}
                className="rounded-lg bg-olive-600 px-4 py-2 text-sm font-medium text-white hover:bg-olive-700 disabled:opacity-50"
              >
                {requesting ? "..." : t.notifications.enable}
              </button>
              <button
                onClick={handleDismiss}
                disabled={requesting}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 disabled:opacity-50"
              >
                {t.notifications.dismiss}
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            disabled={requesting}
            className="flex-shrink-0 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
