import { z } from "zod";
import { normalizePhone } from "@/lib/whatsapp";

/**
 * Self-service profile edit from the customer portal.
 *
 * Only name, phone, and address are editable. Email is absent on purpose: it is
 * the key the guest record is matched on, so letting the customer change it would
 * silently move which orders belong to them. Role and `auth_user_id` are not even
 * fields here, the database function writes the three columns literally.
 */
export const customerProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(120, "Nama terlalu panjang."),
  phone: z
    .string()
    .trim()
    .max(32, "Nomor WhatsApp terlalu panjang.")
    .refine(
      (value) => value === "" || (normalizePhone(value)?.length ?? 0) >= 9,
      "Nomor WhatsApp tidak dikenali. Cantumkan kode negara, contoh 6281234567890.",
    ),
  address: z.string().trim().max(400, "Alamat terlalu panjang."),
});

export type CustomerProfileInput = z.infer<typeof customerProfileSchema>;
