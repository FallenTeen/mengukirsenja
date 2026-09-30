import "server-only";
import { siteUrlFor } from "@/lib/auth/site-url";
import { safeNextPath } from "@/lib/auth/next-path";
import { createClient } from "@/lib/supabase/server";

/**
 * Single place that sends a Supabase magic link, shared by the portal login
 * form and the admin "Kirim Magic Link" actions.
 *
 * Three details make the difference between a link that opens and one that
 * fails on the recipient's phone.
 *
 * The redirect is absolute and built from `siteUrl()`, never from the request.
 * The message is read minutes later, usually on a phone, so it cannot carry
 * `localhost` or whichever host the admin happened to be signed in on.
 *
 * The redirect points at `/auth/callback?token_hash=...&type=email`, which is the
 * `{{ .TokenHash }}` email template. That variant is required here for two
 * reasons. Supabase only puts `?code=` in the link when the request carried a
 * PKCE `code_challenge`, and `@supabase/ssr` (this app's client) is PKCE by
 * default, so a plain `{{ .ConfirmationURL }}` would be verified server-side and
 * land on the app with nothing left to exchange. And even with a code, PKCE
 * demands the code verifier stored when the link was requested, which lives in
 * the admin's browser, not in the customer's email client. The token hash
 * carries its own proof, so `verifyOtp` can sign the customer in on whichever
 * device opened the message. The template is documented in `README.md`.
 *
 * The session-less client is not used here any more: a PKCE client has to
 * *store* the code verifier while the OTP is sent and read it back when the
 * callback exchanges it, and that storage is the cookie store. The sending
 * admin's own session is untouched either way, because `signInWithOtp` just
 * adds a second cookie for the pending flow instead of replacing the current one.
 */
export async function sendMagicLink(
  email: string,
  nextPath: string = "/customer",
): Promise<{ error: string | null }> {
  const next = safeNextPath(nextPath, "/customer");
  const redirectTo = `/auth/callback?next=${encodeURIComponent(next)}`;
  const emailRedirectTo = await siteUrlFor(redirectTo);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo },
  });

  return { error: error?.message ?? null };
}

