"use server";

import { revalidatePath } from "next/cache";
import { requireCustomerUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { customerProfileSchema } from "@/lib/validations/customer";
import { orderTargetSchema } from "@/lib/validations/orders";

export type CustomerActionState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
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

/**
 * Customer-side confirmation.
 *
 * The action itself is only a thin wrapper: ownership, the current status, and
 * the duplicate-confirmation guard all live in `confirm_customer_order`, because
 * an `authenticated` customer holds no UPDATE policy on `orders` and must not be
 * able to write anything else. The `orderId` in the form is a lookup key, never
 * a permission.
 */
export async function confirmCustomerOrder(
  _prev: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const parsed = orderTargetSchema.safeParse({ orderId: text(formData.get("orderId")) });
  if (!parsed.success) return { error: "Pesanan tidak dikenal." };
  const { orderId } = parsed.data;

  await requireCustomerUser(`/customer/orders/${orderId}`);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_customer_order", {
    p_order_id: orderId,
  });

  if (error) {
    // "no_customer" and friends arrive as a returned code, not a PostgREST error,
    // so anything landing here is a genuine failure.
    return { error: `Konfirmasi gagal: ${error.message}` };
  }

  revalidatePath(`/customer/orders/${orderId}`, "page");
  revalidatePath("/customer/orders", "page");
  revalidatePath("/customer", "page");

  switch (data) {
    case "confirmed":
      return { message: "Terima kasih. Pesanan Anda sudah terkonfirmasi." };
    case "already_confirmed":
      return { message: "Pesanan ini sudah terkonfirmasi sebelumnya." };
    case "cancelled":
      return { error: "Pesanan ini sudah dibatalkan, jadi tidak bisa dikonfirmasi." };
    case "not_awaiting":
      return { error: "Pesanan ini sedang menunggu tinjauan admin." };
    case "no_customer":
      return { error: "Akun ini belum terhubung ke data pesanan mana pun." };
    case "not_found":
      // Deliberately the same answer as "exists but is not yours": the portal
      // must not confirm the existence of somebody else's order.
      return { error: "Pesanan tidak ditemukan." };
    default:
      return { error: "Konfirmasi gagal. Silakan hubungi admin lewat WhatsApp." };
  }
}

/** Name, phone, and address on the caller's own customer record. */
export async function saveCustomerProfile(
  _prev: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const parsed = customerProfileSchema.safeParse({
    name: text(formData.get("name")),
    phone: text(formData.get("phone")),
    address: text(formData.get("address")),
  });
  if (!parsed.success) {
    return {
      error: "Periksa kembali isian profil.",
      fieldErrors: asFieldErrors(parsed.error.issues),
    };
  }

  await requireCustomerUser("/customer/profile");
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_customer_profile", {
    p_name: parsed.data.name,
    p_phone: parsed.data.phone,
    p_address: parsed.data.address,
  });
  if (error) return { error: `Profil gagal disimpan: ${error.message}` };

  revalidatePath("/customer", "layout");
  revalidatePath("/customer/profile", "page");
  return { message: "Profil tersimpan." };
}
