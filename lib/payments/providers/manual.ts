import type {
  PaymentProviderDefinition,
  PaymentType,
  ConfigField,
} from "../types";
import { registerProvider } from "../registry";

// Manual provider factory — 通用 manual payment method builder
function createManualProvider(opts: {
  id: string;
  name: string;
  nameZh: string;
  icon: string;
  configFields: ConfigField[];
  instructions?: string;
  instructionsZh?: string;
}): PaymentProviderDefinition {
  return {
    id: opts.id,
    name: opts.name,
    nameZh: opts.nameZh,
    icon: opts.icon,
    type: "manual" as PaymentType,
    configFields: opts.configFields,

    async createSession(_order, config) {
      return {
        qrCodeUrl: config?.qrCodeUrl || undefined,
        reference: config?.accountId || config?.accountNumber || undefined,
        instructions:
          opts.instructionsZh ||
          opts.instructions ||
          `請使用 ${opts.nameZh} 付款，完成後上傳付款證明。`,
      };
    },

    async verifyPayment(_data, _config) {
      // Manual payment — admin 手動確認
      return { success: false, error: "Awaiting manual confirmation" };
    },
  };
}

// ── FPS 轉數快 ──
registerProvider(
  createManualProvider({
    id: "fps",
    name: "FPS",
    nameZh: "轉數快 FPS",
    icon: "🏦",
    configFields: [
      {
        key: "accountName",
        label: "Account Name",
        labelZh: "帳戶名稱",
        type: "text",
        required: true,
        placeholder: "e.g. Chan Tai Man",
      },
      {
        key: "accountId",
        label: "FPS ID / Phone",
        labelZh: "轉數快 ID / 電話",
        type: "text",
        required: true,
        placeholder: "e.g. 91234567",
      },
      {
        key: "qrCodeUrl",
        label: "QR Code Image",
        labelZh: "QR Code 圖片",
        type: "image",
        required: false,
      },
    ],
    instructionsZh: "請用轉數快 (FPS) 過數，完成後上傳截圖作為付款證明。",
  })
);

// ── PayMe ──
registerProvider(
  createManualProvider({
    id: "payme",
    name: "PayMe",
    nameZh: "PayMe",
    icon: "📱",
    configFields: [
      {
        key: "paymeLink",
        label: "PayMe Link",
        labelZh: "PayMe 連結",
        type: "url",
        required: true,
        placeholder: "https://payme.hsbc/...",
      },
      {
        key: "qrCodeUrl",
        label: "QR Code Image",
        labelZh: "QR Code 圖片",
        type: "image",
        required: false,
      },
    ],
    instructionsZh: "請用 PayMe 付款，完成後上傳截圖作為付款證明。",
  })
);

// ── Bank Transfer 銀行轉賬 ──
registerProvider(
  createManualProvider({
    id: "bank_transfer",
    name: "Bank Transfer",
    nameZh: "銀行轉賬",
    icon: "🏧",
    configFields: [
      {
        key: "bankName",
        label: "Bank Name",
        labelZh: "銀行名稱",
        type: "text",
        required: true,
        placeholder: "e.g. HSBC / 恒生銀行",
      },
      {
        key: "accountName",
        label: "Account Name",
        labelZh: "帳戶名稱",
        type: "text",
        required: true,
      },
      {
        key: "accountNumber",
        label: "Account Number",
        labelZh: "帳戶號碼",
        type: "text",
        required: true,
      },
    ],
    instructionsZh: "請轉賬至指定銀行帳戶，完成後上傳截圖作為付款證明。",
  })
);

// ── WeChat Pay 微信支付 ──
registerProvider(
  createManualProvider({
    id: "wechat_pay",
    name: "WeChat Pay",
    nameZh: "微信支付",
    icon: "💬",
    configFields: [
      {
        key: "qrCodeUrl",
        label: "QR Code Image",
        labelZh: "QR Code 圖片",
        type: "image",
        required: true,
      },
    ],
    instructionsZh: "請用微信支付掃描 QR Code 付款，完成後上傳截圖。",
  })
);

// ── Alipay HK 支付寶香港 ──
registerProvider(
  createManualProvider({
    id: "alipay_hk",
    name: "Alipay HK",
    nameZh: "支付寶香港",
    icon: "🅰️",
    configFields: [
      {
        key: "qrCodeUrl",
        label: "QR Code Image",
        labelZh: "QR Code 圖片",
        type: "image",
        required: true,
      },
    ],
    instructionsZh: "請用支付寶香港掃描 QR Code 付款，完成後上傳截圖。",
  })
);

// ── Octopus 八達通 ──
registerProvider(
  createManualProvider({
    id: "octopus",
    name: "Octopus",
    nameZh: "八達通",
    icon: "🐙",
    configFields: [
      {
        key: "qrCodeUrl",
        label: "QR Code Image",
        labelZh: "QR Code 圖片",
        type: "image",
        required: true,
      },
    ],
    instructionsZh: "請用八達通 App 掃描 QR Code 付款，完成後上傳截圖。",
  })
);

// ── PayPal ──
registerProvider(
  createManualProvider({
    id: "paypal",
    name: "PayPal",
    nameZh: "PayPal",
    icon: "🅿️",
    configFields: [
      {
        key: "paypalEmail",
        label: "PayPal Email",
        labelZh: "PayPal 電郵",
        type: "text",
        required: true,
        placeholder: "e.g. shop@example.com",
      },
    ],
    instructionsZh: "請轉賬至指定 PayPal 帳戶，完成後上傳截圖作為付款證明。",
  })
);

// ── Atome (placeholder) ──
registerProvider(
  createManualProvider({
    id: "atome",
    name: "Atome",
    nameZh: "Atome 分期",
    icon: "🔄",
    configFields: [], // placeholder — 未來整合 Atome API
    instructionsZh: "Atome 付款功能即將推出。",
  })
);

// ── Apple Pay (via Stripe) ──
registerProvider(
  createManualProvider({
    id: "apple_pay",
    name: "Apple Pay",
    nameZh: "Apple Pay",
    icon: "🍎",
    configFields: [], // 經 Stripe 處理
    instructionsZh: "Apple Pay 經 Stripe 處理。",
  })
);

// ── Google Pay (via Stripe) ──
registerProvider(
  createManualProvider({
    id: "google_pay",
    name: "Google Pay",
    nameZh: "Google Pay",
    icon: "🤖",
    configFields: [], // 經 Stripe 處理
    instructionsZh: "Google Pay 經 Stripe 處理。",
  })
);

// ── UnionPay 銀聯 (placeholder) ──
registerProvider(
  createManualProvider({
    id: "unionpay",
    name: "UnionPay",
    nameZh: "銀聯",
    icon: "💠",
    configFields: [], // placeholder — 未來整合
    instructionsZh: "銀聯付款功能即將推出。",
  })
);

// ── Crypto 加密貨幣 ──

const networkOptions = [
  { label: "TRC-20", value: "TRC-20" },
  { label: "ERC-20", value: "ERC-20" },
  { label: "BEP-20", value: "BEP-20" },
  { label: "SOL", value: "SOL" },
];

registerProvider(
  createManualProvider({
    id: "crypto_usdt",
    name: "USDT (Tether)",
    nameZh: "USDT 泰達幣",
    icon: "💲",
    configFields: [
      {
        key: "walletAddress",
        label: "Wallet Address",
        labelZh: "錢包地址",
        type: "text",
        required: true,
        placeholder: "e.g. TXyz...abc",
      },
      {
        key: "network",
        label: "Network",
        labelZh: "網絡",
        type: "select",
        required: true,
        options: networkOptions,
      },
      {
        key: "qrCodeUrl",
        label: "QR Code Image",
        labelZh: "QR Code 圖片",
        type: "image",
        required: false,
      },
    ],
    instructionsZh: "請轉賬 USDT 至指定錢包地址，完成後上傳截圖作為付款證明。",
  })
);

registerProvider(
  createManualProvider({
    id: "crypto_usdc",
    name: "USDC",
    nameZh: "USDC",
    icon: "💵",
    configFields: [
      {
        key: "walletAddress",
        label: "Wallet Address",
        labelZh: "錢包地址",
        type: "text",
        required: true,
        placeholder: "e.g. 0xAbc...123",
      },
      {
        key: "network",
        label: "Network",
        labelZh: "網絡",
        type: "select",
        required: true,
        options: networkOptions,
      },
      {
        key: "qrCodeUrl",
        label: "QR Code Image",
        labelZh: "QR Code 圖片",
        type: "image",
        required: false,
      },
    ],
    instructionsZh: "請轉賬 USDC 至指定錢包地址，完成後上傳截圖作為付款證明。",
  })
);

registerProvider(
  createManualProvider({
    id: "crypto_btc",
    name: "Bitcoin",
    nameZh: "比特幣",
    icon: "₿",
    configFields: [
      {
        key: "walletAddress",
        label: "Wallet Address",
        labelZh: "錢包地址",
        type: "text",
        required: true,
        placeholder: "e.g. bc1q...xyz",
      },
      {
        key: "qrCodeUrl",
        label: "QR Code Image",
        labelZh: "QR Code 圖片",
        type: "image",
        required: false,
      },
    ],
    instructionsZh: "請轉賬 BTC 至指定錢包地址，完成後上傳截圖作為付款證明。",
  })
);

registerProvider(
  createManualProvider({
    id: "crypto_eth",
    name: "Ethereum",
    nameZh: "以太幣",
    icon: "⟠",
    configFields: [
      {
        key: "walletAddress",
        label: "Wallet Address",
        labelZh: "錢包地址",
        type: "text",
        required: true,
        placeholder: "e.g. 0xAbc...123",
      },
      {
        key: "qrCodeUrl",
        label: "QR Code Image",
        labelZh: "QR Code 圖片",
        type: "image",
        required: false,
      },
    ],
    instructionsZh: "請轉賬 ETH 至指定錢包地址，完成後上傳截圖作為付款證明。",
  })
);
