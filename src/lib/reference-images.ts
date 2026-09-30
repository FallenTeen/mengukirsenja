/**
 * Guest reference images live in their own public bucket with random object
 * names, so the URL cannot be enumerated and no signed-URL plumbing is needed.
 * The guest's own browser previews the file from a local object URL before the
 * form is even submitted, so nothing here has to be readable while uploading.
 */
export const REFERENCE_BUCKET = "order-references";

/** Object name accepted by the intake function: `ref-<uuid>.<ext>`. */
export function referenceObjectName(extension: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  const safeExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  return `ref-${random}.${safeExtension}`;
}

/** Public URL for a stored object name. The bucket is public by design. */
export function referenceImageUrl(objectName: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/${REFERENCE_BUCKET}/${objectName}`;
}
