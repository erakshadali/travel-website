import { DateTime, IANAZone } from 'luxon'

// Matches the value of <input type="datetime-local">, e.g. 2026-10-12T10:30
export const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
const LOCAL_FORMAT = "yyyy-LL-dd'T'HH:mm"

// Luxon (via Intl) also accepts fixed offsets like "+04:00"; we want real IANA names (Asia/Dubai).
const ZONE_SHAPE = /^(?:UTC|[A-Z][A-Za-z_]*(?:\/[A-Z][A-Za-z0-9_+-]*)+)$/

// "2026-10-12" -> Date at UTC midnight; null when it is not a real calendar day (e.g. 2026-02-30).
export function parseDay(s) {
  const d = new Date(`${s}T00:00:00Z`)
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s ? null : d
}

export const isValidZone = (zone) => ZONE_SHAPE.test(zone) && IANAZone.isValidZone(zone)

/**
 * Convert a wall-clock time in an IANA timezone to a UTC Date.
 * Returns null when the time is invalid or does not exist in that zone (a DST spring-forward gap).
 */
export function localToUtc(localDateTime, timezone) {
  if (!LOCAL_DATETIME.test(localDateTime) || !isValidZone(timezone)) return null
  const dt = DateTime.fromFormat(localDateTime, LOCAL_FORMAT, { zone: timezone })
  if (!dt.isValid || dt.toFormat(LOCAL_FORMAT) !== localDateTime) return null
  return dt.toUTC().toJSDate()
}

export function utcToLocal(date, timezone) {
  return DateTime.fromJSDate(date, { zone: timezone }).toFormat(LOCAL_FORMAT)
}
