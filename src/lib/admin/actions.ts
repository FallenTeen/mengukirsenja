"use server";

import { revalidatePath } from "next/cache";
import { cache } from "react";
import { requireAdmin } from "@/lib/auth/session";
import { sendMagicLink } from "@/lib/auth/magic-link";
import { createClient } from "@/lib/supabase/server";
import {
  catalogItemSchema,
  customerSchema,
  partnerSchema,
  portfolioItemSchema,
} from "@/lib/validations/admin";
import type { CatalogItem, PortfolioItem } from "@/lib/types/database";

type CatalogPatch = Partial<Pick<CatalogItem, "is_active" | "is_featured" | "sort_order">>;
type PortfolioPatch = Partial<Pick<PortfolioItem, "is_active" | "is_featured" | "sort_order">>;

export type AdminFormState = {
  error?: string;
  message?: string;
  /** Field name -> first message, so each input can render its own error. */
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const text = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

/** An unchecked checkbox is simply absent from FormData. */
const flag = (formData: FormData, key: string): boolean => formData.get(key) === "on";

function asFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Admin mutations are protected twice: `requireAdmin` here for a clear error,
 * and the RLS "admins manage ..." policies underneath. A customer that reaches
 * this action anyway is rejected by the database, not by the UI.
 *
 * `cache` keeps the helpers below (upload, slug, partner lookup) from repeating
 * the auth round trip and cookie parse within one request.
 */
const adminClient = cache(async () => {
  await requireAdmin();
  return createClient();
});

/** Cover images are uploaded to the public `catalog` / `portfolio` buckets. */
const IMAGE_BUCKETS = { catalog: "catalog", portfolio: "portfolio" } as const;

async function uploadCover(
  bucket: keyof typeof IMAGE_BUCKETS,
  formData: FormData,
): Promise<string | null> {
  const file = formData.get("coverImage");
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) throw new Error("Berkas cover harus berupa gambar.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 5 MB.");

  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/\W/g, "") || "jpg";
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
  const supabase = await adminClient();
  const { error } = await supabase.storage
    .from(IMAGE_BUCKETS[bucket])
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Gagal mengunggah gambar: ${error.message}`);

  return supabase.storage.from(IMAGE_BUCKETS[bucket]).getPublicUrl(path).data.publicUrl;
}

/** The partner must belong to the chosen service, or it is dropped. */
async function resolvePartner(serviceId: string, partnerId: string | undefined) {
  if (!partnerId) return null;
  const supabase = await adminClient();
  const { data } = await supabase
    .from("partners")
    .select("id, service_id")
    .eq("id", partnerId)
    .maybeSingle();
  return data?.service_id === serviceId ? data.id : null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Public URLs are permanent, so an existing slug is never rewritten. */
async function uniqueSlug(table: "catalog_items" | "portfolio_items", value: string) {
  const base = slugify(value) || "item";
  const supabase = await adminClient();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const { data } = await supabase.from(table).select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export async function saveCatalogItem(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const values = {
    name: text(formData, "name"),
    serviceId: text(formData, "serviceId"),
    partnerId: text(formData, "partnerId"),
    description: text(formData, "description"),
    price: text(formData, "price"),
    priceLabel: text(formData, "priceLabel"),
    coverImageUrl: text(formData, "coverImageUrl"),
    sortOrder: text(formData, "sortOrder"),
  };

  const parsed = catalogItemSchema.safeParse({
    ...values,
    id: text(formData, "id") || undefined,
    slug: text(formData, "slug") || undefined,
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: asFieldErrors(parsed.error.issues), values };
  }
  const input = parsed.data;

  const payload = {
    name: input.name,
    service_id: input.serviceId,
    partner_id: await resolvePartner(input.serviceId, input.partnerId),
    description: input.description || null,
    price: input.price,
    price_label: input.priceLabel || null,
    cover_image_url: (await uploadCover("catalog", formData)) ?? (input.coverImageUrl || null),
    is_featured: flag(formData, "isFeatured"),
    is_active: flag(formData, "isActive"),
    sort_order: input.sortOrder,
  };

  const supabase = await adminClient();
  const slug = input.slug ?? (await uniqueSlug("catalog_items", input.name));

  if (input.id) {
    const { error } = await supabase.from("catalog_items").update(payload).eq("id", input.id);
    if (error) return { error: `Gagal menyimpan paket: ${error.message}`, values };
  } else {
    const { error } = await supabase.from("catalog_items").insert({ ...payload, slug });
    if (error) return { error: `Gagal menyimpan paket: ${error.message}`, values };
  }

  revalidateContent(slug);
  return { message: "Paket disimpan." };
}

/** Row actions: activate, deactivate, feature. */
export async function updateCatalogItem(prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const id = text(formData, "id");
  if (!id) return { error: "Paket tidak dikenal." };

  const patch: CatalogPatch = {};
  if (formData.has("is_active")) patch.is_active = formData.get("is_active") === "true";
  if (formData.has("is_featured")) patch.is_featured = formData.get("is_featured") === "true";
  const order = catalogItemSchema.shape.sortOrder.safeParse(text(formData, "sortOrder"));
  if (order.success) patch.sort_order = order.data;

  const supabase = await adminClient();
  const { data, error } = await supabase
    .from("catalog_items")
    .update(patch)
    .eq("id", id)
    .select("slug")
    .single();
  if (error) return { error: `Gagal memperbarui paket: ${error.message}` };

  revalidateContent(data?.slug);
  return { ...prev, error: undefined, message: "Paket diperbarui." };
}

export async function deleteCatalogItem(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = text(formData, "id");
  const supabase = await adminClient();
  const { data, error } = await supabase
    .from("catalog_items")
    .delete()
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  if (error) return { error: `Gagal menghapus paket: ${error.message}` };

  revalidateContent(data?.slug);
  return { message: "Paket dihapus." };
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

export async function savePortfolioItem(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const values = {
    title: text(formData, "title"),
    serviceId: text(formData, "serviceId"),
    description: text(formData, "description"),
    eventDate: text(formData, "eventDate"),
    coverImageUrl: text(formData, "coverImageUrl"),
    sortOrder: text(formData, "sortOrder"),
  };

  const parsed = portfolioItemSchema.safeParse({
    ...values,
    id: text(formData, "id") || undefined,
    slug: text(formData, "slug") || undefined,
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: asFieldErrors(parsed.error.issues), values };
  }
  const input = parsed.data;

  const payload = {
    title: input.title,
    service_id: input.serviceId,
    description: input.description || null,
    event_date: input.eventDate || null,
    cover_image_url: (await uploadCover("portfolio", formData)) ?? (input.coverImageUrl || null),
    is_featured: flag(formData, "isFeatured"),
    is_active: flag(formData, "isActive"),
    sort_order: input.sortOrder,
  };

  const supabase = await adminClient();
  const slug = input.slug ?? (await uniqueSlug("portfolio_items", input.title));

  if (input.id) {
    const { error } = await supabase.from("portfolio_items").update(payload).eq("id", input.id);
    if (error) return { error: `Gagal menyimpan portfolio: ${error.message}`, values };
  } else {
    const { error } = await supabase.from("portfolio_items").insert({ ...payload, slug });
    if (error) return { error: `Gagal menyimpan portfolio: ${error.message}`, values };
  }

  revalidateContent(slug);
  return { message: "Portfolio disimpan." };
}

export async function updatePortfolioItem(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = text(formData, "id");
  if (!id) return { error: "Item portfolio tidak dikenal." };

  const patch: PortfolioPatch = {};
  if (formData.has("is_active")) patch.is_active = formData.get("is_active") === "true";
  if (formData.has("is_featured")) patch.is_featured = formData.get("is_featured") === "true";
  const order = portfolioItemSchema.shape.sortOrder.safeParse(text(formData, "sortOrder"));
  if (order.success) patch.sort_order = order.data;

  const supabase = await adminClient();
  const { data, error } = await supabase
    .from("portfolio_items")
    .update(patch)
    .eq("id", id)
    .select("slug")
    .single();
  if (error) return { error: `Gagal memperbarui portfolio: ${error.message}` };

  revalidateContent(data?.slug);
  return { message: "Portfolio diperbarui." };
}

export async function deletePortfolioItem(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = text(formData, "id");
  const supabase = await adminClient();
  const { data, error } = await supabase
    .from("portfolio_items")
    .delete()
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  if (error) return { error: `Gagal menghapus portfolio: ${error.message}` };

  revalidateContent(data?.slug);
  return { message: "Portfolio dihapus." };
}

// ---------------------------------------------------------------------------
// Partners
// ---------------------------------------------------------------------------

export async function savePartner(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const values = {
    name: text(formData, "name"),
    serviceId: text(formData, "serviceId"),
    phone: text(formData, "phone"),
    email: text(formData, "email"),
    notes: text(formData, "notes"),
  };

  const parsed = partnerSchema.safeParse({ ...values, id: text(formData, "id") || undefined });
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: asFieldErrors(parsed.error.issues), values };
  }
  const input = parsed.data;

  const payload = {
    name: input.name,
    service_id: input.serviceId || null,
    phone: input.phone || null,
    email: input.email || null,
    notes: input.notes || null,
    is_active: flag(formData, "isActive"),
  };

  const supabase = await adminClient();
  const result = input.id
    ? await supabase.from("partners").update(payload).eq("id", input.id)
    : await supabase.from("partners").insert(payload);
  if (result.error) return { error: `Gagal menyimpan partner: ${result.error.message}`, values };

  revalidatePath("/admin/partners", "page");
  return { message: "Partner disimpan." };
}

export async function updatePartner(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = text(formData, "id");
  const supabase = await adminClient();
  const { error } = await supabase
    .from("partners")
    .update({ is_active: formData.get("is_active") === "true" })
    .eq("id", id);
  if (error) return { error: `Gagal memperbarui partner: ${error.message}` };

  revalidateContent();
  return { message: "Partner diperbarui." };
}

export async function deletePartner(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const supabase = await adminClient();
  const { error } = await supabase.from("partners").delete().eq("id", text(formData, "id"));
  if (error) return { error: `Gagal menghapus partner: ${error.message}` };

  revalidateContent();
  return { message: "Partner dihapus." };
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export async function saveCustomer(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const values = {
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    address: text(formData, "address"),
  };

  const parsed = customerSchema.safeParse({ ...values, id: text(formData, "id") });
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: asFieldErrors(parsed.error.issues), values };
  }
  const input = parsed.data;

  const supabase = await adminClient();
  const { error } = await supabase
    .from("customers")
    .update({
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      address: input.address || null,
    })
    .eq("id", input.id);
  if (error) return { error: `Gagal menyimpan customer: ${error.message}`, values };

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${input.id}`);
  return { message: "Data customer disimpan." };
}

/**
 * Grants portal access. The customer record is never given credentials here:
 * the magic link creates the auth user, and `link_customer_to_auth_user` binds
 * it to the guest record by verified email on the callback.
 */
export async function sendCustomerMagicLink(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = text(formData, "id");
  const supabase = await adminClient();
  const { data, error } = await supabase
    .from("customers")
    .select("email")
    .eq("id", id)
    .maybeSingle();
  if (error) return { error: `Gagal membaca customer: ${error.message}` };
  if (!data?.email) return { error: "Customer ini belum punya email, magic link tidak bisa dikirim." };

  const { error: sendError } = await sendMagicLink(data.email, "/customer");
  if (sendError) return { error: sendError };

  return { message: `Tautan masuk telah dikirim ke ${data.email}.` };
}

/**
 * Public pages read content through the cacheable anon client, so they need an
 * explicit bust. The detail pages are ISR'd by slug, so pass the saved slug.
 */
function revalidateContent(slug?: string | null): void {
  const paths = [
    "/",
    "/catalog",
    "/portfolio",
    "/admin",
    "/admin/catalog",
    "/admin/portfolio",
    "/admin/partners",
  ];
  if (slug) paths.push(`/catalog/${slug}`, `/portfolio/${slug}`);

  for (const path of paths) revalidatePath(path, "page");
}
