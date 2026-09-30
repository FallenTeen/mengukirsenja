import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CatalogItem, Customer, Order, Partner, PortfolioItem, Service } from "@/lib/types/database";
import type { CatalogEntry, PortfolioEntry } from "@/lib/queries/public-content";

/**
 * Admin reads go through the session client on purpose: RLS then decides what
 * the caller may see, so the query layer cannot leak a row the database would
 * refuse.
 */

const CATALOG_FIELDS = `
  id, service_id, partner_id, name, slug, description, price, price_label,
  cover_image_url, is_featured, is_active, sort_order, created_at, updated_at,
  services!inner ( name, slug, type ),
  partners ( name )
`;

const PORTFOLIO_FIELDS = `
  id, service_id, title, slug, description, cover_image_url, event_date,
  is_featured, is_active, sort_order, created_at, updated_at,
  services!inner ( name, slug, type )
`;

type CatalogRow = Omit<CatalogEntry, "service_name" | "service_slug" | "service_type" | "partner_name"> & {
  services: { name: string; slug: string; type: "core" | "partner" } | null;
  partners: { name: string } | null;
};

type PortfolioRow = Omit<PortfolioEntry, "service_name" | "service_slug" | "service_type"> & {
  services: { name: string; slug: string; type: "core" | "partner" } | null;
};

const flattenCatalog = (row: CatalogRow): CatalogEntry => ({
  ...row,
  service_name: row.services?.name ?? "",
  service_slug: row.services?.slug ?? "",
  service_type: row.services?.type ?? "partner",
  partner_name: row.partners?.name ?? null,
});

const flattenPortfolio = (row: PortfolioRow): PortfolioEntry => ({
  ...row,
  service_name: row.services?.name ?? "",
  service_slug: row.services?.slug ?? "",
  service_type: row.services?.type ?? "partner",
});

/**
 * PostgREST `or=(...)` is comma and paren separated, so a raw search term could
 * close the filter. Drop the characters that change the filter shape.
 */
function safeSearch(term: string | undefined): string {
  return (term ?? "").trim().replace(/[,()%*\\]/g, " ").slice(0, 80);
}

export async function getAdminServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, name, slug, type, description, is_active, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Gagal memuat layanan: ${error.message}`);
  return data;
}

export async function getAdminPartners(): Promise<(Partner & { service_name: string | null })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("id, name, service_id, phone, email, notes, is_active, created_at, updated_at, services ( name )")
    .order("name", { ascending: true });
  if (error) throw new Error(`Gagal memuat partner: ${error.message}`);
  return (data ?? []).map((row) => ({
    ...row,
    service_name: (row.services as { name: string } | null)?.name ?? null,
  }));
}

/** Every catalog item, active or not. */
export async function getAdminCatalogItems(
  search?: string,
  serviceSlug?: string,
): Promise<CatalogEntry[]> {
  const supabase = await createClient();
  let query = supabase
    .from("catalog_items")
    .select(CATALOG_FIELDS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  const term = safeSearch(search);
  if (term) query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  if (serviceSlug && serviceSlug !== "all") query = query.eq("services.slug", serviceSlug);

  const { data, error } = await query;
  if (error) throw new Error(`Gagal memuat katalog: ${error.message}`);
  return (data as CatalogRow[]).map(flattenCatalog);
}

export async function getAdminCatalogItem(id: string): Promise<CatalogEntry | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("catalog_items")
    .select(CATALOG_FIELDS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Gagal memuat paket: ${error.message}`);
  return data ? flattenCatalog(data as CatalogRow) : null;
}

export async function getAdminPortfolioItems(
  search?: string,
  serviceSlug?: string,
): Promise<PortfolioEntry[]> {
  const supabase = await createClient();
  let query = supabase
    .from("portfolio_items")
    .select(PORTFOLIO_FIELDS)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  const term = safeSearch(search);
  if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  if (serviceSlug && serviceSlug !== "all") query = query.eq("services.slug", serviceSlug);

  const { data, error } = await query;
  if (error) throw new Error(`Gagal memuat portfolio: ${error.message}`);
  return (data as PortfolioRow[]).map(flattenPortfolio);
}

export async function getAdminPortfolioItem(id: string): Promise<PortfolioEntry | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_items")
    .select(PORTFOLIO_FIELDS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Gagal memuat item portfolio: ${error.message}`);
  return data ? flattenPortfolio(data as PortfolioRow) : null;
}

export type CustomerRow = Customer & { order_count: number; order_codes: string[] };

/** `orders(count)` and the order codes are one round trip each; the studio's
 *  order volume is small enough that a join beats a second query per row. */
export async function getAdminCustomers(search?: string): Promise<CustomerRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select("id, auth_user_id, name, email, phone, address, created_at, updated_at, orders ( order_code )")
    .order("created_at", { ascending: false });

  const term = safeSearch(search);
  if (term) query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);

  const { data, error } = await query;
  if (error) throw new Error(`Gagal memuat customer: ${error.message}`);

  return (data ?? []).map((row) => {
    const orders = (row.orders ?? []) as { order_code: string }[];
    const customer: Customer = { ...row };
    return {
      ...customer,
      order_count: orders.length,
      order_codes: orders.map((order) => order.order_code),
    };
  });
}

export async function getAdminCustomer(id: string): Promise<(CustomerRow & { orders: Order[] }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, auth_user_id, name, email, phone, address, created_at, updated_at, orders ( * )")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Gagal memuat customer: ${error.message}`);
  if (!data) return null;

  const orders = (data.orders ?? []) as Order[];
  const customer: Customer = { ...data };
  return {
    ...customer,
    order_count: orders.length,
    order_codes: orders.map((order) => order.order_code),
    orders: [...orders].sort((a, b) => (a.event_date ?? "").localeCompare(b.event_date ?? "")),
  };
}

export type DashboardCounts = {
  activeCatalogItems: number;
  portfolioItems: number;
  customers: number;
  ordersWaiting: number;
  upcomingOrders: { order_code: string; status: Order["status"]; event_date: string | null }[];
};

/** Head-only counts, so the dashboard does not pull whole tables. */
export async function getDashboardCounts(): Promise<DashboardCounts> {
  const supabase = await createClient();

  const [catalog, portfolio, customers, waiting, upcoming] = await Promise.all([
    supabase.from("catalog_items").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("portfolio_items").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_admin_review"),
    supabase
      .from("orders")
      .select("order_code, status, event_date")
      .in("status", ["pending_admin_review", "awaiting_customer_confirmation", "confirmed"])
      .not("event_date", "is", null)
      .gte("event_date", new Date().toISOString().slice(0, 10))
      .order("event_date", { ascending: true })
      .limit(5),
  ]);

  return {
    activeCatalogItems: catalog.count ?? 0,
    portfolioItems: portfolio.count ?? 0,
    customers: customers.count ?? 0,
    ordersWaiting: waiting.count ?? 0,
    upcomingOrders: (upcoming.data ?? []) as DashboardCounts["upcomingOrders"],
  };
}

export type { CatalogItem, PortfolioItem };
