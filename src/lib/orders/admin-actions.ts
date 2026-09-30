"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { sendMagicLink } from "@/lib/auth/magic-link";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_ORDER_STATUSES, lineSubtotal, toNumber } from "@/lib/order-status";
import { findCustomerByContact } from "@/lib/queries/admin-orders";
import {
  addOrderItemSchema,
  createManualOrderSchema,
  isLegalStatusChange,
  orderCustomerEditSchema,
  orderTargetSchema,
  removeOrderItemSchema,
  saveOrderSchema,
  updateOrderItemSchema,
} from "@/lib/validations/orders";
import type {
  Insertable,
  Order,
  OrderItem,
  OrderStatus,
  Updatable,
} from "@/lib/types/database";

export type OrderActionState = {
  error?: string;
  message?: string;
  /** Non-blocking: another live order already sits on the chosen date. */
  warning?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const text = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

const flag = (formData: FormData, key: string): boolean => formData.get(key) === "on";

function asFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const adminClient = cache(async () => {
  await requireAdmin();
  return createClient();
});

/**
 * `total_estimate` is a stored column so lists and the calendar stay cheap, but
 * the browser never gets to write it: every item mutation finishes by
 * re-reading the line items and re-summing them here.
 */
async function recomputeTotal(orderId: string): Promise<number> {
  const supabase = await adminClient();
  const { data, error } = await supabase
    .from("order_items")
    .select("quantity, unit_price")
    .eq("order_id", orderId);
  if (error) throw new Error(`Gagal menghitung total: ${error.message}`);

  const total = (data ?? []).reduce(
    (sum, item) => sum + lineSubtotal(toNumber(item.quantity), toNumber(item.unit_price)),
    0,
  );

  const { error: updateError } = await supabase
    .from("orders")
    .update({ total_estimate: total })
    .eq("id", orderId);
  if (updateError) throw new Error(`Gagal menyimpan total: ${updateError.message}`);

  return total;
}

function revalidateOrders(orderId?: string): void {
  for (const path of ["/admin", "/admin/orders", "/admin/calendar", "/customer/orders"]) {
    revalidatePath(path, "page");
  }
  if (orderId) {
    revalidatePath(`/admin/orders/${orderId}`, "page");
    revalidatePath(`/customer/orders/${orderId}`, "page");
  }
}

/** Warns, never blocks: two events on one date is a real possibility. */
async function conflictWarning(
  eventDate: string,
  excludeOrderId?: string,
): Promise<string | undefined> {
  const supabase = await adminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_code")
    .eq("event_date", eventDate)
    .in("status", ACTIVE_ORDER_STATUSES);
  if (error) return undefined;

  const others = (data ?? []).filter((row) => row.id !== excludeOrderId);
  if (others.length === 0) return undefined;

  return `Perhatian: ${others.length} pesanan aktif lain sudah terjadwal pada tanggal ini (${others
    .map((row) => row.order_code)
    .join(", ")}). Pesanan tetap disimpan.`;
}

// ---------------------------------------------------------------------------
// Manual orders
// ---------------------------------------------------------------------------

/**
 * Creates an order without the public website. The customer row is reused when
 * the email or the phone digits already exist, which is what keeps a walk-in
 * from becoming a duplicate of a web request.
 */
export async function createManualOrder(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const values = {
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    address: text(formData, "address"),
    eventTitle: text(formData, "eventTitle"),
    eventDate: text(formData, "eventDate"),
    venueName: text(formData, "venueName"),
    venueAddress: text(formData, "venueAddress"),
    customerNote: text(formData, "customerNote"),
    adminNote: text(formData, "adminNote"),
  };

  const parsed = createManualOrderSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "Periksa kembali isian form.",
      fieldErrors: asFieldErrors(parsed.error.issues),
      values,
    };
  }
  const input = parsed.data;

  const supabase = await adminClient();
  const existing =
    input.email || input.phone
      ? await findCustomerByContact(input.email ?? "", input.phone)
      : null;

  let customerId: string;

  if (existing) {
    // Keep the guest record usable as a portal account later on.
    const { error } = await supabase
      .from("customers")
      .update({
        name: input.name,
        email: input.email || existing.email,
        phone: input.phone || existing.phone,
        address: input.address || existing.address,
      })
      .eq("id", existing.id);
    if (error) return { error: `Gagal memperbarui customer: ${error.message}`, values };
    customerId = existing.id;
  } else {
    const { data, error } = await supabase
      .from("customers")
      .insert({
        name: input.name,
        email: input.email || null,
        phone: input.phone,
        address: input.address || null,
        auth_user_id: null,
      })
      .select("id")
      .single();
    if (error) return { error: `Gagal membuat customer: ${error.message}`, values };
    customerId = data.id;
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      source: "admin_manual",
      status: "draft",
      event_title: input.eventTitle || null,
      event_date: input.eventDate,
      venue_name: input.venueName || null,
      venue_address: input.venueAddress || null,
      customer_note: input.customerNote || null,
      admin_note: input.adminNote || null,
      created_by_user_id: (await requireAdmin()).user.id,
    })
    .select("id, order_code")
    .single();
  if (orderError) return { error: `Gagal membuat pesanan: ${orderError.message}`, values };
  revalidateOrders(order.id);
  redirect(`/admin/orders/${order.id}?created=${encodeURIComponent(order.order_code)}`);
}

export async function saveOrder(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const values = {
    eventTitle: text(formData, "eventTitle"),
    eventDate: text(formData, "eventDate"),
    venueName: text(formData, "venueName"),
    venueAddress: text(formData, "venueAddress"),
    customerNote: text(formData, "customerNote"),
    adminNote: text(formData, "adminNote"),
  };

  const parsed = saveOrderSchema.safeParse({ ...values, orderId: text(formData, "orderId") });
  if (!parsed.success) {
    return {
      error: "Periksa kembali isian form.",
      fieldErrors: asFieldErrors(parsed.error.issues),
      values,
    };
  }
  const input = parsed.data;

  const supabase = await adminClient();
  const { error } = await supabase
    .from("orders")
    .update({
      event_title: input.eventTitle || null,
      event_date: input.eventDate,
      venue_name: input.venueName || null,
      venue_address: input.venueAddress || null,
      customer_note: input.customerNote || null,
      admin_note: input.adminNote || null,
    })
    .eq("id", input.orderId);
  if (error) return { error: `Gagal menyimpan pesanan: ${error.message}`, values };

  const warning = await conflictWarning(input.eventDate, input.orderId);
  revalidateOrders(input.orderId);
  return warning
    ? { warning, message: "Pesanan disimpan." }
    : { message: "Pesanan disimpan." };
}

/** Customer contact details can change after the order was created. */
export async function saveOrderCustomer(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const parsed = orderCustomerEditSchema.safeParse({
    customerId: text(formData, "customerId"),
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    address: text(formData, "address"),
  });
  if (!parsed.success) {
    return { error: "Periksa kembali data customer.", fieldErrors: asFieldErrors(parsed.error.issues) };
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
    .eq("id", input.customerId);
  if (error) return { error: `Gagal menyimpan customer: ${error.message}` };

  revalidateOrders(text(formData, "orderId"));
  return { message: "Data customer disimpan." };
}

// ---------------------------------------------------------------------------
// Line items
// ---------------------------------------------------------------------------

/**
 * A catalog item is snapshotted here: name, service, partner, and the current
 * displayed price are copied onto the line, so later catalog edits never
 * rewrite history. The admin may still adjust the snapshot afterwards.
 */
export async function addOrderItem(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const parsed = addOrderItemSchema.safeParse({
    orderId: text(formData, "orderId"),
    kind: text(formData, "kind"),
    catalogItemId: text(formData, "catalogItemId"),
    serviceId: text(formData, "serviceId"),
    partnerId: text(formData, "partnerId"),
    name: text(formData, "name"),
    description: text(formData, "description"),
    quantity: text(formData, "quantity") || "1",
    unitPrice: text(formData, "unitPrice"),
    customerVisible: flag(formData, "customerVisible"),
  });
  if (!parsed.success) {
    return {
      error: "Item tidak bisa ditambahkan.",
      fieldErrors: asFieldErrors(parsed.error.issues),
    };
  }
  const input = parsed.data;

  const supabase = await adminClient();
  let row: Insertable<OrderItem>;

  if (input.kind === "catalog") {
    const { data, error } = await supabase
      .from("catalog_items")
      .select("id, name, service_id, partner_id, price")
      .eq("id", input.catalogItemId!)
      .maybeSingle();
    if (error) return { error: `Gagal membaca paket: ${error.message}` };
    if (!data) return { error: "Paket katalog tidak ditemukan." };

    const unitPrice = toNumber(data.price);
    row = {
      order_id: input.orderId,
      catalog_item_id: data.id,
      service_id: data.service_id,
      partner_id: data.partner_id,
      name: data.name,
      description: input.description || null,
      quantity: input.quantity,
      unit_price: unitPrice,
      subtotal: lineSubtotal(input.quantity, unitPrice),
      is_custom: false,
      customer_visible: input.customerVisible,
    };
  } else {
    // The partner must belong to the chosen service, same rule as the catalog.
    let partnerId = input.partnerId || null;
    if (partnerId) {
      const { data: partner } = await supabase
        .from("partners")
        .select("service_id")
        .eq("id", partnerId)
        .maybeSingle();
      if (partner?.service_id !== input.serviceId) partnerId = null;
    }

    row = {
      order_id: input.orderId,
      catalog_item_id: null,
      service_id: input.serviceId,
      partner_id: partnerId,
      name: input.name!.trim(),
      description: input.description || null,
      quantity: input.quantity,
      unit_price: input.unitPrice,
      subtotal: lineSubtotal(input.quantity, input.unitPrice),
      is_custom: true,
      customer_visible: input.customerVisible,
    };
  }

  const { error } = await supabase.from("order_items").insert(row);
  if (error) return { error: `Gagal menambah item: ${error.message}` };

  await recomputeTotal(input.orderId);
  revalidateOrders(input.orderId);
  return { message: "Item ditambahkan." };
}

export async function updateOrderItem(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const parsed = updateOrderItemSchema.safeParse({
    itemId: text(formData, "itemId"),
    orderId: text(formData, "orderId"),
    name: text(formData, "name"),
    description: text(formData, "description"),
    quantity: text(formData, "quantity"),
    unitPrice: text(formData, "unitPrice"),
    customerVisible: flag(formData, "customerVisible"),
  });
  if (!parsed.success) {
    return {
      error: "Item tidak bisa disimpan.",
      fieldErrors: asFieldErrors(parsed.error.issues),
    };
  }
  const input = parsed.data;

  const supabase = await adminClient();
  const { error } = await supabase
    .from("order_items")
    .update({
      name: input.name,
      description: input.description || null,
      quantity: input.quantity,
      unit_price: input.unitPrice,
      subtotal: lineSubtotal(input.quantity, input.unitPrice),
      customer_visible: input.customerVisible,
    })
    .eq("id", input.itemId)
    .eq("order_id", input.orderId);
  if (error) return { error: `Gagal menyimpan item: ${error.message}` };

  await recomputeTotal(input.orderId);
  revalidateOrders(input.orderId);
  return { message: "Item disimpan." };
}

export async function removeOrderItem(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const parsed = removeOrderItemSchema.safeParse({
    itemId: text(formData, "itemId"),
    orderId: text(formData, "orderId"),
  });
  if (!parsed.success) return { error: "Item tidak dikenal." };
  const { itemId, orderId } = parsed.data;

  const supabase = await adminClient();
  const { error } = await supabase
    .from("order_items")
    .delete()
    .eq("id", itemId)
    .eq("order_id", orderId);
  if (error) return { error: `Gagal menghapus item: ${error.message}` };

  await recomputeTotal(orderId);
  revalidateOrders(orderId);
  return { message: "Item dihapus." };
}

/** Flips customer visibility without opening the whole edit form. */
export async function toggleOrderItemVisibility(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const parsed = removeOrderItemSchema.safeParse({
    itemId: text(formData, "itemId"),
    orderId: text(formData, "orderId"),
  });
  if (!parsed.success) return { error: "Item tidak dikenal." };
  const { itemId, orderId } = parsed.data;

  const supabase = await adminClient();
  const { data, error } = await supabase
    .from("order_items")
    .update({ customer_visible: !flag(formData, "customerVisible") })
    .eq("id", itemId)
    .eq("order_id", orderId)
    .select("customer_visible")
    .maybeSingle();
  if (error) return { error: `Gagal mengubah visibilitas: ${error.message}` };

  revalidateOrders(orderId);
  return { message: data?.customer_visible ? "Item kini terlihat oleh customer." : "Item disembunyikan dari customer." };
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

async function applyStatus(orderId: string, status: OrderStatus): Promise<OrderActionState> {
  const supabase = await adminClient();
  const { data: current, error: readError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();
  if (readError) return { error: `Gagal membaca pesanan: ${readError.message}` };
  if (!current) return { error: "Pesanan tidak ditemukan." };

  // The enum accepts any value, so the transition table is the guard.
  if (!isLegalStatusChange(current.status as OrderStatus, status)) {
    return { error: "Perubahan status itu tidak diperbolehkan." };
  }

  const patch: Updatable<Order> = { status };
  // Recording when the studio agreed is what separates "the admin confirmed
  // it" from "the customer pressed the button", which Phase 5 will set.
  if (status === "confirmed" || status === "completed") {
    patch.admin_confirmed_at = new Date().toISOString();
  }
  // Cancelling voids every earlier sign-off, and reopening starts clean.
  if (status === "cancelled" || (status === "draft" && current.status === "cancelled")) {
    patch.admin_confirmed_at = null;
    patch.customer_confirmed_at = null;
  }

  const { error } = await supabase.from("orders").update(patch).eq("id", orderId);
  if (error) return { error: `Gagal mengubah status: ${error.message}` };

  revalidateOrders(orderId);
  return { message: "Status pesanan diperbarui." };
}

export async function changeOrderStatus(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const orderId = text(formData, "orderId");
  if (!orderId) return { error: "Pesanan tidak dikenal." };
  return applyStatus(orderId, text(formData, "status") as OrderStatus);
}

export async function cancelOrder(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const orderId = text(formData, "orderId");
  if (!orderId) return { error: "Pesanan tidak dikenal." };
  return applyStatus(orderId, "cancelled");
}

// ---------------------------------------------------------------------------
// Customer contact
// ---------------------------------------------------------------------------

/**
 * Grants portal access to the order's own customer. The link carries the
 * order id, but access still comes from RLS: the customer_orders view only
 * returns rows whose `customer_id` matches the signed-in account.
 */
export async function sendOrderMagicLink(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const parsed = orderTargetSchema.safeParse({ orderId: text(formData, "orderId") });
  if (!parsed.success) return { error: "Pesanan tidak dikenal." };
  const { orderId } = parsed.data;

  const supabase = await adminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("order_code, customers ( email )")
    .eq("id", orderId)
    .maybeSingle();
  if (error) return { error: `Gagal membaca pesanan: ${error.message}` };

  const email = (data?.customers as { email: string | null } | null)?.email;
  if (!email) {
    return { error: "Customer ini belum punya email. Isi email di detail pesanan terlebih dahulu." };
  }

  const { error: sendError } = await sendMagicLink(email, `/customer/orders/${orderId}`);
  if (sendError) return { error: sendError };

  return { message: `Tautan untuk pesanan ${data?.order_code} telah dikirim ke ${email}.` };
}
