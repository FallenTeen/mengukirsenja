"use client";

import { useActionState, useState } from "react";
import { Info, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReferenceImagesField } from "@/components/requests/reference-images-field";
import { submitOrderRequest, type OrderRequestState } from "@/lib/orders/actions";
import { minimumEventDate } from "@/lib/validations/order-request";
import type { Service } from "@/lib/types/database";

const initialState: OrderRequestState = {};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

function Field({
  name,
  label,
  error,
  required = false,
  hint,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden>
            *
          </span>
        ) : (
          <span className="text-xs font-normal text-muted-foreground">(opsional)</span>
        )}
      </Label>
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {children}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function OrderRequestForm({
  services,
  catalogItemId,
  catalogItemName,
  defaultServiceSlug,
}: {
  services: Service[];
  catalogItemId?: string;
  catalogItemName?: string;
  defaultServiceSlug?: string;
}) {
  const isCatalog = Boolean(catalogItemId);
  const [state, action, pending] = useActionState(submitOrderRequest, initialState);
  const [dateMode, setDateMode] = useState<"single" | "range">("single");
  const [startDate, setStartDate] = useState("");
  const errors = state.fieldErrors;
  const today = minimumEventDate();

  return (
    <form action={action} className="grid gap-6" noValidate>
      {isCatalog ? (
        <>
          <input type="hidden" name="source" value="web_catalog" />
          <input type="hidden" name="catalogItemId" value={catalogItemId} />
        </>
      ) : (
        <input type="hidden" name="source" value="web_custom" />
      )}
      <input type="hidden" name="dateMode" value={dateMode} />

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {isCatalog && catalogItemName ? (
        <div className="flex items-start gap-3 rounded-lg border bg-card px-4 py-3">
          <Info className="mt-0.5 size-4 shrink-0 text-terracotta" />
          <p className="text-sm">
            Anda mengajukan paket{" "}
            <strong className="font-medium">{catalogItemName}</strong>. Rincian layanan
            dibahas lebih lanjut bersama tim kami sebelum ada harga final.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="name" label="Nama" required error={errors?.name}>          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Nama lengkap Anda"
            required
            aria-invalid={Boolean(errors?.name)}
            defaultValue={state.values?.name}
          />
        </Field>

        <Field name="email" label="Email" required error={errors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            required
            aria-invalid={Boolean(errors?.email)}
            defaultValue={state.values?.email}
          />
        </Field>

        <Field
          name="phone"
          label="Nomor WhatsApp"
          required
          error={errors?.phone}
          hint="Dipakai admin untuk membahas detail acara."
        >
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="08xxxxxxxxxx"
            required
            aria-invalid={Boolean(errors?.phone)}
            defaultValue={state.values?.phone}
          />
        </Field>

        <Field
          name="eventDate"
          label={dateMode === "range" ? "Tanggal mulai" : "Tanggal acara"}
          required
          error={errors?.eventDate}
        >
          <Input
            id="eventDate"
            name="eventDate"
            type="date"
            min={today}
            required
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            aria-invalid={Boolean(errors?.eventDate)}
            defaultValue={state.values?.eventDate}
          />
        </Field>

        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">
            Durasi acara <span className="text-destructive" aria-hidden>*</span>
          </legend>
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="dateMode-choice"
                checked={dateMode === "single"}
                onChange={() => setDateMode("single")}
                className="size-4 accent-primary"
              />
              <span className="text-sm">Satu hari</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="dateMode-choice"
                checked={dateMode === "range"}
                onChange={() => setDateMode("range")}
                className="size-4 accent-primary"
              />
              <span className="text-sm">Beberapa hari</span>
            </label>
          </div>
          {dateMode === "range" ? (
            <div className="grid gap-2 sm:max-w-64">
              <Label htmlFor="eventEndDate">Selesai pada</Label>
              <Input
                id="eventEndDate"
                name="eventEndDate"
                type="date"
                min={startDate || today}
                required
                aria-invalid={Boolean(errors?.eventEndDate)}
              />
              {errors?.eventEndDate ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors.eventEndDate}
                </p>
              ) : null}
            </div>
          ) : null}
        </fieldset>

        <Field name="venueName" label="Nama lokasi" error={errors?.venueName}>
          <Input
            id="venueName"
            name="venueName"
            placeholder="Villa Aster, Hotel Majapahit, ..."
            aria-invalid={Boolean(errors?.venueName)}
            defaultValue={state.values?.venueName}
          />
        </Field>
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium">
          Layanan yang diminati{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (boleh pilih lebih dari satu)
          </span>
        </legend>
        {errors?.services ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.services}
          </p>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <label
              key={service.id}
              className="flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 has-[:checked]:border-terracotta/60 has-[:checked]:bg-terracotta/5"
            >
              <input
                type="checkbox"
                name="services"
                value={service.slug}
                defaultChecked={service.slug === defaultServiceSlug}
                className="mt-0.5 size-4 shrink-0 accent-primary"
              />
              <span className="grid gap-0.5">
                <span className="text-sm font-medium">{service.name}</span>
                {service.description ? (
                  <span className="text-xs text-muted-foreground">{service.description}</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field name="venueAddress" label="Alamat lokasi" error={errors?.venueAddress}>
        <Textarea
          id="venueAddress"
          name="venueAddress"
          rows={2}
          placeholder="Alamat lengkap lokasi acara"
          aria-invalid={Boolean(errors?.venueAddress)}
          defaultValue={state.values?.venueAddress}
        />
      </Field>

      <Field
        name="message"
        label={isCatalog ? "Catatan tambahan" : "Ceritakan kebutuhan Anda"}
        error={errors?.message}
        hint={
          isCatalog
            ? "Konsep, warna, jumlah tamu, atau hal lain yang ingin Anda sampaikan."
            : "Konsep dekorasi, jumlah tamu, layanan tambahan, atau anggaran yang Anda bayangkan."
        }
      >
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Ceritakan acara Anda selengkap mungkin ..."
          aria-invalid={Boolean(errors?.message)}
          defaultValue={state.values?.message}
        />
      </Field>

      <ReferenceImagesField />

      {state.error ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-3">
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto sm:self-start">
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Send data-icon="inline-start" />
          )}
          {pending
            ? "Mengirim..."
            : isCatalog
              ? "Ajukan Paket Ini"
              : "Kirim Pengajuan"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Anda tidak perlu membuat akun atau password. Admin akan menghubungi Anda melalui
          WhatsApp.
        </p>
      </div>
    </form>
  );
}
