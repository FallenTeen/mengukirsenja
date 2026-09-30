"use server";

import { redirect } from "next/navigation";
import { getActiveServices } from "@/lib/queries/public-content";
import { createPublicClient } from "@/lib/supabase/public";
import { orderRequestSchema } from "@/lib/validations/order-request";

export type OrderRequestState = {
  error?: string;
  /** Field name -> first message, so each input can render its own error. */
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const text = (value: FormDataEntryValue | null): string =>
  typeof value === "string" ? value : "";

function asFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function submitOrderRequest(
  _prev: OrderRequestState,
  formData: FormData,
): Promise<OrderRequestState> {
  const values = {
    name: text(formData.get("name")),
    email: text(formData.get("email")),
    phone: text(formData.get("phone")),
    eventDate: text(formData.get("eventDate")),
    venueName: text(formData.get("venueName")),
    venueAddress: text(formData.get("venueAddress")),
    message: text(formData.get("message")),
    preferredService: text(formData.get("preferredService")),
    catalogItemId: text(formData.get("catalogItemId")),
    source: text(formData.get("source")),
    website: text(formData.get("website")),
  };

  const parsed = orderRequestSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "Periksa kembali isian formulir.",
      fieldErrors: asFieldErrors(parsed.error.issues),
      values,
    };
  }

  const input = parsed.data;

  // Honeypot tripped: look successful so bots do not retry, write nothing.
  if (input.website) {
    redirect("/request/success");
  }

  // The preferred service is a hint, not a scope or a price. The schema has no
  // column for it, so fold it into the note the studio actually reads.
  let note = input.message;
  if (input.preferredService) {
    const services = await getActiveServices();
    const label = services.find((s) => s.slug === input.preferredService)?.name;
    note = [note, `Layanan yang diminati: ${label ?? input.preferredService}.`]
      .filter(Boolean)
      .join("\n\n");
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("submit_order_request", {
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone,
    p_event_date: input.eventDate,
    p_venue_name: input.venueName || null,
    p_venue_address: input.venueAddress || null,
    p_customer_note: note || null,
    p_source: input.source,
    p_catalog_item_id: input.catalogItemId || null,
  });

  if (error || !data) {
    return {
      error: error?.message ?? "Pesanan gagal dikirim. Silakan coba lagi.",
      values,
    };
  }

  redirect(`/request/success?code=${encodeURIComponent(data)}`);
}
