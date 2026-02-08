export type PaymentType = "online" | "manual";

export interface ConfigField {
  key: string;
  label: string;
  labelZh: string;
  type: "text" | "url" | "image" | "select" | "boolean";
  required: boolean;
  placeholder?: string;
}

export interface CreateSessionResult {
  url?: string; // redirect URL (online type)
  reference?: string; // payment reference
  qrCodeUrl?: string; // QR code to display
  instructions?: string; // 顯示畀客人嘅指示
}

export interface VerifyResult {
  success: boolean;
  reference?: string;
  error?: string;
}

export interface PaymentProviderDefinition {
  id: string;
  name: string;
  nameZh: string;
  icon: string; // emoji or icon name
  type: PaymentType;
  configFields: ConfigField[];
  createSession(order: any, config: any): Promise<CreateSessionResult>;
  verifyPayment(data: any, config: any): Promise<VerifyResult>;
}
