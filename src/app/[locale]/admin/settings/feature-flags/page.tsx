'use client'

import { useEffect, useState } from 'react'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { useAdminDark } from '@/contexts/AdminDarkContext'
import { Shield, AlertCircle, RefreshCw, Eye, EyeOff, Info } from 'lucide-react'

// ── The 5 site modules ─────────────────────────────────────────────────────────
const MODULES = [
  {
    key:         'module_properties',
    label:       'Properties',
    labelAr:     'العقارات',
    icon:        '🏠',
    color:       '#60a5fa',
    desc:        'Listings, search, detail pages, booking flow',
    descAr:      'الإيجارات والحجوزات وصفحات التفاصيل',
  },
  {
    key:         'module_cars',
    label:       'Cars',
    labelAr:     'السيارات',
    icon:        '🚗',
    color:       '#2A9D8F',
    desc:        'Car listings, rental search, detail pages',
    descAr:      'إيجار السيارات وصفحات التفاصيل',
  },
  {
    key:         'module_services',
    label:       'Services',
    labelAr:     'الخدمات',
    icon:        '🛠',
    color:       '#f97316',
    desc:        'Service providers directory & profiles',
    descAr:      'دليل مزودي الخدمات وملفاتهم',
  },
  {
    key:         'module_blog',
    label:       'Blog',
    labelAr:     'المدونة',
    icon:        '📝',
    color:       '#a78bfa',
    desc:        'Articles, tips, editorial content',
    descAr:      'المقالات والمحتوى التحريري',
  },
  {
    key:         'module_jobs',
    label:       'Jobs',
    labelAr:     'الوظائف',
    icon:        '💼',
    color:       '#D4A843',
    desc:        'Job board, CV submission, hiring',
    descAr:      'لوحة الوظائف وإرسال السير الذاتية',
  },
]

interface ModuleState {
  key:     string
  enabled: boolean | null   // null = loading
  saving:  boolean
}

export default function AdminFeatureFlagsPage() {
  const { dark } = useAdminDark()

  const [states,       setStates]       = useState<ModuleState[]>(MODULES.map(m => ({ key: m.key, enabled: null, saving: false })))
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [lastChanged,  setLastChanged]  = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/admin/verify')
      if (!res.ok) { setError('Unauthorized'); setLoading(false); return }
      const data = await res.json()
      if (data.admin?.role !== 'super_admin') { setError('Super Admin access required'); setLoading(false); return }
      setIsSuperAdmin(true)
      await fetchAll()
    }
    init()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const res  = await fetch('/api/admin/feature-flags/list')
    if (!res.ok) { setError('Failed to load'); setLoading(false); return }
    const data = await res.json()  // { flags: { key: enabled } }
    setStates(MODULES.map(m => ({ key: m.key, enabled: data.flags[m.key] ?? true, saving: false })))
    setLoading(false)
  }

  async function handleToggle(moduleKey: string) {
    if (!isSuperAdmin) return
    setStates(prev => prev.map(s => s.key === moduleKey ? { ...s, saving: true } : s))

    const res  = await fetch('/api/admin/feature-flags/toggle', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ feature_key: moduleKey }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Toggle failed')
      setStates(prev => prev.map(s => s.key === moduleKey ? { ...s, saving: false } : s))
      return
    }

    setStates(prev => prev.map(s => s.key === moduleKey ? { ...s, enabled: data.enabled, saving: false } : s))
    setLastChanged(moduleKey)
    setTimeout(() => setLastChanged(null), 2500)
  }

  // ── styles ─────────────────────────────────────────────────────────────────
  const bg     = dark ? '#080d1a' : '#F0F2F7'
  const card   = dark ? '#121929' : '#fff'
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(26,34,64,0.08)'
  const text   = dark ? '#e2e8f0' : '#1a2240'
  const muted  = dark ? '#94a3b8' : '#6B7280'

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(212,168,67,0.2)', borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: 24 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="#D4A843" />
            </div>
            <div>
              <p style={{ fontSize: 10, color: '#D4A843', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.25em', margin: 0 }}>SUPER ADMIN · MASTER CONTROL</p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: text, margin: 0, fontWeight: 400 }}>Site Sections</h1>
            </div>
          </div>
          <p style={{ fontSize: 13, color: muted }}>
            أوقف أي قسم كامل من الموقع بضغطة واحدة — البيانات تبقى سليمة ومش بتتمسح
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <AlertCircle size={16} color="#f87171" />
            <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Module cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {MODULES.map(mod => {
            const state   = states.find(s => s.key === mod.key)
            const enabled = state?.enabled
            const saving  = state?.saving ?? false
            const changed = lastChanged === mod.key

            return (
              <div
                key={mod.key}
                style={{
                  background: card,
                  border: `1px solid ${enabled === false ? 'rgba(248,113,113,0.3)' : enabled === true ? `${mod.color}22` : border}`,
                  borderRadius: 16,
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  transition: 'border-color 0.2s, opacity 0.2s',
                  opacity: enabled === false ? 0.75 : 1,
                }}
              >
                {/* Icon */}
                <div style={{ width: 52, height: 52, borderRadius: 16, background: enabled === false ? 'rgba(248,113,113,0.08)' : `${mod.color}15`, border: `1px solid ${enabled === false ? 'rgba(248,113,113,0.2)' : `${mod.color}30`}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {mod.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: text }}>{mod.label}</span>
                    <span style={{ fontSize: 13, color: muted }}>·</span>
                    <span style={{ fontSize: 13, color: muted }}>{mod.labelAr}</span>
                    {changed && (
                      <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em', color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '2px 8px', borderRadius: 20 }}>SAVED</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: muted, margin: 0 }}>{mod.desc} · {mod.descAr}</p>
                  <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', color: enabled === false ? '#f87171' : enabled === true ? '#4ade80' : muted, margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {enabled === null ? '...' : enabled ? <><Eye size={11} /> VISIBLE ON SITE</> : <><EyeOff size={11} /> HIDDEN FROM SITE</>}
                  </p>
                </div>

                {/* Big toggle */}
                <button
                  onClick={() => handleToggle(mod.key)}
                  disabled={!isSuperAdmin || saving || enabled === null}
                  style={{
                    width: 64, height: 34, borderRadius: 17, border: 'none', cursor: isSuperAdmin ? 'pointer' : 'not-allowed', position: 'relative', flexShrink: 0,
                    background: enabled ? `${mod.color}40` : 'rgba(248,113,113,0.2)',
                    transition: 'background 0.25s',
                  }}
                >
                  {saving ? (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RefreshCw size={14} color="#D4A843" style={{ animation: 'spin 0.8s linear infinite' }} />
                    </div>
                  ) : (
                    <div style={{
                      position: 'absolute', top: 4, width: 26, height: 26, borderRadius: '50%',
                      background: enabled ? mod.color : '#f87171',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      left: enabled ? 34 : 4,
                      transition: 'left 0.25s, background 0.25s',
                    }} />
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Info footer */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: '16px 20px' }}>
          <h4 style={{ fontSize: 12, color: '#D4A843', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={13} /> كيف يعمل النظام
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['VISIBLE', '#4ade80', 'القسم ظاهر للزوار، الـ nav tab شغال، الصفحات accessible'],
              ['HIDDEN',  '#f87171', 'القسم مختفي من الـ nav، الصفحة بتعرض "Coming Soon"، البيانات سليمة'],
            ].map(([label, color, desc]) => (
              <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: color as string, background: `${color}15`, padding: '2px 7px', borderRadius: 10, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 12, color: muted }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
