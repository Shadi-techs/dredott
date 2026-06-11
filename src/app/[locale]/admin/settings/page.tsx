'use client'

import Link from 'next/link'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Users, ToggleRight, ChevronRight, Shield, Settings, Moon, Sun } from 'lucide-react'
import { useAdminDark } from '@/contexts/AdminDarkContext'

const SETTINGS_SECTIONS = [
  {
    href:        '/admin/settings/admins',
    icon:        Users,
    color:       '#D4A843',
    title:       'Admin Users',
    description: 'إدارة حسابات الـ admins وصلاحياتهم — إضافة وحذف وتعديل',
    badge:       'Super Admin Only',
  },
  {
    href:        '/admin/settings/feature-flags',
    icon:        ToggleRight,
    color:       '#4ade80',
    title:       'Site Sections',
    description: 'تشغيل وإيقاف أقسام الموقع كاملة — Properties / Cars / Services / Blog / Jobs',
    badge:       'Super Admin Only',
  },
]

export default function SettingsIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale }    = use(params)
  const router        = useRouter()
  const { dark, toggle } = useAdminDark()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/admin/verify').then(res => {
      if (!res.ok) router.push(`/${locale}/admin/login`)
      else setChecking(false)
    })
  }, [locale])

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: dark ? '#080d1a' : '#F0F2F7' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(212,168,67,0.2)', borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const bg      = dark ? '#080d1a' : '#F0F2F7'
  const card    = dark ? '#121929' : '#fff'
  const border  = dark ? 'rgba(255,255,255,0.07)' : 'rgba(26,34,64,0.08)'
  const text    = dark ? '#e2e8f0' : '#1a2240'
  const muted   = dark ? '#94a3b8' : '#6B7280'

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: 24 }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={18} color="#D4A843" />
            </div>
            <div>
              <p style={{ fontSize: 10, color: '#D4A843', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.25em', margin: 0 }}>ADMIN · SETTINGS</p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: text, margin: 0, fontWeight: 400 }}>Settings</h1>
            </div>
          </div>
          <p style={{ fontSize: 13, color: muted }}>إعدادات النظام — super admin access only</p>
        </div>

        {/* ── Dark Mode Card ── */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: '20px 24px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: dark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)', border: `1px solid ${dark ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {dark ? <Moon size={22} color="#a78bfa" /> : <Sun size={22} color="#a78bfa" />}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: text, margin: 0 }}>Dark Mode</h2>
              <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em', background: dark ? 'rgba(167,139,250,0.15)' : 'rgba(167,139,250,0.1)', color: '#a78bfa', padding: '2px 8px', borderRadius: 20 }}>
                {dark ? 'ON' : 'OFF'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: muted, margin: 0 }}>
              {dark ? 'الوضع الداكن مفعّل — يؤثر على كل صفحات الأدمن' : 'تفعيل الوضع الداكن لكل صفحات الأدمن'}
            </p>
          </div>

          {/* Toggle switch */}
          <button
            onClick={toggle}
            style={{
              width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
              background: dark ? 'rgba(167,139,250,0.3)' : 'rgba(0,0,0,0.1)',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 3, width: 22, height: 22, borderRadius: '50%',
              background: dark ? '#a78bfa' : '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              left: dark ? 27 : 3,
              transition: 'left 0.2s, background 0.2s',
            }} />
          </button>
        </div>

        {/* ── Navigation links ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SETTINGS_SECTIONS.map(section => {
            const Icon = section.icon
            return (
              <Link
                key={section.href}
                href={`/${locale}${section.href}`}
                style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', transition: 'border-color 0.15s' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${section.color}15`, border: `1px solid ${section.color}25` }}>
                  <Icon size={22} style={{ color: section.color }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: text, margin: 0 }}>{section.title}</h2>
                    <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: muted, padding: '2px 7px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Shield size={8} /> {section.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: muted, margin: 0 }}>{section.description}</p>
                </div>

                <ChevronRight size={16} color={muted} />
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}
