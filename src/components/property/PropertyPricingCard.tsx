'use client'
// ============================================
// DredottSTAY — Property Pricing Card
// Features: 3 currencies, utilities toggle,
// duration selector (night to 6 months)
// ============================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { formatPrice, fetchExchangeRates, type Currency } from '@/lib/utils/currency'
import type { Property } from '@/types'

type Duration = 'nightly' | 'weekly' | 'monthly' | '3months' | '6months'

const DURATIONS: { key: Duration; label: string; nights: number }[] = [
  { key: 'nightly', label: 'Per night', nights: 1 },
  { key: 'weekly', label: 'Per week', nights: 7 },
  { key: 'monthly', label: 'Per month', nights: 30 },
  { key: '3months', label: '3 months', nights: 90 },
  { key: '6months', label: '6 months', nights: 180 },
]

interface PropertyPricingCardProps {
  property: Property
  locale: string
}

export default function PropertyPricingCard({ property, locale }: PropertyPricingCardProps) {
  const router = useRouter()
  const [currency, setCurrency] = useState<Currency>('USD')
  const [withUtilities, setWithUtilities] = useState(true)
  const [duration, setDuration] = useState<Duration>('nightly')
  const [rates, setRates] = useState({ USD: 1, EUR: 0.92, EGP: 48.5 })

  // Fetch live rates on mount
  useEffect(() => {
    fetchExchangeRates().then(setRates)
  }, [])

  // Get base price for selected duration
  const getBasePrice = (): number => {
    switch (duration) {
      case 'nightly': return property.price_per_night
      case 'weekly': return property.price_per_week || property.price_per_night * 7
      case 'monthly': return property.price_per_month || property.price_per_night * 30
      case '3months': return property.price_per_3months || property.price_per_night * 90
      case '6months': return property.price_per_6months || property.price_per_night * 180
      default: return property.price_per_night
    }
  }

  const getNights = () => DURATIONS.find((d) => d.key === duration)?.nights || 1

  const basePrice = getBasePrice()
  const utilitiesAmount = withUtilities
    ? (property.utilities_per_month / 30) * getNights()
    : 0
  const totalAmount = basePrice + utilitiesAmount

  // Convert to selected currency
  const displayBase = formatPrice(Math.round(basePrice * rates[currency]), currency)
  const displayUtil = formatPrice(Math.round(utilitiesAmount * rates[currency]), currency)
  const displayTotal = formatPrice(Math.round(totalAmount * rates[currency]), currency)
  const displayNightly = formatPrice(Math.round(property.price_per_night * rates[currency]), currency)

  const handleBook = () => {
    router.push(
      `/${locale}/book?property=${property.id}&duration=${duration}&utilities=${withUtilities}&currency=${currency}`
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="bg-[#2C3A6B] px-4 py-3">
        <div className="text-[10px] text-[#A0A8B4] tracking-widest mb-1">PRICE</div>
        <div className="text-[#D4A843] text-2xl font-medium">
          {displayNightly}
          <span className="text-xs text-[#A0A8B4] font-normal ml-1">/ night</span>
        </div>
      </div>

      <div className="p-4">
        {/* Duration selector */}
        <div className="mb-3">
          <div className="text-[10px] text-[#A0A8B4] tracking-widest mb-2">DURATION</div>
          <div className="flex border border-[#D4A843]/40 rounded-lg overflow-hidden">
            {DURATIONS.map((d) => (
              <button
                key={d.key}
                onClick={() => setDuration(d.key)}
                className={`flex-1 py-1.5 text-[10px] font-medium transition-colors border-r border-[#D4A843]/20 last:border-r-0 ${
                  duration === d.key
                    ? 'bg-[#2C3A6B] text-[#D4A843]'
                    : 'bg-white text-[#A0A8B4] hover:bg-[#FAF9F6]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Utilities toggle */}
        <div className="mb-3">
          <div className="text-[10px] text-[#A0A8B4] tracking-widest mb-2">UTILITIES</div>
          <div className="flex border border-[#D4A843]/40 rounded-lg overflow-hidden">
            <button
              onClick={() => setWithUtilities(true)}
              className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                withUtilities ? 'bg-[#2C3A6B] text-[#D4A843]' : 'bg-white text-[#A0A8B4] hover:bg-[#FAF9F6]'
              }`}
            >
              With utilities
            </button>
            <button
              onClick={() => setWithUtilities(false)}
              className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                !withUtilities ? 'bg-[#2C3A6B] text-[#D4A843]' : 'bg-white text-[#A0A8B4] hover:bg-[#FAF9F6]'
              }`}
            >
              Without
            </button>
          </div>
        </div>

        {/* Currency toggle */}
        <div className="mb-4">
          <div className="text-[10px] text-[#A0A8B4] tracking-widest mb-2">CURRENCY</div>
          <div className="flex gap-1.5">
            {(['USD', 'EUR', 'EGP'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`flex-1 py-1.5 text-xs rounded-md border transition-colors font-medium ${
                  currency === c
                    ? 'bg-[#FBF0D0] text-[#8B6914] border-[#B8860B]'
                    : 'bg-white text-[#A0A8B4] border-[#D4A843]/40 hover:bg-[#FAF9F6]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="bg-[#FAF9F6] rounded-lg p-3 mb-4 flex flex-col gap-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#A0A8B4]">
              {DURATIONS.find((d) => d.key === duration)?.label}
            </span>
            <span className="text-[#2C3A6B] font-medium">{displayBase}</span>
          </div>
          {withUtilities && (
            <div className="flex justify-between text-xs">
              <span className="text-[#A0A8B4]">Utilities (est.)</span>
              <span className="text-[#2C3A6B] font-medium">{displayUtil}</span>
            </div>
          )}
          <div className="border-t border-[#D4A843]/20 pt-2 flex justify-between">
            <span className="text-sm font-medium text-[#2C3A6B]">Total</span>
            <span className="text-[#B8860B] text-base font-medium">{displayTotal}</span>
          </div>
        </div>

        {/* Book button */}
        <button onClick={handleBook} className="btn-primary w-full text-sm py-3">
          Book now
        </button>

        {/* WhatsApp note */}
        <div className="mt-3 flex items-start gap-2 bg-[#E1F5EE] rounded-lg p-2.5">
          <div className="text-[#0F6E56] mt-0.5">💬</div>
          <p className="text-xs text-[#0F6E56] leading-relaxed">
            We&apos;ll confirm your booking personally on WhatsApp.
          </p>
        </div>

        <p className="text-center text-[10px] text-[#A0A8B4] mt-2">
          Free cancellation up to 48h before check-in
        </p>
      </div>
    </div>
  )
}
