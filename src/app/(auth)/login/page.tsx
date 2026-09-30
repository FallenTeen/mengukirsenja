import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForms } from "@/components/auth/login-forms";
import { getUser, getProfile } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/next-path";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage(props: PageProps<"/login">) {
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
        <p className="text-xs uppercase tracking-[0.35em] text-terracotta">Mengukir Senja</p>
        <h1 className="font-display text-4xl md:text-5xl">Masuk</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Pesanan tetap bisa dibuat tanpa akun. Akun hanya diperlukan untuk membuka detail
          pesanan Anda.
        </p>
      </div>

      <LoginForms
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
