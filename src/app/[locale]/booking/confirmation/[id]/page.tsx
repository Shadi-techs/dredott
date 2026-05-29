// ============================================
// Booking Confirmation Page — DREDOTT
// Path: src/app/[locale]/booking/confirmation/[id]/page.tsx
// Success page after payment completion
// ============================================

'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle, 
  MapPin, 
  Calendar,
  Users,
  Phone,
  Download,
  MessageCircle,
  ArrowRight,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface ConfirmationPageProps {
  params: Promise<{ locale: string; id: string }>
}

interface Booking {
  id: string
  check_in: string
  check_out: string
  num_guests: number
  total_amount: number
  guest_phone: string
  status: string
  created_at: string
  property: {
    name: string
    photos: string[]
    area: string
    owner_phone: string
  }
}

export default function BookingConfirmationPage({ params }: ConfirmationPageProps) {
  const { locale, id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isRtl = locale === 'ar'

  useEffect(() => {
    fetchBooking()
  }, [id])

  const fetchBooking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push(`/${locale}/login`)
        return
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties (
            name,
            photos,
            area,
            owner_phone
          )
        `)
        .eq('id', id)
        .eq('guest_id', user.id)
        .single()

      if (error || !data) {
        setError('Booking not found')
        setLoading(false)
        return
      }

      setBooking(data as any)
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const calculateNights = () => {
    if (!booking) return 0
    const checkIn = new Date(booking.check_in)
    const checkOut = new Date(booking.check_out)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--teal)]" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-[var(--navy)] mb-4">
            {isRtl ? 'خطأ' : 'Error'}
          </h2>
          <p className="text-gray-600 mb-6">{error || 'Booking not found'}</p>
          <Link
            href={`/${locale}/bookings`}
            className="text-[var(--teal)] hover:text-[var(--navy)] font-medium"
          >
            {isRtl ? 'عرض حجوزاتي' : 'View My Bookings'}
          </Link>
        </div>
      </div>
    )
  }

  const property = (booking.property as any)
  const nights = calculateNights()

  return (
    <div className="min-h-screen bg-[var(--cream)] py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 
            className="text-4xl lg:text-5xl text-[var(--navy)] mb-3"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {isRtl ? 'تم <em>التأكيد</em>!' : 'Booking <em>Confirmed</em>!'}
          </h1>
          
          <p className="text-gray-600">
            {isRtl 
              ? 'تم حجزك بنجاح. تم إرسال تفاصيل الحجز إلى بريدك الإلكتروني.'
              : 'Your booking has been confirmed. Check your email for details.'
            }
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-xl border border-[var(--line)] overflow-hidden mb-6">
          {/* Property Image */}
          <div className="relative h-48">
            <img
              src={property?.photos?.[0]}
              alt={property?.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-6">
            {/* Property Name */}
            <h2 
              className="text-2xl text-[var(--navy)] mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {property?.name}
            </h2>

            {/* Booking Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Check-in */}
              <div className="flex items-start gap-3 p-4 bg-[var(--cream)] rounded-lg">
                <Calendar className="w-5 h-5 text-[var(--teal)] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {isRtl ? 'الوصول' : 'Check-in'}
                  </div>
                  <div className="font-semibold text-[var(--navy)]">
                    {formatDate(booking.check_in)}
                  </div>
                </div>
              </div>

              {/* Check-out */}
              <div className="flex items-start gap-3 p-4 bg-[var(--cream)] rounded-lg">
                <Calendar className="w-5 h-5 text-[var(--teal)] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {isRtl ? 'المغادرة' : 'Check-out'}
                  </div>
                  <div className="font-semibold text-[var(--navy)]">
                    {formatDate(booking.check_out)}
                  </div>
                </div>
              </div>

              {/* Guests */}
              <div className="flex items-start gap-3 p-4 bg-[var(--cream)] rounded-lg">
                <Users className="w-5 h-5 text-[var(--teal)] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {isRtl ? 'الضيوف' : 'Guests'}
                  </div>
                  <div className="font-semibold text-[var(--navy)]">
                    {booking.num_guests} {isRtl ? 'ضيف' : booking.num_guests === 1 ? 'guest' : 'guests'}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 p-4 bg-[var(--cream)] rounded-lg">
                <MapPin className="w-5 h-5 text-[var(--teal)] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {isRtl ? 'الموقع' : 'Location'}
                  </div>
                  <div className="font-semibold text-[var(--navy)]">
                    {property?.area?.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="border-t border-[var(--line)] pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">
                  {nights} {isRtl ? 'ليالي' : nights === 1 ? 'night' : 'nights'}
                </span>
                <span className="text-gray-600">${booking.total_amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[var(--navy)]">
                  {isRtl ? 'المبلغ المدفوع' : 'Total Paid'}
                </span>
                <span 
                  className="text-2xl font-bold text-[var(--gold)]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  ${booking.total_amount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking ID */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="text-sm">
            <span className="text-blue-600 font-semibold">
              {isRtl ? 'رقم الحجز:' : 'Booking ID:'}
            </span>
            <span className="ml-2 font-mono text-blue-800">
              {booking.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Contact Owner via WhatsApp */}
          {property?.owner_phone && (
            <a
              href={`https://wa.me/${property.owner_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Hi! I just booked ${property.name}. Booking ID: ${booking.id.slice(0, 8)}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {isRtl ? 'تواصل مع المالك' : 'Contact Owner'}
            </a>
          )}

          {/* View My Bookings */}
          <Link
            href={`/${locale}/bookings`}
            className="flex items-center justify-center gap-2 bg-[var(--navy)] hover:bg-[var(--teal)] text-[var(--gold)] font-semibold py-3 rounded-lg transition-colors"
          >
            {isRtl ? 'حجوزاتي' : 'My Bookings'}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl border border-[var(--line)] p-6">
          <h3 className="font-semibold text-[var(--navy)] mb-4">
            {isRtl ? 'الخطوات التالية' : 'What\'s Next?'}
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[var(--gold-soft)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-[var(--navy)]">1</span>
              </div>
              <span>
                {isRtl 
                  ? 'تحقق من بريدك الإلكتروني للحصول على تفاصيل الحجز والإيصال'
                  : 'Check your email for booking details and receipt'
                }
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[var(--gold-soft)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-[var(--navy)]">2</span>
              </div>
              <span>
                {isRtl 
                  ? 'تواصل مع المالك عبر واتساب لتنسيق الوصول'
                  : 'Contact the owner via WhatsApp to arrange check-in'
                }
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[var(--gold-soft)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-[var(--navy)]">3</span>
              </div>
              <span>
                {isRtl 
                  ? 'استعد لإقامة رائعة في شرم الشيخ!'
                  : 'Prepare for an amazing stay in Sharm El Sheikh!'
                }
              </span>
            </li>
          </ul>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href={`/${locale}`}
            className="text-[var(--teal)] hover:text-[var(--navy)] font-medium"
          >
            {isRtl ? '← العودة للصفحة الرئيسية' : '← Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  )
}