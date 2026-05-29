'use client'
// ============================================
// DredottSTAY — Booking Flow
// 4 steps: Dates → Details → Payment → Confirmed
// Uses: react-hook-form + zod + Stripe
// ============================================

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Shield, Lock } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, fetchExchangeRates, type Currency } from '@/lib/utils/currency'

// ---- Validation schema ----
const bookingSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone_code: z.string().min(1),
  phone: z.string().min(6, 'Phone number is required'),
  whatsapp_same: z.boolean(),
  whatsapp_number: z.string().optional(),
  num_guests: z.number().min(1).max(10),
})

type BookingFormData = z.infer<typeof bookingSchema>

const PHONE_CODES = [
  { code: '+39', flag: '🇮🇹', label: 'Italy' },
  { code: '+7', flag: '🇷🇺', label: 'Russia' },
  { code: '+49', flag: '🇩🇪', label: 'Germany' },
  { code: '+380', flag: '🇺🇦', label: 'Ukraine' },
  { code: '+20', flag: '🇪🇬', label: 'Egypt' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+33', flag: '🇫🇷', label: 'France' },
]

const STEPS = ['Dates', 'Your details', 'Payment', 'Confirmed']

interface BookingClientProps {
  property: {
    id: string
    name: string
    slug: string
    area: string
    price_per_night: number
    price_per_week?: number
    price_per_month?: number
    price_per_3months?: number
    price_per_6months?: number
    utilities_per_month: number
    photos: string[]
    max_guests: number
  }
}

export default function BookingClient({ property }: BookingClientProps) {
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step, setStep] = useState(2) // Start at step 2 (details) — step 1 is calendar
  const [currency, setCurrency] = useState<Currency>('USD')
  const [withUtilities, setWithUtilities] = useState(true)
  const [rates, setRates] = useState({ USD: 1, EUR: 0.92, EGP: 48.5 })
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const duration = (searchParams.get('duration') || 'nightly') as string
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''

  useEffect(() => { fetchExchangeRates().then(setRates) }, [])

  // Get price for duration
  const getBasePrice = () => {
    switch (duration) {
      case 'weekly': return property.price_per_week || property.price_per_night * 7
      case 'monthly': return property.price_per_month || property.price_per_night * 30
      case '3months': return property.price_per_3months || property.price_per_night * 90
      case '6months': return property.price_per_6months || property.price_per_night * 180
      default: return property.price_per_night
    }
  }

  const basePrice = getBasePrice()
  const utilitiesAmt = withUtilities ? property.utilities_per_month : 0
  const totalUSD = basePrice + utilitiesAmt
  const totalDisplay = formatPrice(Math.round(totalUSD * rates[currency]), currency)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      phone_code: '+20',
      whatsapp_same: true,
      num_guests: 2,
    },
  })

  const whatsappSame = watch('whatsapp_same')

  const onSubmitDetails = async (data: BookingFormData) => {
    setStep(3) // Move to payment
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      // Create payment intent
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          amount: Math.round(totalUSD * 100), // cents
          currency: currency.toLowerCase(),
          duration,
          check_in: checkIn,
          check_out: checkOut,
        }),
      })
      const { clientSecret, bookingId: bId } = await res.json()
      setBookingId(bId)
      // In real implementation: use Stripe.js to confirm payment
      // For now: simulate success
      setTimeout(() => { setStep(4); setIsProcessing(false) }, 2000)
    } catch {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Steps bar */}
      <div className="bg-white border-b border-[#D4A843]/30 py-3 px-6 flex items-center justify-center gap-1">
        {STEPS.map((s, i) => {
          const n = i + 1
          const isDone = step > n
          const isActive = step === n
          return (
            <div key={s} className="flex items-center gap-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0 ${
                  isDone ? 'bg-[#2A9D8F] text-white' :
                  isActive ? 'bg-[#B8860B] text-[#FFF8DC]' :
                  'bg-[#F1EFE8] text-[#A0A8B4] border border-[#D4A843]/40'
                }`}>
                  {isDone ? <CheckCircle size={13} /> : n}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-[#2C3A6B]' : isDone ? 'text-[#2A9D8F]' : 'text-[#A0A8B4]'}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px bg-[#D4A843]/30 mx-1" />
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-5 px-6 py-6 max-w-4xl mx-auto flex-wrap lg:flex-nowrap">
        {/* Main form */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* STEP 2 — Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmitDetails)}>
              {/* Property summary */}
              <div className="card mb-4">
                <div className="p-4 flex gap-3 items-center border-b border-[#D4A843]/20">
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[#1e3a5f]">
                    {property.photos?.[0] && (
                      <img src={property.photos[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#2C3A6B]">{property.name}</div>
                    <div className="text-xs text-[#2A9D8F] capitalize">{property.area.replace('_', ' ')}</div>
                    <div className="text-xs text-[#A0A8B4] mt-0.5">
                      {checkIn && checkOut ? `${checkIn} → ${checkOut}` : 'Dates selected'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="ml-auto text-xs text-[#B8860B] underline"
                  >
                    Change dates
                  </button>
                </div>
              </div>

              {/* Details form */}
              <div className="card">
                <div className="p-3 border-b border-[#D4A843]/20">
                  <p className="text-sm font-medium text-[#2C3A6B]">Your details</p>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">FIRST NAME</label>
                      <input {...register('first_name')} placeholder="Ahmed" className="input-field" />
                      {errors.first_name && <p className="text-xs text-[#E24B4A] mt-1">{errors.first_name.message}</p>}
                    </div>
                    <div>
                      <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">LAST NAME</label>
                      <input {...register('last_name')} placeholder="Hassan" className="input-field" />
                      {errors.last_name && <p className="text-xs text-[#E24B4A] mt-1">{errors.last_name.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">EMAIL</label>
                    <input {...register('email')} type="email" placeholder="your@email.com" className="input-field" />
                    {errors.email && <p className="text-xs text-[#E24B4A] mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">PHONE NUMBER</label>
                    <div className="flex gap-2">
                      <select {...register('phone_code')} className="input-field w-[100px]">
                        {PHONE_CODES.map((c) => (
                          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                      </select>
                      <input {...register('phone')} type="tel" placeholder="123 456 7890" className="input-field flex-1" />
                    </div>
                    {errors.phone && <p className="text-xs text-[#E24B4A] mt-1">{errors.phone.message}</p>}

                    {/* WhatsApp check */}
                    <p className="text-xs text-[#A0A8B4] mt-2 mb-1.5">Is this number on WhatsApp?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {}}
                        className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                          whatsappSame ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]' : 'bg-white text-[#A0A8B4] border-[#D4A843]/40'
                        }`}
                      >
                        ✓ Yes, use this number
                      </button>
                      <button
                        type="button"
                        className="flex-1 py-2 text-xs rounded-lg border bg-white text-[#A0A8B4] border-[#D4A843]/40"
                      >
                        No, different number
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">NUMBER OF GUESTS</label>
                    <select {...register('num_guests', { valueAsNumber: true })} className="input-field">
                      {Array.from({ length: property.max_guests }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn-primary w-full py-3">
                    Continue to payment →
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3 — Payment */}
          {step === 3 && (
            <div className="card">
              <div className="bg-[#2C3A6B] p-3 flex items-center justify-between">
                <span className="text-xs font-medium text-[#D4A843]">Secure payment</span>
                <div className="flex items-center gap-1.5 text-[10px] text-[#A0A8B4]">
                  <Lock size={10} className="text-[#2A9D8F]" />
                  Powered by Stripe
                </div>
              </div>
              <div className="p-4">
                {/* Card brands */}
                <div className="flex gap-2 mb-4">
                  {['VISA', 'Mastercard', 'Amex', 'Apple Pay'].map((b) => (
                    <span key={b} className="text-[10px] bg-[#F1EFE8] text-[#5F5E5A] px-2 py-1 rounded font-medium">{b}</span>
                  ))}
                </div>

                {/* Currency toggle */}
                <div className="mb-4">
                  <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-2">CURRENCY</label>
                  <div className="flex gap-2">
                    {(['USD', 'EUR', 'EGP'] as Currency[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        className={`flex-1 py-2 text-xs rounded-lg border font-medium transition-colors ${
                          currency === c ? 'bg-[#FBF0D0] text-[#8B6914] border-[#B8860B]' : 'bg-white text-[#A0A8B4] border-[#D4A843]/40'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card fields (Stripe Elements in real app) */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">CARD NUMBER</label>
                    <div className="input-field text-[#A0A8B4]">1234  5678  9012  3456</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">EXPIRY</label>
                      <div className="input-field text-[#A0A8B4]">MM / YY</div>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">CVC</label>
                      <div className="input-field text-[#A0A8B4]">•••</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="btn-primary w-full py-3 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Confirm & Pay — ${totalDisplay}`
                  )}
                </button>

                {/* Trust signals */}
                <div className="flex gap-4 mt-3 flex-wrap">
                  {[
                    { icon: Shield, text: 'SSL encrypted' },
                    { icon: CheckCircle, text: 'Instant confirmation' },
                    { icon: CheckCircle, text: 'Free cancellation 48h' },
                  ].map((t) => (
                    <div key={t.text} className="flex items-center gap-1 text-[10px] text-[#A0A8B4]">
                      <t.icon size={11} className="text-[#2A9D8F]" />
                      {t.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Confirmed */}
          {step === 4 && (
            <div className="card text-center py-10 px-6">
              <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#2A9D8F]" />
              </div>
              <h2 className="text-xl font-medium text-[#2C3A6B] mb-2">Booking confirmed!</h2>
              <p className="text-sm text-[#A0A8B4] mb-6 max-w-[320px] mx-auto">
                Your stay in Sharm El Sheikh is all set. We&apos;ll reach out on WhatsApp shortly to confirm everything.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a
                  href={`/${locale}/properties`}
                  className="btn-secondary text-sm"
                >
                  Browse more properties
                </a>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-teal text-sm"
                >
                  WhatsApp us
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar summary */}
        <div className="w-full lg:w-[220px] flex-shrink-0 flex flex-col gap-3">
          {/* Property thumb */}
          <div className="card overflow-hidden">
            <div className="h-[90px] bg-[#1e3a5f] overflow-hidden">
              {property.photos?.[0] && (
                <img src={property.photos[0]} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-3">
              <div className="text-sm font-medium text-[#2C3A6B]">{property.name}</div>
              <div className="text-xs text-[#2A9D8F] capitalize">{property.area.replace('_', ' ')}</div>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="card p-3">
            <p className="text-[10px] text-[#A0A8B4] tracking-widest mb-2">PRICE BREAKDOWN</p>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#A0A8B4]">Base price</span>
              <span className="text-[#2C3A6B] font-medium">
                {formatPrice(Math.round(basePrice * rates[currency]), currency)}
              </span>
            </div>
            {withUtilities && (
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#A0A8B4]">Utilities</span>
                <span className="text-[#2C3A6B] font-medium">
                  {formatPrice(Math.round(utilitiesAmt * rates[currency]), currency)}
                </span>
              </div>
            )}
            <div className="border-t border-[#D4A843]/20 pt-2 flex justify-between">
              <span className="text-sm font-medium text-[#2C3A6B]">Total</span>
              <span className="text-[#B8860B] text-base font-medium">{totalDisplay}</span>
            </div>
          </div>

          {/* Cancellation */}
          <div className="bg-[#FBF0D0] border border-[#D4A843]/30 rounded-xl p-3">
            <p className="text-xs text-[#8B6914] leading-relaxed">
              <strong className="text-[#6B4B0A]">Free cancellation</strong> up to 48 hours before check-in. After that, the first night is non-refundable.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
