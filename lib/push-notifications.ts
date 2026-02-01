"use client";

const STORAGE_KEY = "hk-marketplace-push-permission";

export type PushPermissionStatus = "granted" | "denied" | "default" | "dismissed";

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
}

/**
 * Get the current permission status from localStorage
 */
export function getStoredPermission(): PushPermissionStatus | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored as PushPermissionStatus | null;
}

/**
 * Store the permission status in localStorage
 */
export function storePermission(status: PushPermissionStatus): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, status);
}

/**
 * Request notification permission from the user
 */
export async function requestPermission(): Promise<PushPermissionStatus> {
  if (!isPushSupported()) {
    console.log("[Push] Not supported in this browser");
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    const status = permission as PushPermissionStatus;
    storePermission(status);

    if (status === "granted") {
      console.log("[Push] Permission granted");
      await subscribeUser();
    } else {
      console.log("[Push] Permission denied");
    }

    return status;
  } catch (error) {
    console.error("[Push] Error requesting permission:", error);
    return "denied";
  }
}

/**
 * Subscribe the user to push notifications
 */
export async function subscribeUser(): Promise<void> {
  if (!isPushSupported()) return;

  try {
    // Register service worker if not already registered
    const registration = await navigator.serviceWorker.register("/sw.js");

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    console.log("[Push] Service worker registered");
    console.log("[Push] User subscribed (simulated - no backend push endpoint)");

    // In a real app, you would:
    // 1. Get a push subscription from the browser
    // 2. Send it to your backend
    // 3. Store it in your database
    // const subscription = await registration.pushManager.subscribe({...});
    // await fetch('/api/push/subscribe', { method: 'POST', body: JSON.stringify(subscription) });

  } catch (error) {
    console.error("[Push] Error subscribing:", error);
  }
}

/**
 * Send a simulated push notification (for demo purposes)
 * In production, this would be sent from your backend
 */
export async function simulatePushNotification(title: string, body: string): Promise<void> {
  if (!isPushSupported()) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("[Push] Permission not granted, cannot show notification");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(title, {
      body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: "hk-marketplace",
      requireInteraction: false,
    });

    console.log("[Push] Notification shown:", title);
  } catch (error) {
    console.error("[Push] Error showing notification:", error);
  }
}
