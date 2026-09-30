"use client";

import { useActionState } from "react";
import { Loader2, Mail, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormMessages } from "@/components/admin/field";
import { Panel, PanelBody, PanelHeader } from "@/components/dashboard/panel";
import {
  saveCustomer,
  sendCustomerMagicLink,
  type AdminFormState,
} from "@/lib/admin/actions";
import type { Customer } from "@/lib/types/database";

const initialState: AdminFormState = {};

export function CustomerForm({ customer }: { customer: Customer }) {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <ContactForm customer={customer} />
      <MagicLinkPanel customer={customer} />
    </div>
  );
}

function ContactForm({ customer }: { customer: Customer }) {
  const [state, formAction, pending] = useActionState(saveCustomer, initialState);
  const errors = state.fieldErrors;
  const values = state.values;

  return (
    <Panel>
      <PanelHeader title="Data kontak" />
      <PanelBody>
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="id" value={customer.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Nama" required error={errors?.name}>
          <Input
            id="name"
            name="name"
            required
            aria-invalid={Boolean(errors?.name)}
            defaultValue={values?.name ?? customer.name ?? ""}
          />
        </Field>

        <Field name="phone" label="Telepon" error={errors?.phone} hint="Dipakai untuk tombol WhatsApp.">
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            aria-invalid={Boolean(errors?.phone)}
            defaultValue={values?.phone ?? customer.phone ?? ""}
          />
        </Field>
      </div>

      <Field name="email" label="Email" error={errors?.email} hint="Dipakai untuk tautan masuk customer.">
        <Input
          id="email"
          name="email"
          type="email"
          aria-invalid={Boolean(errors?.email)}
          defaultValue={values?.email ?? customer.email ?? ""}
        />
      </Field>

      <Field name="address" label="Alamat" error={errors?.address}>
        <Textarea
          id="address"
          name="address"
          rows={3}
          defaultValue={values?.address ?? customer.address ?? ""}
        />
      </Field>

      <FormMessages error={state.error} message={state.message} />

      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          Simpan Data
        </Button>
      </div>
    </form>
      </PanelBody>
    </Panel>
  );
}

function MagicLinkPanel({ customer }: { customer: Customer }) {
  const [state, formAction, pending] = useActionState(sendCustomerMagicLink, initialState);

  return (
    <Panel>
      <PanelHeader title="Akses portal customer" />
      <PanelBody className="grid gap-3">
      <p className="text-sm text-muted-foreground">
        {customer.email
          ? `Kirim tautan masuk sekali pakai ke ${customer.email}. Customer membuka tautannya sendiri, tidak perlu kata sandi.`
          : "Customer ini belum punya email, jadi tautan masuk belum bisa dikirim."}
      </p>
      <form action={formAction}>
        <input type="hidden" name="id" value={customer.id} />
        <Button type="submit" variant="outline" disabled={pending || !customer.email}>
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Mail data-icon="inline-start" />
          )}
          Kirim Tautan Masuk
        </Button>
      </form>
      <FormMessages error={state.error} message={state.message} />
      </PanelBody>
    </Panel>
  );
}
