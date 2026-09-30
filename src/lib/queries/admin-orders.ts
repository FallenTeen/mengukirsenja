import "server-only";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_ORDER_STATUSES } from "@/lib/order-status";
import { normalizePhone } from "@/lib/whatsapp";
import type {
  Customer,
  Order,
  OrderItem,
  OrderSource,
  OrderStatus,
  Service,
} from "@/lib/types/database";

/**
 * Admin order reads. Session client on purpose so RLS decides what the caller
 * sees; the "admins manage orders" policies then allow the full picture.
 */

const ORDER_FIELDS = `
  id, order_code, customer_id, source, status, event_title, event_date,
  event_end_date, venue_name, venue_address, customer_note, admin_note,
  services_of_interest, reference_images, total_estimate,
  customer_confirmed_at, admin_confirmed_at, created_by_user_id,
  created_at, updated_at,
  customers ( id, name, email, phone, address, auth_user_id )
`;

type OrderRow = Omit<Order, "customers"> & { customers: Customer | null };

function flattenOrder(row: OrderRow) {
  return { ...row, customer: row.customers };
}

export type OrderListEntry = ReturnType<typeof flattenOrder>;

export type OrderFilters = {
  search?: string;
  status?: string;
  source?: string;
  /** `YYYY-MM-DD` bounds, both optional. */
  from?: string;
  to?: string;
};

export async function getAdminOrders(filters: OrderFilters = {}): Promise<OrderListEntry[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(ORDER_FIELDS)
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status as OrderStatus);
  }
  if (filters.source && filters.source !== "all") {
    query = query.eq("source", filters.source as OrderSource);
  }
  if (filters.from) query = query.gte("event_date", filters.from);
  if (filters.to) query = query.lte("event_date", filters.to);

  const term = (filters.search ?? "").trim().replace(/[,()%*\\]/g, " ").slice(0, 80);
  if (term) {
    query = query.or(
      `order_code.ilike.%${term}%,event_title.ilike.%${term}%,venue_name.ilike.%${term}%,customers.name.ilike.%${term}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(`Gagal memuat pesanan: ${error.message}`);
  return (data as unknown as OrderRow[]).map(flattenOrder);
}

export type AdminOrderDetail = OrderListEntry & {
  items: OrderItemEntry[];
  item_count: number;
};

const ITEM_FIELDS = `
  id, order_id, catalog_item_id, service_id, partner_id, name, description,
  quantity, unit_price, subtotal, is_custom, customer_visible, created_at, updated_at,
  services ( name ),
  partners ( name )
`;

type OrderItemRow = Omit<OrderItem, "services" | "partners"> & {
  services: { name: string } | null;
  partners: { name: string } | null;
};

function flattenItem(row: OrderItemRow) {
  return {
    ...row,
    service_name: row.services?.name ?? null,
    partner_name: row.partners?.name ?? null,
  };
}

export type OrderItemEntry = ReturnType<typeof flattenItem>;

/** The full workspace payload: order, customer, and every line item. */
export async function getAdminOrder(id: string): Promise<AdminOrderDetail | null> {
  const supabase = await createClient();
  const [order, items] = await Promise.all([
    supabase.from("orders").select(ORDER_FIELDS).eq("id", id).maybeSingle(),
    supabase
      .from("order_items")
      .select(ITEM_FIELDS)
      .eq("order_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (order.error) throw new Error(`Gagal memuat pesanan: ${order.error.message}`);
  if (!order.data) return null;
  if (items.error) throw new Error(`Gagal memuat item pesanan: ${items.error.message}`);

  const rows = (items.data as unknown as OrderItemRow[]).map(flattenItem);
  return { ...flattenOrder(order.data as unknown as OrderRow), items: rows, item_count: rows.length };
}

export type CalendarEntry = {
  id: string;
  order_code: string;
  status: OrderStatus;
  event_date: string;
  /** NULL on pre-finalization orders, which are all one-day events. */
  event_end_date: string | null;
  event_title: string | null;
  customer_name: string;
  /** Comma-joined service names, for the compact calendar chip. */
  service_summary: string;
};

/**
 * One month window as `YYYY-MM-DD` bounds, so the calendar needs a single
 * range query instead of a count query per cell.
 *
 * A multi-day event is not stored once per day, so the filter asks for anything
 * that *overlaps* the window: it starts on or before the last day and ends on or
 * after the first. A NULL end is a one-day event that can only overlap on its
 * start date, which the `is.null` branch covers.
 */
export async function getCalendarEntries(
  from: string,
  to: string,
): Promise<CalendarEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_code, status, event_date, event_end_date, event_title, customers ( name ), order_items ( services ( name ) )",
    )
    .lte("event_date", to)
    .or(`event_end_date.is.null,event_end_date.gte.${from}`)
    .order("event_date", { ascending: true });

  if (error) throw new Error(`Gagal memuat kalender: ${error.message}`);

  return (data ?? []).map((row) => {
    const services = (row.order_items ?? []) as { services: { name: string } | null }[];
    const names = [
      ...new Set(
        services.map((item) => item.services?.name).filter((name): name is string => Boolean(name)),
      ),
    ];
    return {
      id: row.id,
      order_code: row.order_code,
      status: row.status as OrderStatus,
      event_date: row.event_date as string,
      event_end_date: (row.event_end_date as string | null) ?? null,
      event_title: row.event_title,
      customer_name: (row.customers as { name: string } | null)?.name ?? "Tanpa nama",
      service_summary: names.join(", "),
    };
  });
}

/**
 * Other live orders on a date, used for the non-blocking conflict warning.
 * Excludes the order being edited so saving never warns about itself.
 */
export async function getOrdersOnDate(date: string, excludeOrderId?: string): Promise<CalendarEntry[]> {
  const entries = await getCalendarEntries(date, date);
  return excludeOrderId ? entries.filter((entry) => entry.id !== excludeOrderId) : entries;
}

export async function getActiveOrdersOnDate(date: string, excludeOrderId?: string): Promise<CalendarEntry[]> {
  const entries = await getOrdersOnDate(date, excludeOrderId);
  return entries.filter((entry) => ACTIVE_ORDER_STATUSES.includes(entry.status));
}

/** Dropdown sources for the workspace. Inactive services still belong to old orders. */
export type PartnerOption = {
  id: string;
  name: string;
  service_id: string | null;
};

export async function getOrderFormOptions(): Promise<{
  services: Service[];
  partners: PartnerOption[];
  catalogItems: {
    id: string;
    name: string;
    service_id: string;
    partner_id: string | null;
    price: number | null;
    price_label: string | null;
  }[];
}> {
  const supabase = await createClient();
  const [services, partners, catalog] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, slug, type, description, is_active, sort_order, created_at, updated_at")
      .order("sort_order", { ascending: true }),
    supabase
      .from("partners")
      .select("id, name, service_id, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase
      .from("catalog_items")
      .select("id, name, service_id, partner_id, price, price_label")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (services.error) throw new Error(`Gagal memuat layanan: ${services.error.message}`);
  if (partners.error) throw new Error(`Gagal memuat partner: ${partners.error.message}`);
  if (catalog.error) throw new Error(`Gagal memuat paket: ${catalog.error.message}`);
  return { services: services.data, partners: partners.data, catalogItems: catalog.data };
}

/** Customer lookup for the manual order form, so an existing record is reused. */
export async function findCustomerByContact(
  email: string,
  phone: string,
): Promise<Customer | null> {
  const supabase = await createClient();
  const cleanEmail = email.trim().toLowerCase();
  const digits = phone.replace(/\D/g, "");

  if (cleanEmail) {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .ilike("email", cleanEmail)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`Gagal mencari customer: ${error.message}`);
    if (data) return data;
  }

  if (digits) {
    // Compare normalized digits so 08xx and +628xx resolve to the same person.
    const target = normalizePhone(digits);
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .not("phone", "is", null)
      .limit(200);
    if (error) throw new Error(`Gagal mencari customer: ${error.message}`);
    const match = (data ?? []).find((row) => normalizePhone(row.phone) === target);
    if (match) return match;
  }

  return null;
}
