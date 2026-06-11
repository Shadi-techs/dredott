'use client'
// ============================================================
// Admin — Service Providers Management v2
// Re-submission tracking · Stats · Search · Category filter
// Full control: approve / reject / suspend / hide / feature
// ============================================================

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAdminDark } from '@/contexts/AdminDarkContext'
import {
  Check, X, Eye, EyeOff, Star,
  Phone, Globe, MapPin, Loader2,
  ShieldCheck, Crown, Search, RefreshCw,
  ChevronDown, AlertCircle, BarChart2,
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

type Filter = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminServiceProvidersPage() {
  const { dark } = useAdminDark()

  const [providers, setProviders]     = useState<any[]>([])
  const [categories, setCategories]   = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState<Filter>('pending')
  const [catFilter, setCatFilter]     = useState('')
  const [search, setSearch]           = useState('')
  const [processing, setProcessing]   = useState<string | null>(null)
  const [expandedId, setExpandedId]   = useState<string | null>(null)
  const [stats, setStats]             = useState({ total: 0, pending: 0, approved: 0, rejected: 0, resubmissions: 0 })
  const [seeding, setSeeding]         = useState(false)
  const [seedMsg, setSeedMsg]         = useState('')

  useEffect(() => {
    loadCategories()
    loadStats()
  }, [])
  useEffect(() => { fetchProviders() }, [filter, catFilter])

  const loadCategories = async () => {
    const { data } = await supabase.from('service_provider_categories').select('id, name_en, icon').eq('is_active', true).order('sort_order')
    setCategories(data || [])
  }

  const loadStats = async () => {
    const { data } = await supabase.from('service_providers').select('review_status, submission_count')
    if (!data) return
    setStats({
      total:         data.length,
      pending:       data.filter(p => p.review_status === 'pending').length,
      approved:      data.filter(p => p.review_status === 'approved').length,
      rejected:      data.filter(p => p.review_status === 'rejected').length,
      resubmissions: data.filter(p => (p.submission_count || 1) > 1).length,
    })
  }

  const fetchProviders = async () => {
    setLoading(true)
    let q = supabase
      .from('service_providers')
      .select('*, service_provider_categories(name_en, name_ar, icon), suggested_service')
      .order('created_at', { ascending: false })

    if (filter !== 'all') q = q.eq('review_status', filter)
    if (catFilter)        q = q.eq('category_id', catFilter)

    const { data } = await q
    setProviders(data || [])
    setLoading(false)
  }

  const approve = async (id: string) => {
    setProcessing(id)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('service_providers').update({
      review_status: 'approved', is_active: true, is_verified: true,
      reviewed_by: user?.id, reviewed_at: new Date().toISOString(),
    }).eq('id', id)
    setProcessing(null)
    fetchProviders()
    loadStats()
  }

  const reject = async (id: string, note?: string) => {
    setProcessing(id)
    const { data: { user } } = await supabase.auth.getUser()
    const promptNote = note || window.prompt('Rejection reason (optional):') || 'Application rejected.'
    await supabase.from('service_providers').update({
      review_status: 'rejected', is_active: false,
      reviewed_by: user?.id, reviewed_at: new Date().toISOString(),
      review_note: promptNote,
    }).eq('id', id)
    setProcessing(null)
    fetchProviders()
    loadStats()
  }

  const suspend = async (id: string) => {
    await supabase.from('service_providers').update({
      is_active: false, suspended_by_admin: true, review_status: 'rejected',
      review_note: 'Suspended by admin.',
    }).eq('id', id)
    fetchProviders()
    loadStats()
  }

  const updateVisibility = async (id: string, visibility: string) => {
    await supabase.from('service_providers').update({ visible_to: visibility }).eq('id', id)
    setProviders(prev => prev.map(p => p.id === id ? { ...p, visible_to: visibility } : p))
  }

  const seedCategories = async () => {
    setSeeding(true)
    setSeedMsg('')
    try {
      const res = await fetch('/api/admin/seed-categories', { method: 'POST' })
      const json = await res.json()
      if (json.ok) {
        setSeedMsg(`✓ ${json.inserted} categories seeded`)
        loadCategories()
      } else {
        setSeedMsg(`Error: ${json.error}`)
      }
    } catch {
      setSeedMsg('Network error')
    }
    setSeeding(false)
    setTimeout(() => setSeedMsg(''), 4000)
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('service_providers').update({ featured: !current }).eq('id', id)
    setProviders(prev => prev.map(p => p.id === id ? { ...p, featured: !current } : p))
  }

  const filtered = providers.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.business_name?.toLowerCase().includes(q) ||
      p.phone?.includes(q) ||
      p.email?.toLowerCase().includes(q)
    )
  })

  // ── Styles ─────────────────────────────────────────────────
  const bg    = dark ? '#080d1a' : '#F0F2F7'
  const card  = dark ? '#121929' : '#fff'
  const pcard = dark ? '#1e2d4f' : '#fff'
  const text  = dark ? '#e2e8f0' : '#1a2240'
  const muted = dark ? '#94a3b8' : '#6B7280'
  const brd   = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const inp   = { padding: '8px 12px', background: dark ? '#0e1428' : '#f9fafb', border: `1px solid ${brd}`, borderRadius: 10, color: text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' as const }

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '24px 20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.3em', color: '#D4A843', textTransform: 'uppercase', marginBottom: 4 }}>
            — Service Providers
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: dark ? '#FBF0D0' : text, fontWeight: 400 }}>
            Providers Management
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {seedMsg && (
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: seedMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>
              {seedMsg}
            </span>
          )}
          <button onClick={seedCategories} disabled={seeding}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: dark ? 'rgba(212,168,67,0.08)' : 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.25)', borderRadius: 10, color: '#D4A843', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", cursor: seeding ? 'wait' : 'pointer', letterSpacing: '0.05em' }}>
            {seeding ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : '⚙'}
            Seed 7 Categories
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Total',          value: stats.total,         color: '#7a8aaa' },
          { label: 'Pending',        value: stats.pending,       color: '#f59e0b' },
          { label: 'Approved',       value: stats.approved,      color: '#4ade80' },
          { label: 'Rejected',       value: stats.rejected,      color: '#f87171' },
          { label: 'Re-submissions', value: stats.resubmissions, color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} style={{ background: card, borderRadius: 12, padding: '14px 16px', border: `1px solid ${brd}` }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', color: muted, margin: '4px 0 0', textTransform: 'uppercase' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status filter */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['pending', 'approved', 'rejected', 'all'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize',
              background: filter === f ? '#2C3A6B' : dark ? 'rgba(255,255,255,0.04)' : '#fff',
              color: filter === f ? '#D4A843' : muted,
              border: filter === f ? '1px solid rgba(212,168,67,0.2)' : `1px solid ${brd}`,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {f}
              {f === 'pending' && stats.pending > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', borderRadius: 20, padding: '1px 5px', fontSize: 9, fontWeight: 700 }}>{stats.pending}</span>
              )}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          style={{ ...inp, width: 'auto', minWidth: 140, cursor: 'pointer' }}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name_en}</option>)}
        </select>

        {/* Search */}
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, email…"
            style={{ ...inp, paddingLeft: 30 }} />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={28} color="#D4A843" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: muted }}>No providers found</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(p => {
            const isResub   = (p.submission_count || 1) > 1
            const isExpanded = expandedId === p.id
            const catLabel  = p.service_provider_categories?.name_en
            const catIcon   = p.service_provider_categories?.icon

            return (
              <div key={p.id} style={{
                background: pcard,
                border: `1px solid ${
                  p.review_status === 'pending'  ? (isResub ? 'rgba(167,139,250,0.3)' : 'rgba(245,158,11,0.25)') :
                  p.review_status === 'approved' ? 'rgba(74,222,128,0.12)' : brd
                }`,
                borderRadius: 14, padding: '16px 18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>

                  {/* Logo */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#2C3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, overflow: 'hidden' }}>
                    {p.logo_url ? <img src={p.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : catIcon || '🏢'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: dark ? '#FBF0D0' : text }}>{p.business_name}</span>

                      {catLabel && (
                        <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', color: '#D4A843' }}>
                          {catLabel.toUpperCase()}
                        </span>
                      )}

                      {/* Re-submission badge */}
                      {isResub && (
                        <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)', padding: '2px 7px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <RefreshCw size={9} /> RE-SUBMISSION #{p.submission_count}
                        </span>
                      )}

                      {/* Suspension badge */}
                      {p.suspended_by_admin && (
                        <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', padding: '2px 7px', borderRadius: 20 }}>
                          SUSPENDED
                        </span>
                      )}

                      {/* Plan */}
                      <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, fontFamily: "'JetBrains Mono', monospace", background: p.plan_type === 'premium' ? 'rgba(212,168,67,0.1)' : dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: p.plan_type === 'premium' ? '#D4A843' : muted, border: `1px solid ${p.plan_type === 'premium' ? 'rgba(212,168,67,0.2)' : brd}` }}>
                        {p.plan_type}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                      {p.phone && <span style={{ fontSize: 12, color: muted, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} />{p.phone}</span>}
                      {p.area  && <span style={{ fontSize: 12, color: muted, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{p.area.replace(/_/g,' ')}</span>}
                      {p.website_url && <a href={p.website_url} target="_blank" rel="noopener" style={{ fontSize: 12, color: '#2A9D8F', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}><Globe size={11} />Website</a>}
                      {p.rating_count > 0 && <span style={{ fontSize: 12, color: '#D4A843', display: 'flex', alignItems: 'center', gap: 4 }}><Star size={11} fill="#D4A843" />{p.rating_avg?.toFixed(1)} ({p.rating_count})</span>}
                      <span style={{ fontSize: 11, color: muted }}>{new Date(p.created_at).toLocaleDateString('en-GB')}</span>
                    </div>

                    {p.description && (
                      <p style={{ fontSize: 12, color: muted, lineHeight: 1.5, marginBottom: 8, maxWidth: 480 }}>{p.description.slice(0, 120)}{p.description.length > 120 ? '…' : ''}</p>
                    )}

                    {/* Sub-services tags */}
                    {p.services_offered?.length > 0 && (
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                        {(p.services_offered as string[]).map((s: string) => (
                          <span key={s} style={{ fontSize: 10, padding: '2px 8px', background: dark ? 'rgba(44,58,107,0.5)' : 'rgba(44,58,107,0.08)', color: dark ? '#93c5fd' : '#2C3A6B', borderRadius: 10 }}>
                            {s.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Suggested service */}
                    {p.suggested_service && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '8px 12px', background: 'rgba(212,168,67,0.07)', border: '1px dashed rgba(212,168,67,0.3)', borderRadius: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 13, flexShrink: 0 }}>💡</span>
                        <div>
                          <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', color: '#D4A843', margin: '0 0 3px', textTransform: 'uppercase' }}>Service Suggestion</p>
                          <p style={{ fontSize: 13, color: dark ? '#FBF0D0' : text, margin: 0 }}>{p.suggested_service}</p>
                        </div>
                      </div>
                    )}

                    {/* Re-submission diff indicator */}
                    {isResub && p.previous_snapshot && (
                      <button onClick={() => setExpandedId(isExpanded ? null : p.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 8 }}>
                        <ChevronDown size={12} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                        {isExpanded ? 'Hide' : 'Show'} previous vs current
                      </button>
                    )}

                    {/* Diff view */}
                    {isExpanded && p.previous_snapshot && (
                      <div style={{ background: dark ? 'rgba(167,139,250,0.05)' : 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 12 }}>
                        <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#a78bfa', letterSpacing: '0.1em', marginBottom: 8 }}>CHANGED FIELDS</p>
                        {Object.entries(p.previous_snapshot).map(([k, prev]: [string, any]) => {
                          const current = p[k]
                          const changed = JSON.stringify(prev) !== JSON.stringify(current)
                          if (!changed) return null
                          return (
                            <div key={k} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: 6, marginBottom: 6, alignItems: 'start' }}>
                              <span style={{ color: muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{k}</span>
                              <span style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)', padding: '2px 6px', borderRadius: 6, wordBreak: 'break-all' }}>−{String(prev || '—')}</span>
                              <span style={{ color: '#4ade80', background: 'rgba(74,222,128,0.08)', padding: '2px 6px', borderRadius: 6, wordBreak: 'break-all' }}>+{String(current || '—')}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Review note */}
                    {p.review_note && p.review_status === 'rejected' && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 8 }}>
                        <AlertCircle size={12} color="#f87171" style={{ marginTop: 2, flexShrink: 0 }} />
                        <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{p.review_note}</p>
                      </div>
                    )}

                    {/* Controls row */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {p.review_status === 'approved' && (
                        <>
                          <select value={p.visible_to || 'all'} onChange={e => updateVisibility(p.id, e.target.value)}
                            style={{ padding: '4px 8px', background: dark ? '#0e1428' : '#f9fafb', border: `1px solid ${brd}`, borderRadius: 8, color: text, fontSize: 12, cursor: 'pointer', outline: 'none' }}>
                            {VISIBILITY_OPTIONS.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                          </select>
                          <button onClick={() => toggleFeatured(p.id, p.featured)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, background: p.featured ? 'rgba(212,168,67,0.1)' : dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: `1px solid ${p.featured ? 'rgba(212,168,67,0.25)' : brd}`, color: p.featured ? '#D4A843' : muted }}>
                            <Crown size={11} /> {p.featured ? 'Featured' : 'Feature'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0 }}>
                    {p.review_status === 'pending' && (
                      <>
                        <button onClick={() => approve(p.id)} disabled={processing === p.id}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, color: '#4ade80', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          {processing === p.id ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={13} />}
                          Approve
                        </button>
                        <button onClick={() => reject(p.id)} disabled={processing === p.id}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 12 }}>
                          <X size={13} /> Reject
                        </button>
                      </>
                    )}
                    {p.review_status === 'approved' && (
                      <button onClick={() => suspend(p.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 12 }}>
                        <EyeOff size={12} /> Suspend
                      </button>
                    )}
                    {p.review_status === 'rejected' && (
                      <button onClick={() => approve(p.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 8, color: '#4ade80', cursor: 'pointer', fontSize: 12 }}>
                        <ShieldCheck size={12} /> Re-approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
