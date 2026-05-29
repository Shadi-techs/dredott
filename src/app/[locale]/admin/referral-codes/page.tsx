// ============================================
// Admin Referral Codes (Ambassadors)
// Path: src/app/[locale]/admin/referral-codes/page.tsx
// Each ambassador gets a personal code
// Tracks who signed up through whom
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Plus, Copy, Check, Trash2, ToggleRight, ToggleLeft, Users, X, Loader2, TrendingUp } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const AMBASSADOR_TYPES = [
  { id: 'individual', label: 'Individual',    emoji: '👤' },
  { id: 'resort',     label: 'Resort / Hotel',emoji: '🏨' },
  { id: 'business',   label: 'Business',      emoji: '🏢' },
]

interface ReferralCode {
  id: string; code: string; ambassador_name: string
  ambassador_type: string; phone: string | null; notes: string | null
  discount_pct: number; uses_count: number; is_active: boolean
  created_at: string
}

const generateCode = (name: string) => {
  const prefix = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5)
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${suffix}`
}

export default function ReferralCodesPage() {
  const [codes, setCodes]       = useState<ReferralCode[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [copied, setCopied]     = useState<string | null>(null)

  const [form, setForm] = useState({
    ambassador_name: '', ambassador_type: 'individual',
    phone: '', notes: '', discount_pct: 10, code: '',
  })

  useEffect(() => { fetchCodes() }, [])

  const fetchCodes = async () => {
    const { data } = await supabase
      .from('referral_codes').select('*')
      .order('created_at', { ascending: false })
    setCodes(data || [])
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!form.ambassador_name.trim() || !form.code.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('referral_codes').insert({
      code:             form.code.toUpperCase().trim(),
      ambassador_name:  form.ambassador_name,
      ambassador_type:  form.ambassador_type,
      phone:            form.phone || null,
      notes:            form.notes || null,
      discount_pct:     form.discount_pct,
      created_by:       user?.id,
    })
    setSaving(false)
    setShowForm(false)
    setForm({ ambassador_name: '', ambassador_type: 'individual', phone: '', notes: '', discount_pct: 10, code: '' })
    fetchCodes()
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('referral_codes').update({ is_active: !current }).eq('id', id)
    setCodes(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  const deleteCode = async (id: string) => {
    if (!confirm('Delete this referral code?')) return
    await supabase.from('referral_codes').delete().eq('id', id)
    setCodes(prev => prev.filter(c => c.id !== id))
  }

  const totalSignups = codes.reduce((s, c) => s + c.uses_count, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#0e1428', padding: '28px 32px' }}>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#1a2240', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#FBF0D0', fontWeight: 400 }}>New Ambassador Code</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#7a8aaa', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lbl}>Ambassador Type</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {AMBASSADOR_TYPES.map(t => (
                    <button key={t.id} onClick={() => setForm(f => ({ ...f, ambassador_type: t.id }))} style={{
                      flex: 1, padding: '7px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11,
                      background: form.ambassador_type === t.id ? '#D4A843' : 'rgba(255,255,255,0.06)',
                      color: form.ambassador_type === t.id ? '#0e1428' : '#7a8aaa',
                    }}>{t.emoji} {t.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl}>Name *</label>
                <input value={form.ambassador_name}
                  onChange={e => {
                    const name = e.target.value
                    setForm(f => ({ ...f, ambassador_name: name, code: generateCode(name) }))
                  }}
                  placeholder="e.g. Ahmed Hassan / Rixos Hotel"
                  style={inp} />
              </div>
              <div>
                <label style={lbl}>Code *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    style={{ ...inp, flex: 1, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }} />
                  <button onClick={() => setForm(f => ({ ...f, code: generateCode(f.ambassador_name || 'REF') }))}
                    style={{ padding: '8px 12px', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 8, color: '#D4A843', fontSize: 12, cursor: 'pointer' }}>
                    Regenerate
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+20..." style={inp} />
                </div>
                <div>
                  <label style={lbl}>Discount %</label>
                  <input type="number" min={0} max={100} value={form.discount_pct}
                    onChange={e => setForm(f => ({ ...f, discount_pct: Number(e.target.value) }))}
                    style={inp} />
                </div>
              </div>
              <div>
                <label style={lbl}>Notes (internal)</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. Works at Rixos — gave 20 referrals last year"
                  style={inp} />
              </div>
              <button onClick={handleCreate} disabled={saving || !form.ambassador_name || !form.code} style={{
                padding: 12, background: '#D4A843', color: '#0e1428', border: 'none', borderRadius: 10,
                cursor: 'pointer', fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: !form.ambassador_name || !form.code ? 0.5 : 1,
              }}>
                {saving ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={16} />}
                Create Code
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={eyebrow}>— Ambassador Referral Codes</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#FBF0D0', fontWeight: 400 }}>Referral Codes</h1>
          <p style={{ fontSize: 12, color: '#7a8aaa', marginTop: 4 }}>Each ambassador gets a personal code. Users who sign up with it get a discount — and you know who brought them.</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#D4A843', color: '#0e1428', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
          <Plus size={15} /> New Ambassador
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Ambassadors',   value: codes.length,                          color: '#D4A843', icon: Users },
          { label: 'Active',        value: codes.filter(c => c.is_active).length, color: '#4ade80', icon: ToggleRight },
          { label: 'Total Signups', value: totalSignups,                          color: '#60a5fa', icon: TrendingUp },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} style={{ background: '#1a2240', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <Icon size={20} color={s.color} />
              <div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#FBF0D0', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: '#7a8aaa', marginTop: 3 }}>{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={28} color="#D4A843" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : codes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#7a8aaa' }}>
          <Users size={40} color="rgba(122,138,170,0.3)" style={{ margin: '0 auto 16px' }} />
          <p>No referral codes yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {codes.map(code => {
            const typeConf = AMBASSADOR_TYPES.find(t => t.id === code.ambassador_type)
            return (
              <div key={code.id} style={{
                background: '#1a2240', border: `1px solid ${code.is_active ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)'}`,
                borderRadius: 12, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
                opacity: code.is_active ? 1 : 0.55,
              }}>
                <div style={{ fontSize: 22, width: 36, textAlign: 'center' }}>{typeConf?.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#FBF0D0', marginBottom: 2 }}>{code.ambassador_name}</p>
                  <p style={{ fontSize: 11, color: '#7a8aaa' }}>
                    {code.phone && `${code.phone} · `}
                    {code.discount_pct}% discount · {code.uses_count} signups
                    {code.notes && ` · ${code.notes}`}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: '#D4A843', letterSpacing: '0.08em' }}>{code.code}</span>
                  <button onClick={() => copyCode(code.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a8aaa', padding: 4 }}>
                    {copied === code.code ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggleActive(code.id, code.is_active)} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: code.is_active ? '#fbbf24' : '#4ade80', cursor: 'pointer' }}>
                    {code.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => deleteCode(code.id)} style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, color: '#f87171', cursor: 'pointer' }}>
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

const lbl: React.CSSProperties = { display: 'block', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a8aaa', marginBottom: 6 }
const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 13, boxSizing: 'border-box' as const, outline: 'none' }
const eyebrow: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#D4A843', marginBottom: 6 }