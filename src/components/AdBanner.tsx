// ============================================
// AdBanner Component
// Path: src/components/AdBanner.tsx
// Usage:
//   <AdBanner placement="banner" />   ← in properties/cars pages
//   <AdBanner placement="dashboard" /> ← in owner dashboard
//   <AdBanner placement="card" />      ← inside listing pages
//
// Automatically targets based on user role:
//   - not logged in → shows 'all' + 'guest' ads
//   - guest role    → shows 'all' + 'guest' ads
//   - owner role    → shows 'all' + 'owner' ads
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { X, ExternalLink } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Ad {
  id: string
  title: string
  body: string | null
  image_url: string | null
  cta_label: string
  cta_url: string | null
  target: string
  placement: string
  bg_color: string
  text_color: string
  cta_color: string
}

interface Props {
  placement: 'banner' | 'card' | 'dashboard'
  className?: string
}

export default function AdBanner({ placement }: Props) {
  const [ad, setAd]             = useState<Ad | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [userTarget, setUserTarget] = useState<'guest' | 'owner' | 'all'>('all')

  useEffect(() => {
    // Get user role first
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: prof } = await supabase
          .from('profiles').select('role').eq('id', data.user.id).single()
        setUserTarget(prof?.role === 'property_owner' ? 'owner' : 'guest')
      } else {
        setUserTarget('guest')
      }
    })
  }, [])

  useEffect(() => {
    if (!userTarget) return
    fetchAd()
  }, [userTarget, placement])

  const fetchAd = async () => {
    // Fetch ads matching placement + target (all or specific)
    const { data } = await supabase
      .from('ads')
      .select('*')
      .eq('placement', placement)
      .eq('is_active', true)
      .in('target', ['all', userTarget])
      .order('created_at', { ascending: false })
      .limit(5)

    if (!data || data.length === 0) return

    // Pick random ad from matching ones
    const picked = data[Math.floor(Math.random() * data.length)]
    setAd(picked)

    // Track view
    await supabase.rpc('increment_ad_view', { p_ad_id: picked.id })
  }

  const handleClick = async () => {
    if (!ad) return
    await supabase.rpc('increment_ad_click', { p_ad_id: ad.id })
    if (ad.cta_url) window.location.href = ad.cta_url
  }

  if (!ad || dismissed) return null

  // ── BANNER style ──────────────────────────────────────────
  if (placement === 'banner') return (
    <div style={{
      background: ad.bg_color,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '12px 24px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: 20,
      position: 'relative',
    }}>
      {ad.image_url && (
        <img src={ad.image_url} alt="" style={{ height: 32, borderRadius: 6, objectFit: 'cover' }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <p style={{ fontSize: 13, color: ad.text_color, fontWeight: 500 }}>
          <strong>{ad.title}</strong>
          {ad.body && <span style={{ opacity: 0.8 }}> — {ad.body}</span>}
        </p>
        {ad.cta_url && (
          <button onClick={handleClick} style={{
            padding: '5px 14px', background: ad.cta_color,
            color: ad.bg_color, border: 'none', borderRadius: 20,
            fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
          }}>
            {ad.cta_label}
          </button>
        )}
      </div>
      <button onClick={() => setDismissed(true)} style={{
        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer',
        color: ad.text_color, opacity: 0.5, padding: 4,
      }}>
        <X size={14} />
      </button>
    </div>
  )

  // ── DASHBOARD style ───────────────────────────────────────
  if (placement === 'dashboard') return (
    <div style={{
      background: ad.bg_color,
      border: '1px solid rgba(212,168,67,0.15)',
      borderRadius: 14, padding: '20px 24px',
      display: 'flex', alignItems: 'center',
      gap: 20, position: 'relative',
    }}>
      {ad.image_url && (
        <img src={ad.image_url} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: ad.text_color, marginBottom: 4 }}>{ad.title}</p>
        {ad.body && <p style={{ fontSize: 13, color: ad.text_color, opacity: 0.7, lineHeight: 1.5 }}>{ad.body}</p>}
      </div>
      {ad.cta_url && (
        <button onClick={handleClick} style={{
          padding: '9px 20px', background: ad.cta_color,
          color: ad.bg_color, border: 'none', borderRadius: 10,
          fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {ad.cta_label} <ExternalLink size={13} />
        </button>
      )}
      <button onClick={() => setDismissed(true)} style={{
        position: 'absolute', top: 10, right: 10,
        background: 'none', border: 'none', cursor: 'pointer',
        color: ad.text_color, opacity: 0.4, padding: 4,
      }}>
        <X size={14} />
      </button>
    </div>
  )

  // ── CARD style ────────────────────────────────────────────
  return (
    <div style={{
      background: ad.bg_color,
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14, padding: '16px 18px',
      position: 'relative',
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: ad.text_color, marginBottom: 4 }}>{ad.title}</p>
      {ad.body && <p style={{ fontSize: 12, color: ad.text_color, opacity: 0.7, marginBottom: 12, lineHeight: 1.5 }}>{ad.body}</p>}
      {ad.cta_url && (
        <button onClick={handleClick} style={{
          padding: '7px 16px', background: ad.cta_color,
          color: ad.bg_color, border: 'none', borderRadius: 8,
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>
          {ad.cta_label}
        </button>
      )}
      <button onClick={() => setDismissed(true)} style={{
        position: 'absolute', top: 8, right: 8,
        background: 'none', border: 'none', cursor: 'pointer',
        color: ad.text_color, opacity: 0.4, padding: 4,
      }}>
        <X size={12} />
      </button>
    </div>
  )
}