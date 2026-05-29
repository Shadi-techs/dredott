// ============================================
// Admin Service Providers Management
// Path: src/app/[locale]/admin/service-providers/page.tsx
// Review, approve, reject, manage visibility
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import {
  Check, X, Eye, EyeOff, Star,
  Phone, Globe, MapPin, Loader2,
  ShieldCheck, Crown, Filter
} from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const VISIBILITY_OPTIONS = [
  { id: 'all',   label: 'Everyone' },
  { id: 'guest', label: 'Guests only' },
  { id: 'owner', label: 'Owners only' },
  { id: 'none',  label: 'Hidden' },
]

export default function AdminServiceProvidersPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<'all'|'pending'|'approved'|'rejected'>('pending')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => { fetchProviders() }, [filter])

  const fetchProviders = async () => {
    setLoading(true)
    let query = supabase
      .from('service_providers')
      .select('*, service_categories(name_en, icon)')
      .order('created_at', { ascending: false })

    if (filter !== 'all') query = query.eq('review_status', filter)

    const { data } = await query
    setProviders(data || [])
    setLoading(false)
  }

  const approve = async (id: string) => {
    setProcessing(id)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('service_providers').update({
      review_status: 'approved',
      is_active: true,
      is_verified: true,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id)

    // Notify provider (via admin_notifications for now)
    await supabase.from('admin_notifications').insert({
      type: 'provider_approved',
      title: 'Service provider approved',
      body: `Provider has been approved and is now live.`,
    })

    setProcessing(null)
    fetchProviders()
  }

  const reject = async (id: string, note?: string) => {
    setProcessing(id)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('service_providers').update({
      review_status: 'rejected',
      is_active: false,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      review_note: note || 'Application rejected.',
    }).eq('id', id)
    setProcessing(null)
    fetchProviders()
  }

  const updateVisibility = async (id: string, visibility: string) => {
    await supabase.from('service_providers').update({ visible_to: visibility }).eq('id', id)
    setProviders(prev => prev.map(p => p.id === id ? { ...p, visible_to: visibility } : p))
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('service_providers').update({ featured: !current }).eq('id', id)
    setProviders(prev => prev.map(p => p.id === id ? { ...p, featured: !current } : p))
  }

  const pendingCount  = providers.filter(p => p.review_status === 'pending').length

  return (
    <div style={{ minHeight: '100vh', background: '#0e1428', padding: '28px 32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={eyebrow}>— Service Providers</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#FBF0D0', fontWeight: 400 }}>
            Providers Management
          </h1>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
            background: filter === f ? '#2C3A6B' : 'rgba(255,255,255,0.04)',
            color: filter === f ? '#D4A843' : '#7a8aaa',
            border: filter === f ? '1px solid rgba(212,168,67,0.2)' : '1px solid rgba(255,255,255,0.06)',
            textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {f}
            {f === 'pending' && pendingCount > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', borderRadius: 20, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={28} color="#D4A843" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : providers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#7a8aaa' }}>
          No providers in this category
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {providers.map(p => (
            <div key={p.id} style={{
              background: '#1a2240',
              border: `1px solid ${p.review_status === 'pending' ? 'rgba(245,158,11,0.2)' : p.review_status === 'approved' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)'}`,
              borderRadius: 14, padding: '18px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>

                {/* Logo / Icon */}
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#2C3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {p.logo_url
                    ? <img src={p.logo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: 12, objectFit: 'cover' }} />
                    : p.service_categories?.icon || '🏢'
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#FBF0D0' }}>{p.business_name}</p>
                    <span style={{ fontSize: 10, color: '#D4A843', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {p.service_categories?.name_en}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
                    {p.phone && (
                      <span style={{ fontSize: 12, color: '#7a8aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={12} /> {p.phone}
                      </span>
                    )}
                    {p.area && (
                      <span style={{ fontSize: 12, color: '#7a8aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} /> {p.area.replace(/_/g, ' ')}
                      </span>
                    )}
                    {p.website_url && (
                      <a href={p.website_url} target="_blank" rel="noopener" style={{ fontSize: 12, color: '#2A9D8F', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                        <Globe size={12} /> Website
                      </a>
                    )}
                    {p.rating_count > 0 && (
                      <span style={{ fontSize: 12, color: '#D4A843', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} fill="#D4A843" /> {p.rating_avg?.toFixed(1)} ({p.rating_count})
                      </span>
                    )}
                  </div>

                  {p.description && (
                    <p style={{ fontSize: 12, color: '#7a8aaa', lineHeight: 1.5, marginBottom: 8 }}>{p.description}</p>
                  )}

                  {/* Controls row */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>

                    {/* Visibility */}
                    {p.review_status === 'approved' && (
                      <select
                        value={p.visible_to || 'all'}
                        onChange={e => updateVisibility(p.id, e.target.value)}
                        style={{ padding: '5px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 12, cursor: 'pointer', outline: 'none' }}
                      >
                        {VISIBILITY_OPTIONS.map(v => (
                          <option key={v.id} value={v.id}>{v.label}</option>
                        ))}
                      </select>
                    )}

                    {/* Featured toggle */}
                    {p.review_status === 'approved' && (
                      <button onClick={() => toggleFeatured(p.id, p.featured)} style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                        background: p.featured ? 'rgba(212,168,67,0.1)' : 'rgba(255,255,255,0.04)',
                        border: p.featured ? '1px solid rgba(212,168,67,0.25)' : '1px solid rgba(255,255,255,0.06)',
                        color: p.featured ? '#D4A843' : '#7a8aaa',
                      }}>
                        <Crown size={12} /> {p.featured ? 'Featured' : 'Feature'}
                      </button>
                    )}

                    {/* Plan badge */}
                    <span style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 20,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: p.plan_type === 'premium' ? 'rgba(212,168,67,0.1)' : 'rgba(255,255,255,0.05)',
                      color: p.plan_type === 'premium' ? '#D4A843' : '#7a8aaa',
                      border: `1px solid ${p.plan_type === 'premium' ? 'rgba(212,168,67,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                      {p.plan_type}
                    </span>

                    {/* Registered date */}
                    <span style={{ fontSize: 11, color: '#7a8aaa' }}>
                      {new Date(p.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {p.review_status === 'pending' && (
                    <>
                      <button
                        onClick={() => approve(p.id)}
                        disabled={processing === p.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, color: '#4ade80', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                      >
                        {processing === p.id ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={14} />}
                        Approve
                      </button>
                      <button
                        onClick={() => reject(p.id)}
                        disabled={processing === p.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 13 }}
                      >
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}

                  {p.review_status === 'approved' && (
                    <button
                      onClick={() => reject(p.id, 'Suspended by admin.')}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 12 }}
                    >
                      <EyeOff size={13} /> Suspend
                    </button>
                  )}

                  {p.review_status === 'rejected' && (
                    <button
                      onClick={() => approve(p.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 8, color: '#4ade80', cursor: 'pointer', fontSize: 12 }}
                    >
                      <Check size={13} /> Re-approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const eyebrow: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9, letterSpacing: '0.3em',
  textTransform: 'uppercase', color: '#D4A843', marginBottom: 6,
}