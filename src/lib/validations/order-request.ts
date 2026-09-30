import { z } from "zod";

/** Today's date in the browser's timezone, as `YYYY-MM-DD`. */
function localToday(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const eventDay = z
  .string()
  .trim()
  .regex(DATE_PATTERN, "Tanggal acara tidak valid.")
  .refine((value) => value >= localToday(), "Tanggal acara tidak boleh sudah lewat.");

/** One reference image, uploaded to the references bucket or linked from outside. */
export const referenceImageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("upload"),
    value: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9][A-Za-z0-9_-]{7,80}\.(jpg|jpeg|png|webp|avif)$/i, "Gambar tidak valid."),
  }),
  z.object({
    type: z.literal("link"),
    value: z
      .string()
      .trim()
      .max(500, "Tautan terlalu panjang.")
      .refine(
        (value) => /^https?:\/\/\S+$/i.test(value),
        "Tautan gambar harus diawali http:// atau https://",
      ),
  }),
]);

export const orderRequestSchema = z
  .object({
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
    /** An event can span more than one day, so the end date is a real input. */
    eventDate: eventDay,
    eventEndDate: z.union([eventDay, z.literal("")]).optional(),
    /** `range` means the guest typed an end date; `single` means one day. */
    dateMode: z.enum(["single", "range"]),
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
    /** Slugs; the database resolves them to active service names. */
    services: z.array(z.string().trim().max(80)).max(8, "Maksimal 8 layanan.").default([]),
    /** JSON string, parsed below. */
    referenceImages: z.string().optional().or(z.literal("")),
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
  })
  .superRefine((value, ctx) => {
    if (value.dateMode !== "range") return;
    const end = value.eventEndDate;
    if (!end) {
      ctx.addIssue({
        code: "custom",
        path: ["eventEndDate"],
        message: "Tanggal selesai wajib diisi untuk acara beberapa hari.",
      });
      return;
    }
    if (end < value.eventDate) {
      ctx.addIssue({
        code: "custom",
        path: ["eventEndDate"],
        message: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.",
      });
    }
    const days =
      (new Date(`${end}T00:00:00`).getTime() - new Date(`${value.eventDate}T00:00:00`).getTime()) /
      86_400_000;
    if (days > 30) {
      ctx.addIssue({
        code: "custom",
        path: ["eventEndDate"],
        message: "Rentang acara maksimal 31 hari.",
      });
    }
  });

export type OrderRequestInput = z.infer<typeof orderRequestSchema>;

/** `YYYY-MM-DD` from a `Date`, for the `min` attribute of the date input. */
export function minimumEventDate(): string {
  return localToday();
}

/** Parses the hidden `referenceImages` field, which is JSON on the wire. */
export function parseReferenceImages(
  raw: string | undefined,
): { images: z.infer<typeof referenceImageSchema>[]; error?: string } {
  if (!raw) return { images: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { images: [], error: "Referensi gambar tidak valid." };
  }
  const list = z.array(referenceImageSchema).max(8).safeParse(parsed);
  if (!list.success) {
    return { images: [], error: "Referensi gambar tidak valid." };
  }
  return { images: list.data };
}
