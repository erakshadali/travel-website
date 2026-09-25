// Timezone choices for flight details, plus airport codes that pre-fill city and timezone.

// Zones this agency's trips actually use, with friendly names. Shown first in every dropdown.
export const POPULAR_ZONES = [
  ['Asia/Dubai', 'Dubai, Abu Dhabi, Sharjah (UAE)'],
  ['Asia/Kolkata', 'India (Mumbai, Delhi, Bengaluru...)'],
  ['Asia/Karachi', 'Pakistan'],
  ['Asia/Dhaka', 'Bangladesh'],
  ['Asia/Colombo', 'Sri Lanka'],
  ['Asia/Kathmandu', 'Nepal'],
  ['Asia/Riyadh', 'Saudi Arabia (Riyadh, Jeddah)'],
  ['Asia/Qatar', 'Doha (Qatar)'],
  ['Asia/Muscat', 'Muscat (Oman)'],
  ['Asia/Kuwait', 'Kuwait'],
  ['Asia/Bahrain', 'Bahrain'],
  ['Indian/Maldives', 'Maldives (Male)'],
  ['Asia/Bangkok', 'Thailand (Bangkok, Phuket)'],
  ['Asia/Singapore', 'Singapore'],
  ['Asia/Kuala_Lumpur', 'Malaysia (Kuala Lumpur)'],
  ['Asia/Jakarta', 'Indonesia West (Jakarta)'],
  ['Asia/Makassar', 'Bali and Indonesia Central (Denpasar)'],
  ['Asia/Tokyo', 'Japan (Tokyo, Osaka)'],
  ['Asia/Hong_Kong', 'Hong Kong'],
  ['Europe/London', 'United Kingdom (London)'],
  ['Europe/Paris', 'France (Paris)'],
  ['Europe/Zurich', 'Switzerland (Zurich, Geneva)'],
  ['Europe/Athens', 'Greece (Athens, Santorini)'],
  ['Europe/Istanbul', 'Turkiye (Istanbul)'],
  ['Europe/Rome', 'Italy (Rome)'],
  ['Europe/Berlin', 'Germany (Berlin, Frankfurt)'],
  ['Africa/Cairo', 'Egypt (Cairo)'],
  ['America/New_York', 'US East (New York)'],
  ['America/Los_Angeles', 'US West (Los Angeles)'],
  ['America/Toronto', 'Canada East (Toronto)'],
  ['Australia/Sydney', 'Australia East (Sydney)'],
  ['UTC', 'UTC'],
]

const popularIds = new Set(POPULAR_ZONES.map(([id]) => id))

let regions // cached: [[region, [zone, ...]], ...]

// Every timezone the browser knows, grouped by region, minus the ones already listed as popular.
export function zoneRegions() {
  if (regions) return regions
  const all = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []
  const groups = new Map()
  for (const zone of all) {
    if (popularIds.has(zone) || !zone.includes('/')) continue
    const region = zone.slice(0, zone.indexOf('/'))
    groups.set(region, [...(groups.get(region) ?? []), zone])
  }
  regions = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
  return regions
}

// Whether the browser lists `zone` anywhere in the dropdown.
export const isListedZone = (zone) => popularIds.has(zone) || zoneRegions().some(([, zones]) => zones.includes(zone))

// IATA airport code -> city and timezone. Typing a known code fills in whatever is still empty.
const A = (city, zone, codes) => codes.split(' ').map((code) => [code, { city, zone }])
export const AIRPORTS = Object.fromEntries([
  ...A('Dubai', 'Asia/Dubai', 'DXB DWC'),
  ...A('Abu Dhabi', 'Asia/Dubai', 'AUH'),
  ...A('Sharjah', 'Asia/Dubai', 'SHJ'),
  ...A('Doha', 'Asia/Qatar', 'DOH'),
  ...A('Riyadh', 'Asia/Riyadh', 'RUH'),
  ...A('Jeddah', 'Asia/Riyadh', 'JED'),
  ...A('Muscat', 'Asia/Muscat', 'MCT'),
  ...A('Kuwait City', 'Asia/Kuwait', 'KWI'),
  ...A('Manama', 'Asia/Bahrain', 'BAH'),
  ...A('Mumbai', 'Asia/Kolkata', 'BOM'),
  ...A('Delhi', 'Asia/Kolkata', 'DEL'),
  ...A('Bengaluru', 'Asia/Kolkata', 'BLR'),
  ...A('Hyderabad', 'Asia/Kolkata', 'HYD'),
  ...A('Chennai', 'Asia/Kolkata', 'MAA'),
  ...A('Kolkata', 'Asia/Kolkata', 'CCU'),
  ...A('Kochi', 'Asia/Kolkata', 'COK'),
  ...A('Ahmedabad', 'Asia/Kolkata', 'AMD'),
  ...A('Goa', 'Asia/Kolkata', 'GOI'),
  ...A('Pune', 'Asia/Kolkata', 'PNQ'),
  ...A('Jaipur', 'Asia/Kolkata', 'JAI'),
  ...A('Thiruvananthapuram', 'Asia/Kolkata', 'TRV'),
  ...A('Kozhikode', 'Asia/Kolkata', 'CCJ'),
  ...A('Karachi', 'Asia/Karachi', 'KHI'),
  ...A('Lahore', 'Asia/Karachi', 'LHE'),
  ...A('Islamabad', 'Asia/Karachi', 'ISB'),
  ...A('Dhaka', 'Asia/Dhaka', 'DAC'),
  ...A('Colombo', 'Asia/Colombo', 'CMB'),
  ...A('Kathmandu', 'Asia/Kathmandu', 'KTM'),
  ...A('Male', 'Indian/Maldives', 'MLE'),
  ...A('Bangkok', 'Asia/Bangkok', 'BKK DMK'),
  ...A('Phuket', 'Asia/Bangkok', 'HKT'),
  ...A('Koh Samui', 'Asia/Bangkok', 'USM'),
  ...A('Singapore', 'Asia/Singapore', 'SIN'),
  ...A('Kuala Lumpur', 'Asia/Kuala_Lumpur', 'KUL'),
  ...A('Jakarta', 'Asia/Jakarta', 'CGK'),
  ...A('Denpasar (Bali)', 'Asia/Makassar', 'DPS'),
  ...A('Tokyo', 'Asia/Tokyo', 'NRT HND'),
  ...A('Hong Kong', 'Asia/Hong_Kong', 'HKG'),
  ...A('Paris', 'Europe/Paris', 'CDG ORY'),
  ...A('Zurich', 'Europe/Zurich', 'ZRH'),
  ...A('Geneva', 'Europe/Zurich', 'GVA'),
  ...A('Athens', 'Europe/Athens', 'ATH'),
  ...A('Santorini', 'Europe/Athens', 'JTR'),
  ...A('Istanbul', 'Europe/Istanbul', 'IST SAW'),
  ...A('London', 'Europe/London', 'LHR LGW'),
  ...A('Rome', 'Europe/Rome', 'FCO'),
  ...A('Frankfurt', 'Europe/Berlin', 'FRA'),
  ...A('Munich', 'Europe/Berlin', 'MUC'),
  ...A('Cairo', 'Africa/Cairo', 'CAI'),
  ...A('New York', 'America/New_York', 'JFK EWR'),
  ...A('Los Angeles', 'America/Los_Angeles', 'LAX'),
  ...A('Toronto', 'America/Toronto', 'YYZ'),
  ...A('Sydney', 'Australia/Sydney', 'SYD'),
])

// --- Preview of a ticket time in UTC, so a wrong timezone is obvious before saving. -------------
// The server does the authoritative conversion; this only mirrors it for display.

function offsetMs(zone, utcMs) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(new Date(utcMs))
      .map((p) => [p.type, p.value]),
  )
  const wallAsUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second)
  return wallAsUtc - Math.floor(utcMs / 1000) * 1000
}

// "2026-10-12T04:30" + "Asia/Kolkata" -> Date (UTC instant), or null if either is missing or invalid.
export function localToUtc(local, zone) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local ?? '')
  if (!m || !zone) return null
  const wall = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])
  try {
    let guess = wall - offsetMs(zone, wall)
    guess = wall - offsetMs(zone, guess) // second pass settles times near a daylight-saving change
    return new Date(guess)
  } catch {
    return null
  }
}
