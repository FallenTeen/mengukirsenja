"use client";

import { useActionState } from "react";
import { Loader2, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestMagicLink, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

/**
 * Customer sign-in, passwordless. Split from the admin form so `/portal` can be
 * linked on its own: most visitors of that URL are a customer following a link
 * from an email, and asking them for a password there would only produce
 * failures.
 */
export function PortalLoginForm({
  nextPath,
  initialError,
}: {
  nextPath: string;
  initialError?: string;
}) {
  const [state, formAction, pending] = useActionState(requestMagicLink, initialState);

  return (
    <div className="grid w-full max-w-md gap-6">
      {/* The auth callback sends failures back here without saying which form was
          in play, so the message belongs above the card rather than inside it. */}
      {initialError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {initialError}
        </p>
      ) : null}

      <Card className="gap-6 rounded-none py-6">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Masuk ke portal</CardTitle>
          <CardDescription>
            Tidak perlu password. Masukkan email yang Anda gunakan saat mengajukan pesanan, lalu
            buka tautan yang kami kirim.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
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
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Mail data-icon="inline-start" />
              )}
              Kirim Tautan Masuk
            </Button>
            {state.message ? (
              <p role="status" className="text-sm text-terracotta">
                {state.message}
              </p>
            ) : null}
            {state.error ? (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
