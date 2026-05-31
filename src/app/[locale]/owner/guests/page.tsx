
'use client'
// src/app/[locale]/owner/guests/page.tsx
// Guest CRM - Track all guests who booked with you

import { use, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Users, Search, X, ChevronRight, Calendar,
  DollarSign, Star, Phone, Mail, MessageCircle
} from 'lucide-react'

import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { DENSITY } from '@/lib/owner/theme'
import { Card } from '@/components/owner/Card'
import { ScreenHeader } from '@/components/owner/ScreenHeader'
import { getStrings } from '@/lib/owner/strings'

// ============================================
// TYPES
// ============================================

interface Guest {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  avatar_url: string
  created_at: string
  total_bookings: number
  total_spent: number
  last_booking_date: string
  first_booking_date: string
  bookings: GuestBooking[]
}

interface GuestBooking {
  id: string
  property_name: string
  check_in: string
  check_out: string
  nights: number
  total_amount: number
  currency: string
  status: string
  payment_status: string
}

// ============================================
// GUEST DRAWER
// ============================================

function GuestDrawer({ guest, onClose }: { guest: Guest | null; onClose: () => void }) {
  const { t, d } = useOwnerTheme()
  const tx = getStrings("en" as any)

  if (!guest) return null

  const fullName = `${guest.first_name || ''} ${guest.last_name || ''}`.trim()
  const initials = `${guest.first_name?.[0] || ''}${guest.last_name?.[0] || ''}`.toUpperCase()

  const STATUS_COLORS: Record<string, string> = {
    confirmed:  '#22c55e',
    checked_in: '#2A9D8F',
    completed:  '#7a8aaa',
    cancelled:  '#ef4444',
    pending:    '#f59e0b',
  }

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
            alignItems: 'start',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: `${t.accent}20`,
                border: `2px solid ${t.accent}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700,
                color: t.accent,
                fontFamily: 'var(--mono)',
              }}>
                {initials || '?'}
              </div>
              <div>
                <h2 style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: t.text,
                  fontFamily: 'var(--serif)',
                  marginBottom: 2,
                }}>
                  {fullName || 'Guest'}
                </h2>
                <p style={{ fontSize: 12, color: t.textMuted }}>
                  Guest since {new Date(guest.first_booking_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
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

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}>
            {[
              { label: 'Bookings', value: guest.total_bookings, color: '#60a5fa' },
              { label: 'Total Spent', value: `AED ${(guest.total_spent || 0).toLocaleString()}`, color: t.accent },
              { label: 'Last Stay', value: guest.last_booking_date ? new Date(guest.last_booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—', color: t.success },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  background: t.bg,
                  borderRadius: 10,
                  padding: 12,
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontWeight: 700,
                  fontFamily: 'var(--mono)',
                  color,
                  fontSize: 15,
                }}>
                  {value}
                </div>
                <div style={{
                  fontSize: 10,
                  color: t.textMuted,
                  marginTop: 4,
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${t.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {guest.email && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
            }}>
              <Mail size={16} color={t.textMuted} />
              <a
                href={`mailto:${guest.email}`}
                style={{
                  color: t.text,
                  textDecoration: 'none',
                }}
              >
                {guest.email}
              </a>
            </div>
          )}
          {guest.phone && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
            }}>
              <Phone size={16} color={t.textMuted} />
              <a
                href={`tel:${guest.phone}`}
                style={{
                  color: t.text,
                  textDecoration: 'none',
                }}
              >
                {guest.phone}
              </a>
            </div>
          )}
        </div>

        {/* Bookings History */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: 24 }}>
            <h3 style={{
              fontSize: 10,
              fontFamily: 'var(--mono)',
              letterSpacing: '0.15em',
              color: t.textMuted,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Booking History
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {guest.bookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: t.bg,
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'start',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: t.text,
                        marginBottom: 4,
                      }}>
                        {b.property_name}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: t.textMuted,
                        fontFamily: 'var(--mono)',
                      }}>
                        {b.check_in} → {b.check_out} · {b.nights}n
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: 13,
                        fontFamily: 'var(--mono)',
                        color: t.accent,
                        fontWeight: 600,
                        marginBottom: 4,
                      }}>
                        {b.currency} {b.total_amount?.toLocaleString()}
                      </div>
                      <span style={{
                        fontSize: 10,
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: `${STATUS_COLORS[b.status] || '#7a8aaa'}20`,
                        color: STATUS_COLORS[b.status] || '#7a8aaa',
                        fontFamily: 'var(--mono)',
                      }}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        {guest.phone && (
          <div style={{
            padding: 16,
            borderTop: `1px solid ${t.border}`,
          }}>
            <a
              href={`https://wa.me/${guest.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px',
                borderRadius: 10,
                border: `1px solid ${t.success}40`,
                background: `${t.success}10`,
                color: t.success,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <MessageCircle size={16} />
              Message on WhatsApp
            </a>
          </div>
        )}
      </aside>
    </>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function GuestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { t, d } = useOwnerTheme()
  const tx = getStrings(locale as any)
  const router = useRouter()

  const supabase = createClient()

  const [guests, setGuests] = useState<Guest[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'spent' | 'bookings'>('recent')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchGuests()
  }, [])

  async function fetchGuests() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push(`/${locale}/login`)
      return
    }

    // Get all bookings with guest profiles
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select(`
        id,
        guest_id,
        check_in,
        check_out,
        nights,
        total_amount,
        currency,
        status,
        payment_status,
        created_at,
        property:properties(name),
        guest:profiles(id, first_name, last_name, email, avatar_url, created_at)
      `)
      .eq('owner_id', session.user.id)
      .not('guest_id', 'is', null)
      .order('created_at', { ascending: false })

    if (!bookingsData) {
      setGuests([])
      setLoading(false)
      return
    }

    // Aggregate guests
    const guestMap: Record<string, Guest> = {}

    bookingsData.forEach((b: any) => {
      const g = Array.isArray(b.guest) ? b.guest[0] : b.guest
      if (!g) return

      const guestId = g.id || b.guest_id
      if (!guestId) return

      if (!guestMap[guestId]) {
        guestMap[guestId] = {
          id: guestId,
          first_name: g.first_name || '',
          last_name: g.last_name || '',
          email: g.email || '',
          phone: '',
          avatar_url: g.avatar_url || '',
          created_at: g.created_at || '',
          total_bookings: 0,
          total_spent: 0,
          last_booking_date: '',
          first_booking_date: b.check_in,
          bookings: [],
        }
      }

      const guest = guestMap[guestId]
      guest.total_bookings++
      guest.total_spent += (b.payment_status === 'paid' ? b.total_amount : 0)
      guest.last_booking_date = b.check_in > guest.last_booking_date ? b.check_in : guest.last_booking_date
      guest.first_booking_date = b.check_in < guest.first_booking_date ? b.check_in : guest.first_booking_date

      const prop = Array.isArray(b.property) ? b.property[0] : b.property
      guest.bookings.push({
        id: b.id,
        property_name: prop?.name || 'Property',
        check_in: b.check_in,
        check_out: b.check_out,
        nights: b.nights,
        total_amount: b.total_amount,
        currency: b.currency || 'AED',
        status: b.status,
        payment_status: b.payment_status,
      })
    })

    setGuests(Object.values(guestMap))
    setLoading(false)
  }

  // Filter and sort
  const filteredGuests = guests
    .filter((g) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      const name = `${g.first_name} ${g.last_name}`.toLowerCase()
      return name.includes(q) || g.email.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sortBy === 'spent') return b.total_spent - a.total_spent
      if (sortBy === 'bookings') return b.total_bookings - a.total_bookings
      return b.last_booking_date > a.last_booking_date ? 1 : -1
    })

  const totalGuests = guests.length
  const totalRevenue = guests.reduce((sum, g) => sum + g.total_spent, 0)
  const repeatGuests = guests.filter((g) => g.total_bookings > 1).length

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
        kicker="CRM"
        title="Guests"
        sub={`${totalGuests} total guests · ${repeatGuests} repeat customers`}
      />

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        {[
          { label: 'Total Guests', value: totalGuests, icon: Users, color: '#60a5fa' },
          { label: 'Total Revenue', value: `AED ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: t.accent },
          { label: 'Repeat Guests', value: repeatGuests, icon: Star, color: t.success },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: t.text,
                  fontFamily: 'var(--mono)',
                }}>
                  {value}
                </div>
                <div style={{ fontSize: 11, color: t.textMuted }}>
                  {label}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search and Sort */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{
          flex: 1,
          minWidth: 240,
          position: 'relative',
        }}>
          <Search
            size={18}
            color={t.textMuted}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            placeholder="Search guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              background: t.surface,
              color: t.text,
              fontSize: 13,
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['recent', 'spent', 'bookings'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: `1px solid ${sortBy === sort ? t.accent : t.border}`,
                background: sortBy === sort ? t.accentSoft : t.surface,
                color: sortBy === sort ? t.accent : t.text,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {sort}
            </button>
          ))}
        </div>
      </div>

      {/* Guests List */}
      {filteredGuests.length === 0 ? (
        <Card style={{ padding: 60, textAlign: 'center' }}>
          <Users size={48} color={t.textFaint} style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: 15, color: t.textMuted }}>
            {searchQuery ? 'No guests found' : 'No guests yet'}
          </div>
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gap: 12,
        }}>
          {filteredGuests.map((guest) => {
            const fullName = `${guest.first_name} ${guest.last_name}`.trim()
            const initials = `${guest.first_name?.[0] || ''}${guest.last_name?.[0] || ''}`.toUpperCase()

            return (
              <Card
                key={guest.id}
                hover
                onClick={() => setSelectedGuest(guest)}
                style={{
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: `${t.accent}20`,
                    border: `2px solid ${t.accent}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: t.accent,
                    fontFamily: 'var(--mono)',
                    flexShrink: 0,
                  }}>
                    {initials || '?'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: t.text,
                      marginBottom: 4,
                    }}>
                      {fullName || 'Guest'}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: t.textMuted,
                    }}>
                      {guest.email}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: 20,
                    fontSize: 12,
                    color: t.textMuted,
                    flexShrink: 0,
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: t.text,
                        fontFamily: 'var(--mono)',
                      }}>
                        {guest.total_bookings}
                      </div>
                      <div>Bookings</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: t.accent,
                        fontFamily: 'var(--mono)',
                      }}>
                        {guest.total_spent.toLocaleString()}
                      </div>
                      <div>AED</div>
                    </div>
                  </div>

                  <ChevronRight size={20} color={t.textMuted} style={{ flexShrink: 0 }} />
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Drawer */}
      <GuestDrawer guest={selectedGuest} onClose={() => setSelectedGuest(null)} />

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
