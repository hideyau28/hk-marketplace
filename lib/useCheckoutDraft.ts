"use client";

import { useEffect, useRef, useCallback } from "react";
import type { CartItem } from "@/lib/cart";

type DraftData = {
  customerName: string;
  phone: string;
  email: string;
  items: CartItem[];
  amounts?: {
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
  };
  formData?: {
    fulfillmentType: string;
    district?: string;
    addressLine?: string;
  };
};

const DRAFT_INTERVAL_MS = 30_000; // 30 seconds
const SESSION_KEY = "hk-checkout-session-id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function clearCheckoutSession() {
  if (typeof window === "undefined") return;
  const sessionId = sessionStorage.getItem(SESSION_KEY);
  if (sessionId) {
    // Best-effort delete — fire and forget
    fetch(`/api/checkout-draft?sessionId=${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
    }).catch(() => {});
    sessionStorage.removeItem(SESSION_KEY);
  }
}

/**
 * useCheckoutDraft — 自動儲存 checkout 草稿到 server
 * 每 30 秒 + beforeunload 時儲存
 */
export function useCheckoutDraft(getDraftData: () => DraftData | null) {
  const getDraftDataRef = useRef(getDraftData);
  getDraftDataRef.current = getDraftData;

  const saveDraft = useCallback(() => {
    const data = getDraftDataRef.current();
    if (!data || data.items.length === 0) return;
    // 只有填咗聯絡資料先儲存（避免空草稿）
    if (!data.phone && !data.customerName) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    const body = JSON.stringify({
      sessionId,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email,
      items: data.items,
      amounts: data.amounts,
      formData: data.formData,
    });

    // Use sendBeacon for unload, fetch for periodic saves
    if (typeof navigator?.sendBeacon === "function") {
      try {
        navigator.sendBeacon("/api/checkout-draft", body);
        return;
      } catch {
        // fallback to fetch
      }
    }

    fetch("/api/checkout-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // Periodic save
    const interval = setInterval(() => {
      const data = getDraftDataRef.current();
      if (!data || data.items.length === 0) return;
      if (!data.phone && !data.customerName) return;

      const sessionId = getSessionId();
      if (!sessionId) return;

      fetch("/api/checkout-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          customerName: data.customerName,
          phone: data.phone,
          email: data.email,
          items: data.items,
          amounts: data.amounts,
          formData: data.formData,
        }),
      }).catch(() => {});
    }, DRAFT_INTERVAL_MS);

    // Save on page unload
    const handleBeforeUnload = () => {
      saveDraft();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveDraft]);
}
