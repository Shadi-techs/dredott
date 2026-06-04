'use client'

import Link from 'next/link'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Users, ToggleRight, ChevronRight, Shield, Settings } from 'lucide-react'

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
    title:       'Feature Flags',
    description: 'تحكم في الأقسام اللي بتظهر في الموقع — Navigation tabs',
    badge:       'Super Admin Only',
  },
]

export default function SettingsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/admin/verify').then(res => {
      if (!res.ok) router.push(`/${locale}/admin/login`)
      else setChecking(false)
    })
  }, [locale])

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F0F2F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F2F7] p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 border border-[#D4A843]/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#D4A843]" />
            </div>
            <div>
              <p className="text-[10px] text-[#D4A843] font-mono tracking-widest uppercase">Admin · Settings</p>
              <h1 className="text-2xl font-light text-[#FBF0D0]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Settings
              </h1>
            </div>
          </div>
          <p className="text-sm text-[#7a8aaa] mt-1">
            إعدادات النظام — Super Admin access only
          </p>
        </div>

        {/* Sections */}
        <div className="grid gap-4">
          {SETTINGS_SECTIONS.map(section => {
            const Icon = section.icon
            return (
              <Link
                key={section.href}
                href={`/${locale}${section.href}`}
                className="group bg-[#1e2d4f] border border-white/8 rounded-xl p-5 hover:border-[#D4A843]/30 transition-all flex items-center gap-5"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${section.color}15`, border: `1px solid ${section.color}25` }}>
                  <Icon className="w-6 h-6" style={{ color: section.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-semibold text-[#FBF0D0] group-hover:text-[#D4A843] transition-colors">
                      {section.title}
                    </h2>
                    <span className="text-[9px] font-mono text-[#7a8aaa] bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" /> {section.badge}
                    </span>
                  </div>
                  <p className="text-sm text-[#7a8aaa]">{section.description}</p>
                </div>

                <ChevronRight className="w-4 h-4 text-[#7a8aaa] group-hover:text-[#D4A843] transition-colors flex-shrink-0" />
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}