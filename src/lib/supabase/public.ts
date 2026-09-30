import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * Session-less client for public marketing content.
 *
 * `src/lib/supabase/server.ts` reads cookies, which would opt every public page
 * into dynamic rendering. Public content is identical for every visitor, so
 * these reads use the anonymous role and stay cacheable.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
