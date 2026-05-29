'use client'
// ============================================
// Admin Layout — Fixed
// Path: src/app/[locale]/admin/layout.tsx
//
// ✅ Auth check عن طريق /api/admin/verify (JWT)
// ✅ مش بيستخدم Supabase Auth خالص
// ✅ Sidebar منفصل في AdminSidebar.tsx
// ============================================

import { useState, useEffect, use } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Bell, Menu, X } from 'lucide-react'
import Link from 'next/link'
import AdminSidebar from '@/components/admin/AdminSidebar'

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/verify-pin']

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale }  = use(params)
  const router      = useRouter()
  const pathname    = usePathname()

  const [user, setUser]         = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [unread, setUnread]     = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isPublicPath = PUBLIC_ADMIN_PATHS.some(p => pathname.includes(p))

  // ── Auth check عن طريق JWT cookie ──
  useEffect(() => {
    if (isPublicPath) {
      setLoading(false)
      return
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/verify', { method: 'GET' })

        if (!res.ok) {
          router.push(`/${locale}/admin/login`)
          return
        }

        const data = await res.json()
        setUser(data.admin)
        setLoading(false)
      } catch {
        router.push(`/${locale}/admin/login`)
      }
    }

    checkAuth()
  }, [pathname, locale])

  // ── Unread notifications ──
  useEffect(() => {
    if (!user) return

    async function fetchUnread() {
      try {
        const res = await fetch('/api/admin/notifications/unread-count')
        if (res.ok) {
          const data = await res.json()
          setUnread(data.count || 0)
        }
      } catch {}
    }

    fetchUnread()
  }, [user])

  // ── Login / verify-pin pages — بدون layout ──
  if (isPublicPath) {
    return <>{children}</>
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e1428]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A843]" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-[#0e1428] overflow-hidden">

      {/* ── Sidebar ── */}
      <AdminSidebar
        user={{
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
          role: user.role,
          email: user.email,
        }}
        locale={locale}
      />

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="border-b border-white/10 bg-[#1a2240] px-4 py-3 flex items-center justify-between flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="lg:hidden text-[#7a8aaa] hover:text-[#FBF0D0]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1" />

          {/* Notifications */}
          <Link
            href={`/${locale}/admin/notifications`}
            className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-[#7a8aaa]" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#f87171] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}