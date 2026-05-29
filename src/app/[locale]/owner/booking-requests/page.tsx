// ============================================
// Owner Booking Requests Dashboard — DREDOTT
// Path: src/app/[locale]/owner/booking-requests/page.tsx
// Manage manual booking requests
// ============================================

'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Calendar, Users, Phone, MessageCircle, CheckCircle, X, Loader2, AlertCircle } from 'lucide-react'

interface OwnerBookingRequestsProps {
  params: Promise<{ locale: string }>
}

export default function OwnerBookingRequestsPage({ params }: OwnerBookingRequestsProps) {
  const { locale } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const isRtl = locale === 'ar'

  useEffect(() => {
    checkAuth()
    fetchRequests()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push(`/${locale}/login`)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'property_owner') {
      router.push(`/${locale}`)
      return
    }

    setUser(user)
  }

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties!inner(id, name, photos, owner_user_id),
          guest:profiles!bookings_guest_id_fkey(first_name, last_name, phone)
        `)
        .eq('property.owner_user_id', user.id)
        .eq('booking_type', 'manual')
        .in('status', ['pending_confirmation', 'confirmed'])
        .order('created_at', { ascending: false })

      if (data) {
        setRequests(data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching requests:', error)
      setLoading(false)
    }
  }

  const sendPaymentDetails = (booking: any) => {
    const property = booking.property as any
    const guest = booking.guest as any
    const guestName = `${guest?.first_name || ''} ${guest?.last_name || ''}`.trim()

    const message = `
مرحباً ${guestName}! 🏡

حجزك في ${property?.name}
📅 من ${new Date(booking.check_in).toLocaleDateString('ar-EG')}
📅 إلى ${new Date(booking.check_out).toLocaleDateString('ar-EG')}

💰 المبلغ الإجمالي: $${booking.total_amount}

طرق الدفع المتاحة:
📱 InstaPay: 01234567890
🏦 تحويل بنكي:
   رقم الحساب: 123456789
   البنك: بنك مصر

بعد التحويل، يرجى إرسال إيصال الدفع هنا.
    `.trim()

    const whatsappLink = `https://wa.me/${guest?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, '_blank')
  }

  const handleConfirm = async (bookingId: string) => {
    if (!confirm(isRtl ? 'هل تم استلام الدفع؟' : 'Have you received payment?')) {
      return
    }

    setProcessingId(bookingId)

    try {
      const response = await fetch('/api/bookings/manual/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          owner_id: user?.id,
        }),
      })

      if (response.ok) {
        await fetchRequests()
      } else {
        alert(isRtl ? 'فشل التأكيد' : 'Failed to confirm')
      }
    } catch (error) {
      console.error('Confirm error:', error)
      alert(isRtl ? 'حدث خطأ' : 'Error occurred')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (bookingId: string) => {
    const reason = prompt(isRtl ? 'سبب الرفض (اختياري):' : 'Reason for rejection (optional):')
    
    if (reason === null) return // Cancelled

    setProcessingId(bookingId)

    try {
      const response = await fetch('/api/bookings/manual/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          owner_id: user?.id,
          reason,
        }),
      })

      if (response.ok) {
        await fetchRequests()
      } else {
        alert(isRtl ? 'فشل الرفض' : 'Failed to reject')
      }
    } catch (error) {
      console.error('Reject error:', error)
      alert(isRtl ? 'حدث خطأ' : 'Error occurred')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--teal)]" />
      </div>
    )
  }

  const pendingRequests = requests.filter(r => r.status === 'pending_confirmation')
  const confirmedRequests = requests.filter(r => r.status === 'confirmed')

  return (
    <div className="min-h-screen bg-[var(--cream)] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="mb-8">
          <div 
            className="text-xs tracking-[0.2em] text-[var(--gold)] mb-2"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            — {isRtl ? 'طلبات الحجز' : 'BOOKING REQUESTS'}
          </div>
          <h1 
            className="text-4xl lg:text-5xl text-[var(--navy)] mb-3"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {isRtl ? 'طلبات <em>الحجز</em>' : 'Booking <em>Requests</em>'}
          </h1>
          <p className="text-gray-600">
            {isRtl 
              ? 'إدارة طلبات الحجز اليدوية من الضيوف'
              : 'Manage manual booking requests from guests'
            }
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-[var(--line)] p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">{isRtl ? 'قيد الانتظار' : 'Pending'}</div>
                <div className="text-2xl font-bold text-[var(--navy)]">{pendingRequests.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[var(--line)] p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">{isRtl ? 'مؤكدة' : 'Confirmed'}</div>
                <div className="text-2xl font-bold text-[var(--navy)]">{confirmedRequests.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--navy)] mb-4">
              {isRtl ? '⏳ قيد الانتظار' : '⏳ Pending Requests'}
            </h2>
            <div className="space-y-4">
              {pendingRequests.map((booking) => {
                const property = booking.property as any
                const guest = booking.guest as any
                const nights = booking.nights

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-xl border-2 border-yellow-200 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-6">
                      
                      <div className="lg:col-span-1">
                        <img
                          src={property?.photos?.[0]}
                          alt={property?.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <h3 className="font-semibold text-[var(--navy)] mb-2">
                          {property?.name}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{guest?.first_name} {guest?.last_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{guest?.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(booking.check_in).toLocaleDateString(locale)} - {new Date(booking.check_out).toLocaleDateString(locale)}
                            </span>
                          </div>
                          <div className="text-gray-600">
                            {nights} {isRtl ? 'ليالي' : nights === 1 ? 'night' : 'nights'} · {booking.num_guests} {isRtl ? 'ضيف' : 'guests'}
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-1">
                        <div className="text-sm text-gray-600 mb-1">{isRtl ? 'المبلغ' : 'Amount'}</div>
                        <div 
                          className="text-2xl font-bold text-[var(--gold)]"
                          style={{ fontFamily: 'var(--font-serif)' }}
                        >
                          ${booking.total_amount}
                        </div>
                      </div>

                      <div className="lg:col-span-1 flex flex-col gap-2">
                        <button
                          onClick={() => sendPaymentDetails(booking)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {isRtl ? 'واتساب' : 'WhatsApp'}
                        </button>

                        <button
                          onClick={() => handleConfirm(booking.id)}
                          disabled={processingId === booking.id}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--navy)] hover:bg-[var(--teal)] text-[var(--gold)] rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                        >
                          {processingId === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              {isRtl ? 'تأكيد' : 'Confirm'}
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleReject(booking.id)}
                          disabled={processingId === booking.id}
                          className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-200 hover:border-red-400 text-red-600 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                        >
                          {processingId === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              {isRtl ? 'رفض' : 'Reject'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Confirmed Requests */}
        {confirmedRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-[var(--navy)] mb-4">
              {isRtl ? '✅ المؤكدة' : '✅ Confirmed'}
            </h2>
            <div className="space-y-4">
              {confirmedRequests.map((booking) => {
                const property = booking.property as any
                const guest = booking.guest as any

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-xl border border-green-200 p-6 opacity-75"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-[var(--navy)]">{property?.name}</h3>
                        <p className="text-sm text-gray-600">
                          {guest?.first_name} {guest?.last_name} · {new Date(booking.check_in).toLocaleDateString(locale)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{isRtl ? 'مؤكد' : 'Confirmed'}</div>
                        <div className="font-bold text-green-600">${booking.total_amount}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {requests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {isRtl ? 'لا توجد طلبات' : 'No Requests'}
            </h3>
            <p className="text-gray-500">
              {isRtl 
                ? 'لم يتم استلام أي طلبات حجز بعد'
                : 'No booking requests received yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
