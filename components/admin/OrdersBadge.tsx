"use client";

import { useEffect, useState } from "react";

/**
 * 顯示未處理訂單數量 badge
 * 每 30 秒 poll 一次，用 cookie auth
 */
export default function OrdersBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchCount() {
      try {
        const res = await fetch("/api/admin/orders/count?status=PENDING");
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json.ok) {
          setCount(json.data.count);
        }
      } catch {
        // Silently ignore — badge is non-critical
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 30_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (count <= 0) return null;

  return (
    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
      {count > 99 ? "99+" : count}
    </span>
  );
}
