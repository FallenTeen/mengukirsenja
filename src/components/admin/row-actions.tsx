"use client";

import { useActionState } from "react";
import { Ban, Eye, Loader2, Pencil, Power, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionCluster, RowActionLink } from "@/components/dashboard/data-table";
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
 *
 * Show and Edit are the labelled buttons in this cluster; the state flips and
 * the delete are icon-only with a tooltip, because they are the rare actions and
 * five full-width buttons per row would drown the table.
 */
function Toggle({
  action,
  id,
  field,
  value,
  icon: Icon,
  label,
}: {
  action: typeof updateCatalogItem;
  id: string;
  field: "is_active" | "is_featured";
  value: boolean;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="inline-flex">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name={field} value={String(value)} />
      <Button
        type="submit"
        size="xs"
        variant="ghost"
        disabled={pending}
        title={state.error ?? label}
      >
        {pending ? <Loader2 className="animate-spin" /> : <Icon />}
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
      className="inline-flex"
      onSubmit={(event) => {
        if (!confirm(`Hapus "${name}"? Tindakan ini tidak bisa dibatalkan.`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        size="xs"
        variant="ghost"
        disabled={pending}
        title={state.error ?? `Hapus ${name}`}
      >
        {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
        Hapus
      </Button>
    </form>
  );
}

export function CatalogRowActions({ item }: { item: { id: string; name: string; is_active: boolean; is_featured: boolean } }) {
  return (
    <ActionCluster>
      <RowActionLink
        href={`/admin/catalog/${item.id}`}
        icon={Eye}
        label="Lihat"
        title={`Lihat detail paket ${item.name}`}
      />
      <RowActionLink
        href={`/admin/catalog/${item.id}`}
        icon={Pencil}
        label="Ubah"
        variant="default"
        title={`Ubah paket ${item.name}`}
      />
      <Toggle
        action={updateCatalogItem}
        id={item.id}
        field="is_active"
        value={!item.is_active}
        icon={item.is_active ? Ban : Power}
        label={item.is_active ? "Nonaktifkan" : "Aktifkan"}
      />
      <Toggle
        action={updateCatalogItem}
        id={item.id}
        field="is_featured"
        value={!item.is_featured}
        icon={Star}
        label={item.is_featured ? "Batalkan unggulan" : "Jadikan unggulan"}
      />
      <Remove action={deleteCatalogItem} id={item.id} name={item.name} />
    </ActionCluster>
  );
}

export function PortfolioRowActions({ item }: { item: { id: string; title: string; is_active: boolean; is_featured: boolean } }) {
  return (
    <ActionCluster>
      <RowActionLink
        href={`/admin/portfolio/${item.id}`}
        icon={Eye}
        label="Lihat"
        title={`Lihat detail ${item.title}`}
      />
      <RowActionLink
        href={`/admin/portfolio/${item.id}`}
        icon={Pencil}
        label="Ubah"
        variant="default"
        title={`Ubah ${item.title}`}
      />
      <Toggle
        action={updatePortfolioItem}
        id={item.id}
        field="is_active"
        value={!item.is_active}
        icon={item.is_active ? Ban : Power}
        label={item.is_active ? "Nonaktifkan" : "Aktifkan"}
      />
      <Toggle
        action={updatePortfolioItem}
        id={item.id}
        field="is_featured"
        value={!item.is_featured}
        icon={Star}
        label={item.is_featured ? "Batalkan unggulan" : "Jadikan unggulan"}
      />
      <Remove action={deletePortfolioItem} id={item.id} name={item.title} />
    </ActionCluster>
  );
}

export function PartnerRowActions({ partner }: { partner: { id: string; name: string; is_active: boolean } }) {
  return (
    <ActionCluster>
      <RowActionLink
        href={`/admin/partners/${partner.id}`}
        icon={Eye}
        label="Lihat"
        title={`Lihat detail partner ${partner.name}`}
      />
      <RowActionLink
        href={`/admin/partners/${partner.id}`}
        icon={Pencil}
        label="Ubah"
        variant="default"
        title={`Ubah partner ${partner.name}`}
      />
      <Toggle
        action={updatePartner}
        id={partner.id}
        field="is_active"
        value={!partner.is_active}
        icon={partner.is_active ? Ban : Power}
        label={partner.is_active ? "Nonaktifkan" : "Aktifkan"}
      />
      <Remove action={deletePartner} id={partner.id} name={partner.name} />
    </ActionCluster>
  );
}
