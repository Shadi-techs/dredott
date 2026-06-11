'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type Currency = 'EGP' | 'USD' | 'EUR'

// How many EGP = 1 unit of each currency (update periodically)
// mid-2025 approximate values
const EGP_PER: Record<Currency, number> = {
  EGP: 1,
  USD: 50.5,
  EUR: 55.0,
}

// Countries that default to EGP (Egypt + Arab world)
const EGP_COUNTRIES = new Set([
  'EG','SA','AE','KW','QA','BH','OM','JO','LB','IQ','SY','YE','LY','TN','DZ','MA','SD','PS',
])

// Countries that default to EUR (Eurozone + close neighbors)
const EUR_COUNTRIES = new Set([
  'IT','DE','FR','ES','NL','BE','AT','GR','PT','FI','IE','LU','MT','SI','SK','CY','EE','LV','LT',
  'HR','BG','RO','HU','CZ','PL','SE','DK','NO','CH',
])

interface CurrencyCtx {
  currency: Currency
  setCurrency: (c: Currency) => void
  displayPrice: (egpAmount: number | null | undefined) => string
}

const defaultCtx: CurrencyCtx = {
  currency: 'EGP',
  setCurrency: () => {},
  displayPrice: (n) => n ? `${Math.round(n).toLocaleString()} EGP` : '',
}

const CurrencyContext = createContext<CurrencyCtx>(defaultCtx)

function format(egpAmount: number, currency: Currency): string {
  const amount = Math.round(egpAmount / EGP_PER[currency])
  const formatted = amount.toLocaleString()
  if (currency === 'USD') return `$${formatted}`
  if (currency === 'EUR') return `€${formatted}`
  return `${formatted} EGP`
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('EGP')

  useEffect(() => {
    // Check localStorage first
    const saved = localStorage.getItem('dredott_currency') as Currency | null
    if (saved && (saved === 'EGP' || saved === 'USD' || saved === 'EUR')) {
      setCurrencyState(saved)
      return
    }
    // Detect from IP
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const cc: string = data.country_code || ''
        if (EGP_COUNTRIES.has(cc)) setCurrencyState('EGP')
        else if (EUR_COUNTRIES.has(cc)) setCurrencyState('EUR')
        else setCurrencyState('USD')
      })
      .catch(() => {
        // Default to EGP — this is a Sharm El Sheikh platform
        setCurrencyState('EGP')
      })
  }, [])

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c)
    localStorage.setItem('dredott_currency', c)
  }, [])

  const displayPrice = useCallback((egpAmount: number | null | undefined): string => {
    if (!egpAmount) return ''
    return format(egpAmount, currency)
  }, [currency])

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, displayPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
