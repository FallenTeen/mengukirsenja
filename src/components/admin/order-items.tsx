"use client";

import { useActionState, useState } from "react";
import { ChevronDown, Eye, EyeOff, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { CheckboxField, Field, FormMessages, SelectInput } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  addOrderItem,
  removeOrderItem,
  toggleOrderItemVisibility,
  updateOrderItem,
  type OrderActionState,
} from "@/lib/orders/admin-actions";
import { formatRupiah } from "@/lib/format";
import { toNumber } from "@/lib/order-status";
import type { AdminOrderDetail, OrderItemEntry, PartnerOption } from "@/lib/queries/admin-orders";
import type { Service } from "@/lib/types/database";

const initialState: OrderActionState = {};

/** Catalog prices are shown to pick a package; the server re-reads the real one. */
type CatalogOption = {
  id: string;
  name: string;
  service_id: string;
  price: number | null;
};

/**
 * Line items are the heart of the order, so each row owns its own small form.
 * Nothing is recalculated in the browser: `unit_price * quantity` is echoed for
 * orientation only, and the server re-derives the stored subtotal and total.
 */
export function OrderItemsPanel({
  order,
  services,
  partners,
  catalogItems,
}: {
  order: AdminOrderDetail;
  services: Service[];
  partners: PartnerOption[];
  catalogItems: CatalogOption[];
}) {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  return (
    <div className="grid gap-4">
      {order.items.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
          Belum ada item. Tambahkan paket katalog atau item kustom di bawah.
        </p>
      ) : (
        <>
        <div className="grid gap-2 md:hidden">
          {order.items.map((item) => (
            <article key={item.id} className="grid gap-3 rounded-lg border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <ItemCell item={item} prefix="mobile" />
                <div className="flex shrink-0 items-center gap-1">
                  <VisibilityToggle item={item} compact />
                  <RemoveItem orderId={order.id} item={item} compact />
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-2 border-t pt-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Jumlah</dt>
                  <dd className="mt-0.5 tabular-nums">{toNumber(item.quantity)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Harga satuan</dt>
                  <dd className="mt-0.5 tabular-nums">{formatRupiah(toNumber(item.unit_price))}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="mt-0.5 font-medium tabular-nums">{formatRupiah(toNumber(item.subtotal))}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
        <div className="hidden overflow-hidden rounded-lg border md:block">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  Item
                </TableHead>
                <TableHead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  Qty
                </TableHead>
                <TableHead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  Harga satuan
                </TableHead>
                <TableHead className="bg-muted/40 text-right text-xs uppercase tracking-wider text-muted-foreground">
                  Subtotal
                </TableHead>
                <TableHead className="bg-muted/40 text-right text-xs uppercase tracking-wider text-muted-foreground">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id} className="align-top">
                  <TableCell className="w-full whitespace-normal">
                    <ItemCell item={item} prefix="desktop" />
                  </TableCell>
                  <TableCell className="tabular-nums">{toNumber(item.quantity)}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatRupiah(toNumber(item.unit_price))}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatRupiah(toNumber(item.subtotal))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <VisibilityToggle item={item} />
                      <RemoveItem orderId={order.id} item={item} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-3 border-t pt-4">
        <span className="text-sm text-muted-foreground">
          Total dihitung ulang di server setiap kali item berubah.
        </span>
        <span className="text-lg">
          Estimasi total{" "}
          <strong className="font-display text-2xl text-terracotta tabular-nums">
            {formatRupiah(toNumber(order.total_estimate))}
          </strong>
        </span>
      </div>

      <div>
        <Button
          type="button"
          variant="outline"
          aria-expanded={isAddFormOpen}
          onClick={() => setIsAddFormOpen((open) => !open)}
        >
          <Plus data-icon="inline-start" />
          {isAddFormOpen ? "Tutup form" : "Tambah item"}
        </Button>
      </div>

      {isAddFormOpen ? (
        <AddItemForm
          key={order.item_count}
          orderId={order.id}
          services={services}
          partners={partners}
          catalogItems={catalogItems}
        />
      ) : null}
    </div>
  );
}

function ItemCell({ item, prefix }: { item: OrderItemEntry; prefix: string }) {
  return (
    <div className="grid gap-1">
      <span className="font-medium">{item.name}</span>
      <span className="text-xs text-muted-foreground">
        {[item.service_name, item.partner_name].filter(Boolean).join(" · ") || "Tanpa layanan"}
        {item.is_custom ? " · item kustom" : " · dari katalog"}
      </span>
      {item.description ? (
        <span className="text-xs whitespace-pre-line text-muted-foreground">{item.description}</span>
      ) : null}
      <details className="group mt-1">
        <summary className="inline-flex cursor-pointer items-center gap-1 text-xs text-terracotta underline-offset-4 hover:underline">
          <ChevronDown data-icon="inline-start" className="transition-transform group-open:rotate-180" />
          Ubah item
        </summary>
          <EditItemForm item={item} prefix={prefix} />
      </details>
    </div>
  );
}

function EditItemForm({ item, prefix }: { item: OrderItemEntry; prefix: string }) {
  const [state, formAction, pending] = useActionState(updateOrderItem, initialState);

  return (
    <form
      action={formAction}
      className="mt-3 grid gap-3 rounded-lg border bg-muted/20 p-3 sm:max-w-xl"
      noValidate
    >
      <input type="hidden" name="itemId" value={item.id} />
      <input type="hidden" name="orderId" value={item.order_id} />

      <Field name={`${prefix}-name-${item.id}`} label="Nama item" required error={state.fieldErrors?.name}>
        <Input id={`${prefix}-name-${item.id}`} name="name" defaultValue={item.name} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          name={`${prefix}-quantity-${item.id}`}
          label="Jumlah"
          required
          error={state.fieldErrors?.quantity}
        >
          <Input
            id={`${prefix}-quantity-${item.id}`}
            name="quantity"
            type="number"
            min="0.5"
            step="0.5"
            defaultValue={toNumber(item.quantity)}
          />
        </Field>

        <Field
          name={`${prefix}-unitPrice-${item.id}`}
          label="Harga satuan"
          required
          error={state.fieldErrors?.unitPrice}
        >
          <Input
            id={`${prefix}-unitPrice-${item.id}`}
            name="unitPrice"
            inputMode="numeric"
            defaultValue={String(toNumber(item.unit_price))}
          />
        </Field>
      </div>

      <Field
        name={`${prefix}-description-${item.id}`}
        label="Deskripsi"
        error={state.fieldErrors?.description}
      >
        <Textarea
          id={`${prefix}-description-${item.id}`}
          name="description"
          rows={2}
          defaultValue={item.description ?? ""}
        />
      </Field>

      <CheckboxField
        name="customerVisible"
        label="Terlihat oleh customer"
        defaultChecked={item.customer_visible}
      />

      <FormMessages error={state.error} message={state.message} />

      <div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          Simpan Item
        </Button>
      </div>
    </form>
  );
}

function VisibilityToggle({ item, compact = false }: { item: OrderItemEntry; compact?: boolean }) {
  const [state, formAction, pending] = useActionState(toggleOrderItemVisibility, initialState);

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="itemId" value={item.id} />
      <input type="hidden" name="orderId" value={item.order_id} />
      {/* The action flips this value, so send it as the checkbox would. */}
      <input type="hidden" name="customerVisible" value={item.customer_visible ? "on" : ""} />
      <Button
        type="submit"
        size={compact ? "xs" : "icon-sm"}
        variant="ghost"
        disabled={pending}
        title={state.error ?? (item.customer_visible ? "Sembunyikan dari customer" : "Tampilkan ke customer")}
      >
        {pending ? (
          <Loader2 className="animate-spin" />
        ) : item.customer_visible ? (
          <Eye />
        ) : (
          <EyeOff className="text-muted-foreground" />
        )}
        {compact ? (
          item.customer_visible ? "Sembunyikan" : "Tampilkan"
        ) : (
          <span className="sr-only">
            {item.customer_visible ? "Sembunyikan dari customer" : "Tampilkan ke customer"}
          </span>
        )}
      </Button>
    </form>
  );
}

function RemoveItem({
  orderId,
  item,
  compact = false,
}: {
  orderId: string;
  item: OrderItemEntry;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(removeOrderItem, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm(`Hapus "${item.name}" dari pesanan ini?`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="itemId" value={item.id} />
      <input type="hidden" name="orderId" value={orderId} />
      <Button
        type="submit"
        size={compact ? "xs" : "icon-sm"}
        variant="ghost"
        disabled={pending}
        title={state.error ?? `Hapus ${item.name}`}
      >
        {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
        {compact ? "Hapus" : <span className="sr-only">Hapus {item.name}</span>}
      </Button>
    </form>
  );
}

/** Catalog items are snapshotted server-side, so this form sends no amounts. */
function AddItemForm({
  orderId,
  services,
  partners,
  catalogItems,
}: {
  orderId: string;
  services: Service[];
  partners: PartnerOption[];
  catalogItems: CatalogOption[];
}) {
  const [state, formAction, pending] = useActionState(addOrderItem, initialState);
  const [kind, setKind] = useState<"catalog" | "custom">("catalog");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [visible, setVisible] = useState(true);

  const servicePartners = partners.filter((partner) => partner.service_id === serviceId);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border bg-muted/20 p-4"
      noValidate
    >
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="customerVisible" value={visible ? "on" : ""} />

      <h3 className="text-sm font-medium">Tambah item</h3>

      <div className="flex flex-wrap gap-4">
        <KindOption
          checked={kind === "catalog"}
          onChange={() => setKind("catalog")}
          label="Paket katalog"
        />
        <KindOption
          checked={kind === "custom"}
          onChange={() => setKind("custom")}
          label="Item kustom"
        />
      </div>

      {kind === "catalog" ? (
        catalogItems.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-4 text-sm text-muted-foreground">
            Tidak ada paket katalog yang aktif. Tambahkan paket di katalog, atau pilih item kustom.
          </p>
        ) : (
          <Field
            name="catalogItemId"
            label="Paket"
            required
            error={state.fieldErrors?.catalogItemId}
            hint="Nama dan harga saat ini disalin ke pesanan, sehingga perubahan katalog tidak mengubah riwayat."
          >
            <SelectInput
              id="catalogItemId"
              name="catalogItemId"
              defaultValue={catalogItems[0]?.id}
              required
            >
              {catalogItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.price !== null ? ` (${formatRupiah(toNumber(item.price))})` : ""}
                </option>
              ))}
            </SelectInput>
          </Field>
        )
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              name="serviceId"
              label="Layanan"
              required
              error={state.fieldErrors?.serviceId}
            >
              <SelectInput
                id="serviceId"
                name="serviceId"
                required
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </SelectInput>
            </Field>

            {servicePartners.length > 0 ? (
              <Field name="partnerId" label="Partner" error={state.fieldErrors?.partnerId}>
                <SelectInput id="partnerId" name="partnerId" defaultValue="">
                  <option value="">Tanpa partner</option>
                  {servicePartners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            ) : null}
          </div>

          <Field name="name" label="Nama item" required error={state.fieldErrors?.name}>
            <Input
              id="name"
              name="name"
              placeholder="Custom Backdrop"
              aria-invalid={Boolean(state.fieldErrors?.name)}
            />
          </Field>

          <Field name="description" label="Deskripsi" error={state.fieldErrors?.description}>
            <Textarea id="description" name="description" rows={2} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="quantity" label="Jumlah" required error={state.fieldErrors?.quantity}>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0.5"
                step="0.5"
                defaultValue="1"
                required
              />
            </Field>

            <Field
              name="unitPrice"
              label="Harga satuan"
              required
              error={state.fieldErrors?.unitPrice}
            >
              <Input
                id="unitPrice"
                name="unitPrice"
                inputMode="numeric"
                placeholder="4500000"
                required
              />
            </Field>
          </div>
        </>
      )}

      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={visible}
          onChange={(event) => setVisible(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        <span className="text-sm font-medium">Tampilkan ke customer</span>
      </label>

      <FormMessages error={state.error} message={state.message} />

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Plus data-icon="inline-start" />
          )}
          {kind === "catalog" ? "Tambah Paket" : "Tambah Item Kustom"}
        </Button>
      </div>
    </form>
  );
}

function KindOption({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="radio"
        name="kind-choice"
        checked={checked}
        onChange={onChange}
        className="size-4 accent-primary"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
