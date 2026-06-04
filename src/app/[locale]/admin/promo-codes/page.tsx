// ============================================
// Admin Promo Codes Page
// Path: src/app/[locale]/admin/promo-codes/page.tsx
// Super admin + admin can create/manage promo codes
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import {
  Plus, Copy, Check, Trash2, ToggleLeft,
  ToggleRight, Tag, TrendingUp, Loader2, X
} from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PromoCode {
  id: string
  code: string
  description: string | null
  discount_pct: number
  max_uses: number | null
  uses_count: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export default function PromoCodesPage() {
  const [codes, setCodes]         = useState<PromoCode[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [copied, setCopied]       = useState<string | null>(null)

  const [form, setForm] = useState({
    code: '', description: '',
    discount_pct: 10, max_uses: '',
    expires_at: '',
  })

  useEffect(() => { fetchCodes() }, [])

  const fetchCodes = async () => {
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })
    setCodes(data || [])
    setLoading(false)
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
    setForm(f => ({ ...f, code }))
  }

  const handleCreate = async () => {
    if (!form.code.trim() || !form.discount_pct) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('promo_codes').insert({
      code:         form.code.toUpperCase().trim(),
      description:  form.description || null,
      discount_pct: form.discount_pct,
      max_uses:     form.max_uses ? Number(form.max_uses) : null,
      expires_at:   form.expires_at || null,
      created_by:   user?.id,
    })

    if (!error) {
      setShowForm(false)
      setForm({ code: '', description: '', discount_pct: 10, max_uses: '', expires_at: '' })
      fetchCodes()
    }
    setSaving(false)
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('promo_codes').update({ is_active: !current }).eq('id', id)
    setCodes(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  const deleteCode = async (id: string) => {
    if (!confirm('Delete this promo code?')) return
    await supabase.from('promo_codes').delete().eq('id', id)
    setCodes(prev => prev.filter(c => c.id !== id))
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const totalUses    = codes.reduce((s, c) => s + c.uses_count, 0)
  const activeCodes  = codes.filter(c => c.is_active).length

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '28px 32px' }}>

      {/* Create Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#0e1428', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#FBF0D0', fontWeight: 400 }}>New Promo Code</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#7a8aaa', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Code */}
              <div>
                <label style={label}>Code *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. AHMED2026"
                    style={{ ...input, flex: 1, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }} />
                  <button onClick={generateCode} style={{ padding: '8px 14px', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 8, color: '#D4A843', fontSize: 12, cursor: 'pointer' }}>
                    Generate
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={label}>Description (internal)</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Ahmed's referral code"
                  style={input} />
              </div>

              {/* Discount + Max uses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={label}>Discount %  *</label>
                  <input type="number" min={1} max={100} value={form.discount_pct}
                    onChange={e => setForm(f => ({ ...f, discount_pct: Number(e.target.value) }))}
                    style={input} />
                </div>
                <div>
                  <label style={label}>Max uses (empty = unlimited)</label>
                  <input type="number" min={1} value={form.max_uses}
                    onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                    placeholder="∞"
                    style={input} />
                </div>
              </div>

              {/* Expires */}
              <div>
                <label style={label}>Expiry date (optional)</label>
                <input type="date" value={form.expires_at}
                  onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                  style={input} />
              </div>

              <button onClick={handleCreate} disabled={saving} style={{
                marginTop: 8, padding: '11px', background: '#D4A843', color: '#ffffff',
                border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {saving ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={16} />}
                Create Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={eyebrow}>— Promo Codes</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#FBF0D0', fontWeight: 400 }}>Referral & Discount Codes</h1>
        </div>
        <button onClick={() => setShowForm(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', background: '#D4A843', color: '#ffffff',
          border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13,
        }}>
          <Plus size={15} /> New Code
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Codes', value: codes.length, icon: Tag, color: '#D4A843' },
          { label: 'Active', value: activeCodes, icon: ToggleRight, color: '#4ade80' },
          { label: 'Total Uses', value: totalUses, icon: TrendingUp, color: '#60a5fa' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} style={{ background: '#0e1428', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <Icon size={20} color={s.color} />
              <div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#FBF0D0', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: '#7a8aaa', marginTop: 3 }}>{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Codes List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={28} color="#D4A843" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : codes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#7a8aaa' }}>
          <Tag size={40} color="rgba(122,138,170,0.3)" style={{ margin: '0 auto 16px' }} />
          <p>No promo codes yet — create your first one</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {codes.map(code => (
            <div key={code.id} style={{
              background: '#0e1428', border: `1px solid ${code.is_active ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)'}`,
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
              opacity: code.is_active ? 1 : 0.5,
            }}>

              {/* Code */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: '#D4A843', letterSpacing: '0.1em' }}>
                  {code.code}
                </span>
                <button onClick={() => copyCode(code.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a8aaa', padding: 4 }}>
                  {copied === code.code ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {code.description && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{code.description}</p>}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>{code.discount_pct}% off</span>
                  <span style={{ fontSize: 12, color: '#7a8aaa' }}>
                    Used: {code.uses_count}{code.max_uses ? `/${code.max_uses}` : ''}
                  </span>
                  {code.expires_at && (
                    <span style={{ fontSize: 12, color: new Date(code.expires_at) < new Date() ? '#f87171' : '#7a8aaa' }}>
                      Expires: {new Date(code.expires_at).toLocaleDateString('en-GB')}
                    </span>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <span style={{
                fontSize: 10, padding: '3px 10px', borderRadius: 20,
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em',
                background: code.is_active ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                color: code.is_active ? '#4ade80' : '#7a8aaa',
                border: `1px solid ${code.is_active ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                {code.is_active ? 'active' : 'inactive'}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => toggleActive(code.id, code.is_active)} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: code.is_active ? '#fbbf24' : '#4ade80', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {code.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
                <button onClick={() => deleteCode(code.id)} style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const label: React.CSSProperties = {
  display: 'block', fontSize: 10,
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: '0.2em', textTransform: 'uppercase',
  color: '#7a8aaa', marginBottom: 6,
}

const input: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8, color: '#fff', fontSize: 13,
  boxSizing: 'border-box' as const,
  outline: 'none',
}

const eyebrow: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9, letterSpacing: '0.3em',
  textTransform: 'uppercase', color: '#D4A843', marginBottom: 6,
}