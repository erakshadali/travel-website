// Turns what people type ("+971 50 123-4567", "(0091) 98200 12345") into E.164 ("+971501234567").
// A leading 00 is the international prefix in most countries and becomes "+". A number with no
// country code is left alone and rejected by the E.164 check.
export const E164 = /^\+[1-9]\d{7,14}$/

export function normalizeWhatsapp(input) {
  const compact = String(input).replace(/[\s\-().]/g, '')
  return compact.startsWith('00') ? `+${compact.slice(2)}` : compact
}
