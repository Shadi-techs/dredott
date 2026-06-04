// ============================================
// Courtesy Listings Manager
// Path: src/app/[locale]/admin/courtesy/page.tsx
// Super Admin only — managed listings with DREDOTT badge
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import {
  Crown, Plus, Trash2, Infinity,
  Building2, Car, X, Loader2, Check, Lock
} from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Courtesy {
  id: string
  property_id: string | null
  car_id: string | null
  owner_id: string | null
  badge_label: string
  badge_color: string
  is_lifetime: boolean
  starts_at: string
  ends_at: string | null
  notes: string | null
  created_at: string
  property_name?: string
  car_name?: string
}

export default function CourtesyPage() {
  const router = useRouter()
  const [listings, setListings]   = useState<Courtesy[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [cars, setCars]           = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  const [form, setForm] = useState({
    type:        'property' as 'property' | 'car',
    target_id:   '',
    badge_label: 'DREDOTT',
    badge_color: '#D4A843',
    is_lifetime: false,
    ends_at:     '',
    notes:       '',
  })

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/en/admin/login'); return }
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (prof?.role !== 'super_admin') { router.push('/en/admin'); return }
    setIsSuperAdmin(true)
    fetchAll()
  }

  const fetchAll = async () => {
    const [{ data: courtesy }, { data: props }, { data: carsList }] = await Promise.all([
      supabase.from('active_courtesy').select('*').order('created_at', { ascending: false }),
      supabase.from('properties').select('id, name, area').eq('review_status', 'approved').limit(100),
      supabase.from('cars').select('id, name, brand, model').eq('review_status', 'approved').limit(100),
    ])
    setListings(courtesy || [])
    setProperties(props || [])
    setCars(carsList || [])
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!form.target_id) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      property_id: form.type === 'property' ? form.target_id : null,
      car_id:      form.type === 'car'      ? form.target_id : null,
      badge_label: form.badge_label,
      badge_color: form.badge_color,
      is_lifetime: form.is_lifetime,
      ends_at:     form.is_lifetime ? null : (form.ends_at ? new Date(form.ends_at).toISOString() : null),
      notes:       form.notes || null,
      created_by:  user?.id,
    }

    const { error } = await supabase.from('courtesy_listings').insert(payload)
    if (!error) {
      setShowForm(false)
      setForm({ type: 'property', target_id: '', badge_label: 'DREDOTT', badge_color: '#D4A843', is_lifetime: false, ends_at: '', notes: '' })
      fetchAll()
    }
    setSaving(false)
  }

  const deleteCourtesy = async (id: string) => {
    if (!confirm('Remove courtesy status from this listing?')) return
    await supabase.from('courtesy_listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  if (!isSuperAdmin) return null

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F7', padding: '28px 32px' }}>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#1e2d4f', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#FBF0D0', fontWeight: 400 }}>Add Courtesy Listing</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#7a8aaa', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Type */}
              <div>
                <label style={lbl}>Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['property', 'car'] as const).map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t, target_id: '' }))} style={{
                      flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                      background: form.type === t ? '#D4A843' : 'rgba(255,255,255,0.06)',
                      color: form.type === t ? '#F0F2F7' : '#7a8aaa',
                    }}>
                      {t === 'property' ? '🏠 Property' : '🚗 Car'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Listing selector */}
              <div>
                <label style={lbl}>Select {form.type}</label>
                <select value={form.target_id} onChange={e => setForm(f => ({ ...f, target_id: e.target.value }))} style={sel}>
                  <option value="">-- Choose --</option>
                  {form.type === 'property'
                    ? properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                    : cars.map(c => <option key={c.id} value={c.id}>{c.name || `${c.brand} ${c.model}`}</option>)
                  }
                </select>
              </div>

              {/* Badge */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
                <div>
                  <label style={lbl}>Badge Label</label>
                  <input value={form.badge_label} onChange={e => setForm(f => ({ ...f, badge_label: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Color</label>
                  <input type="color" value={form.badge_color} onChange={e => setForm(f => ({ ...f, badge_color: e.target.value }))}
                    style={{ width: 44, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none', padding: 2 }} />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label style={lbl}>Duration</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button onClick={() => setForm(f => ({ ...f, is_lifetime: false }))} style={{
                    flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13,
                    background: !form.is_lifetime ? '#D4A843' : 'rgba(255,255,255,0.06)',
                    color: !form.is_lifetime ? '#F0F2F7' : '#7a8aaa',
                  }}>📅 Set expiry date</button>
                  <button onClick={() => setForm(f => ({ ...f, is_lifetime: true, ends_at: '' }))} style={{
                    flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13,
                    background: form.is_lifetime ? '#D4A843' : 'rgba(255,255,255,0.06)',
                    color: form.is_lifetime ? '#F0F2F7' : '#7a8aaa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}><Infinity size={15} /> Lifetime</button>
                </div>
                {!form.is_lifetime && (
                  <input type="date" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} style={inp} />
                )}
              </div>

              {/* Notes */}
              <div>
                <label style={lbl}>Internal Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="e.g. Family friend — courtesy for 1 year" style={{ ...inp, resize: 'none' as const }} />
              </div>

              <button onClick={handleCreate} disabled={saving || !form.target_id} style={{
                padding: 12, background: '#D4A843', color: '#F0F2F7',
                border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: !form.target_id ? 0.5 : 1,
              }}>
                {saving ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={16} />}
                Add Courtesy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Lock size={14} color="#D4A843" />
            <p style={eyebrow}>Super Admin Only — Courtesy Listings</p>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#FBF0D0', fontWeight: 400 }}>
            DREDOTT Managed Units
          </h1>
          <p style={{ fontSize: 12, color: '#7a8aaa', marginTop: 4 }}>
            Listings with courtesy status — treated as company-affiliated properties.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', background: '#D4A843', color: '#F0F2F7',
          border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13,
        }}>
          <Plus size={15} /> Add Courtesy
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Courtesy', value: listings.length },
          { label: 'Lifetime',       value: listings.filter(l => l.is_lifetime).length },
          { label: 'Expiring Soon',  value: listings.filter(l => !l.is_lifetime && l.ends_at && new Date(l.ends_at) < new Date(Date.now() + 30 * 86400000)).length },
        ].map((s, i) => (
          <div key={i} style={{ background: '#1e2d4f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: '#D4A843', lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#7a8aaa', marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={28} color="#D4A843" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#7a8aaa' }}>
          <Crown size={40} color="rgba(212,168,67,0.2)" style={{ margin: '0 auto 16px' }} />
          <p>No courtesy listings yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {listings.map(l => {
            const isExpiringSoon = !l.is_lifetime && l.ends_at &&
              new Date(l.ends_at) < new Date(Date.now() + 30 * 86400000)

            return (
              <div key={l.id} style={{
                background: '#1e2d4f',
                border: `1px solid ${isExpiringSoon ? 'rgba(251,191,36,0.2)' : 'rgba(212,168,67,0.1)'}`,
                borderRadius: 12, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                {/* Type icon */}
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(212,168,67,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {l.property_id ? <Building2 size={18} color="#D4A843" /> : <Car size={18} color="#D4A843" />}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#FBF0D0', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.property_name || l.car_name || 'Unknown listing'}
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {l.notes && <span style={{ fontSize: 11, color: '#7a8aaa', fontStyle: 'italic' }}>{l.notes}</span>}
                    {l.is_lifetime
                      ? <span style={{ fontSize: 11, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 3 }}><Infinity size={11} /> Lifetime</span>
                      : l.ends_at && <span style={{ fontSize: 11, color: isExpiringSoon ? '#fbbf24' : '#7a8aaa' }}>
                          Expires {new Date(l.ends_at).toLocaleDateString('en-GB')}
                          {isExpiringSoon && ' ⚠️'}
                        </span>
                    }
                  </div>
                </div>

                {/* Badge preview */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: l.badge_color, color: '#F0F2F7',
                  padding: '4px 10px', borderRadius: 20,
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  <Crown size={11} /> {l.badge_label}
                </div>

                {/* Delete */}
                <button onClick={() => deleteCourtesy(l.id)} style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, color: '#f87171', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a8aaa', marginBottom: 6 }
const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 13, boxSizing: 'border-box' as const, outline: 'none' }
const sel: React.CSSProperties = { ...{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 13, boxSizing: 'border-box' as const, outline: 'none' } }
const eyebrow: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#D4A843' }