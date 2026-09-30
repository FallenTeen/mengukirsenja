"use server";

import { redirect } from "next/navigation";
import { sendMagicLink } from "@/lib/auth/magic-link";
import { safeNextPath } from "@/lib/auth/next-path";
import { createClient } from "@/lib/supabase/server";
import { adminLoginSchema, magicLinkSchema } from "@/lib/validations/auth";

export type AuthActionState = { error?: string; message?: string };

export async function requestMagicLink(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = magicLinkSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Email tidak valid." };
  }

  const { error } = await sendMagicLink(
    parsed.data.email,
    safeNextPath(formData.get("next"), "/customer"),
  );
  if (error) return { error };

  return {
    message: `Tautan masuk telah dikirim ke ${parsed.data.email}. Periksa juga folder spam.`,
  };
}

export async function signInAdmin(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data login tidak valid." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return { error: error?.message ?? "Email atau password salah." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "Akun ini tidak memiliki akses admin." };
  }

  redirect(safeNextPath(formData.get("next"), "/admin"));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
