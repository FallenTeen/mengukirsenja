"use client";

import { useActionState } from "react";
import { KeyRound, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestMagicLink, signInAdmin, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function LoginForms({
  nextPath,
  initialError,
}: {
  nextPath: string;
  initialError?: string;
}) {
  const [magicLink, magicLinkAction, magicLinkPending] = useActionState(
    requestMagicLink,
    initialState,
  );
  const [admin, adminAction, adminPending] = useActionState(signInAdmin, initialState);

  return (
    <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
      <Card className="gap-6 rounded-none py-6">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Customer Portal</CardTitle>
          <CardDescription>
            Tidak perlu password. Masukkan email yang Anda gunakan saat mengajukan pesanan, lalu
            buka tautan yang kami kirim.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={magicLinkAction} className="grid gap-4">
            <input type="hidden" name="next" value={nextPath} />
            <div className="grid gap-2">
              <Label htmlFor="magic-email">Email</Label>
              <Input
                id="magic-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                required
              />
            </div>
            <Button type="submit" size="lg" disabled={magicLinkPending}>
              {magicLinkPending ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Mail data-icon="inline-start" />
              )}
              Kirim Tautan Masuk
            </Button>
            {magicLink.message ? (
              <p role="status" className="text-sm text-terracotta">
                {magicLink.message}
              </p>
            ) : null}
            {magicLink.error ? (
              <p role="alert" className="text-sm text-destructive">
                {magicLink.error}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card className="gap-6 rounded-none py-6">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Admin</CardTitle>
          <CardDescription>
            Area ini hanya untuk pengelola Mengukir Senja.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={adminAction} className="grid gap-4">
            <input type="hidden" name="next" value={nextPath} />
            <div className="grid gap-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {initialError ? (
              <p role="alert" className="text-sm text-destructive">
                {initialError}
              </p>
            ) : null}
            {admin.error ? (
              <p role="alert" className="text-sm text-destructive">
                {admin.error}
              </p>
            ) : null}
            <Button type="submit" size="lg" disabled={adminPending}>
              {adminPending ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <KeyRound data-icon="inline-start" />
              )}
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
