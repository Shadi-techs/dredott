'use client'
// src/app/[locale]/owner/flash-deals/page.tsx
// Flash Deals Management - Create and manage time-limited deals

import { use, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Zap, Plus, X, Clock, TrendingUp, AlertCircle } from 'lucide-react'

import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { DENSITY } from '@/lib/owner/theme'
import { Card } from '@/components/owner/Card'
import { Button } from '@/components/owner/Button'
import { ScreenHeader } from '@/components/owner/ScreenHeader'
import { getStrings } from '@/lib/owner/strings'

// ============================================
// TYPES
// ============================================

interface FlashDeal {
  id: string
  property_id: string
  check_in: string
  check_out: string
  nights: number
  original_price: number
  deal_price: number
  discount_percentage: number
  total_amount: number
  expires_at: string
  status: string
  claimed_by: string | null
  claimed_at: string | null
  payment_status: string
  email_sent: boolean
  whatsapp_sent: boolean
  created_at: string
  property: {
    name: string
    area: string
    type: string
    photos: string[]
    price_per_night: number
  }
}

interface NewDeal {
  property_id: string
  check_in: string
  check_out: string
  discount_percentage: number
  expires_hours: number
}

// ============================================
// STATUS CONFIG
// ============================================

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Active',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  claimed:   { label: 'Claimed',   color: '#D4A843', bg: 'rgba(212,168,67,0.12)' },
  expired:   { label: 'Expired',   color: '#7a8aaa', bg: 'rgba(122,138,170,0.12)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.expired
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
// CREATE DEAL MODAL
// ============================================

function CreateDealModal({
  properties,
  onClose,
  onCreated,
}: {
  properties: any[]
  onClose: () => void
  onCreated: () => void
}) {
  const { palette } = useOwnerTheme()
  const t = palette

  const supabase = createClient()

  const [form, setForm] = useState<NewDeal>({
    property_id: '',
    check_in: '',
    check_out: '',
    discount_percentage: 20,
    expires_hours: 24,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const selectedProperty = properties.find(p => p.id === form.property_id)
  const nights = form.check_in && form.check_out
    ? Math.ceil((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / 86400000)
    : 0
  const originalPrice = (selectedProperty?.price_per_night || 0) * nights
  const dealPrice = Math.round(originalPrice * (1 - form.discount_percentage / 100))

  async function handleCreate() {
    if (!form.property_id || !form.check_in || !form.check_out) {
      setError('Please fill all required fields')
      return
    }
    if (nights <= 0) {
      setError('Check-out must be after check-in')
      return
    }

    setSubmitting(true)
    setError('')

    const expiresAt = new Date(Date.now() + form.expires_hours * 3600000).toISOString()

    const { error: insertError } = await supabase.from('flash_deals').insert({
      property_id: form.property_id,
      check_in: form.check_in,
      check_out: form.check_out,
      nights,
      original_price: originalPrice,
      deal_price: dealPrice,
      discount_percentage: form.discount_percentage,
      total_amount: dealPrice,
      expires_at: expiresAt,
      status: 'active',
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      onCreated()
      onClose()
    }
    setSubmitting(false)
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

      {/* Modal */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}>
        <div style={{
          background: t.surface,
          borderRadius: 16,
          border: `1px solid ${t.border}`,
          width: '100%',
          maxWidth: 480,
          padding: 24,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={20} color={t.accent} />
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: t.text,
              }}>
                Schedule a Flash Deal
              </h3>
            </div>
            <button onClick={onClose} style={{
              background: 'none',
              border: 'none',
              color: t.textMuted,
              cursor: 'pointer',
              padding: 4,
            }}>
              <X size={20} />
            </button>
          </div>

          {error && (
            <div style={{
              padding: 12,
              borderRadius: 8,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444',
              fontSize: 13,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Property */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}>
                Property
              </label>
              <select
                value={form.property_id}
                onChange={(e) => setForm({ ...form, property_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: t.bg,
                  color: t.text,
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              >
                <option value="">Select a property</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: t.text,
                  marginBottom: 6,
                }}>
                  Check-in
                </label>
                <input
                  type="date"
                  value={form.check_in}
                  onChange={(e) => setForm({ ...form, check_in: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1px solid ${t.border}`,
                    background: t.bg,
                    color: t.text,
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: t.text,
                  marginBottom: 6,
                }}>
                  Check-out
                </label>
                <input
                  type="date"
                  value={form.check_out}
                  onChange={(e) => setForm({ ...form, check_out: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1px solid ${t.border}`,
                    background: t.bg,
                    color: t.text,
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* Discount */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}>
                Discount: {form.discount_percentage}%
              </label>
              <input
                type="range"
                min="10"
                max="70"
                step="5"
                value={form.discount_percentage}
                onChange={(e) => setForm({ ...form, discount_percentage: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  accentColor: t.accent,
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                color: t.textMuted,
                marginTop: 4,
              }}>
                <span>10%</span>
                <span>70%</span>
              </div>
            </div>

            {/* Expires */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}>
                Expires in (hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={form.expires_hours}
                onChange={(e) => setForm({ ...form, expires_hours: parseInt(e.target.value) || 24 })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: t.bg,
                  color: t.text,
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Preview */}
            {nights > 0 && (
              <div style={{
                padding: 16,
                borderRadius: 10,
                background: t.accentSoft,
                border: `1px solid ${t.accent}40`,
              }}>
                <div style={{
                  fontSize: 11,
                  color: t.textMuted,
                  marginBottom: 6,
                  fontFamily: 'var(--mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                  Preview
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 12,
                }}>
                  <span style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: t.accent,
                    fontFamily: 'var(--serif)',
                  }}>
                    AED {dealPrice.toLocaleString()}
                  </span>
                  <span style={{
                    fontSize: 13,
                    color: t.textMuted,
                    textDecoration: 'line-through',
                    fontFamily: 'var(--mono)',
                  }}>
                    AED {originalPrice.toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 6 }}>
                  {nights} nights · Save AED {(originalPrice - dealPrice).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              onClick={onClose}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: 'transparent',
                color: t.textMuted,
                fontSize: 13,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: submitting ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: t.accentDark,
                color: t.accentInk,
                fontSize: 13,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <div style={{
                  width: 16,
                  height: 16,
                  border: `2px solid ${t.accentInk}40`,
                  borderTopColor: t.accentInk,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              ) : (
                <>
                  <Zap size={16} />
                  Create Deal
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================
// DEAL CARD
// ============================================

function DealCard({
  deal,
  onEnd,
  onRefresh,
}: {
  deal: FlashDeal
  onEnd: (id: string) => void
  onRefresh: () => void
}) {
  const { palette } = useOwnerTheme()
  const t = palette

  const expiresAt = new Date(deal.expires_at)
  const now = new Date()
  const msLeft = expiresAt.getTime() - now.getTime()
  const hoursLeft = Math.floor(msLeft / 3600000)
  const minsLeft = Math.floor((msLeft % 3600000) / 60000)
  const isActive = deal.status === 'active' && msLeft > 0
  const isClaimed = deal.status === 'claimed' || !!deal.claimed_by

  const timeLabel = msLeft <= 0
    ? 'Expired'
    : hoursLeft > 48
      ? `${Math.floor(hoursLeft / 24)}d ${hoursLeft % 24}h`
      : `${hoursLeft}h ${minsLeft}m`

  return (
    <Card style={{
      transition: 'all 0.2s',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'var(--mono)',
          background: `${t.accent}20`,
          color: t.accent,
          border: `1px solid ${t.accent}40`,
        }}>
          <Zap size={14} />
          FLASH · {deal.discount_percentage}% OFF
        </span>
        <StatusBadge status={deal.status} />
      </div>

      {/* Property */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 20,
          fontFamily: 'var(--serif)',
          fontWeight: 500,
          color: t.text,
          marginBottom: 4,
        }}>
          {deal.property?.name}
        </div>
        <div style={{ fontSize: 13, color: t.textMuted }}>
          {deal.property?.area} · {deal.check_in} → {deal.check_out} · {deal.nights} nights
        </div>
      </div>

      {/* Price */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 12,
        marginBottom: 16,
      }}>
        <span style={{
          fontSize: 32,
          fontWeight: 700,
          color: t.accent,
          fontFamily: 'var(--serif)',
        }}>
          AED {deal.deal_price?.toLocaleString()}
        </span>
        <span style={{
          fontSize: 14,
          color: t.textMuted,
          textDecoration: 'line-through',
          fontFamily: 'var(--mono)',
        }}>
          AED {deal.original_price?.toLocaleString()}
        </span>
        <span style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontFamily: 'var(--mono)',
          color: '#ef4444',
        }}>
          <Clock size={14} />
          {timeLabel}
        </span>
      </div>

      {/* Status */}
      <div style={{ marginBottom: 16 }}>
        {isClaimed ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            background: `${t.accent}10`,
            borderRadius: 10,
            border: `1px solid ${t.accent}30`,
          }}>
            <TrendingUp size={16} color={t.accent} />
            <span style={{ fontSize: 13, color: t.accent, fontWeight: 600 }}>
              Deal claimed!
            </span>
          </div>
        ) : (
          <div style={{
            fontSize: 13,
            color: t.textMuted,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#22c55e',
              animation: 'pulse 2s infinite',
            }} />
            Waiting to be claimed
          </div>
        )}
      </div>

      {/* Notifications */}
      <div style={{
        display: 'flex',
        gap: 16,
        fontSize: 12,
        color: t.textMuted,
        marginBottom: 16,
      }}>
        <span style={{ color: deal.email_sent ? t.success : t.textMuted }}>
          {deal.email_sent ? '✓' : '○'} Email
        </span>
        <span style={{ color: deal.whatsapp_sent ? t.success : t.textMuted }}>
          {deal.whatsapp_sent ? '✓' : '○'} WhatsApp
        </span>
      </div>

      {/* Actions */}
      {isActive && !isClaimed && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onEnd(deal.id)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 8,
              border: `1px solid ${t.danger}40`,
              background: 'transparent',
              color: t.danger,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            End Now
          </button>
        </div>
      )}
    </Card>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function FlashDealsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { palette } = useOwnerTheme()
  const t = palette
  const d = DENSITY.regular
  const router = useRouter()
  const tx = getStrings(locale as any)

  const supabase = createClient()

  const [deals, setDeals] = useState<FlashDeal[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    void fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push(`/${locale}/login`)
      return
    }

    // Get user's properties
    const { data: propsData } = await supabase
      .from('properties')
      .select('id, name, price_per_night')
      .eq('owner_user_id', session.user.id)
      .eq('status', 'live')

    setProperties(propsData || [])

    // Get flash deals
    const propertyIds = (propsData || []).map(p => p.id)
    if (propertyIds.length > 0) {
      const { data: dealsData } = await supabase
        .from('flash_deals')
        .select(`
          *,
          property:properties(name, area, type, photos, price_per_night)
        `)
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })

      setDeals(dealsData || [])
    }

    setLoading(false)
  }

  async function handleEndDeal(dealId: string) {
    await supabase
      .from('flash_deals')
      .update({ status: 'cancelled' })
      .eq('id', dealId)

    await fetchData()
  }

  const filteredDeals = filterStatus === 'all'
    ? deals
    : deals.filter(d => d.status === filterStatus)

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
        kicker="Flash Deals"
        title="Limited-Time Offers"
        sub="Create time-sensitive deals to fill last-minute availability"
        actions={
          <Button variant="primary" icon={Zap} onClick={() => setShowCreate(true)}>
            New Flash Deal
          </Button>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'active', 'claimed', 'expired', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: `1px solid ${filterStatus === status ? t.accent : t.border}`,
              background: filterStatus === status ? t.accentSoft : t.surface,
              color: filterStatus === status ? t.accent : t.text,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontFamily: 'var(--mono)',
              transition: 'all 0.15s',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <Card style={{ padding: 60, textAlign: 'center' }}>
          <Zap size={48} color={t.textFaint} style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: 15, color: t.textMuted, marginBottom: 8 }}>
            No flash deals yet
          </div>
          <div style={{ fontSize: 13, color: t.textFaint, marginBottom: 20 }}>
            Create your first time-limited deal to boost bookings
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowCreate(true)}>
            Create Flash Deal
          </Button>
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}>
          {filteredDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onEnd={handleEndDeal}
              onRefresh={fetchData}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateDealModal
          properties={properties}
          onClose={() => setShowCreate(false)}
          onCreated={fetchData}
        />
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>
    </div>
  )
}
