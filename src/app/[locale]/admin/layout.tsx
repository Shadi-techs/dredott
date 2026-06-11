'use client'
import { useState, useEffect, use } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { AdminDarkProvider, useAdminDark } from '@/contexts/AdminDarkContext'

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/verify-pin']

function AdminShell({ children, locale }: { children: React.ReactNode; locale: string }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { dark } = useAdminDark()

  const [user,    setUser]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unread,  setUnread]  = useState(0)

  // Auto-lock after 3 minutes of inactivity
  useEffect(() => {
    let timer: NodeJS.Timeout
    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        router.push(`/${locale}/admin/login?reason=timeout`)
      }, 3 * 60 * 1000)
    }
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer()
    return () => { clearTimeout(timer); events.forEach(e => window.removeEventListener(e, resetTimer)) }
  }, [locale])

  const isPublicPath = PUBLIC_ADMIN_PATHS.some(p => pathname.includes(p))

  useEffect(() => {
    if (isPublicPath) { setLoading(false); return }
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/verify', { method: 'GET' })
        if (!res.ok) { router.push(`/${locale}/admin/login`); return }
        const data = await res.json()
        setUser(data.admin)
        setLoading(false)
      } catch { router.push(`/${locale}/admin/login`) }
    }
    checkAuth()
  }, [pathname, locale])

  useEffect(() => {
    if (!user) return
    async function fetchUnread() {
      try {
        const res = await fetch('/api/admin/notifications/unread-count')
        if (res.ok) { const data = await res.json(); setUnread(data.count || 0) }
      } catch {}
    }
    fetchUnread()
    const interval  = setInterval(fetchUnread, 30_000)
    const onFocus   = () => fetchUnread()
    const onStorage = (e: StorageEvent) => { if (e.key === 'admin_notif_read') fetchUnread() }
    const onRefresh = () => fetchUnread()
    window.addEventListener('focus', onFocus)
    window.addEventListener('storage', onStorage)
    window.addEventListener('admin_notif_refresh', onRefresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('admin_notif_refresh', onRefresh)
    }
  }, [user])

  if (isPublicPath) return <>{children}</>

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0e1428' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A843]" />
    </div>
  )

  if (!user) return null

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      data-dark={dark}
      style={{ background: dark ? '#080d1a' : '#F4F6FA', color: dark ? '#e2e8f0' : '#1a2240', transition: 'background 0.2s, color 0.2s' }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#D4A843]/20 flex-shrink-0 z-40" style={{ background: '#0e1428' }}>
        <div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 700, letterSpacing: '0.08em', color: '#D4A843' }}>DREDOTT</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '0.3em', color: 'rgba(160,168,180,0.6)', marginTop: 1 }}>ADMIN PANEL</div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/admin/notifications`} className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-[#7a8aaa]" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#f87171] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Body: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar
          user={{ name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username, role: user.role, email: user.email }}
          locale={locale}
        />
        {/* Page content — background cascades from data-dark on wrapper */}
        <div className="flex-1 overflow-y-auto admin-content" style={{ background: dark ? '#080d1a' : '#F4F6FA' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = use(params)
  return (
    <AdminDarkProvider>
      <AdminShell locale={locale}>{children}</AdminShell>
    </AdminDarkProvider>
  )
}
