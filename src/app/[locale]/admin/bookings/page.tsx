'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Calendar, Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
type PaymentStatus = 'pending' | 'paid' | 'refunded'

interface BookingRow {
  id: string
  check_in: string
  check_out: string
  nights: number
  num_guests: number
  total_amount: number
  currency: string
  status: BookingStatus
  payment_status: PaymentStatus
  duration_type: string
  created_at: string
  profiles: { first_name: string; last_name: string; email: string } | null
  properties: { name: string; area: string } | null
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-teal-100 text-teal-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
}

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-600',
  paid: 'bg-green-50 text-green-700',
  refunded: 'bg-purple-50 text-purple-700',
}

export default function AdminBookingsPage() {
  const params = useParams()
  const locale = params.locale as string

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const fetchBookings = async () => {
    setLoading(true)
    let query = supabase
      .from('bookings')
      .select(`
        id, check_in, check_out, nights, num_guests, total_amount, currency,
        status, payment_status, duration_type, created_at,
        profiles:guest_id (first_name, last_name, email),
        properties:property_id (name, area)
      `)
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data } = await query
    if (data) setBookings(data as unknown as BookingRow[])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: BookingStatus) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    fetchBookings()
  }

  const filtered = bookings.filter((b) => {
    const guestName = `${b.profiles?.first_name ?? ''} ${b.profiles?.last_name ?? ''}`.toLowerCase()
    const propName = ((b.profiles?.email ?? '') + (b.properties?.name ?? '')).toLowerCase()
    const q = searchTerm.toLowerCase()
    return guestName.includes(q) || propName.includes(q)
  })

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600 mt-1">{bookings.length} total bookings</p>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              statusFilter === s
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by guest name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Guest</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Property</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Dates</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Amount</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Payment</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">
                    {booking.profiles?.first_name} {booking.profiles?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{booking.profiles?.email}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{booking.properties?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {booking.properties?.area?.replace('_', ' ')}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>
                      {booking.check_in} → {booking.check_out}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {booking.nights} nights · {booking.num_guests} guests
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {booking.currency} {booking.total_amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{booking.duration_type}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[booking.status]}`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${PAYMENT_STYLES[booking.payment_status]}`}
                  >
                    {booking.payment_status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(booking.id, 'confirmed')}
                          className="p-1.5 hover:bg-teal-50 text-teal-600 rounded-lg transition-colors"
                          title="Confirm"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateStatus(booking.id, 'cancelled')}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'completed')}
                        className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors"
                        title="Mark completed"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  )
}
