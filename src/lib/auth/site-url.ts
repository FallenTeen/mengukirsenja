import "server-only";
import { headers } from "next/headers";

/**
 * The absolute origin this deployment is reachable at.
 *
 * Email is the one place where a relative URL is useless: the link in the inbox
 * must already name the host, and neither `window.location` nor a `Link` exists
 * on the server that renders the message. So the origin has to come from
 * configuration, with `Origin` only as a fallback for local development.
 *
 * `NEXT_PUBLIC_SITE_URL` wins outright. A magic link is opened minutes later
 * from an inbox, often on a different device, so the address baked into the
 * message must not depend on which panel and which host the admin happened to be
 * on when pressing send. That is also the reason this is not derived from the
 * request URL in production: `next dev --experimental-https` and a proxy both
 * put an origin in front of us that the recipient cannot reach.
 *
 * The fallbacks keep local development working without the variable, and the
 * value is trimmed of a trailing slash because it is concatenated with a path.
 */
export async function siteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return stripTrailingSlash(configured);

  const origin = (await headers()).get("origin");
  if (origin) return stripTrailingSlash(origin);

  return "http://localhost:3000";
}

/** Absolute URL for an app-relative path, e.g. `/auth/callback?next=/customer`. */
export async function siteUrlFor(path: string): Promise<string> {
  return `${await siteUrl()}${path}`;
}

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
