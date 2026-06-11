'use client'
import { useEffect, useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface Props {
  moduleKey: string
  dark?: boolean
}

export default function SiteVisibilityToggle({ moduleKey, dark = false }: Props) {
  const [enabled,   setEnabled]   = useState<boolean | null>(null)
  const [saving,    setSaving]    = useState(false)
  const [canToggle, setCanToggle] = useState(false)

  useEffect(() => {
    async function init() {
      const [flagsRes, adminRes] = await Promise.all([
        fetch('/api/admin/feature-flags/list'),
        fetch('/api/admin/verify'),
      ])
      if (flagsRes.ok) {
        const d = await flagsRes.json()
        setEnabled(d.flags[moduleKey] ?? true)
      }
      if (adminRes.ok) {
        const d = await adminRes.json()
        setCanToggle(d.admin?.role === 'super_admin')
      }
    }
    init()
  }, [moduleKey])

  const handleToggle = async () => {
    if (!canToggle || saving || enabled === null) return
    setSaving(true)
    const res = await fetch('/api/admin/feature-flags/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature_key: moduleKey }),
    })
    if (res.ok) {
      const data = await res.json()
      setEnabled(data.enabled)
    }
    setSaving(false)
  }

  if (enabled === null) return null

  return (
    <button
      onClick={handleToggle}
      disabled={!canToggle || saving}
      title={canToggle
        ? (enabled ? 'Click to hide from site' : 'Click to show on site')
        : 'Super admin only — go to Settings → Site Sections'}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 13px',
        background: enabled ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
        border: `1px solid ${enabled ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
        borderRadius: 20,
        cursor: canToggle ? 'pointer' : 'default',
        color: enabled ? '#4ade80' : '#f87171',
        fontSize: 11, fontWeight: 600,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.1em',
        opacity: saving ? 0.6 : 1,
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      {saving
        ? <Loader2 size={11} style={{ animation: 'spin 0.6s linear infinite' }} />
        : enabled ? <Eye size={11} /> : <EyeOff size={11} />}
      {enabled ? 'VISIBLE' : 'HIDDEN'}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </button>
  )
}
