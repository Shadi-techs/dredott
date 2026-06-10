// ============================================
// Booking Flow Page — DREDOTT
// Path: src/app/[locale]/booking/[id]/page.tsx
// 3-step booking process with Stripe
// ============================================

'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Bed, 
  Users,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import BookingCalendar from '@/components/BookingCalendar'
import PaymentForm from '@/components/PaymentForm'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface BookingPageProps {
  params: Promise<{ locale: string; id: string }>
}

interface Property {
  id: string
  name: string
  photos: string[]
  area: string
  bedrooms: number
  max_guests: number
  price_per_night: number
  calendar_blocked_dates: any[]
  platform_managed: boolean
}

type BookingStep = 'dates' | 'details' | 'payment'

export default function BookingPage({ params }: BookingPageProps) {
  const { locale, id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Booking state
  const [currentStep, setCurrentStep] = useState<BookingStep>('dates')
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [numGuests, setNumGuests] = useState(1)
  const [guestPhone, setGuestPhone] = useState('')
  
  // Payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isRtl = locale === 'ar'

  useEffect(() => {
    checkAuth()
    fetchProperty()
  }, [id])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push(`/${locale}/login?redirect=/${locale}/booking/${id}`)
      return
    }

    setUser(user)

    // Get user profile for phone
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', user.id)
      .single()

    if (profile?.phone) {
      setGuestPhone(profile.phone)
    }
  }

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, photos, area, bedrooms, max_guests, price_per_night, calendar_blocked_dates, platform_managed')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('Property not found')
        setLoading(false)
        return
      }

      setProperty(data)
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleDatesChange = (checkInDate: Date | null, checkOutDate: Date | null) => {
    setCheckIn(checkInDate)
    setCheckOut(checkOutDate)
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    if (!property) return 0
    return property.price_per_night * calculateNights()
  }

  const canProceedToDetails = () => {
    return checkIn && checkOut && calculateNights() >= 1
  }

  const canProceedToPayment = () => {
    return numGuests > 0 && numGuests <= (property?.max_guests || 0) && guestPhone.length > 0
  }

  const handleProceedToDetails = () => {
    if (canProceedToDetails()) {
      setCurrentStep('details')
    }
  }

  const handleProceedToPayment = async () => {
    if (!canProceedToPayment() || !user) return

    setLoading(true)
    setError(null)

    try {
      // Create booking via API
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: id,
          guest_id: user.id,
          check_in: checkIn!.toISOString().split('T')[0],
          check_out: checkOut!.toISOString().split('T')[0],
          num_guests: numGuests,
          guest_phone: guestPhone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      setClientSecret(data.client_secret)
      setBookingId(data.booking.id)
      setCurrentStep('payment')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async () => {
    if (!bookingId) return

    try {
      // Confirm payment via API
      await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_intent_id: clientSecret?.split('_secret_')[0],
        }),
      })

      // Redirect to confirmation
      router.push(`/${locale}/booking/confirmation/${bookingId}`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--teal)]"></div>
      </div>
    )
  }

  if (error && !property) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-[var(--navy)] mb-2">
            {isRtl ? 'خطأ' : 'Error'}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href={`/${locale}/properties`}
            className="inline-flex items-center gap-2 text-[var(--teal)] hover:text-[var(--navy)] font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            {isRtl ? 'العودة للعقارات' : 'Back to Properties'}
          </Link>
        </div>
      </div>
    )
  }

  if (!property) return null

  const nights = calculateNights()
  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-[var(--cream)] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Back Button */}
        <Link
          href={`/${locale}/properties/${id}`}
          className="inline-flex items-center gap-2 text-[var(--teal)] hover:text-[var(--navy)] font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {isRtl ? 'العودة للعقار' : 'Back to Property'}
        </Link>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {(['dates', 'details', 'payment'] as BookingStep[]).map((step, index) => {
            const stepNumber = index + 1
            const isActive = currentStep === step
            const isCompleted = 
              (step === 'dates' && (currentStep === 'details' || currentStep === 'payment')) ||
              (step === 'details' && currentStep === 'payment')

            return (
              <div key={step} className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                    ${isCompleted 
                      ? 'bg-[var(--teal)] text-white' 
                      : isActive 
                      ? 'bg-[var(--navy)] text-[var(--gold)]' 
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-[var(--navy)]' : 'text-gray-500'}`}>
                    {step === 'dates' && (isRtl ? 'التواريخ' : 'Dates')}
                    {step === 'details' && (isRtl ? 'التفاصيل' : 'Details')}
                    {step === 'payment' && (isRtl ? 'الدفع' : 'Payment')}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-0.5 ${isCompleted ? 'bg-[var(--teal)]' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <div 
                className="text-xs tracking-[0.2em] text-[var(--gold)] mb-2"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                — {isRtl ? 'احجز الآن' : 'BOOK NOW'}
              </div>
              <h1 
                className="text-4xl text-[var(--navy)] mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {currentStep === 'dates' && (isRtl ? 'اختر <em>التواريخ</em>' : 'Select <em>Dates</em>')}
                {currentStep === 'details' && (isRtl ? '<em>تفاصيل</em> الحجز' : 'Booking <em>Details</em>')}
                {currentStep === 'payment' && (isRtl ? '<em>الدفع</em>' : '<em>Payment</em>')}
              </h1>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {/* Step Content */}
            {currentStep === 'dates' && (
              <div>
                <BookingCalendar
                  blockedDates={property.calendar_blocked_dates || []}
                  onDatesChange={handleDatesChange}
                  locale={locale}
                />
                
                <button
                  onClick={handleProceedToDetails}
                  disabled={!canProceedToDetails()}
                  className="mt-6 w-full bg-[var(--navy)] hover:bg-[var(--teal)] text-[var(--gold)] font-semibold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRtl ? 'المتابعة' : 'Continue'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {currentStep === 'details' && (
              <div className="bg-white rounded-xl border border-[var(--line)] p-6">
                <h3 className="text-lg font-semibold text-[var(--navy)] mb-4">
                  {isRtl ? 'معلومات الضيوف' : 'Guest Information'}
                </h3>

                {/* Number of Guests */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRtl ? 'عدد الضيوف' : 'Number of Guests'}
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setNumGuests(Math.max(1, numGuests - 1))}
                      className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center">
                      <div className="text-2xl font-bold text-[var(--navy)]">{numGuests}</div>
                      <div className="text-xs text-gray-500">
                        {isRtl ? `الحد الأقصى ${property.max_guests}` : `Max ${property.max_guests}`}
                      </div>
                    </div>
                    <button
                      onClick={() => setNumGuests(Math.min(property.max_guests, numGuests + 1))}
                      className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRtl ? 'رقم الهاتف (واتساب)' : 'Phone Number (WhatsApp)'}
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+20 123 456 7890"
                    className="w-full px-4 py-3 bg-[var(--cream)] rounded-lg border border-transparent focus:border-[var(--gold)] outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {isRtl ? 'سنستخدم هذا الرقم لتأكيد الحجز' : 'We\'ll use this to confirm your booking'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentStep('dates')}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 hover:border-[var(--gold)] text-gray-700 font-semibold rounded-lg transition-colors"
                  >
                    {isRtl ? 'السابق' : 'Back'}
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    disabled={!canProceedToPayment() || loading}
                    className="flex-1 bg-[var(--navy)] hover:bg-[var(--teal)] text-[var(--gold)] font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--gold)]" />
                    ) : (
                      <>
                        {isRtl ? 'المتابعة للدفع' : 'Continue to Payment'}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'payment' && clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  amount={total}
                  currency="EGP"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  locale={locale}
                />
              </Elements>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-[var(--line)] p-6 sticky top-8">
              {/* Property Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <img
                  src={property.photos[0]}
                  alt={property.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-[var(--navy)] mb-2">{property.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {property.area.replace('_', ' ')}
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {checkIn && checkOut && (
                  <>
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-[var(--teal)]" />
                      <div>
                        <div className="text-xs text-gray-500">{isRtl ? 'الوصول' : 'Check-in'}</div>
                        <div className="font-medium text-[var(--navy)]">
                          {checkIn.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-[var(--teal)]" />
                      <div>
                        <div className="text-xs text-gray-500">{isRtl ? 'المغادرة' : 'Check-out'}</div>
                        <div className="font-medium text-[var(--navy)]">
                          {checkOut.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {numGuests > 0 && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[var(--teal)]" />
                    <div>
                      <div className="text-xs text-gray-500">{isRtl ? 'الضيوف' : 'Guests'}</div>
                      <div className="font-medium text-[var(--navy)]">
                        {numGuests} {isRtl ? 'ضيف' : numGuests === 1 ? 'guest' : 'guests'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              {nights > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      EGP {property.price_per_night.toLocaleString()} × {nights} {isRtl ? 'ليالي' : nights === 1 ? 'night' : 'nights'}
                    </span>
                    <span className="font-medium text-[var(--navy)]">
                      EGP {(property.price_per_night * nights).toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex justify-between">
                    <span className="font-semibold text-[var(--navy)]">
                      {isRtl ? 'الإجمالي' : 'Total'}
                    </span>
                    <span
                      className="text-2xl font-bold text-[var(--gold)]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      EGP {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}