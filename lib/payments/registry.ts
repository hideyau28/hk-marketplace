import type { PaymentProviderDefinition } from "./types";

const providers = new Map<string, PaymentProviderDefinition>();

export function registerProvider(provider: PaymentProviderDefinition) {
  providers.set(provider.id, provider);
}

export function getProvider(id: string): PaymentProviderDefinition | null {
  return providers.get(id) || null;
}

export function getAllProviders(): PaymentProviderDefinition[] {
  return Array.from(providers.values());
}

// Auto-register built-in providers
import "./providers/stripe";
import "./providers/manual";
