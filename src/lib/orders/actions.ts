"use server";

import { redirect } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import { orderRequestSchema, parseReferenceImages } from "@/lib/validations/order-request";

export type OrderRequestState = {
  error?: string;
  /** Field name -> first message, so each input can render its own error. */
  fieldErrors?: Record<string, string>;
  /** Submitted text, so a rejected form comes back filled in. */
  values?: Partial<
    Record<
      | "name"
      | "email"
      | "phone"
      | "eventDate"
      | "eventEndDate"
      | "venueName"
      | "venueAddress"
      | "message"
      | "catalogItemId",
      string
    >
  >;
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
    catalogItemId: text(formData.get("catalogItemId")),
    source: text(formData.get("source")),
    website: text(formData.get("website")),
    eventEndDate: text(formData.get("eventEndDate")),
    dateMode: text(formData.get("dateMode")) || "single",
    services: formData.getAll("services").map((value) => String(value)),
    referenceImages: text(formData.get("referenceImages")),
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

  const references = parseReferenceImages(input.referenceImages);
  if (references.error) {
    return { error: references.error, fieldErrors: { referenceImages: references.error }, values };
  }

  // A one-day event is stored as end = start so the column keeps one meaning.
  // Services of interest are no longer folded into the note: they have a column of
  // their own now, resolved to real service names inside the database.
  const eventEndDate = input.dateMode === "range" ? (input.eventEndDate || input.eventDate) : input.eventDate;

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("submit_order_request", {
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone,
    p_event_date: input.eventDate,
    p_event_end_date: eventEndDate,
    p_venue_name: input.venueName || null,
    p_venue_address: input.venueAddress || null,
    p_customer_note: input.message || null,
    p_source: input.source,
    p_catalog_item_id: input.catalogItemId || null,
    p_services_of_interest: input.services,
    p_reference_images: references.images,
  });

  if (error || !data) {
    return {
      error: error?.message ?? "Pesanan gagal dikirim. Silakan coba lagi.",
      values,
    };
  }

  redirect(`/request/success?code=${encodeURIComponent(data)}`);
}
