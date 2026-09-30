"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckboxField, Field, FormMessages, SelectInput } from "@/components/admin/field";
import { CoverImageField } from "@/components/admin/catalog-form";
import { savePortfolioItem, type AdminFormState } from "@/lib/admin/actions";
import type { PortfolioEntry } from "@/lib/queries/public-content";
import type { Service } from "@/lib/types/database";

const initialState: AdminFormState = {};

export function PortfolioItemForm({
  item,
  services,
  action = savePortfolioItem,
}: {
  item?: PortfolioEntry;
  services: Service[];
  action?: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const errors = state.fieldErrors;
  const values = state.values;

  return (
    <form action={formAction} className="grid gap-6" noValidate>
      {item ? (
        <>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="slug" value={item.slug} />
        </>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="title" label="Judul" required error={errors?.title}>
          <Input
            id="title"
            name="title"
            required
            aria-invalid={Boolean(errors?.title)}
            defaultValue={values?.title ?? item?.title ?? ""}
          />
        </Field>

        <Field name="serviceId" label="Layanan" required error={errors?.serviceId}>
          <SelectInput
            id="serviceId"
            name="serviceId"
            required
            aria-invalid={Boolean(errors?.serviceId)}
            defaultValue={values?.serviceId ?? item?.service_id ?? services[0]?.id ?? ""}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field
          name="eventDate"
          label="Tanggal acara"
          error={errors?.eventDate}
          hint="Dipakai untuk mengurutkan portofolio dari yang terbaru."
        >
          <Input
            id="eventDate"
            name="eventDate"
            type="date"
            aria-invalid={Boolean(errors?.eventDate)}
            defaultValue={values?.eventDate ?? item?.event_date ?? ""}
          />
        </Field>

        <Field name="sortOrder" label="Urutan tampil" required error={errors?.sortOrder}>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            step={10}
            required
            defaultValue={values?.sortOrder ?? item?.sort_order ?? 0}
          />
        </Field>
      </div>

      <Field name="description" label="Deskripsi" error={errors?.description}>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={values?.description ?? item?.description ?? ""}
        />
      </Field>

      <CoverImageField
        currentUrl={item?.cover_image_url ?? null}
        urlValue={values?.coverImageUrl}
        error={errors?.coverImageUrl}
      />

      <div className="grid gap-3 border-t pt-5 sm:grid-cols-2">
        <CheckboxField
          name="isActive"
          label="Aktif"
          hint="Item nonaktif disembunyikan dari website publik."
          defaultChecked={item ? item.is_active : true}
        />
        <CheckboxField
          name="isFeatured"
          label="Unggulan"
          hint="Item unggulan tampil lebih dulu di portofolio."
          defaultChecked={item?.is_featured ?? false}
        />
      </div>

      <FormMessages error={state.error} message={state.message} />

      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          Simpan Portfolio
        </Button>
      </div>
    </form>
  );
}
