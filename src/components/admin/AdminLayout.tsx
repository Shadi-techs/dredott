'use client'
// ============================================
// DredottSTAY — Admin Layout
// Sidebar navigation + role-based menu items
// ============================================

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Home, Calendar, Users, Star,
  Settings, ChevronLeft, Menu, X, LogOut,
  FileText, Wrench, UserCheck, BarChart3, Zap
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  user: { name: string; role: string }
}

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['super_admin', 'admin', 'viewer'] },
  { href: '/admin/properties', icon: Home, label: 'Properties', roles: ['super_admin', 'admin', 'viewer'] },
  { href: '/admin/bookings', icon: Calendar, label: 'Bookings', roles: ['super_admin', 'admin', 'viewer'] },
  { href: '/admin/guests', icon: Users, label: 'Guests', roles: ['super_admin', 'admin', 'viewer'] },
  { href: '/admin/reviews', icon: Star, label: 'Reviews', roles: ['super_admin', 'admin'] },
  { href: '/admin/inventory', icon: FileText, label: 'Inventory', roles: ['super_admin', 'admin'] },
  { href: '/admin/staff', icon: Wrench, label: 'Staff', roles: ['super_admin'] },
  { href: '/admin/accounting', icon: BarChart3, label: 'Accounting', roles: ['super_admin'] },
  { href: '/admin/flash-deals', icon: Zap, label: 'Flash Deals', roles: ['super_admin', 'admin'] },
  { href: '/admin/team', icon: UserCheck, label: 'Admin Team', roles: ['super_admin'] },
  { href: '/admin/settings', icon: Settings, label: 'Settings', roles: ['super_admin'] },
]

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user.role))

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[#D4A843]/20">
        <div className="text-[#D4A843] font-medium text-sm">DREDOTT</div>
        {!collapsed && (
          <div className="text-[#A0A8B4] text-[10px] tracking-widest mt-0.5">ADMIN PANEL</div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-sm transition-colors border-l-2 ${
                isActive
                  ? 'bg-[#D4A843]/12 text-[#D4A843] border-[#B8860B]'
                  : 'text-[#E8ECF8]/70 border-transparent hover:bg-white/6 hover:text-[#E8ECF8]'
              }`}
            >
              <Icon size={15} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + role */}
      <div className="border-t border-[#D4A843]/20 p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#B8860B] flex items-center justify-center text-xs font-medium text-[#FFF8DC] flex-shrink-0">
            {user.name[0]}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-[#FBF0D0] truncate">{user.name}</div>
              <div className="text-[10px] text-[#A0A8B4] capitalize">{user.role.replace('_', ' ')}</div>
            </div>
          )}
          {!collapsed && (
            <button className="text-[#A0A8B4] hover:text-[#E24B4A] transition-colors">
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#F5F4F0] overflow-hidden">
      {/* Desktop sidebar */}
      <div className={`hidden lg:flex flex-col bg-[#2C3A6B] flex-shrink-0 transition-all duration-200 ${collapsed ? 'w-[56px]' : 'w-[200px]'}`}>
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-[200px] bg-[#2C3A6B] z-50 lg:hidden">
            <SidebarContent />
          </div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-[#D4A843]/20 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(!mobileOpen) }}
            className="text-[#A0A8B4] hover:text-[#2C3A6B]"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex-1" />
          <a
            href="/"
            target="_blank"
            className="text-xs text-[#A0A8B4] hover:text-[#2C3A6B] flex items-center gap-1"
          >
            View site ↗
          </a>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
