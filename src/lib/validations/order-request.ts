import { z } from "zod";

/** Today's date in the browser's timezone, as `YYYY-MM-DD`. */
function localToday(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const orderRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(120, "Nama terlalu panjang."),
  email: z.email("Masukkan alamat email yang valid."),
  phone: z
    .string()
    .trim()
    .min(6, "Nomor WhatsApp minimal 6 karakter.")
    .max(32, "Nomor WhatsApp terlalu panjang.")
    .refine(
      (value) => /^[0-9+()\-\s]+$/.test(value),
      "Nomor WhatsApp hanya boleh berisi angka, spasi, dan tanda + - ( ).",
    ),
  eventDate: z
    .string()
    .trim()
    .regex(DATE_PATTERN, "Tanggal acara tidak valid.")
    .refine((value) => {
      const today = localToday();
      return value >= today;
    }, "Tanggal acara tidak boleh sudah lewat."),
  venueName: z
    .string()
    .trim()
    .max(160, "Nama lokasi terlalu panjang.")
    .optional()
    .or(z.literal("")),
  venueAddress: z
    .string()
    .trim()
    .max(400, "Alamat terlalu panjang.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .max(4000, "Pesan maksimal 4000 karakter.")
    .optional()
    .or(z.literal("")),
  /** Optional hint only. Never trusted to price or scope the order. */
  preferredService: z.string().trim().max(120).optional().or(z.literal("")),
  /** Only set when a specific catalog package is being requested. */
  catalogItemId: z.uuid("Paket tidak valid.").optional().or(z.literal("")),
  source: z.enum(["web_custom", "web_catalog"]),
  /**
   * Honeypot. Real visitors never see this field, so anything in it is a bot.
   * The action reports success without writing anything. Content is allowed
   * through on purpose: rejecting it here would return a visible error and
   * tell the bot it had been detected.
   */
  website: z.string().max(200).optional(),
});

export type OrderRequestInput = z.infer<typeof orderRequestSchema>;

/** `YYYY-MM-DD` from a `Date`, for the `min` attribute of the date input. */
export function minimumEventDate(): string {
  return localToday();
}
