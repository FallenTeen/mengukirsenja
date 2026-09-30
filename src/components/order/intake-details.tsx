import Image from "next/image";
import { ExternalLink, Images, Sparkles } from "lucide-react";
import { referenceImageUrl } from "@/lib/reference-images";
import type { ReferenceImage } from "@/lib/types/database";

/**
 * Read-only views of the two things a guest attaches to a request. Shared by the
 * admin workspace and the customer portal so both sides see the same thing, and
 * a plain server component so it costs no client JavaScript.
 */

/** The services the guest ticked, i.e. intent. The booked lines are order items. */
export function ServicesOfInterest({ services }: { services: string[] }) {
  if (services.length === 0) return null;

  return (
    <div className="grid gap-1.5">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles data-icon="inline-start" className="size-3" />
        Minat layanan
      </span>
      <ul className="flex flex-wrap gap-1.5">
        {services.map((service) => (
          <li
            key={service}
            className="rounded-full border border-terracotta/30 bg-terracotta/5 px-2.5 py-1 text-xs"
          >
            {service}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReferenceGallery({ images }: { images: ReferenceImage[] }) {
  if (images.length === 0) return null;

  return (
    <div className="grid gap-1.5">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Images data-icon="inline-start" className="size-3" />
        Referensi gambar ({images.length})
      </span>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((image, index) => {
          // An upload is an object name in our own bucket; a link is whatever the
          // guest typed, which is why only the upload goes through next/image.
          const src = image.type === "upload" ? referenceImageUrl(image.value) : image.value;
          const label = `Referensi ${index + 1}`;

          return (
            <li key={`${image.type}-${image.value}`} className="grid gap-1">
              <a
                href={src}
                target="_blank"
                rel="noreferrer noopener"
                className="relative block aspect-4/3 overflow-hidden rounded-lg border bg-muted"
              >
                {image.type === "upload" ? (
                  <Image src={src} alt={label} fill sizes="160px" className="object-cover" />
                ) : (
                  // A guest-supplied host is not in `images.remotePatterns`, and
                  // the optimizer would reject it.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={label}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                )}
                {image.type === "link" ? (
                  <ExternalLink className="absolute right-1 top-1 size-3.5 rounded bg-background/80 p-0.5" />
                ) : null}
              </a>
              <span className="truncate text-[0.7rem] text-muted-foreground">
                {image.type === "upload" ? "Unggahan" : "Tautan"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
