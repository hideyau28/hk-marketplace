export type AnalyticsEvent =
  | "page_view"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase"
  | "view_item"
  | "search";

export interface AnalyticsParams {
  page_title?: string;
  page_path?: string;
  currency?: string;
  value?: number;
  transaction_id?: string;
  items?: Array<{
    item_id?: string;
    item_name?: string;
    price?: number;
    quantity?: number;
  }>;
  search_term?: string;
  [key: string]: any;
}

/**
 * Track an event to both Google Analytics and Meta Pixel
 */
export function trackEvent(event: AnalyticsEvent, params?: AnalyticsParams): void {
  // Google Analytics 4
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", event, params);
  }

  // Meta Pixel - map GA4 events to Facebook events
  if (typeof window !== "undefined" && (window as any).fbq) {
    const fbq = (window as any).fbq;

    switch (event) {
      case "page_view":
        fbq("track", "PageView");
        break;
      case "add_to_cart":
        fbq("track", "AddToCart", {
          currency: params?.currency,
          value: params?.value,
        });
        break;
      case "begin_checkout":
        fbq("track", "InitiateCheckout", {
          currency: params?.currency,
          value: params?.value,
        });
        break;
      case "purchase":
        fbq("track", "Purchase", {
          currency: params?.currency,
          value: params?.value,
          transaction_id: params?.transaction_id,
        });
        break;
      case "view_item":
        fbq("track", "ViewContent", {
          currency: params?.currency,
          value: params?.value,
        });
        break;
      case "search":
        fbq("track", "Search", {
          search_string: params?.search_term,
        });
        break;
    }
  }
}
