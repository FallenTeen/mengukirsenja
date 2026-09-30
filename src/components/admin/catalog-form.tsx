"use client";

import { useActionState } from "react";
import { Loader2, Save, Upload } from "lucide-react";
import { CoverImage } from "@/components/site/cover-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckboxField, Field, FormMessages, SelectInput } from "@/components/admin/field";
import { saveCatalogItem, type AdminFormState } from "@/lib/admin/actions";
import type { CatalogEntry } from "@/lib/queries/public-content";
import type { Partner, Service } from "@/lib/types/database";

const initialState: AdminFormState = {};

/**
 * Decoration is the core service and never has a partner, so the partner
 * selector only appears once a partner-backed service is picked.
 */
export function CatalogItemForm({
  item,
  services,
  partners,
  action = saveCatalogItem,
}: {
  item?: CatalogEntry;
  services: Service[];
  partners: Partner[];
  action?: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const errors = state.fieldErrors;
  const values = state.values;

  const coreServiceId = services.find((service) => service.type === "core")?.id;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      {item ? (
        <>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="slug" value={item.slug} />
        </>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Nama paket" required error={errors?.name}>
          <Input
            id="name"
            name="name"
            required
            aria-invalid={Boolean(errors?.name)}
            defaultValue={values?.name ?? item?.name ?? ""}
          />
        </Field>

        <Field name="serviceId" label="Layanan" required error={errors?.serviceId}>
          <ServiceSelect
            services={services}
            defaultValue={values?.serviceId ?? item?.service_id ?? coreServiceId ?? ""}
            invalid={Boolean(errors?.serviceId)}
          />
        </Field>

        <PartnerField
          services={services}
          partners={partners}
          defaultValue={values?.partnerId ?? item?.partner_id ?? ""}
          error={errors?.partnerId}
        />

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

        <Field
          name="price"
          label="Harga"
          error={errors?.price}
          hint="Tanpa titik atau pemisah. Kosongkan bila harga menyesuaikan."
        >
          <Input
            id="price"
            name="price"
            inputMode="numeric"
            placeholder="18000000"
            defaultValue={values?.price ?? (item?.price !== null && item?.price !== undefined ? String(item.price) : "")}
          />
        </Field>

        <Field
          name="priceLabel"
          label="Label harga"
          error={errors?.priceLabel}
          hint="Tampil di kartu katalog bila diisi, misalnya: Mulai dari Rp18.000.000"
        >
          <Input
            id="priceLabel"
            name="priceLabel"
            defaultValue={values?.priceLabel ?? item?.price_label ?? ""}
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
          hint="Paket nonaktif disembunyikan dari website publik."
          defaultChecked={item ? item.is_active : true}
        />
        <CheckboxField
          name="isFeatured"
          label="Unggulan"
          hint="Paket unggulan tampil lebih dulu di katalog."
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
          Simpan Paket
        </Button>
      </div>
    </form>
  );
}

function ServiceSelect({
  services,
  defaultValue,
  invalid,
}: {
  services: Service[];
  defaultValue: string;
  invalid: boolean;
}) {
  return (
    <SelectInput id="serviceId" name="serviceId" defaultValue={defaultValue} required aria-invalid={invalid}>
      {services.map((service) => (
        <option key={service.id} value={service.id}>
          {service.name}
        </option>
      ))}
    </SelectInput>
  );
}

function PartnerField({
  services,
  partners,
  defaultValue,
  error,
}: {
  services: Service[];
  partners: Partner[];
  defaultValue: string;
  error?: string;
}) {
  const partnerServices = services.filter((service) => service.type === "partner");
  if (partnerServices.length === 0) return null;

  return (
    <Field
      name="partnerId"
      label="Partner"
      error={error}
      hint="Hanya untuk layanan yang dikerjakan bersama partner, seperti Soundsystem bersama Basssound."
    >
      <SelectInput id="partnerId" name="partnerId" defaultValue={defaultValue}>
        <option value="">Tanpa partner</option>
        {partners.map((partner) => (
          <option key={partner.id} value={partner.id}>
            {partner.name}
          </option>
        ))}
      </SelectInput>
    </Field>
  );
}

/**
 * Upload wins over the text field: the file is written to Supabase Storage and
 * its public URL replaces whatever was typed. Leave the file empty to keep the
 * current image.
 */
export function CoverImageField({
  currentUrl,
  urlValue,
  error,
}: {
  currentUrl: string | null;
  urlValue?: string;
  error?: string;
}) {
  const shownUrl = urlValue ?? currentUrl ?? null;

  return (
    <fieldset className="grid gap-4 border-t pt-5">
      <legend className="text-sm font-medium">Gambar cover</legend>
      <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-start">
        <div className="relative aspect-4/3 overflow-hidden rounded-lg border">
          <CoverImage src={shownUrl} alt="Pratinjau gambar cover" sizes="10rem" />
        </div>
        <div className="grid gap-4">
          <Field name="coverImage" label="Unggah gambar" hint="JPG atau PNG, maksimal 5 MB.">
            <Input id="coverImage" name="coverImage" type="file" accept="image/*" />
          </Field>
          <Field
            name="coverImageUrl"
            label="Atau tautan gambar"
            error={error}
            hint="Dipakai bila gambar belum diunggah."
          >
            <Input
              id="coverImageUrl"
              name="coverImageUrl"
              placeholder="https://... atau /images/... "
              defaultValue={urlValue ?? currentUrl ?? ""}
            />
          </Field>
        </div>
      </div>
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Upload className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Mengunggah berkas baru akan menggantikan gambar di atas.
      </p>
    </fieldset>
  );
}
