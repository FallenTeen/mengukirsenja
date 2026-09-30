"use client";

import { useActionState } from "react";
import { Loader2, Save, TriangleAlert } from "lucide-react";
import { Field, FormMessages } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createManualOrder,
  saveOrder,
  saveOrderCustomer,
  type OrderActionState,
} from "@/lib/orders/admin-actions";
import type { AdminOrderDetail } from "@/lib/queries/admin-orders";

const initialState: OrderActionState = {};

/** One submit per block, so a failure in the customer form never discards the
 *  event form's input, and vice versa. */
export function OrderEventForm({ order }: { order: AdminOrderDetail }) {
  const [state, formAction, pending] = useActionState(saveOrder, initialState);
  const errors = state.fieldErrors ?? {};
  const values = state.values;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="orderId" value={order.id} />

      <EventFields
        errors={errors}
        values={values}
        defaults={{
          eventTitle: order.event_title ?? "",
          eventDate: order.event_date ?? "",
          eventEndDate: order.event_end_date && order.event_end_date !== order.event_date
            ? order.event_end_date
            : "",
          venueName: order.venue_name ?? "",
          venueAddress: order.venue_address ?? "",
          customerNote: order.customer_note ?? "",
          adminNote: order.admin_note ?? "",
        }}
      />

      {state.warning ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-amber/50 bg-amber/10 px-4 py-3 text-sm"
        >
          <TriangleAlert data-icon="inline-start" className="mt-0.5 shrink-0" />
          {state.warning}
        </p>
      ) : null}

      <FormMessages error={state.error} message={state.message} />

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          Simpan Data Acara
        </Button>
      </div>
    </form>
  );
}

/** Create page: customer and event submit together, since neither alone is useful. */
export function ManualOrderForm({
  defaultEventDate,
}: {
  defaultEventDate?: string;
}) {
  const [state, formAction, pending] = useActionState(createManualOrder, initialState);
  const errors = state.fieldErrors ?? {};
  const values = state.values;

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <CustomerFields errors={errors} values={values} idPrefix="" />

      <EventFields
        errors={errors}
        values={values}
        defaults={{ eventDate: defaultEventDate ?? "" }}
      />

      <FormMessages error={state.error} message={state.message} />

      <div className="grid gap-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          Buat Pesanan
        </Button>
        <p className="text-xs text-muted-foreground">
          Pesanan baru dibuat berstatus draf. Tambahkan item, lalu kirim ke customer saat sudah siap.
        </p>
      </div>
    </form>
  );
}

/** Workspace: contact details only, so a bad email never discards the event edits. */
export function OrderCustomerForm({ order }: { order: AdminOrderDetail }) {
  const [state, formAction, pending] = useActionState(saveOrderCustomer, initialState);
  const errors = state.fieldErrors ?? {};
  const customer = order.customer;

  if (!customer) {
    return (
      <p className="text-sm text-muted-foreground">Data customer tidak tersedia.</p>
    );
  }

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="orderId" value={order.id} />
      <input type="hidden" name="customerId" value={customer.id} />

      <CustomerFields
        errors={errors}
        values={undefined}
        idPrefix="order-"
        defaults={{
          name: customer.name ?? "",
          email: customer.email ?? "",
          phone: customer.phone ?? "",
          address: customer.address ?? "",
        }}
      />

      <FormMessages error={state.error} message={state.message} />

      <div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          Simpan Data Customer
        </Button>
      </div>
    </form>
  );
}

type Errors = Record<string, string | undefined>;
type Values = Record<string, string> | undefined;

function CustomerFields({
  errors,
  values,
  defaults,
  idPrefix,
}: {
  errors: Errors;
  values: Values;
  defaults?: Record<string, string>;
  idPrefix: string;
}) {
  const id = (key: string) => `${idPrefix}${key}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field name={id("name")} label="Nama customer" required error={errors?.name}>
        <Input
          id={id("name")}
          name="name"
          required
          aria-invalid={Boolean(errors?.name)}
          defaultValue={values?.name ?? defaults?.name ?? ""}
        />
      </Field>

      <Field
        name={id("phone")}
        label="WhatsApp"
        required
        error={errors?.phone}
        hint="Dipakai untuk tombol hubungi customer."
      >
        <Input
          id={id("phone")}
          name="phone"
          type="tel"
          inputMode="tel"
          required
          placeholder="08123456789"
          aria-invalid={Boolean(errors?.phone)}
          defaultValue={values?.phone ?? defaults?.phone ?? ""}
        />
      </Field>

      <Field
        name={id("email")}
        label="Email"
        error={errors?.email}
        hint="Wajib bila customer akan diberi akses portal."
      >
        <Input
          id={id("email")}
          name="email"
          type="email"
          aria-invalid={Boolean(errors?.email)}
          defaultValue={values?.email ?? defaults?.email ?? ""}
        />
      </Field>

      <Field name={id("address")} label="Alamat" error={errors?.address}>
        <Input
          id={id("address")}
          name="address"
          aria-invalid={Boolean(errors?.address)}
          defaultValue={values?.address ?? defaults?.address ?? ""}
        />
      </Field>
    </div>
  );
}

function EventFields({
  errors,
  values,
  defaults,
}: {
  errors: Errors;
  values: Values;
  defaults?: Record<string, string>;
}) {
  const value = (key: string) => values?.[key] ?? defaults?.[key] ?? "";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="eventTitle"
          label="Judul acara"
          error={errors?.eventTitle}
          hint="Misalnya: Pernikahan Rani & Bagas"
        >
          <Input
            id="eventTitle"
            name="eventTitle"
            aria-invalid={Boolean(errors?.eventTitle)}
            defaultValue={value("eventTitle")}
          />
        </Field>

        <Field name="eventDate" label="Tanggal mulai acara" required error={errors?.eventDate}>
          <Input
            id="eventDate"
            name="eventDate"
            type="date"
            required
            aria-invalid={Boolean(errors?.eventDate)}
            defaultValue={value("eventDate")}
          />
        </Field>

        <Field
          name="eventEndDate"
          label="Tanggal selesai acara"
          error={errors?.eventEndDate}
          hint="Kosongkan untuk acara satu hari."
        >
          <Input
            id="eventEndDate"
            name="eventEndDate"
            type="date"
            min={value("eventDate") || undefined}
            aria-invalid={Boolean(errors?.eventEndDate)}
            defaultValue={value("eventEndDate")}
          />
        </Field>

        <Field name="venueName" label="Nama lokasi" error={errors?.venueName}>
          <Input
            id="venueName"
            name="venueName"
            placeholder="Gedung Serbaguna Mutiara"
            defaultValue={value("venueName")}
          />
        </Field>

        <Field name="venueAddress" label="Alamat lokasi" error={errors?.venueAddress}>
          <Input
            id="venueAddress"
            name="venueAddress"
            defaultValue={value("venueAddress")}
          />
        </Field>
      </div>

      <Field
        name="customerNote"
        label="Catatan dari customer"
        error={errors?.customerNote}
        hint="Tampil di portal customer."
      >
        <Textarea
          id="customerNote"
          name="customerNote"
          rows={3}
          defaultValue={value("customerNote")}
        />
      </Field>

      <Field
        name="adminNote"
        label="Catatan internal"
        error={errors?.adminNote}
        hint="Hanya terlihat oleh admin, tidak pernah dikirim ke customer."
      >
        <Textarea id="adminNote" name="adminNote" rows={3} defaultValue={value("adminNote")} />
      </Field>
    </>
  );
}
