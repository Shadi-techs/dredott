'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Users, Search, Mail, Phone, Globe, Calendar } from 'lucide-react'

interface GuestProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  nationality?: string
  city?: string
  language_preference?: string
  created_at: string
  booking_count?: number
}

export default function AdminGuestsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [guests, setGuests] = useState<GuestProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    setLoading(true)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone, nationality, city, language_preference, created_at')
      .eq('role', 'guest')
      .order('created_at', { ascending: false })

    if (!profiles) {
      setLoading(false)
      return
    }

    const { data: bookingCounts } = await supabase
      .from('bookings')
      .select('guest_id')

    const countMap: Record<string, number> = {}
    if (bookingCounts) {
      for (const row of bookingCounts) {
        countMap[row.guest_id] = (countMap[row.guest_id] ?? 0) + 1
      }
    }

    setGuests(
      profiles.map((p) => ({ ...p, booking_count: countMap[p.id] ?? 0 }))
    )
    setLoading(false)
  }

  const filtered = guests.filter((g) => {
    const q = searchTerm.toLowerCase()
    return (
      `${g.first_name} ${g.last_name}`.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      (g.nationality ?? '').toLowerCase().includes(q)
    )
  })

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
        <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
        <p className="text-gray-600 mt-1">{guests.length} registered guests</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or nationality..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No guests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Guest</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Origin</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Bookings</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm shrink-0">
                        {guest.first_name?.[0]}{guest.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {guest.first_name} {guest.last_name}
                        </p>
                        {guest.language_preference && (
                          <p className="text-xs text-gray-400 uppercase">{guest.language_preference}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      {guest.email}
                    </div>
                    {guest.phone && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                        {guest.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {guest.nationality || guest.city ? (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>
                          {[guest.nationality, guest.city].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      (guest.booking_count ?? 0) > 0
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Calendar className="w-3 h-3" />
                      {guest.booking_count ?? 0} booking{(guest.booking_count ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(guest.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
