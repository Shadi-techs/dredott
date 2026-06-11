'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type Currency = 'EGP' | 'USD' | 'EUR'

// Rates: how much 1 EGP = X of each currency (fetched live, fallback below)
type Rates = { EGP: number; USD: number; EUR: number }
const FALLBACK_RATES: Rates = { EGP: 1, USD: 0.0198, EUR: 0.0182 }

const RATES_CACHE_KEY = 'dredott_rates'
const RATES_TTL_MS    = 24 * 60 * 60 * 1000  // 24 hours

// Countries that default to EGP (Egypt + Arab world)
const EGP_COUNTRIES = new Set([
  'EG','SA','AE','KW','QA','BH','OM','JO','LB','IQ','SY','YE','LY','TN','DZ','MA','SD','PS',
])
// Countries that default to EUR (Eurozone + neighbors)
const EUR_COUNTRIES = new Set([
  'IT','DE','FR','ES','NL','BE','AT','GR','PT','FI','IE','LU','MT','SI','SK','CY','EE','LV','LT',
  'HR','BG','RO','HU','CZ','PL','SE','DK','NO','CH',
])

interface CurrencyCtx {
  currency: Currency
  setCurrency: (c: Currency) => void
  displayPrice: (egpAmount: number | null | undefined) => string
  rates: Rates
}

const CurrencyContext = createContext<CurrencyCtx>({
  currency: 'EGP',
  setCurrency: () => {},
  displayPrice: (n) => n ? `${Math.round(n).toLocaleString()} EGP` : '',
  rates: FALLBACK_RATES,
})

function formatAmount(egpAmount: number, currency: Currency, rates: Rates): string {
  const amount    = Math.round(egpAmount * rates[currency])
  const formatted = amount.toLocaleString()
  if (currency === 'USD') return `$${formatted}`
  if (currency === 'EUR') return `€${formatted}`
  return `${formatted} EGP`
}

function loadCachedRates(): Rates | null {
  try {
    const raw = localStorage.getItem(RATES_CACHE_KEY)
    if (!raw) return null
    const { rates, cachedAt } = JSON.parse(raw)
    if (Date.now() - cachedAt > RATES_TTL_MS) return null  // expired
    return rates as Rates
  } catch {
    return null
  }
}

function saveRatesCache(rates: Rates) {
  try {
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates, cachedAt: Date.now() }))
  } catch {}
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('EGP')
  const [rates,    setRates]         = useState<Rates>(FALLBACK_RATES)

  useEffect(() => {
    // ── 1. Restore user's saved currency preference ──
    const saved = localStorage.getItem('dredott_currency') as Currency | null
    if (saved === 'EGP' || saved === 'USD' || saved === 'EUR') {
      setCurrencyState(saved)
    } else {
      // ── 2. Detect default currency from IP ──
      fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(data => {
          const cc: string = data.country_code || ''
          if      (EGP_COUNTRIES.has(cc)) setCurrencyState('EGP')
          else if (EUR_COUNTRIES.has(cc)) setCurrencyState('EUR')
          else                            setCurrencyState('USD')
        })
        .catch(() => setCurrencyState('EGP'))
    }

    // ── 3. Load live exchange rates ──
    const cached = loadCachedRates()
    if (cached) {
      setRates(cached)
    } else {
      fetch('/api/exchange-rates')
        .then(r => r.json())
        .then(data => {
          const live: Rates = {
            EGP: 1,
            USD: data.USD ?? FALLBACK_RATES.USD,
            EUR: data.EUR ?? FALLBACK_RATES.EUR,
          }
          setRates(live)
          saveRatesCache(live)
        })
        .catch(() => {})  // keep fallback
    }
  }, [])

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c)
    localStorage.setItem('dredott_currency', c)
  }, [])

  const displayPrice = useCallback((egpAmount: number | null | undefined): string => {
    if (!egpAmount) return ''
    return formatAmount(egpAmount, currency, rates)
  }, [currency, rates])

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, displayPrice, rates }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
