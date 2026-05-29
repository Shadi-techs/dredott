// ============================================
// Admin Ads Manager Page
// Path: src/app/[locale]/admin/ads/page.tsx
// Super admin + admin — full control over ads
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import {
  Plus, Edit2, Trash2, Eye, EyeOff,
  MousePointerClick, BarChart2, X, Loader2, Check
} from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TARGETS = [
  { id: 'all',   label: 'Everyone',         emoji: '🌍' },
  { id: 'guest', label: 'Guests / Visitors', emoji: '👤' },
  { id: 'owner', label: 'Property Owners',   emoji: '🏠' },
]

const PLACEMENTS = [
  { id: 'banner',    label: 'Top Banner',       desc: 'Full-width bar above content' },
  { id: 'card',      label: 'Inline Card',       desc: 'Inside listing detail pages' },
  { id: 'dashboard', label: 'Owner Dashboard',   desc: 'Shown in owner portal' },
]

interface Ad {
  id: string; title: string; body: string | null
  image_url: string | null; cta_label: string; cta_url: string | null
  target: string; placement: string
  bg_color: string; text_color: string; cta_color: string
  is_active: boolean; starts_at: string; ends_at: string | null
  view_count: number; click_count: number; created_at: string
}

const EMPTY_FORM = {
  title: '', body: '', image_url: '', cta_label: 'Learn More', cta_url: '',
  target: 'all', placement: 'banner',
  bg_color: '#0e1428', text_color: '#FBF0D0', cta_color: '#D4A843',
  starts_at: '', ends_at: '',
}

export default function AdsManagerPage() {
  const [ads, setAds]           = useState<Ad[]>([])
  const [loading, setLoading]   = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [editAd, setEditAd]     = useState<Ad | null>(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [filter, setFilter]     = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => { fetchAds() }, [])

  const fetchAds = async () => {
    const { data } = await supabase
      .from('ads').select('*')
      .order('created_at', { ascending: false })
    setAds(data || [])
    setLoading(false)
  }

  const openNew = () => {
    setEditAd(null)
    setForm(EMPTY_FORM)
    setShowEditor(true)
  }

  const openEdit = (ad: Ad) => {
    setEditAd(ad)
    setForm({
      title:      ad.title,
      body:       ad.body || '',
      image_url:  ad.image_url || '',
      cta_label:  ad.cta_label,
      cta_url:    ad.cta_url || '',
      target:     ad.target,
      placement:  ad.placement,
      bg_color:   ad.bg_color,
      text_color: ad.text_color,
      cta_color:  ad.cta_color,
      starts_at:  ad.starts_at?.slice(0, 16) || '',
      ends_at:    ad.ends_at?.slice(0, 16) || '',
    })
    setShowEditor(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    const payload = {
      title:      form.title,
      body:       form.body || null,
      image_url:  form.image_url || null,
      cta_label:  form.cta_label,
      cta_url:    form.cta_url || null,
      target:     form.target,
      placement:  form.placement,
      bg_color:   form.bg_color,
      text_color: form.text_color,
      cta_color:  form.cta_color,
      starts_at:  form.starts_at || new Date().toISOString(),
      ends_at:    form.ends_at || null,
      created_by: user?.id,
    }

    if (editAd) {
      await supabase.from('ads').update(payload).eq('id', editAd.id)
    } else {
      await supabase.from('ads').insert(payload)
    }

    setSaving(false)
    setShowEditor(false)
    fetchAds()
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('ads').update({ is_active: !current }).eq('id', id)
    setAds(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a))
  }

  const deleteAd = async (id: string) => {
    if (!confirm('Delete this ad?')) return
    await supabase.from('ads').delete().eq('id', id)
    setAds(prev => prev.filter(a => a.id !== id))
  }

  const filteredAds = ads.filter(a => {
    if (filter === 'active')   return a.is_active
    if (filter === 'inactive') return !a.is_active
    return true
  })

  const totalViews  = ads.reduce((s, a) => s + a.view_count, 0)
  const totalClicks = ads.reduce((s, a) => s + a.click_count, 0)
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0'

  const F = (field: keyof typeof EMPTY_FORM, val: string) =>
    setForm(f => ({ ...f, [field]: val }))

  return (
    <div style={{ minHeight: '100vh', background: '#0e1428', padding: '28px 32px' }}>

      {/* Editor Modal */}
      {showEditor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>
          <div style={{ background: '#1a2240', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 16, width: '100%', maxWidth: 600, padding: 28 }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#FBF0D0', fontWeight: 400 }}>
                {editAd ? 'Edit Ad' : 'New Ad'}
              </h2>
              <button onClick={() => setShowEditor(false)} style={{ background: 'none', border: 'none', color: '#7a8aaa', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Target + Placement */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Show to</label>
                  <select value={form.target} onChange={e => F('target', e.target.value)} style={sel}>
                    {TARGETS.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Placement</label>
                  <select value={form.placement} onChange={e => F('placement', e.target.value)} style={sel}>
                    {PLACEMENTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={lbl}>Title *</label>
                <input value={form.title} onChange={e => F('title', e.target.value)}
                  placeholder="Ad headline" style={inp} />
              </div>

              {/* Body */}
              <div>
                <label style={lbl}>Body text</label>
                <textarea value={form.body} onChange={e => F('body', e.target.value)}
                  rows={2} placeholder="Short description..." style={{ ...inp, resize: 'none' as const }} />
              </div>

              {/* CTA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>CTA Button Label</label>
                  <input value={form.cta_label} onChange={e => F('cta_label', e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={lbl}>CTA URL</label>
                  <input value={form.cta_url} onChange={e => F('cta_url', e.target.value)}
                    placeholder="/en/pricing" style={inp} />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label style={lbl}>Image URL (optional)</label>
                <input value={form.image_url} onChange={e => F('image_url', e.target.value)}
                  placeholder="https://..." style={inp} />
              </div>

              {/* Colors */}
              <div>
                <label style={lbl}>Colors</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {[
                    { label: 'Background', field: 'bg_color' as const },
                    { label: 'Text',       field: 'text_color' as const },
                    { label: 'CTA Button', field: 'cta_color' as const },
                  ].map(c => (
                    <div key={c.field} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="color" value={form[c.field]} onChange={e => F(c.field, e.target.value)}
                        style={{ width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none', padding: 0 }} />
                      <span style={{ fontSize: 11, color: '#7a8aaa' }}>{c.label}</span>
                    </div>
                  ))}

                  {/* Preview */}
                  <div style={{
                    flex: 1, background: form.bg_color, borderRadius: 8,
                    padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: 11, color: form.text_color, flex: 1 }}>{form.title || 'Preview'}</span>
                    <span style={{ fontSize: 10, background: form.cta_color, color: form.bg_color, padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                      {form.cta_label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Start date (empty = now)</label>
                  <input type="datetime-local" value={form.starts_at} onChange={e => F('starts_at', e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={lbl}>End date (empty = forever)</label>
                  <input type="datetime-local" value={form.ends_at} onChange={e => F('ends_at', e.target.value)} style={inp} />
                </div>
              </div>

              <button onClick={handleSave} disabled={saving} style={{
                marginTop: 8, padding: 12, background: '#D4A843', color: '#0e1428',
                border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {saving ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={16} />}
                {editAd ? 'Save Changes' : 'Create Ad'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={eyebrow}>— Ads Manager</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#FBF0D0', fontWeight: 400 }}>Advertisements</h1>
        </div>
        <button onClick={openNew} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', background: '#D4A843', color: '#0e1428',
          border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13,
        }}>
          <Plus size={15} /> New Ad
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Ads',    value: ads.length,                             color: '#D4A843' },
          { label: 'Active',       value: ads.filter(a => a.is_active).length,    color: '#4ade80' },
          { label: 'Total Views',  value: totalViews.toLocaleString(),            color: '#60a5fa' },
          { label: 'CTR',          value: `${ctr}%`,                              color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#1a2240', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#7a8aaa', marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all', 'active', 'inactive'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
            background: filter === f ? '#2C3A6B' : 'rgba(255,255,255,0.04)',
            color: filter === f ? '#D4A843' : '#7a8aaa',
            border: filter === f ? '1px solid rgba(212,168,67,0.2)' : '1px solid rgba(255,255,255,0.06)',
            textTransform: 'capitalize',
          }}>{f}</button>
        ))}
      </div>

      {/* Ads list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={28} color="#D4A843" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : filteredAds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#7a8aaa' }}>No ads found</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredAds.map(ad => {
            const target    = TARGETS.find(t => t.id === ad.target)
            const placement = PLACEMENTS.find(p => p.id === ad.placement)
            const ctr       = ad.view_count > 0 ? ((ad.click_count / ad.view_count) * 100).toFixed(1) : '0'

            return (
              <div key={ad.id} style={{
                background: '#1a2240',
                border: `1px solid ${ad.is_active ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)'}`,
                borderRadius: 12, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
                opacity: ad.is_active ? 1 : 0.55,
              }}>

                {/* Color swatch */}
                <div style={{ width: 40, height: 40, borderRadius: 8, background: ad.bg_color, flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#FBF0D0', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ad.title}
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#7a8aaa' }}>{target?.emoji} {target?.label}</span>
                    <span style={{ fontSize: 11, color: '#7a8aaa' }}>📍 {placement?.label}</span>
                    <span style={{ fontSize: 11, color: '#60a5fa' }}>
                      <Eye size={10} style={{ display: 'inline', marginRight: 3 }} />{ad.view_count}
                    </span>
                    <span style={{ fontSize: 11, color: '#f59e0b' }}>
                      <MousePointerClick size={10} style={{ display: 'inline', marginRight: 3 }} />{ad.click_count} ({ctr}%)
                    </span>
                    {ad.ends_at && (
                      <span style={{ fontSize: 11, color: new Date(ad.ends_at) < new Date() ? '#f87171' : '#7a8aaa' }}>
                        Ends {new Date(ad.ends_at).toLocaleDateString('en-GB')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <span style={{
                  fontSize: 10, padding: '3px 10px', borderRadius: 20,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: ad.is_active ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                  color: ad.is_active ? '#4ade80' : '#7a8aaa',
                  border: `1px solid ${ad.is_active ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                  {ad.is_active ? 'live' : 'off'}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(ad)} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#7a8aaa', cursor: 'pointer' }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => toggleActive(ad.id, ad.is_active)} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: ad.is_active ? '#fbbf24' : '#4ade80', cursor: 'pointer' }}>
                    {ad.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => deleteAd(ad.id)} style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, color: '#f87171', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
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

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 10,
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: '0.2em', textTransform: 'uppercase',
  color: '#7a8aaa', marginBottom: 6,
}
const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8, color: '#fff', fontSize: 13,
  boxSizing: 'border-box' as const, outline: 'none',
}
const sel: React.CSSProperties = {
  ...{
    width: '100%', padding: '10px 14px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, color: '#fff', fontSize: 13,
    boxSizing: 'border-box' as const, outline: 'none',
  }
}
const eyebrow: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9, letterSpacing: '0.3em',
  textTransform: 'uppercase', color: '#D4A843', marginBottom: 6,
}