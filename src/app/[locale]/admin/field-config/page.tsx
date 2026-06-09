'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter, usePathname } from 'next/navigation'
import { Settings, Car, Home, ToggleLeft, ToggleRight, Save, Bell, ChevronDown, ChevronUp, Moon, Sun } from 'lucide-react'

const SECTIONS = [
  { key: 'cars',       label_en: 'Cars',       label_ar: 'السيارات', icon: '🚗' },
  { key: 'properties', label_en: 'Properties', label_ar: 'الإقامات', icon: '🏠' },
]

type Field = {
  id: string
  field_key: string
  label_en: string
  label_ar: string
  is_enabled: boolean
  is_required: boolean
  owner_can_toggle: boolean
  sort_order: number
}

export default function FieldConfigPage() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const isAr = locale === 'ar'
  const router = useRouter()

  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const searchParams = useSearchParams()
  const urlSection = searchParams.get('section') || ''
  const [activeSection, setActiveSection] = useState(urlSection || 'cars')
  const singleSection = !!urlSection
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ fields: true, payment: true })
  const [dark, setDark] = useState(false)
  const [saved, setSaved] = useState(false)

  const colors = {
    bg: dark ? '#0e1428' : '#F4F6FA',
    card: dark ? '#1a2240' : '#fff',
    border: dark ? 'rgba(212,168,67,0.15)' : '#e5e7eb',
    text: dark ? '#FBF0D0' : '#1a2240',
    sub: dark ? '#9CA3AF' : '#6B7280',
    gold: '#D4A843',
    navy: '#2C3A6B',
  }

  useEffect(() => { fetchFields() }, [activeSection])

  const fetchFields = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/field-config?section=${activeSection}`)
    if (res.ok) {
      const data = await res.json()
      setFields(data.fields || [])
    }
    setLoading(false)
  }

  const toggle = (id: string, key: 'is_enabled' | 'is_required' | 'owner_can_toggle') => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: !f[key] } : f))
  }

  const saveAll = async () => {
    setSaving(true)
    await fetch('/api/admin/field-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)

    // Admin notification
    await fetch('/api/admin/notifications/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'settings_changed',
        category: 'system',
        title: `Field config updated — ${activeSection}`,
        body: `Super Admin updated field configuration for ${activeSection} section`,
        priority: 'normal',
      })
    })
  }

  const paymentFields = fields.filter(f => f.field_key.startsWith('payment'))
  const regularFields = fields.filter(f => !f.field_key.startsWith('payment'))

  const ToggleSwitch = ({ active, onChange, color = colors.gold }: any) => (
    <button onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: active ? color : dark ? '#374151' : '#D1D5DB', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: active ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
    </button>
  )

  const FieldRow = ({ field }: { field: Field }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 16, alignItems: 'center', padding: '14px 20px', borderBottom: `1px solid ${colors.border}`, background: field.is_enabled ? 'transparent' : dark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: field.is_enabled ? colors.text : colors.sub, margin: '0 0 2px' }}>
          {isAr ? field.label_ar : field.label_en}
        </p>
        <p style={{ fontSize: 11, color: colors.sub, margin: 0, fontFamily: 'monospace' }}>{field.field_key}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10, color: colors.sub, fontFamily: 'monospace' }}>{isAr ? 'مفعّل' : 'ENABLED'}</span>
        <ToggleSwitch active={field.is_enabled} onChange={() => toggle(field.id, 'is_enabled')} color={colors.gold} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10, color: colors.sub, fontFamily: 'monospace' }}>{isAr ? 'إلزامي' : 'REQUIRED'}</span>
        <ToggleSwitch active={field.is_required && field.is_enabled} onChange={() => field.is_enabled && toggle(field.id, 'is_required')} color="#ef4444" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10, color: colors.sub, fontFamily: 'monospace' }}>{isAr ? 'للمالك' : 'OWNER'}</span>
        <ToggleSwitch active={field.owner_can_toggle && field.is_enabled} onChange={() => field.is_enabled && toggle(field.id, 'owner_can_toggle')} color="#2A9D8F" />
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, direction: isAr ? 'rtl' : 'ltr', transition: 'all 0.2s' }}>
      
      {/* Header */}
      <div style={{ background: dark ? '#0a0f1e' : '#fff', borderBottom: `1px solid ${colors.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', color: colors.sub, fontFamily: 'monospace', margin: '0 0 2px' }}>SUPER ADMIN · FIELD CONFIG</p>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, margin: 0 }}>
            {isAr ? 'إعدادات الحقول' : 'Field Configuration'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setDark(!dark)} style={{ padding: '8px 12px', background: dark ? '#1a2240' : '#f3f4f6', border: `1px solid ${colors.border}`, borderRadius: 8, cursor: 'pointer', color: colors.text, display: 'flex', alignItems: 'center', gap: 6 }}>
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={saveAll} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: saved ? '#2A9D8F' : colors.gold, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0e1428' }}>
            <Save size={14} />
            {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : saved ? (isAr ? 'تم الحفظ ✓' : 'Saved ✓') : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>

        {/* Section Tabs - only if no section in URL */}
        <div style={{ display: singleSection ? 'none' : 'flex', gap: 8, marginBottom: 24 }}>
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: `1px solid ${activeSection === s.key ? colors.gold : colors.border}`, background: activeSection === s.key ? (dark ? '#1a2240' : '#FBF0D0') : colors.card, cursor: 'pointer', fontSize: 14, fontWeight: activeSection === s.key ? 600 : 400, color: activeSection === s.key ? colors.gold : colors.text }}>
              {s.icon} {isAr ? s.label_ar : s.label_en}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: colors.sub }}>Loading...</div>
        ) : (
          <>
            {/* Legend */}
            <div style={{ background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, padding: '12px 20px', marginBottom: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: colors.gold }} />
                <span style={{ fontSize: 12, color: colors.sub }}>{isAr ? 'مفعّل = يظهر في الفورم' : 'Enabled = shows in form'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: 12, color: colors.sub }}>{isAr ? 'إلزامي = لازم يتملأ' : 'Required = must be filled'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#2A9D8F' }} />
                <span style={{ fontSize: 12, color: colors.sub }}>{isAr ? 'للمالك = المالك يتحكم فيه' : 'Owner = owner can toggle'}</span>
              </div>
            </div>

            {/* Fields Group */}
            <div style={{ background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, overflow: 'hidden', marginBottom: 16 }}>
              <button onClick={() => setExpandedGroups(p => ({ ...p, fields: !p.fields }))} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: expandedGroups.fields ? `1px solid ${colors.border}` : 'none' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{isAr ? '📋 حقول الإعلان' : '📋 Listing Fields'}</span>
                {expandedGroups.fields ? <ChevronUp size={16} color={colors.sub} /> : <ChevronDown size={16} color={colors.sub} />}
              </button>
              {expandedGroups.fields && regularFields.map(f => <FieldRow key={f.id} field={f} />)}
            </div>

            {/* Payment Group */}
            <div style={{ background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
              <button onClick={() => setExpandedGroups(p => ({ ...p, payment: !p.payment }))} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: expandedGroups.payment ? `1px solid ${colors.border}` : 'none' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{isAr ? '💳 طرق الدفع' : '💳 Payment Methods'}</span>
                {expandedGroups.payment ? <ChevronUp size={16} color={colors.sub} /> : <ChevronDown size={16} color={colors.sub} />}
              </button>
              {expandedGroups.payment && paymentFields.map(f => <FieldRow key={f.id} field={f} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
