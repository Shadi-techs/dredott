// ============================================
// Guest Manual Booking Tracker — DREDOTT
// Path: src/app/[locale]/bookings/manual/[id]/page.tsx
// Track manual booking status
// ============================================

'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle, X, Loader2, AlertCircle, MessageCircle } from 'lucide-react'

interface ManualBookingTrackerProps {
  params: Promise<{ locale: string; id: string }>
}

export default function ManualBookingTrackerPage({ params }: ManualBookingTrackerProps) {
  const { locale, id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [booking, setBooking] = useState<any>(null)
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
          property:properties(name, photos, area, owner_phone)
        `)
        .eq('id', id)
        .eq('guest_id', user.id)
        .single()

      if (error || !data) {
        setError(isRtl ? 'لم يتم العثور على الحجز' : 'Booking not found')
        setLoading(false)
        return
      }

      setBooking(data)
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const getStatusInfo = () => {
    switch (booking?.status) {
      case 'pending_confirmation':
        return {
          icon: <Clock className="w-12 h-12 text-yellow-600" />,
          bg: 'bg-yellow-100',
          border: 'border-yellow-200',
          title: isRtl ? 'قيد الانتظار' : 'Pending Confirmation',
          description: isRtl 
            ? 'تم إرسال طلبك إلى المالك. سيتواصل معك قريباً عبر واتساب.'
            : 'Your request has been sent to the owner. They will contact you soon via WhatsApp.',
        }
      case 'confirmed':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-600" />,
          bg: 'bg-green-100',
          border: 'border-green-200',
          title: isRtl ? 'مؤكد' : 'Confirmed',
          description: isRtl 
            ? 'تم تأكيد حجزك! تحقق من واتساب للحصول على تفاصيل الدفع.'
            : 'Your booking is confirmed! Check WhatsApp for payment details.',
        }
      case 'cancelled':
        return {
          icon: <X className="w-12 h-12 text-red-600" />,
          bg: 'bg-red-100',
          border: 'border-red-200',
          title: isRtl ? 'ملغي' : 'Cancelled',
          description: isRtl 
            ? 'للأسف، لم يتمكن المالك من تأكيد هذا الحجز.'
            : 'Unfortunately, the owner could not confirm this booking.',
        }
      default:
        return {
          icon: <AlertCircle className="w-12 h-12 text-gray-600" />,
          bg: 'bg-gray-100',
          border: 'border-gray-200',
          title: isRtl ? 'غير معروف' : 'Unknown',
          description: '',
        }
    }
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
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-[var(--navy)] mb-2">{isRtl ? 'خطأ' : 'Error'}</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const property = booking.property as any
  const statusInfo = getStatusInfo()
  const nights = booking.nights

  return (
    <div className="min-h-screen bg-[var(--cream)] py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        
        <div className={`${statusInfo.bg} ${statusInfo.border} border-2 rounded-xl p-8 text-center mb-8`}>
          <div className="inline-flex items-center justify-center mb-4">
            {statusInfo.icon}
          </div>
          <h1 
            className="text-3xl text-[var(--navy)] mb-3"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {statusInfo.title}
          </h1>
          <p className="text-gray-700">{statusInfo.description}</p>
        </div>

        <div className="bg-white rounded-xl border border-[var(--line)] overflow-hidden mb-6">
          <div className="relative h-48">
            <img
              src={property?.photos?.[0]}
              alt={property?.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6">
            <h2 
              className="text-2xl text-[var(--navy)] mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {property?.name}
            </h2>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">{isRtl ? 'رقم الحجز' : 'Booking ID'}</span>
                <span className="font-mono font-semibold text-[var(--navy)]">
                  {booking.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">{isRtl ? 'الوصول' : 'Check-in'}</span>
                <span className="font-medium text-[var(--navy)]">
                  {new Date(booking.check_in).toLocaleDateString(locale, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">{isRtl ? 'المغادرة' : 'Check-out'}</span>
                <span className="font-medium text-[var(--navy)]">
                  {new Date(booking.check_out).toLocaleDateString(locale, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">{isRtl ? 'الليالي' : 'Nights'}</span>
                <span className="font-medium text-[var(--navy)]">{nights}</span>
              </div>

              <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">{isRtl ? 'الضيوف' : 'Guests'}</span>
                <span className="font-medium text-[var(--navy)]">{booking.num_guests}</span>
              </div>

              <div className="flex justify-between pt-3">
                <span className="font-semibold text-[var(--navy)]">{isRtl ? 'المبلغ الإجمالي' : 'Total Amount'}</span>
                <span 
                  className="text-2xl font-bold text-[var(--gold)]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  ${booking.total_amount}
                </span>
              </div>
            </div>

            {booking.special_requests && (
              <div className="p-4 bg-[var(--cream)] rounded-lg">
                <div className="text-xs font-semibold text-gray-600 mb-1">
                  {isRtl ? 'طلبات خاصة:' : 'Special Requests:'}
                </div>
                <p className="text-sm text-gray-700">{booking.special_requests}</p>
              </div>
            )}
          </div>
        </div>

        {booking.status === 'pending_confirmation' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              {isRtl ? 'ماذا بعد؟' : 'What\'s Next?'}
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">1.</span>
                <span>
                  {isRtl 
                    ? 'سيتواصل معك المالك عبر واتساب خلال 24 ساعة'
                    : 'The owner will contact you via WhatsApp within 24 hours'
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">2.</span>
                <span>
                  {isRtl 
                    ? 'سيرسل لك تفاصيل الدفع (تحويل بنكي أو InstaPay)'
                    : 'They will send payment details (bank transfer or InstaPay)'
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">3.</span>
                <span>
                  {isRtl
                    ? 'بعد التحويل، أرسل إيصال الدفع للمالك'
                    : 'After transferring, send payment receipt to the owner'
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">4.</span>
                <span>
                  {isRtl 
                    ? 'سيتم تأكيد حجزك خلال ساعات من استلام الدفع'
                    : 'Your booking will be confirmed within hours of payment receipt'
                  }
                </span>
              </li>
            </ul>
          </div>
        )}

        {booking.status === 'confirmed' && property?.owner_phone && (
          <a
            href={`https://wa.me/${property.owner_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
              `Hi! Regarding booking ${booking.id.slice(0, 8)}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            {isRtl ? 'تواصل مع المالك' : 'Contact Owner'}
          </a>
        )}

        {booking.status === 'cancelled' && booking.cancellation_reason && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm font-semibold text-red-900 mb-1">
              {isRtl ? 'سبب الإلغاء:' : 'Cancellation Reason:'}
            </div>
            <p className="text-sm text-red-800">{booking.cancellation_reason}</p>
          </div>
        )}
      </div>
    </div>
  )
}
