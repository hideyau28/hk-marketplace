/**
 * Order status transition rules
 *
 * Defines which status transitions are allowed to prevent invalid state changes.
 */

import type { OrderStatus } from "@prisma/client";

/**
 * Map of allowed transitions: from status -> array of allowed target statuses
 *
 * New flow: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → COMPLETED
 * Can cancel from: PENDING, CONFIRMED, PROCESSING
 * Can refund from: DELIVERED, COMPLETED
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  // New status flow
  PENDING: ["PENDING_CONFIRMATION", "CONFIRMED", "CANCELLED"],
  PENDING_CONFIRMATION: ["PAID", "PAYMENT_REJECTED", "CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "SHIPPED", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED", "REFUNDED"],
  COMPLETED: ["REFUNDED"],
  CANCELLED: [], // Terminal state
  REFUNDED: [], // Terminal state
  PAYMENT_REJECTED: [], // Terminal state
  // Legacy statuses (backward compatibility)
  PAID: ["FULFILLING", "CONFIRMED", "SHIPPED", "CANCELLED", "REFUNDED", "DISPUTED"],
  FULFILLING: ["SHIPPED", "PROCESSING", "CANCELLED"],
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
