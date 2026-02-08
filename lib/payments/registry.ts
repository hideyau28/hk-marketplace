import type { PaymentProviderDefinition } from "./types";

const providers = new Map<string, PaymentProviderDefinition>();

export function registerProvider(provider: PaymentProviderDefinition) {
  providers.set(provider.id, provider);
}

let initialized = false;
function ensureProviders() {
  if (initialized) return;
  initialized = true;
  require("./providers/stripe");
  require("./providers/manual");
}

export function getProvider(id: string): PaymentProviderDefinition | null {
  ensureProviders();
  return providers.get(id) || null;
}

export function getAllProviders(): PaymentProviderDefinition[] {
  ensureProviders();
  return Array.from(providers.values());
}
