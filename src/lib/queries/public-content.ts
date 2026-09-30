import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { CatalogItem, PortfolioItem, Service } from "@/lib/types/database";

export const CORE_SERVICE_SLUG = "decoration";

/** Catalog item joined with the display names needed by the card and detail views. */
export type CatalogEntry = CatalogItem & {
  service_name: string;
  service_slug: string;
  service_type: "core" | "partner";
  partner_name: string | null;
};

export type PortfolioEntry = PortfolioItem & {
  service_name: string;
  service_slug: string;
  service_type: "core" | "partner";
};

/**
 * `services!inner` is required: PostgREST embeds as a LEFT JOIN, and a filter
 * on a plain embed is silently ignored. `service_id` is NOT NULL, so the inner
 * join never drops a row. `partners` stays a plain embed because it is
 * nullable and `!inner` would drop unpartnered packages.
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

function flattenCatalog(row: CatalogRow): CatalogEntry {
  const { services, partners, ...rest } = row;
  return {
    ...rest,
    service_name: services?.name ?? "",
    service_slug: services?.slug ?? "",
    service_type: services?.type ?? "partner",
    partner_name: partners?.name ?? null,
  };
}

function flattenPortfolio(row: PortfolioRow): PortfolioEntry {
  const { services, ...rest } = row;
  return {
    ...rest,
    service_name: services?.name ?? "",
    service_slug: services?.slug ?? "",
    service_type: services?.type ?? "partner",
  };
}

export async function getActiveServices(): Promise<Service[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, name, slug, type, description, is_active, sort_order, created_at, updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Gagal memuat daftar layanan: ${error.message}`);
  return data;
}

export async function getCatalogItems(serviceSlug?: string): Promise<CatalogEntry[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("catalog_items")
    .select(CATALOG_FIELDS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (serviceSlug && serviceSlug !== "all") {
    query = query.eq("services.slug", serviceSlug);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Gagal memuat katalog: ${error.message}`);
  return (data as CatalogRow[]).map(flattenCatalog);
}

export async function getCatalogItemBySlug(slug: string): Promise<CatalogEntry | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("catalog_items")
    .select(CATALOG_FIELDS)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat paket: ${error.message}`);
  return data ? flattenCatalog(data as CatalogRow) : null;
}

export async function getPortfolioItems(serviceSlug?: string): Promise<PortfolioEntry[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("portfolio_items")
    .select(PORTFOLIO_FIELDS)
    .eq("is_active", true)
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("sort_order", { ascending: true });

  if (serviceSlug && serviceSlug !== "all") {
    query = query.eq("services.slug", serviceSlug);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Gagal memuat portfolio: ${error.message}`);
  return (data as PortfolioRow[]).map(flattenPortfolio);
}

export async function getPortfolioItemBySlug(slug: string): Promise<PortfolioEntry | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("portfolio_items")
    .select(PORTFOLIO_FIELDS)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat item portfolio: ${error.message}`);
  return data ? flattenPortfolio(data as PortfolioRow) : null;
}

/**
 * Decoration first, then featured, then the manual sort order. Keeps the core
 * service visually dominant on the home page without hiding partner work.
 */
export function sortCatalogForDisplay(items: CatalogEntry[]): CatalogEntry[] {
  return [...items].sort((a, b) => {
    if (a.service_type !== b.service_type) return a.service_type === "core" ? -1 : 1;
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
}
