// ============================================
// Listing Quality Indicator
// Path: src/components/owner/QualityIndicator.tsx
// Shows completeness score — Premium owners only
// Fields checked: title, description, photos,
//   area, price, bedrooms, compound/address
// ============================================

'use client'

import { CheckCircle, AlertCircle, XCircle, Crown } from 'lucide-react'

interface Field {
  label: string
  filled: boolean
  weight: number // importance 1-3
}

interface QualityIndicatorProps {
  isPremium: boolean
  listing: {
    title?: string
    description?: string
    photos?: string[]
    area?: string
    price_per_night?: number
    price_per_month?: number
    bedrooms?: number
    compound_id?: string
    building_number?: string
    street_name?: string
  }
}

export default function QualityIndicator({ isPremium, listing }: QualityIndicatorProps) {
  if (!isPremium) {
    return (
      <div style={{
        background: '#fafafa', border: '1px dashed rgba(0,0,0,0.1)',
        borderRadius: 12, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Crown size={16} color="#D4A843" />
        <p style={{ fontSize: 12, color: '#9ca3af' }}>
          <span style={{ color: '#D4A843', fontWeight: 600 }}>Premium</span> — Listing quality indicator
        </p>
      </div>
    )
  }

  const fields: Field[] = [
    { label: 'Title',         filled: !!listing.title?.trim(),                  weight: 3 },
    { label: 'Description',   filled: (listing.description?.split(' ').length || 0) >= 20, weight: 3 },
    { label: 'Photos',        filled: (listing.photos?.filter(Boolean).length || 0) >= 2, weight: 3 },
    { label: 'Area',          filled: !!listing.area,                            weight: 2 },
    { label: 'Price',         filled: !!(listing.price_per_night || listing.price_per_month), weight: 3 },
    { label: 'Bedrooms',      filled: listing.bedrooms !== undefined,             weight: 1 },
    { label: 'Location',      filled: !!(listing.compound_id || listing.building_number), weight: 2 },
  ]

  const totalWeight = fields.reduce((s, f) => s + f.weight, 0)
  const filledWeight = fields.filter(f => f.filled).reduce((s, f) => s + f.weight, 0)
  const score = Math.round((filledWeight / totalWeight) * 100)

  const scoreColor = score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#ef4444'
  const scoreLabel = score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs work'

  const missingFields = fields.filter(f => !f.filled)

  return (
    <div style={{
      background: '#fff', border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: 14, padding: '18px 20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Crown size={14} color="#D4A843" />
          <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#D4A843' }}>
            Listing Quality
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: scoreColor, fontFamily: "'Cormorant Garamond', serif" }}>
            {score}%
          </span>
          <span style={{ fontSize: 11, color: scoreColor, fontWeight: 500 }}>{scoreLabel}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${score}%`,
          background: scoreColor,
          borderRadius: 3,
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {fields.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {f.filled
              ? <CheckCircle size={13} color="#16a34a" />
              : f.weight >= 3
                ? <XCircle size={13} color="#ef4444" />
                : <AlertCircle size={13} color="#f59e0b" />
            }
            <span style={{ fontSize: 12, color: f.filled ? '#374151' : '#9ca3af' }}>{f.label}</span>
          </div>
        ))}
      </div>

      {/* Missing required fields */}
      {missingFields.filter(f => f.weight >= 3).length > 0 && (
        <div style={{
          marginTop: 12, padding: '8px 12px',
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: 8,
        }}>
          <p style={{ fontSize: 11, color: '#dc2626' }}>
            Required: {missingFields.filter(f => f.weight >= 3).map(f => f.label).join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}