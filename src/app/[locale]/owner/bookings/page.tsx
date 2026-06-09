'use client'
// src/app/[locale]/owner/bookings/page.tsx
// Owner Bookings - Timeline + Table view with real Supabase queries

import { use, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Calendar, Clock, Users, DollarSign, ChevronRight, X,
  Phone, MessageCircle, Filter, Download, Plus
} from 'lucide-react'

import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { DENSITY } from '@/lib/owner/theme'
import { Card } from '@/components/owner/Card'
import { Button } from '@/components/owner/Button'
import { ScreenHeader } from '@/components/owner/ScreenHeader'
import { getStrings } from '@/lib/owner/strings'
import { toast } from '@/components/owner/Toast'

// ============================================
// TYPES
// ============================================

interface Booking {
  id: string
  property_id: string
  guest_id: string
  check_in: string
  check_out: string
  nights: number
  num_guests: number
  base_price: number
  total_amount: number
  currency: string
  payment_status: string
  status: string
  booking_type: string
  guest_phone: string
  stripe_payment_intent_id: string
  whatsapp_confirmed: boolean
  created_at: string
  cancellation_reason: string
  is_platform_managed: boolean
  property: {
    name: string
    area: string
    type: string
    photos: string[]
  }
  guest: {
    first_name: string
    last_name: string
    email: string
    avatar_url: string
  }
}

type FilterType = 'all' | 'today' | 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled'
type ViewType = 'timeline' | 'table'

// ============================================
// STATUS BADGE
// ============================================

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  confirmed:   { label: 'Confirmed',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  pending:     { label: 'Pending',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  checked_in:  { label: 'In-house',   color: '#2A9D8F', bg: 'rgba(42,157,143,0.12)' },
  completed:   { label: 'Completed',  color: '#7a8aaa', bg: 'rgba(122,138,170,0.12)' },
  cancelled:   { label: 'Cancelled',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  paid:        { label: 'Paid',       color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  unpaid:      { label: 'Unpaid',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  refunded:    { label: 'Refunded',   color: '#7a8aaa', bg: 'rgba(122,138,170,0.12)' },
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, color: '#7a8aaa', bg: 'rgba(122,138,170,0.12)' }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: 'var(--mono)',
      color: config.color,
      background: config.bg,
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: config.color,
      }} />
      {config.label}
    </span>
  )
}

// ============================================
// BOOKING DRAWER
// ============================================

function BookingDrawer({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  const { t, d } = useOwnerTheme()
  const tx = getStrings("en" as any)

  if (!booking) return null

  const checkIn = new Date(booking.check_in)
  const checkOut = new Date(booking.check_out)
  const guestName = `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim()
  const code = `DR-${booking.id.slice(0, 4).toUpperCase()}`

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 40,
        }}
      />

      {/* Drawer */}
      <aside style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: '100%',
        maxWidth: 480,
        background: t.surface,
        borderLeft: `1px solid ${t.border}`,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: 24,
          borderBottom: `1px solid ${t.border}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}>
            <span style={{
              fontSize: 10,
              fontFamily: 'var(--mono)',
              letterSpacing: '0.2em',
              color: t.accent,
            }}>
              {code}
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: t.textMuted,
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={20} />
            </button>
          </div>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontSize: 28,
            fontWeight: 500,
            color: t.text,
            marginBottom: 6,
          }}>
            {guestName || 'Guest'}
          </h2>
          <p style={{
            fontSize: 13,
            color: t.textMuted,
            marginBottom: 12,
          }}>
            {booking.nights} nights · {booking.num_guests} guests · {booking.booking_type || 'online'}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <StatusBadge status={booking.status} />
            <StatusBadge status={booking.payment_status} />
          </div>
        </div>

        {/* Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 24,
        }}>
          {/* Property */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: `1px solid ${t.borderSoft}`,
          }}>
            <span style={{
              fontSize: 10,
              color: t.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'var(--mono)',
            }}>
              Property
            </span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                {booking.property?.name}
              </div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                {booking.property?.area}
              </div>
            </div>
          </div>

          {/* Check-in */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: `1px solid ${t.borderSoft}`,
          }}>
            <span style={{
              fontSize: 10,
              color: t.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'var(--mono)',
            }}>
              Check-in
            </span>
            <span style={{
              fontSize: 13,
              color: t.text,
              fontFamily: 'var(--mono)',
            }}>
              {checkIn.toLocaleDateString('en-GB')} · 15:00
            </span>
          </div>

          {/* Check-out */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: `1px solid ${t.borderSoft}`,
          }}>
            <span style={{
              fontSize: 10,
              color: t.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'var(--mono)',
            }}>
              Check-out
            </span>
            <span style={{
              fontSize: 13,
              color: t.text,
              fontFamily: 'var(--mono)',
            }}>
              {checkOut.toLocaleDateString('en-GB')} · 11:00
            </span>
          </div>

          {/* Pricing */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: `1px solid ${t.borderSoft}`,
          }}>
            <span style={{
              fontSize: 10,
              color: t.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'var(--mono)',
            }}>
              Total amount
            </span>
            <span style={{
              fontSize: 15,
              color: t.accent,
              fontFamily: 'var(--mono)',
              fontWeight: 700,
            }}>
              {booking.currency} {booking.total_amount?.toLocaleString()}
            </span>
          </div>

          {/* Guest Contact */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: `1px solid ${t.borderSoft}`,
          }}>
            <span style={{
              fontSize: 10,
              color: t.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'var(--mono)',
            }}>
              Contact
            </span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: t.text }}>
                {booking.guest?.email}
              </div>
              {booking.guest_phone && (
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                  {booking.guest_phone}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: 16,
          borderTop: `1px solid ${t.border}`,
          display: 'flex',
          gap: 12,
        }}>
          {booking.guest_phone && (
            <a
              href={`https://wa.me/${booking.guest_phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${t.success}40`,
                color: t.success,
                background: `${t.success}10`,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          )}
          <Button variant="primary" style={{ flex: 1 }}>
            Full Details →
          </Button>
        </div>
      </aside>
    </>
  )
}

// ============================================
// TIMELINE VIEW
// ============================================

function TimelineView({ bookings, onSelect }: { bookings: Booking[]; onSelect: (b: Booking) => void }) {
  const { t, d } = useOwnerTheme()
  const tx = getStrings("en" as any)

  const today = new Date()
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <Card padding={0} style={{ marginBottom: 16 }}>
      {/* Calendar strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(14, 1fr)',
        borderBottom: `1px solid ${t.border}`,
      }}>
        {days.map((d, i) => {
          const isToday = i === 0
          return (
            <div
              key={i}
              style={{
                padding: '12px 0',
                textAlign: 'center',
                borderRight: `1px solid ${t.borderSoft}`,
                background: isToday ? t.accentSoft : 'transparent',
              }}
            >
              <div style={{
                fontSize: 9,
                fontFamily: 'var(--mono)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: isToday ? t.accent : t.textMuted,
              }}>
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div style={{
                fontSize: 18,
                fontFamily: 'var(--serif)',
                color: isToday ? t.accent : t.text,
                marginTop: 2,
              }}>
                {d.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        gap: 20,
        fontSize: 11,
        color: t.textMuted,
        borderBottom: `1px solid ${t.borderSoft}`,
      }}>
        {[
          { color: '#22c55e', label: 'Confirmed' },
          { color: '#2A9D8F', label: 'In-house' },
          { color: '#f59e0b', label: 'Pending' },
          { color: '#ef4444', label: 'Cancelled' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Bookings list */}
      <div>
        {bookings.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: t.textMuted,
            fontSize: 13,
          }}>
            No bookings found
          </div>
        ) : (
          bookings.map((b, idx) => {
            const config = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
            const guestName = `${b.guest?.first_name || ''} ${b.guest?.last_name || ''}`.trim()
            return (
              <div
                key={b.id}
                onClick={() => onSelect(b)}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  borderTop: idx === 0 ? 'none' : `1px solid ${t.borderSoft}`,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = t.bg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: 4,
                  height: 40,
                  borderRadius: 2,
                  background: config.color,
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                      {guestName || 'Guest'}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontFamily: 'var(--mono)',
                      color: t.textMuted,
                    }}>
                      DR-{b.id.slice(0, 4).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
                    {b.property?.name} · {b.check_in} → {b.check_out} · {b.nights} nights
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontSize: 13,
                    fontFamily: 'var(--mono)',
                    color: t.accent,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}>
                    {b.currency} {b.total_amount?.toLocaleString()}
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <ChevronRight size={16} color={t.textMuted} style={{ flexShrink: 0 }} />
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function BookingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { t, d } = useOwnerTheme()
  const tx = getStrings(locale as any)
  const router = useRouter()

  const supabase = createClient()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [view, setView] = useState<ViewType>('timeline')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void loadBookings()
  }, [])

  useEffect(() => {
    applyFilter()
  }, [filter, bookings])

  const loadBookings = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push(`/${locale}/login`)
      return
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        property:properties(name, area, type, photos),
        guest:profiles(first_name, last_name, email, avatar_url)
      `)
      .eq('owner_id', session.user.id)
      .order('check_in', { ascending: false })

    if (error) {
      console.error('Error loading bookings:', error)
      toast.error(error.message, 'Failed to load bookings')
    } else {
      setBookings(data || [])
    }

    setLoading(false)
  }

  const applyFilter = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let filtered = bookings

    if (filter === 'today') {
      filtered = bookings.filter(b => {
        const checkIn = new Date(b.check_in)
        checkIn.setHours(0, 0, 0, 0)
        return checkIn.getTime() === today.getTime()
      })
    } else if (filter !== 'all') {
      filtered = bookings.filter(b => b.status === filter)
    }

    setFilteredBookings(filtered)
  }

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'today', label: 'Today' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'checked_in', label: 'In-house' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  if (loading) {
    return (
      <div style={{ padding: d.pad, display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
        <div style={{
          width: 32,
          height: 32,
          border: `3px solid ${t.border}`,
          borderTopColor: t.accent,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <div style={{ padding: d.pad }}>
      <ScreenHeader
        kicker="Bookings"
        title="Reservations"
        sub="Manage your property bookings and guest stays"
        actions={
          <>
            <Button variant="ghost" icon={Download}>Export</Button>
            <Button variant="primary" icon={Plus}>New Booking</Button>
          </>
        }
      />

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 20,
        flexWrap: 'wrap',
      }}>
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: `1px solid ${filter === f.value ? t.accent : t.border}`,
              background: filter === f.value ? t.accentSoft : t.surface,
              color: filter === f.value ? t.accent : t.text,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--mono)',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 20,
      }}>
        {(['timeline', 'table'] as ViewType[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: `1px solid ${view === v ? t.accent : t.border}`,
              background: view === v ? t.accentSoft : t.surface,
              color: view === v ? t.accent : t.text,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.15s',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'timeline' && (
        <TimelineView
          bookings={filteredBookings}
          onSelect={setSelectedBooking}
        />
      )}

      {/* Drawer */}
      <BookingDrawer
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
