'use client'
// src/app/[locale]/owner/layout.tsx

import { ReactNode, use, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, List, Calendar, Package, Settings,
  Users, Zap, BarChart2, DollarSign, TrendingUp,
  MessagesSquare, FileText, Link2, Plus, ExternalLink,
  LogOut, Menu, X, Car, Home
} from 'lucide-react'

import { OwnerThemeProvider } from '@/components/owner/ThemeProvider'
import { PermissionsProvider } from '@/components/owner/PermissionsProvider'
import { getStrings } from '@/lib/owner/strings'
import { createClient } from '@/lib/supabase/client'

const SIDEBAR_WIDTH = 240

export default function OwnerLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const pathname = usePathname()
  const router = useRouter()
  const tx = getStrings(locale as any)
  const isAr = locale === 'ar'
  const supabase = createClient()

  const [profile, setProfile] = useState<any>(null)
  const [propCount, setPropCount] = useState(0)
  const [carCount, setCarCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => { void loadUser() }, [])

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push(`/${locale}/login`); return }

    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    if (prof) setProfile(prof)

    const { count: pc } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', session.user.id)
    setPropCount(pc || 0)

    const { count: cc } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', session.user.id)
    setCarCount(cc || 0)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(`/${locale}`)
  }

  const initials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || '?'
    : '?'

  const fullName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.role
    : '...'

  const totalListings = propCount + carCount

  const navItems = [
    { icon: LayoutDashboard, label: tx.dashboard,  href: `/${locale}/owner` },
    { icon: List,            label: tx.listings,   href: `/${locale}/owner/listings` },
    { icon: Calendar,        label: tx.calendar,   href: `/${locale}/owner/calendar` },
    { icon: Package,         label: tx.packages,   href: `/${locale}/owner/packages` },
    { icon: Settings,        label: tx.settings,   href: `/${locale}/owner/settings` },
  ]

  const growthTools = [
    { icon: Users,        label: tx.team,        href: `/${locale}/owner/team` },
    { icon: Zap,          label: tx.flashDeals,  href: `/${locale}/owner/flash-deals` },
    { icon: BarChart2,    label: tx.analytics,   href: `/${locale}/owner/analytics` },
    { icon: DollarSign,   label: tx.financials,  href: `/${locale}/owner/financials` },
    { icon: TrendingUp,   label: tx.smartPrice,  href: `/${locale}/owner/pricing` },
    { icon: MessagesSquare, label: tx.whatsapp,  href: `/${locale}/owner/whatsapp` },
    { icon: FileText,     label: tx.expenses,    href: `/${locale}/owner/expenses` },
    { icon: Users,        label: tx.guestHistory,href: `/${locale}/owner/guests` },
    { icon: FileText,     label: tx.reports,     href: `/${locale}/owner/reports` },
    { icon: Link2,        label: tx.icalSync,    href: `/${locale}/owner/ical` },
  ]

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href={`/${locale}/owner`} style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: '#D4A843', letterSpacing: '0.05em' }}>
            DREDOTT
          </div>
          <div style={{ fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,206,221,0.5)', marginTop: 2 }}>
            {tx.portal}
          </div>
        </Link>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(201,206,221,0.6)', cursor: 'pointer', padding: 4 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* User Profile */}
      <div style={{ padding: '12px 16px', margin: '0 12px 16px', background: 'rgba(212,168,67,0.15)', borderRadius: 10, border: '1px solid rgba(212,168,67,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#D4A843', color: '#2C3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#C9CEDD', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fullName}
            </div>
            <div style={{ fontSize: 10, color: '#D4A843', fontFamily: 'var(--mono)', marginTop: 2 }}>
              ✦ {locale === 'ar' ? 'مالك عقار' : 'Property Owner'}
            </div>
          </div>
        </div>

        {/* Listings usage */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(201,206,221,0.6)', marginBottom: 4, fontFamily: 'var(--mono)' }}>
            <span>{totalListings} {locale === 'ar' ? 'إعلان' : 'listings'}</span>
            <span>
              <Home size={8} style={{ verticalAlign: 'middle', marginRight: 2 }} />{propCount}
              {' · '}
              <Car size={8} style={{ verticalAlign: 'middle', marginRight: 2 }} />{carCount}
            </span>
          </div>
          <div style={{ height: 4, background: 'rgba(212,168,67,0.2)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, totalListings * 10)}%`, background: '#D4A843', borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      {/* General Nav */}
      <div style={{ padding: '0 12px', marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,206,221,0.5)', marginBottom: 8, paddingLeft: 8 }}>
          {locale === 'ar' ? 'عام' : 'General'}
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: isActive ? 'rgba(212,168,67,0.15)' : 'transparent', color: isActive ? '#D4A843' : 'rgba(201,206,221,0.7)', fontSize: 13, fontWeight: isActive ? 600 : 500, cursor: 'pointer', transition: 'all 0.15s', marginBottom: 2 }}>
                <item.icon size={16} /><span>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Growth Tools */}
      <div style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,206,221,0.5)', marginBottom: 8, paddingLeft: 8 }}>
          {locale === 'ar' ? 'أدوات النمو' : 'Growth tools'}
        </div>
        {growthTools.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: isActive ? 'rgba(212,168,67,0.15)' : 'transparent', color: isActive ? '#D4A843' : 'rgba(201,206,221,0.7)', fontSize: 13, fontWeight: isActive ? 600 : 500, cursor: 'pointer', transition: 'all 0.15s', marginBottom: 2 }}>
                <item.icon size={16} /><span>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Add Listing */}
      <div style={{ padding: '16px 12px' }}>
        <Link href={`/${locale}/owner/listings/new`} onClick={() => setSidebarOpen(false)} style={{ textDecoration: 'none' }}>
          <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: '#B8860B', color: '#FFFFFF', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Plus size={16} />{tx.addListing}
          </button>
        </Link>
      </div>

      {/* Footer Links */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(201,206,221,0.15)' }}>
        <Link href={`/${locale}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', color: 'rgba(201,206,221,0.5)', fontSize: 12, textDecoration: 'none' }}>
          <ExternalLink size={14} />{tx.viewSite}
        </Link>
        <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', color: 'rgba(248,113,113,0.7)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: isAr ? 'right' : 'left' }}>
          <LogOut size={14} />{tx.signOut}
        </button>
      </div>
    </>
  )

  return (
    <OwnerThemeProvider>
      <PermissionsProvider>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF9F6' }} dir={isAr ? 'rtl' : 'ltr'}>

          {/* Desktop Sidebar */}
          {!isMobile && (
            <aside style={{ width: SIDEBAR_WIDTH, background: '#2C3A6B', color: '#C9CEDD', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', overflow: 'hidden', [isAr ? 'right' : 'left']: 0, zIndex: 30 }}>
              <SidebarContent />
            </aside>
          )}

          {/* Mobile Overlay */}
          {isMobile && sidebarOpen && (
            <>
              <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
              <aside style={{ width: SIDEBAR_WIDTH, background: '#2C3A6B', color: '#C9CEDD', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', overflow: 'hidden', [isAr ? 'right' : 'left']: 0, zIndex: 50 }}>
                <SidebarContent />
              </aside>
            </>
          )}

          {/* Main Content */}
          <main style={{ flex: 1, [isAr ? 'marginRight' : 'marginLeft']: isMobile ? 0 : SIDEBAR_WIDTH, minHeight: '100vh' }}>
            {/* Mobile Top Bar */}
            {isMobile && (
              <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#2C3A6B', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: '#D4A843', letterSpacing: '0.05em' }}>DREDOTT</div>
                <button onClick={() => setSidebarOpen(true)} style={{ background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)', borderRadius: 8, padding: '8px 10px', color: '#D4A843', cursor: 'pointer' }}>
                  <Menu size={18} />
                </button>
              </div>
            )}
            {children}
          </main>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </PermissionsProvider>
    </OwnerThemeProvider>
  )
}
