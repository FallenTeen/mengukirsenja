import { z } from "zod";

export const magicLinkSchema = z.object({
  email: z.email("Masukkan alamat email yang valid."),
});

export const adminLoginSchema = z.object({
  email: z.email("Masukkan alamat email yang valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
