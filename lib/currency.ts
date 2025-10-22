/**
 * Currency Conversion Utility
 *
 * This utility handles currency conversion with live exchange rates.
 * Falls back to cached rates if API is unavailable.
 */

// Supported currencies
export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
] as const

export type CurrencyCode = typeof CURRENCIES[number]["code"]

// Static exchange rates (fallback - updated periodically)
// Base currency: USD
const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CAD: 1.35,
  AUD: 1.52,
  CHF: 0.88,
  CNY: 7.24,
  SEK: 10.35,
  NZD: 1.63,
}

// Cache for exchange rates
let cachedRates: Record<string, number> = FALLBACK_RATES
let lastFetch: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

/**
 * Fetch live exchange rates from API
 * Using exchangerate-api.com free tier (1500 requests/month)
 */
async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error("Failed to fetch rates")
    }

    const data = await response.json()
    return data.rates
  } catch (error) {
    console.warn("Failed to fetch live exchange rates, using fallback:", error)
    return FALLBACK_RATES
  }
}

/**
 * Get current exchange rates (cached or fresh)
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now()

  // Return cached rates if fresh enough
  if (now - lastFetch < CACHE_DURATION) {
    return cachedRates
  }

  // Fetch fresh rates
  try {
    const rates = await fetchExchangeRates()
    cachedRates = rates
    lastFetch = now
    return rates
  } catch (error) {
    console.warn("Using fallback rates due to error:", error)
    return FALLBACK_RATES
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const rates = await getExchangeRates()

  // Convert to USD first (base currency)
  const amountInUSD = amount / rates[fromCurrency]

  // Convert from USD to target currency
  const convertedAmount = amountInUSD * rates[toCurrency]

  return convertedAmount
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(code: string): string {
  const currency = CURRENCIES.find((c) => c.code === code)
  return currency?.symbol || code
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode)

  // Special formatting for JPY (no decimals)
  if (currencyCode === "JPY" || currencyCode === "CNY") {
    return `${symbol}${Math.round(amount).toLocaleString()}`
  }

  return `${symbol}${amount.toFixed(2)}`
}

/**
 * Convert multiple amounts at once (more efficient)
 */
export async function convertMultiple(
  amounts: Array<{ amount: number; from: string }>,
  toCurrency: string
): Promise<number[]> {
  const rates = await getExchangeRates()

  return amounts.map(({ amount, from }) => {
    if (from === toCurrency) return amount
    const amountInUSD = amount / rates[from]
    return amountInUSD * rates[toCurrency]
  })
}

/**
 * Get synchronous exchange rates (uses cached values)
 */
export function getExchangeRatesSync(): Record<string, number> {
  return cachedRates
}

/**
 * Convert currency synchronously (uses cached rates)
 */
export function convertCurrencySync(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const rates = cachedRates
  const amountInUSD = amount / rates[fromCurrency]
  return amountInUSD * rates[toCurrency]
}
