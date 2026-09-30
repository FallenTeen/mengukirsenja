"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckboxField, Field, FormMessages, SelectInput } from "@/components/admin/field";
import { savePartner, type AdminFormState } from "@/lib/admin/actions";
import type { Partner, Service } from "@/lib/types/database";

const initialState: AdminFormState = {};

export function PartnerForm({
  partner,
  services,
  action = savePartner,
}: {
  partner?: Partner;
  services: Service[];
  action?: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const errors = state.fieldErrors;
  const values = state.values;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      {partner ? <input type="hidden" name="id" value={partner.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Nama partner" required error={errors?.name}>
          <Input
            id="name"
            name="name"
            required
            aria-invalid={Boolean(errors?.name)}
            defaultValue={values?.name ?? partner?.name ?? ""}
          />
        </Field>

        <Field
          name="serviceId"
          label="Layanan terkait"
          error={errors?.serviceId}
          hint="Bermakna bila partner spesifik untuk satu layanan, misalnya Basssound untuk Soundsystem."
        >
          <SelectInput
            id="serviceId"
            name="serviceId"
            defaultValue={values?.serviceId ?? partner?.service_id ?? ""}
          >
            <option value="">Semua layanan</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field
          name="phone"
          label="Telepon"
          error={errors?.phone}
          hint="Format Indonesia, boleh 08xx atau +62xx."
        >
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="08123456789"
            aria-invalid={Boolean(errors?.phone)}
            defaultValue={values?.phone ?? partner?.phone ?? ""}
          />
        </Field>

        <Field name="email" label="Email" error={errors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            aria-invalid={Boolean(errors?.email)}
            defaultValue={values?.email ?? partner?.email ?? ""}
          />
        </Field>
      </div>

      <Field name="notes" label="Catatan internal" error={errors?.notes}>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={values?.notes ?? partner?.notes ?? ""}
        />
      </Field>

      <CheckboxField
        name="isActive"
        label="Aktif"
        hint="Partner nonaktif tidak muncul di pilihan paket katalog."
        defaultChecked={partner ? partner.is_active : true}
      />

      <FormMessages error={state.error} message={state.message} />

      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          Simpan Partner
        </Button>
      </div>
    </form>
  );
}
