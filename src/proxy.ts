import { NextResponse, type NextRequest } from "next/server";

/**
 * First line of defence for `/admin`: a request without a Supabase session cookie
 * never reaches the admin tree at all, so a guest cannot pull admin markup or an
 * RSC payload out of the server, not even a redirect frame.
 *
 * The cookie tells us who *might* be signed in, never that they are an admin. The
 * role check needs the database and therefore stays in `requireAdmin`, which the
 * admin layout runs on every request. RLS is the third layer underneath that.
 */
const SESSION_COOKIE = /^sb-[a-z0-9]+-auth-token(\.\d+)?$/;

export default function proxy(request: NextRequest) {
  const hasSession = request.cookies
    .getAll()
    .some((cookie) => SESSION_COOKIE.test(cookie.name) && cookie.value.length > 0);

  if (hasSession) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
