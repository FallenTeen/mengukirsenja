"use client";

import { useActionState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
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
import { signInAdmin, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

/**
 * Admin sign-in, on its own page. It is deliberately not reachable through a
 * link a customer would follow: `/login` is password-only and the server action
 * re-checks the role and signs the account back out if it is not an admin.
 */
export function AdminLoginForm({
  nextPath,
  initialError,
}: {
  nextPath: string;
  initialError?: string;
}) {
  const [state, formAction, pending] = useActionState(signInAdmin, initialState);

  return (
    <div className="grid w-full max-w-md gap-6">
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
          <CardTitle className="font-display text-2xl">Masuk admin</CardTitle>
          <CardDescription>
            Area ini hanya untuk pengelola Mengukir Senja. Pelanggan masuk lewat portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
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
            {state.error ? (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            ) : null}
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? (
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
