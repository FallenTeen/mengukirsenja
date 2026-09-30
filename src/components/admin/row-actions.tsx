"use client";

import { useActionState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteCatalogItem,
  deletePartner,
  deletePortfolioItem,
  updateCatalogItem,
  updatePartner,
  updatePortfolioItem,
  type AdminFormState,
} from "@/lib/admin/actions";

const initialState: AdminFormState = {};

/**
 * One form per control, so a failed toggle cannot roll back the rest of the
 * table and the rows stay independent of each other.
 */
function Toggle({
  action,
  id,
  field,
  value,
  label,
}: {
  action: typeof updateCatalogItem;
  id: string;
  field: "is_active" | "is_featured";
  value: boolean;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name={field} value={String(value)} />
      <Button
        type="submit"
        size="xs"
        variant={value ? "secondary" : "ghost"}
        disabled={pending}
        title={state.error}
      >
        {pending ? <Loader2 className="animate-spin" /> : null}
        {label}
      </Button>
    </form>
  );
}

function Remove({
  action,
  id,
  name,
}: {
  action: typeof deleteCatalogItem;
  id: string;
  name: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm(`Hapus "${name}"? Tindakan ini tidak bisa dibatalkan.`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        size="icon-xs"
        variant="ghost"
        disabled={pending}
        title={state.error ?? `Hapus ${name}`}
      >
        {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
        <span className="sr-only">Hapus {name}</span>
      </Button>
    </form>
  );
}

export function CatalogRowActions({ item }: { item: { id: string; name: string; is_active: boolean; is_featured: boolean } }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Toggle
        action={updateCatalogItem}
        id={item.id}
        field="is_active"
        value={!item.is_active}
        label={item.is_active ? "Nonaktifkan" : "Aktifkan"}
      />
      <Toggle
        action={updateCatalogItem}
        id={item.id}
        field="is_featured"
        value={!item.is_featured}
        label={item.is_featured ? "Batalkan unggulan" : "Jadikan unggulan"}
      />
      <Remove action={deleteCatalogItem} id={item.id} name={item.name} />
    </div>
  );
}

export function PortfolioRowActions({ item }: { item: { id: string; title: string; is_active: boolean; is_featured: boolean } }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Toggle
        action={updatePortfolioItem}
        id={item.id}
        field="is_active"
        value={!item.is_active}
        label={item.is_active ? "Nonaktifkan" : "Aktifkan"}
      />
      <Toggle
        action={updatePortfolioItem}
        id={item.id}
        field="is_featured"
        value={!item.is_featured}
        label={item.is_featured ? "Batalkan unggulan" : "Jadikan unggulan"}
      />
      <Remove action={deletePortfolioItem} id={item.id} name={item.title} />
    </div>
  );
}

export function PartnerRowActions({ partner }: { partner: { id: string; name: string; is_active: boolean } }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Toggle
        action={updatePartner}
        id={partner.id}
        field="is_active"
        value={!partner.is_active}
        label={partner.is_active ? "Nonaktifkan" : "Aktifkan"}
      />
      <Remove action={deletePartner} id={partner.id} name={partner.name} />
    </div>
  );
}
