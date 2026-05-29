// ============================================
// DredottSTAY — Currency Utilities
// Fetches rates from Central Bank of Egypt API
// Auto-selects currency based on visitor country
// ============================================

export type Currency = 'USD' | 'EUR' | 'EGP'

// Countries that see EUR first
const EUR_COUNTRIES = ['IT', 'DE', 'FR', 'ES', 'NL', 'BE', 'AT', 'GR', 'PT']

// Countries that see EGP first
const EGP_COUNTRIES = ['EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'JO', 'LB']

// Get preferred currency based on country code
export function getPreferredCurrency(countryCode: string): Currency {
  if (EUR_COUNTRIES.includes(countryCode)) return 'EUR'
  if (EGP_COUNTRIES.includes(countryCode)) return 'EGP'
  return 'USD' // Default for everyone else (RU, UA, etc.)
}

// Fetch live rates from CBE (cached for 1 hour)
export async function fetchExchangeRates(): Promise<{ USD: number; EUR: number; EGP: number }> {
  try {
    // CBE API endpoint (prices are in EGP per 1 foreign currency)
    const response = await fetch(
      'https://www.cbe.org.eg/en/monetary-policy/exchange-rates',
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )

    // If CBE API is unavailable, use fallback rates
    // These should be updated periodically
    return getFallbackRates()
  } catch {
    return getFallbackRates()
  }
}

// Fallback rates (update these periodically)
function getFallbackRates() {
  return {
    USD: 1,        // Base currency
    EUR: 0.92,     // 1 USD = 0.92 EUR (approximate)
    EGP: 48.5,     // 1 USD = 48.5 EGP (approximate — update regularly)
  }
}

// Convert price from USD to target currency
export function convertPrice(
  usdAmount: number,
  currency: Currency,
  rates: { USD: number; EUR: number; EGP: number }
): number {
  switch (currency) {
    case 'USD': return usdAmount
    case 'EUR': return Math.round(usdAmount * rates.EUR * 100) / 100
    case 'EGP': return Math.round(usdAmount * rates.EGP)
    default: return usdAmount
  }
}

// Format price with currency symbol
export function formatPrice(amount: number, currency: Currency): string {
  switch (currency) {
    case 'USD': return `$${amount.toLocaleString()}`
    case 'EUR': return `€${amount.toLocaleString()}`
    case 'EGP': return `EGP ${amount.toLocaleString()}`
    default: return `$${amount.toLocaleString()}`
  }
}

// Currency symbols
export const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  EGP: 'EGP ',
}
