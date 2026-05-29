'use client'
// ============================================
// DredottSTAY — Admin Dashboard Client
// Stats cards + recent bookings + quick actions
// ============================================

import { Home, Users, Calendar, Star, DollarSign, Plus, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface AdminDashboardClientProps {
  stats: {
    properties: number
    bookings: number
    guests: number
    pendingReviews: number
    revenue: number | null
  }
  recentBookings: any[]
  recentGuests: any[]
  isSuperAdmin: boolean
  whatsappNumber: string
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-[#E1F5EE] text-[#0F6E56]',
  pending: 'bg-[#FBF0D0] text-[#8B6914]',
  cancelled: 'bg-[#FCEBEB] text-[#A32D2D]',
  completed: 'bg-[#E8ECF8] text-[#2C3A6B]',
}

const COUNTRY_FLAGS: Record<string, string> = {
  IT: '🇮🇹', RU: '🇷🇺', DE: '🇩🇪', UA: '🇺🇦', EG: '🇪🇬', GB: '🇬🇧',
}

export default function AdminDashboardClient({
  stats, recentBookings, recentGuests, isSuperAdmin, whatsappNumber
}: AdminDashboardClientProps) {

  const statCards = [
    { label: 'Active properties', value: stats.properties, icon: Home, color: '#2C3A6B', href: '/admin/properties' },
    { label: 'Total bookings', value: stats.bookings, icon: Calendar, color: '#2A9D8F', href: '/admin/bookings' },
    { label: 'Registered guests', value: stats.guests, icon: Users, color: '#B8860B', href: '/admin/guests' },
    { label: 'Reviews pending', value: stats.pendingReviews, icon: Star, color: '#E24B4A', href: '/admin/reviews' },
    ...(isSuperAdmin && stats.revenue !== null ? [{
      label: 'Total revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: '#8B6914', href: '/admin/accounting'
    }] : []),
  ]

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-medium text-[#2C3A6B]">Dashboard</h1>
          <p className="text-xs text-[#A0A8B4] mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/admin/properties/new" className="btn-primary text-sm flex items-center gap-1.5">
          <Plus size={14} /> Add property
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href} className="bg-white border border-[#D4A843]/30 rounded-xl p-4 hover:border-[#B8860B] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.color + '18' }}>
                  <Icon size={16} style={{ color: s.color }} />
                </div>
              </div>
              <div className="text-xl font-medium text-[#2C3A6B]">{s.value}</div>
              <div className="text-xs text-[#A0A8B4] mt-0.5">{s.label}</div>
            </Link>
          )
        })}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent bookings */}
        <div className="lg:col-span-2 bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#D4A843]/20 flex items-center justify-between">
            <span className="text-sm font-medium text-[#2C3A6B]">Recent bookings</span>
            <Link href="/admin/bookings" className="text-xs text-[#B8860B] underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#D4A843]/10">
                  <th className="text-left px-4 py-2.5 text-[#A0A8B4] font-medium">Guest</th>
                  <th className="text-left px-4 py-2.5 text-[#A0A8B4] font-medium">Property</th>
                  <th className="text-left px-4 py-2.5 text-[#A0A8B4] font-medium">Dates</th>
                  <th className="text-left px-4 py-2.5 text-[#A0A8B4] font-medium">Amount</th>
                  <th className="text-left px-4 py-2.5 text-[#A0A8B4] font-medium">Status</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-[#D4A843]/10 hover:bg-[#FAF9F6]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#2C3A6B] flex items-center justify-center text-[10px] font-medium text-[#D4A843]">
                          {b.profiles?.first_name?.[0] || '?'}
                        </div>
                        <span className="text-[#2C3A6B] font-medium">
                          {b.profiles?.first_name || 'Guest'}
                          {b.profiles?.nationality && ` ${COUNTRY_FLAGS[b.profiles.nationality] || ''}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#555]">{b.properties?.name || '—'}</td>
                    <td className="px-4 py-3 text-[#A0A8B4]">
                      {b.check_in ? `${b.check_in} → ${b.check_out}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-[#B8860B] font-medium">
                      ${b.total_amount?.toFixed(0) || '0'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status] || 'bg-[#F1EFE8] text-[#A0A8B4]'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#2A9D8F] hover:text-[#228a7d] transition-colors"
                        title="WhatsApp guest"
                      >
                        <MessageCircle size={13} />
                      </a>
                    </td>
                  </tr>
                ))}
                {recentBookings.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-[#A0A8B4]">No bookings yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent guests */}
        <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#D4A843]/20 flex items-center justify-between">
            <span className="text-sm font-medium text-[#2C3A6B]">New guests</span>
            <Link href="/admin/guests" className="text-xs text-[#B8860B] underline">View all</Link>
          </div>
          <div className="divide-y divide-[#D4A843]/10">
            {recentGuests.map((g) => (
              <Link key={g.id} href={`/admin/guests/${g.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAF9F6] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#2C3A6B] flex items-center justify-center text-xs font-medium text-[#D4A843] flex-shrink-0">
                  {g.first_name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#2C3A6B] truncate">
                    {g.first_name} {g.last_name}
                    {g.nationality && ` ${COUNTRY_FLAGS[g.nationality] || ''}`}
                  </div>
                  <div className="text-[10px] text-[#A0A8B4]">
                    {new Date(g.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
            {recentGuests.length === 0 && (
              <div className="px-4 py-6 text-center text-[#A0A8B4] text-xs">No guests yet</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
