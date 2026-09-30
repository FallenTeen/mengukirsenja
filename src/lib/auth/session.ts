import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Customer, Profile } from "@/lib/types/database";

export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async (userId: string): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
});

/** The customer record linked to the signed-in user, if any. */
export const getCustomer = cache(async (userId: string): Promise<Customer | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("customers").select("*").eq("auth_user_id", userId).maybeSingle();
  return data;
});

export const isAdmin = cache(async (): Promise<boolean> => {
  const user = await getUser();
  if (!user) return false;
  return (await getProfile(user.id))?.role === "admin";
});

/**
 * Customer gate for the portal and its server actions.
 *
 * Two rules, both about *role* and not just about being signed in. A guest is
 * sent to the passwordless portal instead of the admin sign-in page, and an
 * admin is turned back to the panel: an admin account owns no customer record,
 * so the portal would render an empty shell while its actions ran as nobody.
 *
 * The portal's data boundary is still RLS (`customers read own orders` keys off
 * `current_customer_id()`), so this is a routing guard, not the authorization
 * boundary.
 */
export async function requireCustomerUser(nextPath = "/customer"): Promise<User> {
  const user = await getUser();
  if (!user) redirect(`/portal?next=${encodeURIComponent(nextPath)}`);
  if ((await getProfile(user.id))?.role === "admin") redirect("/admin");
  return user;
}

/**
 * Admin gate, in three layers. `src/proxy.ts` turns away guests before the admin
 * tree renders at all, this function turns away a signed-in user whose profile is
 * not an admin, and the RLS policies underneath refuse the reads and writes
 * regardless of what the browser asks for.
 *
 * Both denials leave nothing on screen: a guest is sent to the login page, and an
 * authenticated non-admin is sent to the marketing home rather than an access
 * error that would confirm the panel exists.
 */
export async function requireAdmin(nextPath = "/admin"): Promise<{ user: User; profile: Profile }> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  const profile = await getProfile(user.id);
  if (profile?.role !== "admin") redirect("/");
  return { user, profile };
}

export async function requireCustomer(
  nextPath = "/customer",
): Promise<{ user: User; customer: Customer | null }> {
  const user = await requireCustomerUser(nextPath);
  return { user, customer: await getCustomer(user.id) };
}
