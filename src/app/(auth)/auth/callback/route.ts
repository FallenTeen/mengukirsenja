import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/next-path";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/customer");
  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);

  if (!code) return fail("Tautan masuk tidak valid. Silakan minta tautan baru.");

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail(error.message);

  // Attach the signed-in user to their pre-existing customer record. The
  // database derives the customer from the verified JWT email, so the browser
  // cannot choose which record gets linked.
  const { error: linkError } = await supabase.rpc("link_customer_to_auth_user");
  if (linkError) return fail(linkError.message);

  return NextResponse.redirect(`${origin}${next}`);
}
