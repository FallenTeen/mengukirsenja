/**
 * Studio contact details.
 *
 * Kept in code rather than the database on purpose: the contact page and the
 * customer portal both need a phone number that must be readable even while
 * every content query is loading, and a WhatsApp deep link cannot degrade
 * gracefully to "no number configured".
 *
 * These are placeholders. Replace them with the real studio details before
 * launch, nothing else needs to change.
 */
export const STUDIO = {
  name: "Mengukir Senja Decoration",
  whatsappNumber: "6280000000000",
  email: "halo@mengukirsenja.id",
  address: "Lokasi studio akan diumumkan di sini.",
  hours: "Senin–Sabtu, 09.00–18.00 WIB",
  responseTime: "Balasan biasanya dalam 1×24 jam pada jam kerja.",
} as const;
