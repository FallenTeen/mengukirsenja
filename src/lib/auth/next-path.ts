/** Only same-origin relative paths are accepted as post-login destinations. */
export function safeNextPath(
  value: string | string[] | FormDataEntryValue | null | undefined,
  fallback: string,
): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}
