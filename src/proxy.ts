import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Two jobs, in this order.
 *
 * First a cheap cookie gate: a request without a Supabase session cookie never
 * reaches `/admin` or `/customer` at all, so a guest cannot pull admin markup or
 * an RSC payload out of the server, not even a redirect frame. The cookie tells
 * us who *might* be signed in, never what role they hold.
 *
 * Then `updateSession` rotates the session cookie. The proxy is the one place a
 * refresh token can be exchanged on the edge, so skipping it leaves a long visit
 * holding an expired access token, and the page-level guards then bounce a
 * signed-in user between the portal and its own sign-in page.
 *
 * The role check needs the database and therefore stays in `requireAdmin` and
 * `requireCustomerUser`, which every layout runs on every request. RLS is the
 * third layer underneath that.
 */
const SESSION_COOKIE = /^sb-[a-z0-9]+-auth-token(\.\d+)?$/;

/** Each area sends a guest to its own sign-in page, not to a shared one. */
const GUEST_ENTRY: Record<string, string> = { "/admin": "/login", "/customer": "/portal" };

export default async function proxy(request: NextRequest) {
  const hasSession = request.cookies
    .getAll()
    .some((cookie) => SESSION_COOKIE.test(cookie.name) && cookie.value.length > 0);

  if (hasSession) return updateSession(request);

  const entry = Object.entries(GUEST_ENTRY).find(([prefix]) =>
    request.nextUrl.pathname.startsWith(prefix),
  )?.[1];
  if (!entry) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = entry;
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/customer/:path*"],
};
