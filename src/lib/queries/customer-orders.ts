import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types/database";

/**
 * Customer-facing order reads. Everything goes through the `customer_orders`
 * view, which omits `admin_note`, and RLS still checks that the row belongs to
 * the signed-in customer. Phase 5 adds the confirmation action on top of this.
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
  return (data ?? []) as CustomerOrderSummary[];
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

  // The RLS policy exposes every line of the customer's own order, so the
  // `customer_visible` filter has to happen here.
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
