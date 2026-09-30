"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REFERENCE_BUCKET, referenceObjectName } from "@/lib/reference-images";
import { createClient } from "@/lib/supabase/client";
import type { ReferenceImage } from "@/lib/types/database";

const MAX_IMAGES = 8;
const MAX_BYTES = 5 * 1024 * 1024;

/** An uploaded file plus the local object URL used to preview it before submit. */
type UploadItem = ReferenceImage & { type: "upload"; preview: string };
type LinkItem = ReferenceImage & { type: "link" };
type Item = UploadItem | LinkItem;

function toItem(reference: ReferenceImage): Item {
  return reference.type === "upload"
    ? { type: "upload", value: reference.value, preview: "" }
    : { type: "link", value: reference.value };
}

/**
 * Guest reference images, uploaded straight to the `order-references` bucket.
 *
 * The file is uploaded as soon as it is picked so the guest can preview and delete
 * it before submitting, which is what the form promises. Only the object name goes
 * into the form payload; the intake function re-validates it before storing.
 */
export function ReferenceImagesField({ initial = [] }: { initial?: ReferenceImage[] }) {
  const [items, setItems] = useState<Item[]>(() => initial.map(toItem));
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previews = useRef(new Set<string>());

  const payload = items.map(({ type, value }) => ({ type, value }));
  const full = items.length >= MAX_IMAGES;

  // Object URLs live until the tab closes; release them when the form goes away.
  useEffect(() => {
    const urls = previews.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  async function onFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList);
    if (items.length + files.length > MAX_IMAGES) {
      setError(`Maksimal ${MAX_IMAGES} gambar referensi.`);
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} bukan gambar.`);
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} lebih dari 5 MB.`);
        return;
      }
    }

    setBusy(true);
    try {
      const supabase = createClient();
      for (const file of files) {
        const objectName = referenceObjectName(file.name.split(".").pop() ?? "jpg");
        const { error: uploadError } = await supabase.storage
          .from(REFERENCE_BUCKET)
          .upload(objectName, file, { contentType: file.type, upsert: false });

        if (uploadError) {
          setError(`Gagal mengunggah ${file.name}: ${uploadError.message}`);
          continue;
        }

        const preview = URL.createObjectURL(file);
        previews.current.add(preview);
        setItems((current) => [
          ...current,
          { type: "upload", value: objectName, preview } satisfies UploadItem,
        ]);
      }
    } finally {
      setBusy(false);
    }
  }

  function addLink() {
    const value = link.trim();
    if (!/^https?:\/\/\S+$/i.test(value)) {
      setError("Tautan gambar harus diawali http:// atau https://");
      return;
    }
    if (items.length >= MAX_IMAGES) {
      setError(`Maksimal ${MAX_IMAGES} gambar referensi.`);
      return;
    }
    setError(null);
    setItems((current) => [...current, { type: "link", value } satisfies LinkItem]);
    setLink("");
  }

  function remove(index: number) {
    setItems((current) => {
      const target = current[index];
      if (target?.type === "upload" && target.preview) {
        URL.revokeObjectURL(target.preview);
        previews.current.delete(target.preview);
      }
      return current.filter((_, position) => position !== index);
    });
  }

  return (
    <fieldset className="grid gap-4">
      <legend className="text-sm font-medium">
        Referensi gambar{" "}
        <span className="text-xs font-normal text-muted-foreground">(opsional)</span>
      </legend>
      <p className="text-xs text-muted-foreground">
        Concepts, warna, atau foto yang Anda sukai. Unggah dari perangkat atau tempel tautannya.
        Maksimal {MAX_IMAGES} gambar, 5 MB per gambar.
      </p>

      {/* Only the object names and URLs travel with the form. */}
      <input type="hidden" name="referenceImages" value={JSON.stringify(payload)} />

      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((item, index) => (
            <li key={`${item.type}-${item.value}`} className="grid gap-2">
              <div className="relative aspect-4/3 overflow-hidden rounded-lg border bg-muted">
                {/* Uploaded files preview from the local file, links from the web.
                    A plain img is the point: next/image cannot optimise an
                    arbitrary host a guest typed in, and blob URLs are not
                    remote patterns at all. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.type === "upload" ? item.preview || "" : item.value}
                  alt={`Referensi ${index + 1}`}
                  className="size-full object-cover"
                  loading="lazy"
                />
                <Button
                  type="button"
                  size="icon-sm"
                  variant="destructive"
                  className="absolute right-1 top-1"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-3.5" />
                  <span className="sr-only">Hapus referensi {index + 1}</span>
                </Button>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {item.type === "upload" ? "Dari perangkat" : "Tautan"}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="referenceFiles">Unggah gambar</Label>
          <Input
            id="referenceFiles"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            disabled={busy || full}
            onChange={(event) => {
              void onFiles(event.target.files);
              event.target.value = "";
            }}
          />
          {busy ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" aria-hidden />
              Mengunggah gambar...
            </p>
          ) : null}
        </div>

        <div className="grid content-end gap-2">
          <Label htmlFor="referenceLink">Atau tautan gambar</Label>
          <div className="flex gap-2">
            <Input
              id="referenceLink"
              type="url"
              inputMode="url"
              placeholder="https://..."
              value={link}
              disabled={full}
              onChange={(event) => setLink(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addLink();
                }
              }}
            />
            <Button type="button" variant="outline" disabled={full} onClick={addLink}>
              <Link2 data-icon="inline-start" />
              Tambah
            </Button>
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {full ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ImagePlus className="size-3.5" aria-hidden />
          Batas {MAX_IMAGES} gambar sudah tercapai.
        </p>
      ) : null}
    </fieldset>
  );
}
