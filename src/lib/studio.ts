/**
 * Studio contact details.
 *
 * Kept in code rather than the database on purpose: the contact page and the
 * customer portal both need a phone number that must be readable even while
 * every content query is loading, and a WhatsApp deep link cannot degrade
 * gracefully to "no number configured".
 *
 * The WhatsApp number is public by nature, so it comes from the environment and
 * falls back to a placeholder: a wrong number must be one edit in `.env.local`,
 * not a code change and a redeploy. Everything else is content, not configuration.
 */
export const STUDIO = {
  name: "Mengukir Senja Decoration",
  whatsappNumber: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP ?? "6287845332619",
  email: "hayyantaufiqurrohman@gmail.com",
  address: "https://maps.app.goo.gl/HJ8TxTwLTQrnH5t66",
  hours: "24 Hours a day",
  responseTime: "Balasan biasanya dalam 1×24 jam pada jam kerja.",
} as const;
