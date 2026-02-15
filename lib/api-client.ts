/**
 * Frontend API client with unified error handling.
 * Ensures friendly messages are shown to users — never raw stack traces.
 */

// 友善錯誤訊息 mapping（前台顯示用）
const FRIENDLY_MESSAGES: Record<string, { en: string; "zh-HK": string }> = {
  BAD_REQUEST: { en: "Invalid request. Please check your input.", "zh-HK": "請求無效，請檢查輸入。" },
  UNAUTHORIZED: { en: "Please sign in to continue.", "zh-HK": "請先登入。" },
  FORBIDDEN: { en: "You don't have permission to do this.", "zh-HK": "你冇權限執行此操作。" },
  NOT_FOUND: { en: "The requested resource was not found.", "zh-HK": "搵唔到你要嘅內容。" },
  CONFLICT: { en: "A conflict occurred. Please try again.", "zh-HK": "發生衝突，請重試。" },
  RATE_LIMITED: { en: "Too many requests. Please wait a moment.", "zh-HK": "請求太頻繁，請稍後再試。" },
  INTERNAL: { en: "Something went wrong. Please try again later.", "zh-HK": "出咗啲問題，請稍後再試。" },
  NETWORK_ERROR: { en: "Network error. Please check your connection.", "zh-HK": "網絡錯誤，請檢查連線。" },
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

/**
 * Extract a user-friendly error message from an API error response.
 * Never returns raw stack traces or internal details.
 */
export function getFriendlyMessage(
  code: string,
  serverMessage?: string,
  locale: string = "zh-HK"
): string {
  const loc = locale === "zh-HK" ? "zh-HK" : "en";

  // Use the mapped friendly message for known codes
  const friendly = FRIENDLY_MESSAGES[code];
  if (friendly) return friendly[loc];

  // For unknown codes, return a generic message (唔好露內部細節)
  return FRIENDLY_MESSAGES.INTERNAL[loc];
}

/**
 * Typed fetch wrapper for API routes.
 * Returns { ok, data } on success, { ok, code, message } on failure.
 * Error messages are always safe for user display.
 */
export async function apiFetch<T = unknown>(
  url: string,
  init?: RequestInit,
  locale?: string
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, init);
    const json = await res.json();

    if (!res.ok || !json.ok) {
      const code = json.error?.code || "INTERNAL";
      return {
        ok: false,
        code,
        message: getFriendlyMessage(code, json.error?.message, locale),
      };
    }

    return { ok: true, data: json.data as T };
  } catch {
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: getFriendlyMessage("NETWORK_ERROR", undefined, locale),
    };
  }
}
