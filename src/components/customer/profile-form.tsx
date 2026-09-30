"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { Field, FormMessages } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveCustomerProfile, type CustomerActionState } from "@/lib/customer/actions";

const initialState: CustomerActionState = {};

/**
 * Name, phone, address, the three fields the database function is willing to
 * write. Email is shown read-only on purpose: it is what the guest record was
 * matched on, so it is displayed as the account key rather than an editable field.
 */
export function CustomerProfileForm({
  name,
  email,
  phone,
  address,
}: {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}) {
  const [state, formAction, pending] = useActionState(saveCustomerProfile, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <Field name="name" label="Nama" required error={errors.name}>
        <Input id="name" name="name" defaultValue={name} autoComplete="name" required />
      </Field>

      <Field
        name="phone"
        label="Nomor WhatsApp"
        error={errors.phone}
        hint="Dipakai kami untuk menghubungi Anda. Contoh: 081234567890."
      >
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={phone ?? ""}
          autoComplete="tel"
        />
      </Field>

      <Field name="address" label="Alamat" error={errors.address}>
        <Textarea
          id="address"
          name="address"
          rows={3}
          defaultValue={address ?? ""}
          autoComplete="street-address"
        />
      </Field>

      <div className="grid gap-2">
        <p className="text-sm font-medium">Email akun</p>
        <p className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          {email ?? "Belum terhubung ke email."}
        </p>
        <p className="text-xs text-muted-foreground">
          Email tidak bisa diubah dari sini karena menjadi kunci penandaan pesanan Anda. Hubungi
          admin bila perlu dikoreksi.
        </p>
      </div>

      <FormMessages error={state.error} message={state.message} />

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          Simpan Profil
        </Button>
      </div>
    </form>
  );
}
