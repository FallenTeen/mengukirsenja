import type { OrderSource, OrderStatus } from "@/lib/types/database";

/**
 * Order status vocabulary shared by the calendar, the order list, the order
 * workspace, and the customer portal. Labels live here so a status is never
 * called two different things in two places.
 */

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  draft: "Draf",
  pending_admin_review: "Menunggu ditinjau",
  awaiting_customer_confirmation: "Menunggu konfirmasi",
  confirmed: "Terkonfirmasi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const ORDER_SOURCE_LABEL: Record<OrderSource, string> = {
  web_catalog: "Katalog website",
  web_custom: "Permintaan website",
  admin_manual: "Manual admin",
};

/** Statuses that still occupy a date on the calendar. */
export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  "pending_admin_review",
  "awaiting_customer_confirmation",
  "confirmed",
];

/**
 * Legal next states. The database enum allows any value, so the transition
 * table is enforced here instead of scattering `if` statements over buttons.
 * A cancelled order may be reopened as a draft; a completed one is final.
 */
export const NEXT_ORDER_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  draft: ["awaiting_customer_confirmation", "confirmed", "cancelled"],
  pending_admin_review: ["awaiting_customer_confirmation", "confirmed", "cancelled"],
  awaiting_customer_confirmation: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: ["draft"],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return NEXT_ORDER_STATUSES[from].includes(to);
}

/** Accent colour per status: terracotta carries the ones needing attention. */
export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_admin_review: "bg-brand-red/10 text-brand-red",
  awaiting_customer_confirmation: "bg-amber/15 text-gold",
  confirmed: "bg-terracotta/12 text-terracotta",
  completed: "bg-terracotta text-cream",
  cancelled: "bg-muted text-muted-foreground line-through",
};

/** Rounding helpers. Money arrives as numeric from Postgres. */
export function toNumber(value: number | string | null | undefined): number {
  const parsed = typeof value === "string" ? Number(value) : (value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function lineSubtotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}
