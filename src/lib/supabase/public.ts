import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * Session-less client for public marketing content.
 *
 * `src/lib/supabase/server.ts` reads cookies, which would opt every public page
 * into dynamic rendering. Public content is identical for every visitor, so
 * these reads use the anonymous role and stay cacheable.
 *
 * `@supabase/supabase-js` rather than `@supabase/ssr` on purpose: with
 * `persistSession: false` there are no cookies to write, and callers only need
 * `rpc` (submit a request) so no auth state machine is involved. One thing to
 * keep in mind if this client is ever used for auth: plain supabase-js defaults
 * to `flowType: "implicit"`, while the SSR clients use `"pkce"`. `sendMagicLink`
 * therefore does not send the OTP from here, because a PKCE code verifier has to
 * be stored on the way out to be presented on the way back in.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
