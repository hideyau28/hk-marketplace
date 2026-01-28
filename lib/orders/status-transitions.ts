/**
 * Order status transition rules
 *
 * Defines which status transitions are allowed to prevent invalid state changes.
 */

import type { OrderStatus } from "@prisma/client";

/**
 * Map of allowed transitions: from status -> array of allowed target statuses
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["FULFILLING", "CANCELLED", "REFUNDED", "DISPUTED"],
  FULFILLING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED", "REFUNDED", "DISPUTED"],
  COMPLETED: ["REFUNDED", "DISPUTED"],
  CANCELLED: [], // Terminal state
  REFUNDED: [], // Terminal state
  DISPUTED: [], // Terminal state
};

/**
 * Check if a status transition is valid
 */
export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  // Same status is always allowed (no-op)
  if (from === to) return true;

  const allowedTargets = ALLOWED_TRANSITIONS[from];
  return allowedTargets.includes(to);
}

/**
 * Get a human-readable error message for an invalid transition
 */
export function getTransitionError(from: OrderStatus, to: OrderStatus): string {
  const allowedTargets = ALLOWED_TRANSITIONS[from];

  if (allowedTargets.length === 0) {
    return `Cannot transition from ${from} (terminal state)`;
  }

  return `Invalid status transition from ${from} to ${to}. Allowed transitions: ${allowedTargets.join(", ")}`;
}
