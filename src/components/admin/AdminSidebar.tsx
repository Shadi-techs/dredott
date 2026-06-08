'use client'
// ============================================
// AdminSidebar — Updated v2
// Path: src/components/admin/AdminSidebar.tsx
//
// ✅ Locale-aware nav links
// ✅ Logout عن طريق /api/admin/logout (JWT)
// ✅ Role-based menu
// ✅ Collapsible sidebar
// ✅ Mobile overlay
// ✅ Sections منظمة زي الـ v2 design
// ============================================

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Home, Car, Calendar, Users, Mail,
  Settings, ChevronLeft, Menu, X, LogOut,
  FileText, Wrench, BarChart3, Zap,
  Bell, ShieldCheck, Crown, Newspaper,
  BookOpen, Activity, BadgePercent, Megaphone,
  Building2, Star, Map, UserCheck, Package,
  Gift, Briefcase, HeartHandshake, Lightbulb,
  Lock
} from 'lucide-react'

interface AdminUser {
  name: string
  role: 'super_admin' | 'admin' | 'viewer'
  email: string
}

interface NavItem {
  href: string
  icon: any
  label: string
  roles: string[]
  badge?: string
  locked?: boolean  // قريباً — مش متاح لسه
}

interface NavSection {
  title: string
  items: NavItem[]
}

// ============================================
// NAV SECTIONS — منظمة زي الـ v2
// ============================================

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { href: '/admin',                icon: LayoutDashboard, label: 'Dashboard',         roles: ['super_admin', 'admin', 'viewer'] },
      { href: '/admin/notifications',  icon: Bell,            label: 'Notifications',     roles: ['super_admin', 'admin'] },
      { href: '/admin/email',          icon: Mail,            label: 'Email',             roles: ['super_admin', 'admin'] },
    ],
  },
  {
    title: 'MODERATION',
    items: [
      { href: '/admin/review',         icon: ShieldCheck,     label: 'Approvals',         roles: ['super_admin', 'admin'] },
      { href: '/admin/owners',         icon: Users,           label: 'Owners',            roles: ['super_admin', 'admin'] },
    ],
  },
  {
    title: 'SITE SECTIONS',
    items: [
      { href: '/admin/properties',     icon: Home,            label: 'Properties',        roles: ['super_admin', 'admin', 'viewer'] },
      { href: '/admin/cars',           icon: Car,             label: 'Cars',              roles: ['super_admin', 'admin', 'viewer'] },
      { href: '/admin/blog',           icon: Newspaper,       label: 'Blog',              roles: ['super_admin', 'admin'] },
      { href: '/admin/flash-deals',    icon: Zap,             label: 'Flash Deals',       roles: ['super_admin', 'admin'] },
      { href: '/admin/ads',            icon: Megaphone,       label: 'Ads',               roles: ['super_admin', 'admin'] },
    ],
  },
  {
    title: 'SHARED MODULES',
    items: [
      { href: '/admin/bookings',       icon: Calendar,        label: 'Bookings',          roles: ['super_admin', 'admin', 'viewer'] },
      { href: '/admin/guests',         icon: Users,           label: 'Guests',            roles: ['super_admin', 'admin', 'viewer'] },
      { href: '/admin/subscriptions',  icon: Crown,           label: 'Subscriptions',     roles: ['super_admin', 'admin'] },
      { href: '/admin/promo-codes',    icon: BadgePercent,    label: 'Promo Codes',       roles: ['super_admin'] },
      { href: '/admin/referral-codes', icon: Gift,            label: 'Referral Codes',    roles: ['super_admin'] },
      { href: '/admin/inventory',      icon: FileText,        label: 'Inventory',         roles: ['super_admin', 'admin'] },
    ],
  },
  {
    title: 'PLATFORM',
    items: [
      { href: '/admin/property-managers', icon: Briefcase,   label: 'Prop. Managers',    roles: ['super_admin', 'admin'] },
      { href: '/admin/service-providers', icon: HeartHandshake, label: 'Services',       roles: ['super_admin', 'admin'] },
      { href: '/admin/appointments',   icon: Calendar,        label: 'Appointments',      roles: ['super_admin', 'admin'] },
      { href: '/admin/courtesy',       icon: HeartHandshake,  label: 'Courtesy',          roles: ['super_admin', 'admin'] },
      { href: '/admin/quality-index',  icon: BarChart3,       label: 'Quality Index',     roles: ['super_admin', 'admin'] },
      { href: '/admin/suggestions',    icon: Lightbulb,       label: 'Suggestions',       roles: ['super_admin', 'admin'] },
      { href: '/admin/cities',         icon: Map,             label: 'Cities',            roles: ['super_admin'] },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { href: '/admin/staff',          icon: Wrench,          label: 'Staff',             roles: ['super_admin'] },
      { href: '/admin/activity',       icon: Activity,        label: 'Activity Log',      roles: ['super_admin'] },
      { href: '/admin/master-plan',    icon: BookOpen,        label: 'Master Plan',       roles: ['super_admin'] },
      { href: '/admin/settings',       icon: Settings,        label: 'Settings',          roles: ['super_admin'] },
    ],
  },
]

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  viewer: 'Viewer',
}

export default function AdminSidebar({ user, locale }: { user: AdminUser; locale: string }) {
  const pathname                    = usePathname()
  const router                      = useRouter()
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // ============================================
  // LOGOUT — عن طريق API route (JWT)
  // مش عن طريق supabase.auth.signOut()
  // ============================================
  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {
      // حتى لو فشل الـ API call، امسح الـ cookie وروح للـ login
    }
    router.push(`/${locale}/admin/login`)
  }

  // ── Active check (locale-aware) ──
  const isActive = (href: string) => {
    const fullHref = `/${locale}${href}`
    if (href === '/admin') {
      return pathname === fullHref
    }
    return pathname.startsWith(fullHref)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* ── Collapse Button ── */}
      <div className="px-3 py-3 border-b border-[#D4A843]/20 flex items-center justify-end">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden lg:flex text-[#A0A8B4] hover:text-[#D4A843] transition-colors p-1.5 rounded-lg hover:bg-white/5"
        >
          <ChevronLeft size={14} className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* ── Nav Sections ── */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(item => item.roles.includes(user.role))
          if (visibleItems.length === 0) return null

          return (
            <div key={section.title} className="mb-3">
              {/* Section title */}
              {!collapsed && (
                <div className="px-3 py-1 text-[9px] font-semibold tracking-[0.2em] text-[#A0A8B4]/50 uppercase mb-1">
                  {section.title}
                </div>
              )}
              {collapsed && <div className="border-t border-[#D4A843]/10 my-2 mx-2" />}

              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon     = item.icon
                  const active   = isActive(item.href)
                  const fullHref = `/${locale}${item.href}`

                  if (item.locked) {
                    return (
                      <div
                        key={item.href}
                        title={collapsed ? item.label : undefined}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm opacity-40 cursor-not-allowed border-l-2 border-transparent"
                      >
                        <Icon size={15} className="flex-shrink-0 text-[#E8ECF8]/40" />
                        {!collapsed && (
                          <>
                            <span className="truncate text-[#E8ECF8]/40">{item.label}</span>
                            <Lock size={10} className="ml-auto text-[#A0A8B4]/50" />
                          </>
                        )}
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.href}
                      href={fullHref}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={`
                        flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all border-l-2
                        ${active
                          ? 'bg-[#D4A843]/12 text-[#D4A843] border-[#D4A843] font-medium'
                          : 'text-[#E8ECF8]/70 border-transparent hover:bg-white/6 hover:text-[#E8ECF8]'
                        }
                      `}
                    >
                      <Icon size={15} className="flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className="ml-auto text-[9px] bg-[#f87171]/20 text-[#f87171] px-1.5 py-0.5 rounded-full font-mono">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* ── User + Logout ── */}
      <div className="border-t border-[#D4A843]/20 p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#D4A843]/20 border border-[#D4A843]/40 flex items-center justify-center text-xs font-bold text-[#D4A843] flex-shrink-0 uppercase">
            {user.name[0] || 'A'}
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#FBF0D0] truncate">{user.name}</div>
                <div className="text-[9px] text-[#D4A843] uppercase tracking-wider">
                  {ROLE_LABELS[user.role] || user.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                title="Logout"
                className="text-[#A0A8B4] hover:text-[#f87171] transition-colors p-1 rounded disabled:opacity-50"
              >
                {loggingOut
                  ? <div className="w-3.5 h-3.5 border border-[#f87171]/50 border-t-[#f87171] rounded-full animate-spin" />
                  : <LogOut size={14} />
                }
              </button>
            </>
          )}

          {collapsed && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Logout"
              className="text-[#A0A8B4] hover:text-[#f87171] transition-colors p-1 rounded disabled:opacity-50"
            >
              {loggingOut
                ? <div className="w-3.5 h-3.5 border border-[#f87171]/50 border-t-[#f87171] rounded-full animate-spin" />
                : <LogOut size={14} />
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <div
        style={{ display: isMobile ? 'none' : 'flex', flexDirection: 'column', background: '#0e1428', flexShrink: 0, transition: 'all 0.2s', borderRight: '1px solid rgba(212,168,67,0.1)', width: collapsed ? 56 : 210 }}
      >
        <SidebarContent />
      </div>

      {/* ── Mobile: Hamburger Button ── */}
      <button
        onClick={() => setMobileOpen(o => !o)}
        style={{ display: isMobile ? "flex" : "none", position: "fixed", top: 12, left: 12, zIndex: 50, background: "#0e1428", border: "1px solid rgba(212,168,67,0.2)", color: "#D4A843", padding: 8, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.3)", cursor: "pointer", alignItems: "center", justifyContent: "center" }}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }}
            onClick={() => setMobileOpen(false)}
          />
          <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 210, background: "#0e1428", zIndex: 50, borderRight: "1px solid rgba(212,168,67,0.1)" }}>
            <SidebarContent />
          </div>
        </>
      )}
    </>
  )
}