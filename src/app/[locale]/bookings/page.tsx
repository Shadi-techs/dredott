// ============================================
// User Bookings Dashboard — DREDOTT
// Path: src/app/[locale]/bookings/page.tsx
// View all user's bookings with filters
// ============================================

'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  X,
  Loader2,
  Filter,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface BookingsPageProps {
  params: Promise<{ locale: string }>
}

interface Booking {
  id: string
  check_in: string
  check_out: string
  num_guests: number
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  property: {
    id: string
    name: string
    photos: string[]
    area: string
  }
}

type FilterStatus = 'all' | 'upcoming' | 'past' | 'cancelled'

export default function BookingsPage({ params }: BookingsPageProps) {
  const { locale } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const isRtl = locale === 'ar'

  useEffect(() => {
    checkAuth()
    fetchBookings()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push(`/${locale}/login?redirect=/bookings`)
    }
  }

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties (
            id,
            name,
            photos,
            area
          )
        `)
        .eq('guest_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setBookings(data as any)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm(isRtl ? 'هل تريد إلغاء هذا الحجز؟' : 'Are you sure you want to cancel this booking?')) {
      return
    }

    setCancellingId(bookingId)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Cancelled by guest',
          user_id: user?.id,
        }),
      })

      if (response.ok) {
        // Refresh bookings
        await fetchBookings()
      } else {
        alert(isRtl ? 'فشل إلغاء الحجز' : 'Failed to cancel booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert(isRtl ? 'فشل إلغاء الحجز' : 'Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }

  const filterBookings = (bookings: Booking[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (filter) {
      case 'upcoming':
        return bookings.filter(b => 
          new Date(b.check_in) >= today && b.status !== 'cancelled'
        )
      case 'past':
        return bookings.filter(b => 
          new Date(b.check_out) < today && b.status !== 'cancelled'
        )
      case 'cancelled':
        return bookings.filter(b => b.status === 'cancelled')
      default:
        return bookings
    }
  }

  const filteredBookings = filterBookings(bookings)

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === 'cancelled') {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
          {isRtl ? 'ملغي' : 'Cancelled'}
        </span>
      )
    }
    if (paymentStatus === 'pending') {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
          {isRtl ? 'بانتظار الدفع' : 'Pending Payment'}
        </span>
      )
    }
    return (
      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
        {isRtl ? 'مؤكد' : 'Confirmed'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--teal)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <div 
            className="text-xs tracking-[0.2em] text-[var(--gold)] mb-2"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            — {isRtl ? 'حجوزاتي' : 'MY BOOKINGS'}
          </div>
          <h1 
            className="text-4xl lg:text-5xl text-[var(--navy)] mb-3"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {isRtl ? '<em>حجوزاتي</em>' : 'My <em>Bookings</em>'}
          </h1>
          <p className="text-gray-600">
            {isRtl 
              ? 'إدارة حجوزاتك ومشاهدة التفاصيل'
              : 'Manage your bookings and view details'
            }
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
          {(['all', 'upcoming', 'past', 'cancelled'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
                ${filter === f
                  ? 'bg-[var(--navy)] text-[var(--gold)]'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-[var(--line)]'
                }
              `}
            >
              {f === 'all' && (isRtl ? `الكل (${bookings.length})` : `All (${bookings.length})`)}
              {f === 'upcoming' && (isRtl ? 'القادمة' : 'Upcoming')}
              {f === 'past' && (isRtl ? 'السابقة' : 'Past')}
              {f === 'cancelled' && (isRtl ? 'الملغاة' : 'Cancelled')}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {isRtl ? 'لا توجد حجوزات' : 'No bookings found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {isRtl 
                ? filter === 'all' ? 'ليس لديك أي حجوزات بعد' : 'لا توجد حجوزات في هذه الفئة'
                : filter === 'all' ? 'You haven\'t made any bookings yet' : 'No bookings in this category'
              }
            </p>
            <Link
              href={`/${locale}/stays`}
              className="inline-flex items-center gap-2 bg-[var(--navy)] hover:bg-[var(--teal)] text-[var(--gold)] px-6 py-3 rounded-lg font-semibold transition-all"
            >
              {isRtl ? 'تصفح العقارات' : 'Browse Properties'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const property = booking.property as any
              const nights = calculateNights(booking.check_in, booking.check_out)
              const isCancellable = booking.status !== 'cancelled' && new Date(booking.check_in) > new Date()

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-[var(--line)] overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                    {/* Property Image & Info */}
                    <div className="md:col-span-1">
                      <img
                        src={property?.photos?.[0]}
                        alt={property?.name}
                        className="w-full h-32 md:h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="md:col-span-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <Link
                            href={`/${locale}/stays/${property?.id}`}
                            className="text-lg font-semibold text-[var(--navy)] hover:text-[var(--teal)]"
                          >
                            {property?.name}
                          </Link>
                          {getStatusBadge(booking.status, booking.payment_status)}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <MapPin className="w-4 h-4" />
                          {property?.area?.replace('_', ' ')}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">{isRtl ? 'الوصول' : 'Check-in'}</div>
                            <div className="font-medium text-[var(--navy)]">{formatDate(booking.check_in)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">{isRtl ? 'المغادرة' : 'Check-out'}</div>
                            <div className="font-medium text-[var(--navy)]">{formatDate(booking.check_out)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">{isRtl ? 'الليالي' : 'Nights'}</div>
                            <div className="font-medium text-[var(--navy)]">{nights}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">{isRtl ? 'الضيوف' : 'Guests'}</div>
                            <div className="font-medium text-[var(--navy)]">{booking.num_guests}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="md:col-span-1 flex flex-col justify-between items-end text-right">
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-1">{isRtl ? 'المبلغ الإجمالي' : 'Total'}</div>
                        <div 
                          className="text-2xl font-bold text-[var(--gold)]"
                          style={{ fontFamily: 'var(--font-serif)' }}
                        >
                          ${booking.total_amount}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 w-full">
                        <Link
                          href={`/${locale}/booking/confirmation/${booking.id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--navy)] hover:bg-[var(--teal)] text-[var(--gold)] rounded-lg text-sm font-semibold transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          {isRtl ? 'عرض' : 'View'}
                        </Link>

                        {isCancellable && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-200 hover:border-red-400 text-red-600 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                          >
                            {cancellingId === booking.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <X className="w-4 h-4" />
                                {isRtl ? 'إلغاء' : 'Cancel'}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}