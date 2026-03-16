import type { PaymentProviderDefinition } from "../types";
import { registerProvider } from "../registry";

/**
 * Stripe provider — wraps existing checkout session logic.
 * Actual session creation lives in app/api/checkout/session/route.ts;
 * this definition exposes metadata for the provider registry.
 */
const stripeProvider: PaymentProviderDefinition = {
  id: "stripe",
  name: "Card / Apple Pay / Google Pay",
  nameZh: "信用卡 / Apple Pay / Google Pay",
  icon: "💳",
  type: "online",
  configFields: [], // 用 Tenant 現有 Stripe 設定

  async createSession(_order, _config) {
    // Stripe checkout session 由 /api/checkout/session route 處理
    // 呢度只係 registry entry，唔直接 call Stripe SDK
    return {
      instructions: "Redirecting to Stripe checkout…",
    };
  },

  async verifyPayment(_data, _config) {
    // Webhook 已處理 payment verification
    return { success: true };
  },
};

registerProvider(stripeProvider);
