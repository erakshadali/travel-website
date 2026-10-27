import { site } from './data'

const { currency } = site
const { secondary } = currency

// Prices in data.js are stored in `currency` (USD). When the brand has a secondary currency (AED) it is
// shown as the headline price and the stored currency becomes the "≈" line; the booking API still gets USD.
const fmt = (symbol, n) => `${symbol}${Math.round(n).toLocaleString()}`

// Headline price, e.g. "AED 4,738"
export const money = (n) => (secondary ? fmt(secondary.symbol, n * secondary.rate) : fmt(currency.symbol, n))

// Reference price in the stored currency, e.g. "$1,290" (empty string when the brand has no secondary currency)
export const moneySecondary = (n) => (secondary ? fmt(currency.symbol, n) : '')
