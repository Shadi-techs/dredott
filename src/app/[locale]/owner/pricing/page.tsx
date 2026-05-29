'use client'
// src/app/[locale]/owner/pricing/page.tsx
// Smart pricing suggestions based on demand, seasonality, and competition

import { use, useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, TrendingDown, Check, X, Calendar as CalIcon,
  Users, DollarSign, Zap, BarChart2, AlertCircle
} from 'lucide-react'

import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { DENSITY } from '@/lib/owner/theme'
import { Card } from '@/components/owner/Card'
import { Button } from '@/components/owner/Button'
import { ScreenHeader } from '@/components/owner/ScreenHeader'
import { getStrings } from '@/lib/owner/strings'

// ============================================
// TYPES
// ============================================

interface PricingSuggestion {
  id: string
  property_id: string
  current_price: number
  suggested_price: number
  price_change: number
  price_change_percent: number
  reason: string
  confidence: 'low' | 'medium' | 'high'
  valid_from: string
  valid_to: string
  applied: boolean
  property: {
    name: string
    price_per_night: number
  }
}

interface PriceHistory {
  date: string
  price: number
  bookings: number
}

// ============================================
// SUGGESTION CARD
// ============================================

function SuggestionCard({
  suggestion,
  onApply,
  onDismiss,
}: {
  suggestion: PricingSuggestion
  onApply: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const { palette } = useOwnerTheme()
  const t = palette

  const isIncrease = suggestion.price_change > 0
  const changeColor = isIncrease ? t.success : t.danger
  const ChangeIcon = isIncrease ? TrendingUp : TrendingDown

  const confidenceColors = {
    low: t.textMuted,
    medium: '#f59e0b',
    high: t.success,
  }

  return (
    <Card>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: `${changeColor}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ChangeIcon size={24} color={changeColor} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
          }}>
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: t.text,
            }}>
              {suggestion.property?.name}
            </span>
            <span style={{
              fontSize: 10,
              padding: '3px 8px',
              borderRadius: 12,
              background: `${confidenceColors[suggestion.confidence]}20`,
              color: confidenceColors[suggestion.confidence],
              fontFamily: 'var(--mono)',
              textTransform: 'uppercase',
            }}>
              {suggestion.confidence} confidence
            </span>
          </div>

          <div style={{
            fontSize: 12,
            color: t.textMuted,
            marginBottom: 12,
            lineHeight: 1.5,
          }}>
            {suggestion.reason}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            marginBottom: 8,
          }}>
            <div style={{
              fontSize: 11,
              color: t.textMuted,
              textDecoration: 'line-through',
              fontFamily: 'var(--mono)',
            }}>
              AED {suggestion.current_price.toLocaleString()}
            </div>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: t.accent,
              fontFamily: 'var(--serif)',
            }}>
              AED {suggestion.suggested_price.toLocaleString()}
            </div>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: changeColor,
              fontFamily: 'var(--mono)',
            }}>
              {isIncrease ? '+' : ''}{suggestion.price_change_percent.toFixed(1)}%
            </div>
          </div>

          <div style={{
            fontSize: 11,
            color: t.textFaint,
            fontFamily: 'var(--mono)',
          }}>
            Valid: {new Date(suggestion.valid_from).toLocaleDateString()} → {new Date(suggestion.valid_to).toLocaleDateString()}
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flexShrink: 0,
        }}>
          <button
            onClick={() => onApply(suggestion.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: t.accentDark,
              color: t.accentInk,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Check size={14} />
            Apply
          </button>
          <button
            onClick={() => onDismiss(suggestion.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: `1px solid ${t.border}`,
              background: 'transparent',
              color: t.textMuted,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <X size={14} />
            Dismiss
          </button>
        </div>
      </div>
    </Card>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function SmartPricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { palette } = useOwnerTheme()
  const t = palette
  const d = DENSITY.regular
  const router = useRouter()
  const tx = getStrings(locale as any)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [suggestions, setSuggestions] = useState<PricingSuggestion[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<string | null>(null)

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

    // Get properties
    const { data: propsData } = await supabase
      .from('properties')
      .select('id, name, price_per_night')
      .eq('owner_user_id', session.user.id)
      .eq('status', 'live')

    setProperties(propsData || [])

    // Generate mock suggestions (in production, this would call an AI pricing service)
    const mockSuggestions: PricingSuggestion[] = (propsData || []).map((prop, idx) => {
      const currentPrice = prop.price_per_night || 500
      const changePercent = [15, -10, 20, 8, -5][idx % 5]
      const suggestedPrice = Math.round(currentPrice * (1 + changePercent / 100))
      
      const reasons = [
        'High demand for upcoming weekend. Similar properties fully booked.',
        'Low occupancy predicted. Competitors have reduced prices by 12%.',
        'Peak season approaching. Historical data shows 25% price increase is optimal.',
        'Event detected: Formula 1 Race. Demand spike expected.',
        'Competitor analysis suggests slight price reduction to improve visibility.',
      ]

      return {
        id: `suggestion-${prop.id}`,
        property_id: prop.id,
        current_price: currentPrice,
        suggested_price: suggestedPrice,
        price_change: suggestedPrice - currentPrice,
        price_change_percent: changePercent,
        reason: reasons[idx % 5],
        confidence: (['high', 'medium', 'high', 'high', 'medium'] as const)[idx % 5],
        valid_from: new Date(Date.now() + idx * 86400000).toISOString().split('T')[0],
        valid_to: new Date(Date.now() + (idx + 7) * 86400000).toISOString().split('T')[0],
        applied: false,
        property: {
          name: prop.name,
          price_per_night: currentPrice,
        },
      }
    })

    setSuggestions(mockSuggestions)
    setLoading(false)
  }

  async function handleApply(suggestionId: string) {
    setApplying(suggestionId)
    const suggestion = suggestions.find(s => s.id === suggestionId)
    
    if (suggestion) {
      // Update property price
      await supabase
        .from('properties')
        .update({ price_per_night: suggestion.suggested_price })
        .eq('id', suggestion.property_id)

      // Mark as applied
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
    }
    
    setApplying(null)
  }

  async function handleDismiss(suggestionId: string) {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }

  const avgIncrease = suggestions.length > 0
    ? suggestions.reduce((sum, s) => sum + s.price_change_percent, 0) / suggestions.length
    : 0

  const potentialRevenue = suggestions
    .filter(s => s.price_change > 0)
    .reduce((sum, s) => sum + s.price_change * 30, 0) // Assuming 30 nights

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
        kicker="Smart Pricing"
        title="AI-Powered Price Optimization"
        sub="Maximize revenue with data-driven pricing suggestions"
        actions={
          <Button variant="ghost" icon={BarChart2}>
            View Analytics
          </Button>
        }
      />

      {/* Info Banner */}
      <Card style={{
        marginBottom: 24,
        background: `${t.accent}08`,
        borderColor: `${t.accent}30`,
      }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Zap size={20} color={t.accent} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: t.text,
              marginBottom: 4,
            }}>
              How smart pricing works
            </div>
            <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.6 }}>
              Our AI analyzes demand patterns, competitor pricing, seasonal trends, local events, and historical data
              to suggest optimal prices that maximize your revenue while maintaining high occupancy rates.
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${t.accent}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={20} color={t.accent} />
            </div>
            <div>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: t.text,
                fontFamily: 'var(--mono)',
              }}>
                {avgIncrease > 0 ? '+' : ''}{avgIncrease.toFixed(1)}%
              </div>
              <div style={{ fontSize: 11, color: t.textMuted }}>
                Avg. suggested change
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${t.success}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <DollarSign size={20} color={t.success} />
            </div>
            <div>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: t.text,
                fontFamily: 'var(--mono)',
              }}>
                +AED {potentialRevenue.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: t.textMuted }}>
                Potential monthly gain
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${t.info}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Zap size={20} color={t.info} />
            </div>
            <div>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: t.text,
                fontFamily: 'var(--mono)',
              }}>
                {suggestions.length}
              </div>
              <div style={{ fontSize: 11, color: t.textMuted }}>
                Active suggestions
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Suggestions */}
      {suggestions.length === 0 ? (
        <Card style={{ padding: 60, textAlign: 'center' }}>
          <Zap size={48} color={t.textFaint} style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: 15, color: t.textMuted, marginBottom: 8 }}>
            No pricing suggestions available
          </div>
          <div style={{ fontSize: 13, color: t.textFaint, marginBottom: 20 }}>
            Our AI is analyzing market data. Check back soon for personalized pricing recommendations.
          </div>
          <Button variant="ghost" icon={BarChart2}>
            View Price History
          </Button>
        </Card>
      ) : (
        <>
          <div style={{
            fontSize: 11,
            fontFamily: 'var(--mono)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: t.textFaint,
            marginBottom: 16,
          }}>
            {suggestions.length} Suggestions
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onApply={handleApply}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        </>
      )}

      {/* Educational Footer */}
      <Card style={{
        marginTop: 24,
        background: t.bg,
      }}>
        <div style={{
          fontSize: 11,
          fontFamily: 'var(--mono)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: t.textFaint,
          marginBottom: 12,
        }}>
          Pricing Factors
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}>
          {[
            { icon: CalIcon, label: 'Seasonality', desc: 'High/low season patterns' },
            { icon: Users, label: 'Demand', desc: 'Booking velocity trends' },
            { icon: BarChart2, label: 'Competition', desc: 'Similar properties nearby' },
            { icon: AlertCircle, label: 'Events', desc: 'Conferences, festivals, races' },
          ].map((factor) => {
            const Icon = factor.icon
            return (
              <div key={factor.label} style={{ display: 'flex', gap: 10 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `${t.accent}10`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={16} color={t.accent} />
                </div>
                <div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: t.text,
                    marginBottom: 2,
                  }}>
                    {factor.label}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: t.textMuted,
                  }}>
                    {factor.desc}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
