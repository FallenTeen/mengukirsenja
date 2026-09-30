import "server-only";
import { headers } from "next/headers";
import { safeNextPath } from "@/lib/auth/next-path";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Single place that sends a Supabase magic link, shared by the portal login
 * form and the admin "Kirim Magic Link" action.
 *
 * Uses the session-less client on purpose: the admin must not be signed out of
 * their own session by sending a link to a customer, and no cookie should change
 * as a side effect of this call.
 */
export async function sendMagicLink(
  email: string,
  nextPath: string = "/customer",
): Promise<{ error: string | null }> {
  const origin = (await headers()).get("origin");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin || "http://localhost:3000";
  const next = safeNextPath(nextPath, "/customer");

  const supabase = createPublicClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  return { error: error?.message ?? null };
}
