// ============================================
// Notify Me — Red Sea Deals
// Path: src/components/NotifyMeDeals.tsx
// Guests/Owners subscribe to deal alerts by area
// Visitors cannot use this (redirect to login)
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Bell, BellOff, Check, Zap } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const AREAS = [
  { slug: 'naama_bay',  label: 'Naama Bay' },
  { slug: 'sharks_bay', label: 'Sharks Bay' },
  { slug: 'hadaba',     label: 'Hadaba' },
  { slug: 'montazah',   label: 'Montazah' },
  { slug: 'nabq',       label: 'Nabq Bay' },
  { slug: 'um_el_sid',  label: 'Um El Sid' },
  { slug: 'el_salam',   label: 'El Salam' },
  { slug: 'old_market', label: 'Old Market' },
]

interface Props {
  compact?: boolean  // compact = inline button, full = modal trigger
}

export default function NotifyMeDeals({ compact = false }: Props) {
  const router = useRouter()
  const [user, setUser]                 = useState<any>(null)
  const [subscribed, setSubscribed]     = useState<string[]>([])
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [saving, setSaving]             = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) fetchSubscriptions(data.user.id)
      else setLoading(false)
    })
  }, [])

  const fetchSubscriptions = async (userId: string) => {
    const { data } = await supabase
      .from('deal_area_subscriptions')
      .select('area')
      .eq('user_id', userId)
      .eq('is_active', true)
    setSubscribed((data || []).map(d => d.area))
    setLoading(false)
  }

  const toggleArea = async (area: string) => {
    if (!user) { router.push('/en/login?reason=notify_me'); return }
    setSaving(area)
    const isSubscribed = subscribed.includes(area)

    if (isSubscribed) {
      await supabase.from('deal_area_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('area', area)
      setSubscribed(prev => prev.filter(a => a !== area))
    } else {
      await supabase.from('deal_area_subscriptions')
        .upsert({ user_id: user.id, area, is_active: true }, { onConflict: 'user_id,area' })
      setSubscribed(prev => [...prev, area])
    }
    setSaving(null)
  }

  const anySubscribed = subscribed.length > 0

  // ── Compact button ─────────────────────────────────────────
  if (compact) return (
    <>
      <button
        onClick={() => user ? setShowModal(true) : router.push('/en/login?reason=notify_me')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 20,
          background: anySubscribed ? 'rgba(212,168,67,0.1)' : 'rgba(0,0,0,0.04)',
          border: anySubscribed ? '1px solid rgba(212,168,67,0.3)' : '1px solid rgba(0,0,0,0.08)',
          color: anySubscribed ? '#D4A843' : '#6b7280',
          fontSize: 13, fontWeight: anySubscribed ? 600 : 400,
          cursor: 'pointer',
        }}
      >
        {anySubscribed ? <Bell size={14} fill="currentColor" /> : <Bell size={14} />}
        {anySubscribed ? `Alerts on (${subscribed.length})` : 'Notify me — Red Sea Deals'}
      </button>

      {showModal && <Modal subscribed={subscribed} saving={saving} onToggle={toggleArea} onClose={() => setShowModal(false)} />}
    </>
  )

  // ── Full inline ────────────────────────────────────────────
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(212,168,67,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={18} color="#D4A843" />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#2C3A6B' }}>Red Sea Deals Alerts</p>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>Get notified when limited offers drop in your preferred areas</p>
        </div>
      </div>

      {!user ? (
        <button onClick={() => router.push('/en/login?reason=notify_me')} style={{ width: '100%', padding: '10px', background: '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Sign in to enable alerts
        </button>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {AREAS.map(area => {
            const isOn = subscribed.includes(area.slug)
            const isSaving = saving === area.slug
            return (
              <button
                key={area.slug}
                onClick={() => toggleArea(area.slug)}
                disabled={!!saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                  background: isOn ? '#2C3A6B' : '#f3f4f6',
                  color: isOn ? '#D4A843' : '#555',
                  border: isOn ? '1px solid #2C3A6B' : '1px solid transparent',
                  opacity: isSaving ? 0.6 : 1,
                  transition: 'all 0.15s',
                }}
              >
                {isOn ? <Bell size={12} fill="currentColor" /> : <Bell size={12} />}
                {area.label}
                {isOn && <Check size={11} />}
              </button>
            )
          })}
        </div>
      )}

      {anySubscribed && (
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 10 }}>
          Alerts active for {subscribed.length} area{subscribed.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}

function Modal({ subscribed, saving, onToggle, onClose }: {
  subscribed: string[]; saving: string | null
  onToggle: (area: string) => void; onClose: () => void
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Zap size={20} color="#D4A843" />
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#2C3A6B', fontWeight: 400 }}>
            Red Sea Deal Alerts
          </h2>
        </div>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>
          Choose areas to get notified when limited-time offers drop.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {AREAS.map(area => {
            const isOn = subscribed.includes(area.slug)
            return (
              <button key={area.slug} onClick={() => onToggle(area.slug)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                  background: isOn ? '#2C3A6B' : '#f3f4f6',
                  color: isOn ? '#D4A843' : '#555',
                  border: isOn ? '1px solid #2C3A6B' : '1px solid transparent',
                }}>
                {isOn ? <Bell size={12} fill="currentColor" /> : <Bell size={12} />}
                {area.label}
              </button>
            )
          })}
        </div>
        <button onClick={onClose} style={{ width: '100%', padding: '10px', background: '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Done
        </button>
      </div>
    </div>
  )
}