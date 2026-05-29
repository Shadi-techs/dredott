// ============================================
// Manual Booking Request Page — DREDOTT
// Path: src/app/[locale]/booking/request/[id]/page.tsx
// Request booking with direct payment
// ============================================

'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Calendar, Users, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import BookingCalendar from '@/components/BookingCalendar'

interface ManualBookingRequestProps {
  params: Promise<{ locale: string; id: string }>
}

export default function ManualBookingRequestPage({ params }: ManualBookingRequestProps) {
  const { locale, id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [property, setProperty] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [numGuests, setNumGuests] = useState(1)
  const [guestPhone, setGuestPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  const isRtl = locale === 'ar'

  useEffect(() => {
    checkAuth()
    fetchProperty()
  }, [id])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push(`/${locale}/login?redirect=/booking/request/${id}`)
      return
    }

    setUser(user)

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
        .select('id, name, photos, area, price_per_night, max_guests, calendar_blocked_dates, platform_managed, owner_user_id')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError(isRtl ? 'لم يتم العثور على العقار' : 'Property not found')
        setLoading(false)
        return
      }

      if (!data.platform_managed) {
        setError(isRtl ? 'هذا العقار غير متاح للحجز' : 'Property not available for booking')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!checkIn || !checkOut || !user) return
    
    setSubmitting(true)
    setError(null)

    try {
      const nights = calculateNights()
      const total = calculateTotal()

      // Create manual booking request
      const response = await fetch('/api/bookings/manual/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: id,
          guest_id: user.id,
          check_in: checkIn.toISOString().split('T')[0],
          check_out: checkOut.toISOString().split('T')[0],
          num_guests: numGuests,
          guest_phone: guestPhone,
          special_requests: specialRequests,
          total_amount: total,
          nights,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking request')
      }

      setSuccess(true)
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push(`/${locale}/bookings/manual/${data.booking.id}`)
      }, 3000)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--teal)]" />
      </div>
    )
  }

  if (error && !property) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-[var(--navy)] mb-2">{isRtl ? 'خطأ' : 'Error'}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl text-[var(--navy)] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            {isRtl ? 'تم <em>إرسال</em> الطلب!' : 'Request <em>Sent</em>!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isRtl 
              ? 'تم إرسال طلب الحجز إلى المالك. سيتواصل معك عبر واتساب قريباً.'
              : 'Your booking request has been sent to the owner. They will contact you via WhatsApp soon.'
            }
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            {isRtl ? 'جاري التحويل...' : 'Redirecting...'}
          </div>
        </div>
      </div>
    )
  }

  const nights = calculateNights()
  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-[var(--cream)] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[var(--teal)] hover:text-[var(--navy)] font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {isRtl ? 'رجوع' : 'Back'}
        </button>

        <div className="mb-6">
          <div className="text-xs tracking-[0.2em] text-[var(--gold)] mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
            — {isRtl ? 'طلب حجز' : 'BOOKING REQUEST'}
          </div>
          <h1 className="text-4xl text-[var(--navy)] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {isRtl ? '<em>التحويل</em> المباشر' : 'Direct <em>Transfer</em>'}
          </h1>
          <p className="text-gray-600">
            {isRtl 
              ? 'اختر التواريخ وسيتواصل معك المالك لتأكيد الحجز'
              : 'Choose your dates and the owner will contact you to confirm'
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <BookingCalendar
                blockedDates={property?.calendar_blocked_dates || []}
                onDatesChange={handleDatesChange}
                locale={locale}
              />

              <div className="bg-white rounded-xl border border-[var(--line)] p-6">
                <h3 className="text-lg font-semibold text-[var(--navy)] mb-4">
                  {isRtl ? 'معلومات الضيوف' : 'Guest Information'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRtl ? 'عدد الضيوف' : 'Number of Guests'}
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setNumGuests(Math.max(1, numGuests - 1))}
                        className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-[var(--navy)]">{numGuests}</div>
                        <div className="text-xs text-gray-500">
                          {isRtl ? `الحد الأقصى ${property?.max_guests}` : `Max ${property?.max_guests}`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNumGuests(Math.min(property?.max_guests || 1, numGuests + 1))}
                        className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRtl ? 'رقم الهاتف (واتساب)' : 'Phone Number (WhatsApp)'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+20 123 456 7890"
                      className="w-full px-4 py-3 bg-[var(--cream)] rounded-lg border border-transparent focus:border-[var(--gold)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRtl ? 'طلبات خاصة (اختياري)' : 'Special Requests (Optional)'}
                    </label>
                    <textarea
                      rows={3}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--cream)] rounded-lg border border-transparent focus:border-[var(--gold)] outline-none resize-none"
                      placeholder={isRtl ? 'أي طلبات خاصة...' : 'Any special requests...'}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <input type="checkbox" required className="mt-1" />
                  <label className="text-gray-700">
                    {isRtl 
                      ? 'أفهم أن الحجوزات اليدوية تتم مباشرة بيني وبين المالك. DREDOTT غير مسؤول عن نزاعات الدفع.'
                      : 'I understand that manual bookings are direct between me and the property owner. DREDOTT is not responsible for payment disputes.'
                    }
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={!checkIn || !checkOut || submitting}
                className="w-full bg-[var(--navy)] hover:bg-[var(--teal)] text-[var(--gold)] font-semibold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isRtl ? 'جاري الإرسال...' : 'Sending...'}
                  </>
                ) : (
                  isRtl ? 'إرسال طلب الحجز' : 'Send Booking Request'
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-[var(--line)] p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-[var(--navy)] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                {isRtl ? 'ملخص الحجز' : 'Booking Summary'}
              </h3>

              {property?.photos?.[0] && (
                <img
                  src={property.photos[0]}
                  alt={property.name}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}

              <h4 className="font-semibold text-[var(--navy)] mb-4">{property?.name}</h4>

              {checkIn && checkOut && nights > 0 && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-3 border-b border-gray-200">
                    <span className="text-gray-600">{isRtl ? 'الوصول' : 'Check-in'}</span>
                    <span className="font-medium text-[var(--navy)]">
                      {checkIn.toLocaleDateString(locale)}
                    </span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-gray-200">
                    <span className="text-gray-600">{isRtl ? 'المغادرة' : 'Check-out'}</span>
                    <span className="font-medium text-[var(--navy)]">
                      {checkOut.toLocaleDateString(locale)}
                    </span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-gray-200">
                    <span className="text-gray-600">{isRtl ? 'الليالي' : 'Nights'}</span>
                    <span className="font-medium text-[var(--navy)]">{nights}</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-gray-200">
                    <span className="text-gray-600">{isRtl ? 'الضيوف' : 'Guests'}</span>
                    <span className="font-medium text-[var(--navy)]">{numGuests}</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="font-semibold text-[var(--navy)]">{isRtl ? 'الإجمالي' : 'Total'}</span>
                    <span className="text-2xl font-bold text-[var(--gold)]" style={{ fontFamily: 'var(--font-serif)' }}>
                      ${total}
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
