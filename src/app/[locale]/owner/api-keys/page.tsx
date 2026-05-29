'use client'
// src/app/[locale]/owner/api-keys/page.tsx
// Manage partner API keys for this owner account.

import { use, useEffect, useState } from 'react'
import {
  Plus, Trash2, Copy, Check, AlertCircle, Globe, Activity,
} from 'lucide-react'

import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { usePerms } from '@/components/owner/PermissionsProvider'
import { Card } from '@/components/owner/Card'
import { Badge } from '@/components/owner/Badge'
import { Button } from '@/components/owner/Button'
import { ScreenHeader } from '@/components/owner/ScreenHeader'
import { RestrictedScreen } from '@/components/owner/Restricted'

type Scope = 'read_listings' | 'read_availability' | 'read_bookings' | 'read_pricing' | 'write_bookings'

interface ApiKey {
  id: string
  name: string
  partner_url: string | null
  last_plaintext_4: string
  scopes: Scope[]
  rate_limit_per_min: number
  status: 'active' | 'revoked'
  created_at: string
  last_used_at: string | null
}

const SCOPE_LABELS: Record<Scope, { en: string; ar: string; tone: 'success' | 'warning' | 'danger' | 'accent' | 'neutral' }> = {
  read_listings:     { en: 'Read listings',     ar: 'قراءة الإعلانات',   tone: 'success' },
  read_availability: { en: 'Read availability', ar: 'قراءة الإتاحة',     tone: 'success' },
  read_pricing:      { en: 'Read pricing',      ar: 'قراءة الأسعار',     tone: 'success' },
  read_bookings:     { en: 'Read bookings',     ar: 'قراءة الحجوزات',    tone: 'warning' },
  write_bookings:    { en: 'Create bookings',   ar: 'إنشاء حجوزات',      tone: 'danger'  },
}

const ALL_SCOPES: Scope[] = ['read_listings', 'read_availability', 'read_pricing', 'read_bookings', 'write_bookings']

export default function ApiKeysPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { t, d } = useOwnerTheme()
  const { perms } = usePerms()

  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newScopes, setNewScopes] = useState<Scope[]>(['read_listings', 'read_availability'])
  const [submitting, setSubmitting] = useState(false)
  const [justCreated, setJustCreated] = useState<{ plaintext: string; name: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { void load() }, [])

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/owner/api-keys')
    const json = await res.json()
    setKeys(json.data || [])
    setLoading(false)
  }

  const create = async () => {
    if (!newName.trim() || newScopes.length === 0) return
    setSubmitting(true)
    const res = await fetch('/api/owner/api-keys', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        partner_url: newUrl || undefined,
        scopes: newScopes,
      }),
    })
    const json = await res.json()
    setSubmitting(false)
    if (json.plaintext_key) {
      setJustCreated({ plaintext: json.plaintext_key, name: newName })
      setNewName(''); setNewUrl(''); setNewScopes(['read_listings', 'read_availability'])
      setCreating(false)
      await load()
    } else {
      alert(json.message || 'Failed to create key')
    }
  }

  const revoke = async (id: string) => {
    if (!confirm('Revoke this key? The partner site using it will stop working immediately.')) return
    await fetch(`/api/owner/api-keys/${id}`, { method: 'DELETE' })
    await load()
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!perms.manage_settings) {
    return <RestrictedScreen title="API Keys" requiredPerm="Account & payouts" />
  }

  const ar = locale === 'ar'

  return (
    <div style={{ padding: d.pad }}>
      <ScreenHeader
        kicker={`${ar ? 'مميز' : 'Premium'} · API`}
        title={ar ? 'مفاتيح API للشركاء' : 'Partner API keys'}
        sub={ar
          ? 'أنشئ مفتاحاً لكل موقع شريك يستخدم بياناتك. تستطيع إلغاؤه أو حصر صلاحياته في أي لحظة.'
          : 'Issue a key for each partner site that pulls your data. Revoke or scope down any time.'}
        actions={
          <>
            <Button variant="ghost" icon={Globe} onClick={() => window.open(`/${locale}/owner/api-keys/docs`, '_blank')}>
              {ar ? 'الوثائق' : 'Docs'}
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
              {ar ? 'مفتاح جديد' : 'New key'}
            </Button>
          </>
        }
      />

      {/* Just-created key — shown ONCE */}
      {justCreated && (
        <Card style={{
          marginBottom: d.gap,
          borderColor: t.accent, borderWidth: 1.5,
          background: t.accentSoft,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ color: t.accent, flexShrink: 0, marginTop: 2 }}>
              <AlertCircle size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: t.text, marginBottom: 4 }}>
                {ar ? 'احفظ هذا المفتاح الآن' : 'Save this key now'}
              </div>
              <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
                {ar
                  ? `هذه المرة الوحيدة التي سيظهر فيها مفتاح "${justCreated.name}". انسخه إلى مكان آمن — لا يمكن استعادته بعد إغلاق هذه الرسالة.`
                  : `This is the only time we'll show the key for "${justCreated.name}". Copy it somewhere safe — there is no way to retrieve it after you close this banner.`}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: t.surface, border: `1px solid ${t.border}`,
                padding: '10px 14px', borderRadius: 9,
              }}>
                <code style={{
                  flex: 1, fontFamily: 'var(--mono)', fontSize: 12.5,
                  color: t.text, overflow: 'auto', whiteSpace: 'nowrap',
                }}>{justCreated.plaintext}</code>
                <Button size="sm" variant={copied ? 'soft' : 'primary'} icon={copied ? Check : Copy}
                        onClick={() => copyKey(justCreated.plaintext)}>
                  {copied ? (ar ? 'تم النسخ' : 'Copied') : (ar ? 'نسخ' : 'Copy')}
                </Button>
              </div>
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="quiet" size="sm" onClick={() => setJustCreated(null)}>
                  {ar ? 'أغلقت ، حفظت المفتاح' : "I've saved it — close"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Create form */}
      {creating && (
        <Card style={{ marginBottom: d.gap, borderColor: t.accent, borderWidth: 1.5 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, color: t.text, marginBottom: 18 }}>
            {ar ? 'إنشاء مفتاح API' : 'Create an API key'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontFamily: 'var(--mono)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: t.textFaint, marginBottom: 6,
              }}>{ar ? 'الاسم *' : 'Name *'}</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)}
                     placeholder={ar ? 'مثال: موقع فندق دريم' : 'e.g. Dream Hotel website'}
                     style={inputStyle(t)} />
            </div>
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontFamily: 'var(--mono)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: t.textFaint, marginBottom: 6,
              }}>{ar ? 'رابط الشريك (اختياري)' : 'Partner URL (optional)'}</label>
              <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                     placeholder="https://partner.example.com"
                     style={inputStyle(t)} />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block', fontSize: 11, fontFamily: 'var(--mono)',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: t.textFaint, marginBottom: 8,
            }}>{ar ? 'الصلاحيات' : 'Scopes'}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ALL_SCOPES.map((s) => {
                const checked = newScopes.includes(s)
                const meta = SCOPE_LABELS[s]
                const isWrite = s === 'write_bookings'
                return (
                  <label key={s} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 12, borderRadius: 9,
                    background: checked ? (isWrite ? 'rgba(248,113,113,0.08)' : t.accentSoft) : t.surfaceAlt,
                    border: `1px solid ${checked ? (isWrite ? t.danger : t.accent) : t.border}`,
                    cursor: 'pointer',
                  }}>
                    <input type="checkbox" checked={checked}
                           onChange={() => {
                             setNewScopes((cur) => checked ? cur.filter(x => x !== s) : [...cur, s])
                           }}
                           style={{ accentColor: isWrite ? t.danger : t.accent, width: 16, height: 16 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                        {ar ? meta.ar : meta.en}
                      </div>
                      <div style={{ fontSize: 11, color: t.textMuted, fontFamily: 'var(--mono)' }}>
                        {s}
                      </div>
                    </div>
                    {isWrite && (
                      <Badge tone="danger" dot>{ar ? 'حساس' : 'Sensitive'}</Badge>
                    )}
                  </label>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="quiet" onClick={() => setCreating(false)}>{ar ? 'إلغاء' : 'Cancel'}</Button>
            <Button variant="primary" onClick={create} disabled={submitting || !newName.trim() || newScopes.length === 0}>
              {submitting ? '…' : (ar ? 'إنشاء المفتاح' : 'Create key')}
            </Button>
          </div>
        </Card>
      )}

      {/* Keys list */}
      {loading ? (
        <Card style={{ padding: 40, textAlign: 'center', color: t.textMuted }}>Loading…</Card>
      ) : keys.length === 0 ? (
        <Card style={{ padding: 60, textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px',
            background: t.accentSoft, color: t.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Globe size={24} />
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: t.text, marginBottom: 6 }}>
            {ar ? 'لا توجد مفاتيح بعد' : 'No keys yet'}
          </div>
          <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 18, maxWidth: 360, margin: '0 auto 18px' }}>
            {ar
              ? 'أنشئ مفتاحاً لمشاركة بياناتك مع موقع شريك. كل مفتاح له صلاحيات محددة يمكنك تغييرها.'
              : 'Issue a key to share your data with a partner site. Each key has scoped permissions you control.'}
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
            {ar ? 'إنشاء أول مفتاح' : 'Create your first key'}
          </Button>
        </Card>
      ) : (
        <Card padding={0} style={{ overflow: 'hidden' }}>
          {keys.map((k, i) => (
            <div key={k.id} style={{
              padding: '18px 22px', borderTop: i === 0 ? 'none' : `1px solid ${t.borderSoft}`,
              opacity: k.status === 'revoked' ? 0.5 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{k.name}</span>
                    {k.status === 'revoked'
                      ? <Badge tone="danger" dot>Revoked</Badge>
                      : <Badge tone="success" dot>Active</Badge>}
                  </div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: t.textMuted, fontFamily: 'var(--mono)', marginBottom: 10 }}>
                    <span>dredott_pk_…{k.last_plaintext_4}</span>
                    {k.partner_url && (
                      <a href={k.partner_url} target="_blank" rel="noreferrer" style={{ color: t.accent, textDecoration: 'none' }}>
                        {k.partner_url}
                      </a>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {k.scopes.map((s) => (
                      <Badge key={s} tone={SCOPE_LABELS[s].tone}>{SCOPE_LABELS[s].en}</Badge>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: t.textFaint, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <Activity size={11} />
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : (ar ? 'لم يُستخدم' : 'Never used')}
                    </div>
                    <div style={{ marginTop: 2 }}>
                      {k.rate_limit_per_min}/min
                    </div>
                  </div>
                  {k.status === 'active' && (
                    <Button size="sm" variant="ghost" icon={Trash2} onClick={() => revoke(k.id)}>
                      {ar ? 'إلغاء' : 'Revoke'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

function inputStyle(t: { border: string; surfaceAlt: string; text: string }) {
  return {
    width: '100%', padding: '11px 14px',
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt, color: t.text,
    borderRadius: 9, fontSize: 14, fontFamily: 'inherit',
    outline: 'none',
  } as const
}
