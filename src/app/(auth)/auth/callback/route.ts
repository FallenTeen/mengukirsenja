import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { safeNextPath } from "@/lib/auth/next-path";
import { siteUrl } from "@/lib/auth/site-url";
import { createClient } from "@/lib/supabase/server";

/**
 * The one landing point for a magic link.
 *
 * Supabase sends the reader of the email to this path with either a
 * `token_hash` (the `{{ .TokenHash }}` email template) or a `code` (the
 * server-side OAuth/PKCE redirect). Both are handled, and the token hash is the
 * shape this app asks for in `sendMagicLink`, because it is the only one that
 * survives the two trips a real magic link makes: the request happens on the
 * admin's browser and the click happens on the customer's phone, so nothing
 * stored during the request can be relied on at the click. PKCE additionally
 * requires that stored verifier, which is why `code` alone cannot sign in a
 * customer who opens their email somewhere else.
 *
 * `type=email` is fixed rather than taken from the query string, and it is the
 * same value the email template writes into the link. Every link this app sends
 * is an email sign-in link, and accepting a caller-chosen type would let a
 * crafted URL ask for a different verification class.
 */
const MAGIC_LINK_TYPE: EmailOtpType = "email";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const baseUrl = await siteUrl();
  const tokenHash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/customer");
  // Magic links come from `/portal`, so a failure belongs back on that page. An
  // admin session that expires mid-flow lands on `/login` instead, which is the
  // page that can actually restore it.
  const entry = searchParams.get("next")?.startsWith("/admin") ? "/login" : "/portal";
  const fail = (reason: string) =>
    NextResponse.redirect(`${baseUrl}${entry}?error=${encodeURIComponent(reason)}`);

  if (!tokenHash && !code) {
    return fail("Tautan masuk tidak valid. Silakan minta tautan baru.");
  }

  // Created before the exchange on purpose. The client reads the request cookies
  // when it is constructed, which is how the PKCE branch gets the code-verifier
  // cookie stored when the link was requested. Without it, a `?code=` link
  // cannot be exchanged at all.
  const supabase = await createClient();

  // `verifyOtp` writes the session cookies through the cookie adapter in
  // `createClient`, so the browser comes back signed in.
  const { error } = tokenHash
    ? await supabase.auth.verifyOtp({ type: MAGIC_LINK_TYPE, token_hash: tokenHash })
    : await supabase.auth.exchangeCodeForSession(code!);
  if (error) return fail(error.message);

  // Attach the signed-in user to their pre-existing customer record. The
  // database derives the customer from the verified JWT email, so the browser
  // cannot choose which record gets linked.
  const { error: linkError } = await supabase.rpc("link_customer_to_auth_user");
  if (linkError) return fail(linkError.message);

  return NextResponse.redirect(`${baseUrl}${next}`);
}

