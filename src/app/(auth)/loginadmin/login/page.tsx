import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth/next-path";

/**
 * Alias for the admin sign-in, kept so the panel has a URL that does not read as
 * a shared entry point. It only forwards to `/login`, which owns the form, the
 * password check, and the role check: one implementation, two doors.
 *
 * A prettier URL is not a security control. The admin tree stays closed by the
 * role check in `requireAdmin` and the RLS policies underneath, no matter which
 * URL a visitor guesses.
 */
export default async function AdminLoginAliasPage(props: PageProps<"/loginadmin/login">) {
  const params = await props.searchParams;
  const next = safeNextPath(params.next, "/admin");

  redirect(`/login?next=${encodeURIComponent(next)}`);
}
