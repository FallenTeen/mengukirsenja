import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Cover art for catalog and portfolio cards. `cover_image_url` is nullable, so
 * fall back to a branded gradient panel instead of rendering a broken image.
 * Callers must position the parent relatively and give it a height.
 */
export function CoverImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        aria-hidden
        data-slot="cover-placeholder"
        className={cn(
          "bg-[linear-gradient(140deg,var(--beige)_0%,var(--ivory)_45%,var(--olive)_160%)]",
          className,
        )}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
