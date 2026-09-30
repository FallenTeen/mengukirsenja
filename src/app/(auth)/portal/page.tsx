import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalLoginForm } from "@/components/auth/portal-login-form";
import { BrandLogo } from "@/components/site/brand-logo";
import { safeNextPath } from "@/lib/auth/next-path";
import { getProfile, getUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Masuk Portal" };

/**
 * Customer sign-in, separate from `/login` so a link in an email lands straight
 * on the passwordless form. An admin who opens this page is sent to the admin
 * panel instead of being asked for a password they did not come here to type.
 */
export default async function PortalPage(props: PageProps<"/portal">) {
  const params = await props.searchParams;
  const nextPath = safeNextPath(params.next, "/customer");

  const user = await getUser();
  if (user) {
    const role = (await getProfile(user.id))?.role;
    redirect(role === "admin" ? "/admin" : nextPath);
  }

  return (
    <div className="grid w-full gap-10">
      <div className="grid justify-items-center gap-3 text-center">
        <BrandLogo className="size-20" priority />
        <h1 className="font-display text-4xl md:text-5xl">Portal pelanggan</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Pesanan tetap bisa dibuat tanpa akun. Akun hanya diperlukan untuk membuka detail pesanan
          Anda.
        </p>
      </div>

      <PortalLoginForm
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
