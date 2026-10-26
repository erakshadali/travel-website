import { site } from './data'

const { currency } = site

// Primary currency, e.g. "$1,290"
export const money = (n) => `${currency.symbol}${Math.round(n).toLocaleString()}`

// Secondary currency, e.g. "AED 4,738" (empty string when the brand has no secondary currency)
export const moneySecondary = (n) =>
  currency.secondary ? `${currency.secondary.symbol}${Math.round(n * currency.secondary.rate).toLocaleString()}` : ''
