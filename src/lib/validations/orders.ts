import { z } from "zod";
import { ORDER_STATUS_LABEL, NEXT_ORDER_STATUSES } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types/database";

/**
 * Validation for the admin order workspace. Prices and totals are re-derived on
 * the server, so nothing here is trusted as an amount: the schemas only check
 * that the admin typed something plausible.
 */

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().or(z.literal(""));

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const eventDate = z
  .string()
  .trim()
  .refine((value) => datePattern.test(value), "Tanggal acara tidak valid.")
  .refine((value) => value >= new Date().toISOString().slice(0, 10), "Tanggal acara sudah lewat.");

const email = z
  .string()
  .trim()
  .max(160, "Email terlalu panjang.")
  .refine((value) => value === "" || z.email().safeParse(value).success, "Email tidak valid.")
  .optional()
  .or(z.literal(""));

const money = (message: string) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? 0 : Number(value.replace(/\D/g, ""))))
    .refine((value) => Number.isFinite(value) && value >= 0, message);

const quantity = z
  .string()
  .trim()
  .transform((value) => Number(value.replace(",", ".")))
  .refine((value) => Number.isFinite(value) && value > 0, "Jumlah harus lebih besar dari 0.");

/** Customer block. Email is optional so a walk-in order can exist without one. */
export const orderCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama customer minimal 2 karakter.")
    .max(120, "Nama customer terlalu panjang."),
  email,
  phone: z
    .string()
    .trim()
    .min(6, "Nomor WhatsApp minimal 6 digit.")
    .max(32, "Nomor WhatsApp terlalu panjang."),
  address: optionalText(400, "Alamat terlalu panjang."),
});

/** Event + note block. */
export const orderEventSchema = z.object({
  eventTitle: optionalText(160, "Judul acara terlalu panjang."),
  eventDate,
  venueName: optionalText(160, "Nama lokasi terlalu panjang."),
  venueAddress: optionalText(400, "Alamat lokasi terlalu panjang."),
  customerNote: optionalText(4000, "Catatan customer terlalu panjang."),
  adminNote: optionalText(4000, "Catatan internal terlalu panjang."),
});

/** Creating a manual order: customer + event in one submit. */
export const createManualOrderSchema = orderCustomerSchema.merge(orderEventSchema);

/** Saving an existing order. `orderId` is only used to address the row. */
export const saveOrderSchema = orderEventSchema.extend({
  orderId: z.uuid("Pesanan tidak dikenal."),
});

export const orderStatusSchema = z.object({
  orderId: z.uuid("Pesanan tidak dikenal."),
  status: z.enum(
    Object.keys(ORDER_STATUS_LABEL) as [OrderStatus, ...OrderStatus[]],
    "Status pesanan tidak dikenal.",
  ),
});

/**
 * Adding a line item. A catalog item is chosen by id and snapshotted
 * server-side; a custom item carries its own service, name, price, and so on.
 */
export const addOrderItemSchema = z
  .object({
    orderId: z.uuid("Pesanan tidak dikenal."),
    kind: z.enum(["catalog", "custom"], "Pilih paket katalog atau item kustom."),
    catalogItemId: z.union([z.uuid(), z.literal("")]).optional(),
    serviceId: z.union([z.uuid(), z.literal("")]).optional(),
    partnerId: z.union([z.uuid(), z.literal("")]).optional(),
    name: z
      .string()
      .trim()
      .min(2, "Nama item minimal 2 karakter.")
      .max(160, "Nama item terlalu panjang.")
      .optional(),
    description: optionalText(1000, "Deskripsi terlalu panjang."),
    quantity,
    unitPrice: money("Harga satuan harus berupa angka."),
    customerVisible: z.boolean(),
  })
  .refine((value) => value.kind !== "catalog" || Boolean(value.catalogItemId), {
    message: "Pilih paket katalog yang akan ditambahkan.",
    path: ["catalogItemId"],
  })
  .refine((value) => value.kind !== "custom" || Boolean(value.serviceId), {
    message: "Pilih layanan untuk item kustom.",
    path: ["serviceId"],
  })
  .refine((value) => value.kind !== "custom" || Boolean(value.name?.trim()), {
    message: "Item kustom wajib punya nama.",
    path: ["name"],
  });

/** Editing a line item. Name and price stay a snapshot the admin may adjust. */
export const updateOrderItemSchema = z.object({
  itemId: z.uuid("Item tidak dikenal."),
  orderId: z.uuid("Pesanan tidak dikenal."),
  name: z
    .string()
    .trim()
    .min(2, "Nama item minimal 2 karakter.")
    .max(160, "Nama item terlalu panjang."),
  description: optionalText(1000, "Deskripsi terlalu panjang."),
  quantity,
  unitPrice: money("Harga satuan harus berupa angka."),
  customerVisible: z.boolean(),
});

export const removeOrderItemSchema = z.object({
  itemId: z.uuid("Item tidak dikenal."),
  orderId: z.uuid("Pesanan tidak dikenal."),
});

export const orderTargetSchema = z.object({
  orderId: z.uuid("Pesanan tidak dikenal."),
});

/**
 * Contact edit on an existing customer record. Looser than
 * `orderCustomerSchema` because a record created by a web request may have
 * arrived with a blank phone, and the admin should be able to fix it up.
 */
export const orderCustomerEditSchema = z.object({
  customerId: z.uuid("Customer tidak dikenal."),
  name: z
    .string()
    .trim()
    .min(2, "Nama customer minimal 2 karakter.")
    .max(120, "Nama customer terlalu panjang."),
  email,
  phone: z.string().trim().max(32, "Nomor WhatsApp terlalu panjang."),
  address: optionalText(400, "Alamat terlalu panjang."),
});

/** Guard rails used by `changeOrderStatus`; the message is shown to the admin. */
export function isLegalStatusChange(from: OrderStatus, to: OrderStatus): boolean {
  return NEXT_ORDER_STATUSES[from].includes(to);
}

export type CreateManualOrderInput = z.infer<typeof createManualOrderSchema>;
export type SaveOrderInput = z.infer<typeof saveOrderSchema>;
export type AddOrderItemInput = z.infer<typeof addOrderItemSchema>;
export type UpdateOrderItemInput = z.infer<typeof updateOrderItemSchema>;
