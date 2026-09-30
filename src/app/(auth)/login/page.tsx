import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { BrandLogo } from "@/components/site/brand-logo";
import { safeNextPath } from "@/lib/auth/next-path";
import { getProfile, getUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Masuk Admin" };

/**
 * Admin-only sign-in. Customers have their own passwordless page at `/portal`,
 * so this one carries the password form and nothing else. `next` only survives
 * `safeNextPath`, which keeps it on this origin, and a signed-in customer is
 * pushed to their portal rather than into the admin area.
 */
export default async function LoginPage(props: PageProps<"/login">) {
  const params = await props.searchParams;
  const nextPath = safeNextPath(params.next, "/admin");

  const user = await getUser();
  if (user) {
    const role = (await getProfile(user.id))?.role;
    // A signed-in customer has no business here, so send them to their portal.
    redirect(role === "admin" ? nextPath : "/customer");
  }

  return (
    <div className="grid w-full gap-10">
      <div className="grid justify-items-center gap-3 text-center">
        <BrandLogo className="size-20" priority />
        <h1 className="font-display text-4xl md:text-5xl">Masuk admin</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Area khusus pengelola. Pelanggan tidak perlu akun untuk mengajukan pesanan, dan masuk ke
          portal lewat tautan ke email.
        </p>
      </div>

      <AdminLoginForm
        nextPath={nextPath}
        initialError={typeof params.error === "string" ? params.error : undefined}
      />

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/" className="underline underline-offset-4 hover:text-foreground">
          Kembali ke beranda
        </Link>
      </p>
    </div>
  );
}
