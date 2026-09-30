import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types/database";

/**
 * Customer-facing order reads. Everything goes through the `customer_orders`
 * view, which omits `admin_note`, and RLS still checks that the row belongs to
 * the signed-in customer. The only write the portal performs is confirmation,
 * and that goes through the `confirm_customer_order` function.
 */
export type CustomerOrderSummary = {
  id: string;
  order_code: string;
  status: OrderStatus;
  event_title: string | null;
  event_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  customer_note: string | null;
  total_estimate: number | string;
  customer_confirmed_at: string | null;
  /** Name of the first customer-visible line, standing in for "main service". */
  main_item_name?: string | null;
};

export type CustomerOrderLine = {
  id: string;
  name: string;
  description: string | null;
  quantity: number | string;
  unit_price: number | string;
  subtotal: number | string;
};

export type CustomerOrderDetail = {
  order: CustomerOrderSummary;
  items: CustomerOrderLine[];
};

export async function getCustomerOrders(): Promise<CustomerOrderSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_orders")
    .select("*")
    .order("event_date", { ascending: true, nullsFirst: false });

  if (error) throw new Error(`Gagal memuat pesanan: ${error.message}`);
  const orders = (data ?? []) as CustomerOrderSummary[];
  if (orders.length === 0) return orders;

  // One extra query for every order at once: the list needs a one-word idea of
  // what each booking is about, and a per-order lookup would be N+1.
  const { data: lines, error: lineError } = await supabase
    .from("order_items")
    .select("order_id, name, created_at")
    .in(
      "order_id",
      orders.map((order) => order.id),
    )
    .order("created_at", { ascending: true });

  if (lineError) throw new Error(`Gagal memuat item pesanan: ${lineError.message}`);

  const firstItem = new Map<string, string>();
  for (const line of lines ?? []) {
    if (!firstItem.has(line.order_id)) firstItem.set(line.order_id, line.name);
  }

  return orders.map((order) => ({
    ...order,
    main_item_name: firstItem.get(order.id) ?? null,
  }));
}

/**
 * The order the dashboard leads with: the closest upcoming event, falling back to
 * the nearest live order so a customer whose event already passed is not shown an
 * empty page. The list arrives date-ascending with empty dates last, so index 0 is
 * the soonest.
 */
export function pickFeaturedOrder(orders: CustomerOrderSummary[]): CustomerOrderSummary | null {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = orders.filter(
    (order) => order.status !== "cancelled" && order.event_date && order.event_date >= today,
  );
  return upcoming[0] ?? orders.find((order) => order.status !== "cancelled") ?? orders[0] ?? null;
}

export async function getCustomerOrder(id: string): Promise<CustomerOrderDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat pesanan: ${error.message}`);
  if (!data) return null;

  // RLS already hides `customer_visible = false` rows from customers; the filter
  // is repeated here so the intent is visible at the call site too.
  const { data: items, error: itemError } = await supabase
    .from("order_items")
    .select("id, name, description, quantity, unit_price, subtotal")
    .eq("order_id", id)
    .eq("customer_visible", true)
    .order("created_at", { ascending: true });

  if (itemError) throw new Error(`Gagal memuat item pesanan: ${itemError.message}`);

  return {
    order: data as CustomerOrderSummary,
    items: (items ?? []) as CustomerOrderLine[],
  };
}
