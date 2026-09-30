import { z } from "zod";

/** Blank text means "not set" and is stored as NULL. */
const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().or(z.literal(""));

/** Rupiah entered as plain digits, e.g. 18000000. */
const optionalAmount = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : Number(value.replace(/\D/g, ""))))
  .refine(
    (value) => value === null || (Number.isFinite(value) && value >= 0),
    "Harga harus berupa angka.",
  );

/** Either a repo-relative path or an absolute http(s) URL. */
const optionalImage = z
  .string()
  .trim()
  .max(500, "Alamat gambar terlalu panjang.")
  .refine(
    (value) => value === "" || value.startsWith("/") || /^https?:\/\//.test(value),
    "Gambar harus berupa tautan http(s) atau path yang diawali /.",
  );

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const catalogItemSchema = z.object({
  id: z.uuid().optional(),
  /** Sent back from the edit form so the public URL survives a rename. */
  slug: z.string().trim().max(160).optional(),
  name: z
    .string()
    .trim()
    .min(2, "Nama paket minimal 2 karakter.")
    .max(160, "Nama paket terlalu panjang."),
  serviceId: z.uuid("Layanan wajib dipilih."),
  /** Cleared server-side unless it belongs to the chosen service. */
  partnerId: z.union([z.uuid(), z.literal("")]).optional(),
  description: optionalText(2000, "Deskripsi terlalu panjang."),
  price: optionalAmount,
  priceLabel: optionalText(80, "Label harga terlalu panjang."),
  coverImageUrl: optionalImage,
  sortOrder: z.coerce
    .number("Urutan harus berupa angka.")
    .int("Urutan harus bilangan bulat.")
    .min(0)
    .max(9999),
});

export const portfolioItemSchema = z.object({
  id: z.uuid().optional(),
  /** Sent back from the edit form so the public URL survives a rename. */
  slug: z.string().trim().max(160).optional(),
  title: z
    .string()
    .trim()
    .min(2, "Judul minimal 2 karakter.")
    .max(160, "Judul terlalu panjang."),
  serviceId: z.uuid("Layanan wajib dipilih."),
  description: optionalText(2000, "Deskripsi terlalu panjang."),
  eventDate: z
    .string()
    .trim()
    .refine((value) => value === "" || datePattern.test(value), "Tanggal acara tidak valid.")
    .optional()
    .or(z.literal("")),
  coverImageUrl: optionalImage,
  sortOrder: z.coerce
    .number("Urutan harus berupa angka.")
    .int("Urutan harus bilangan bulat.")
    .min(0)
    .max(9999),
});

export const partnerSchema = z.object({
  id: z.uuid().optional(),
  name: z
    .string()
    .trim()
    .min(2, "Nama partner minimal 2 karakter.")
    .max(120, "Nama partner terlalu panjang."),
  serviceId: z.union([z.uuid(), z.literal("")]).optional(),
  phone: optionalText(32, "Nomor WhatsApp terlalu panjang."),
  email: z
    .string()
    .trim()
    .max(160, "Email terlalu panjang.")
    .refine((value) => value === "" || z.email().safeParse(value).success, "Email tidak valid.")
    .optional()
    .or(z.literal("")),
  notes: optionalText(2000, "Catatan terlalu panjang."),
});

/**
 * Admin-side customer edit. `auth_user_id` is deliberately absent: a guest
 * record stays a guest until the customer signs in through a magic link.
 */
export const customerSchema = z.object({
  id: z.uuid(),
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(120, "Nama terlalu panjang."),
  email: z
    .string()
    .trim()
    .max(160, "Email terlalu panjang.")
    .refine((value) => value === "" || z.email().safeParse(value).success, "Email tidak valid.")
    .optional()
    .or(z.literal("")),
  phone: optionalText(32, "Nomor WhatsApp terlalu panjang."),
  address: optionalText(400, "Alamat terlalu panjang."),
});

export type CatalogItemInput = z.infer<typeof catalogItemSchema>;
export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;
export type PartnerInput = z.infer<typeof partnerSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
