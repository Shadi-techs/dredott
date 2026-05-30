'use client'
// src/app/[locale]/owner/layout.tsx
// Owner Portal Layout with Sidebar - EXACT COLORS

import { ReactNode, use } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, List, Calendar, Package, Settings,
  Users, Zap, BarChart2, DollarSign, TrendingUp,
  MessagesSquare, FileText, Link2, Plus, ExternalLink, LogOut
} from 'lucide-react'

import { OwnerThemeProvider } from '@/components/owner/ThemeProvider'
import { PermissionsProvider } from '@/components/owner/PermissionsProvider'
import { getStrings } from '@/lib/owner/strings'

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
  const tx = getStrings(locale as any)
  const isAr = locale === 'ar'

  const navItems = [
    { icon: LayoutDashboard, label: tx.dashboard, href: `/${locale}/owner` },
    { icon: List, label: tx.listings, href: `/${locale}/owner/listings` },
    { icon: Calendar, label: tx.calendar, href: `/${locale}/owner/calendar` },
    { icon: Package, label: tx.packages, href: `/${locale}/owner/packages` },
    { icon: Settings, label: tx.settings, href: `/${locale}/owner/settings` },
  ]

  const growthTools = [
    { icon: Users, label: tx.team, href: `/${locale}/owner/team` },
    { icon: Zap, label: tx.flashDeals, href: `/${locale}/owner/flash-deals` },
    { icon: BarChart2, label: tx.analytics, href: `/${locale}/owner/analytics` },
    { icon: DollarSign, label: tx.financials, href: `/${locale}/owner/financials` },
    { icon: TrendingUp, label: tx.smartPrice, href: `/${locale}/owner/pricing` },
    { icon: MessagesSquare, label: tx.whatsapp, href: `/${locale}/owner/whatsapp` },
    { icon: FileText, label: tx.expenses, href: `/${locale}/owner/expenses` },
    { icon: Users, label: tx.guestHistory, href: `/${locale}/owner/guests` },
    { icon: FileText, label: tx.reports, href: `/${locale}/owner/reports` },
    { icon: Link2, label: tx.icalSync, href: `/${locale}/owner/ical` },
  ]

  return (
    <OwnerThemeProvider>
      <PermissionsProvider>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF9F6' }} dir={isAr ? 'rtl' : 'ltr'}>
          {/* Sidebar - Navy Blue Solid */}
          <aside style={{
            width: SIDEBAR_WIDTH,
            background: '#2C3A6B',        // ✅ Navy Blue SOLID (not gradient)
            color: '#C9CEDD',             // ✅ Light text
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            height: '100vh',
            overflow: 'auto',
            [isAr ? 'right' : 'left']: 0,
          }}>
            {/* Logo */}
            <div style={{ padding: '20px 20px 16px' }}>
              <Link href={`/${locale}/owner`} style={{ textDecoration: 'none' }}>
                <div style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 20,
                  fontWeight: 600,
                  color: '#D4A843',           // ✅ Gold
                  letterSpacing: '0.05em',
                }}>
                  DREDOTT
                </div>
                <div style={{
                  fontSize: 9,
                  fontFamily: 'var(--mono)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(201, 206, 221, 0.5)',  // ✅ Muted sidebar text
                  marginTop: 2,
                }}>
                  {tx.portal}
                </div>
              </Link>
            </div>

            {/* User Profile */}
            <div style={{
              padding: '12px 16px',
              margin: '0 12px 16px',
              background: 'rgba(212, 168, 67, 0.15)',  // ✅ Gold soft background
              borderRadius: 10,
              border: '1px solid rgba(212, 168, 67, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#D4A843',      // ✅ Gold avatar
                  color: '#2C3A6B',           // ✅ Navy text on gold
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'var(--mono)',
                }}>
                  LH
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#C9CEDD',         // ✅ Light text
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    Layla Hadid
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: '#D4A843',         // ✅ Gold
                    fontFamily: 'var(--mono)',
                    marginTop: 2,
                  }}>
                    ✦ {locale === 'ar' ? 'مميز بلس' : 'Atelier Plus'}
                  </div>
                </div>
              </div>

              {/* Usage Bar */}
              <div style={{ marginTop: 10 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 9,
                  color: 'rgba(201, 206, 221, 0.6)',  // ✅ Muted sidebar text
                  marginBottom: 4,
                  fontFamily: 'var(--mono)',
                }}>
                  <span>7/12 {locale === 'ar' ? 'مستخدم' : 'used'}</span>
                  <span>5 {locale === 'ar' ? 'متبقي' : 'left'}</span>
                </div>
                <div style={{
                  height: 4,
                  background: 'rgba(212, 168, 67, 0.2)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: '58%',
                    background: '#D4A843',    // ✅ Gold progress
                    borderRadius: 2,
                  }} />
                </div>
              </div>
            </div>

            {/* General Navigation */}
            <div style={{ padding: '0 12px', marginBottom: 20 }}>
              <div style={{
                fontSize: 9,
                fontFamily: 'var(--mono)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(201, 206, 221, 0.5)',  // ✅ Muted section label
                marginBottom: 8,
                paddingLeft: 8,
              }}>
                {locale === 'ar' ? 'عام' : 'General'}
              </div>
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: isActive ? 'rgba(212, 168, 67, 0.15)' : 'transparent',
                      color: isActive ? '#D4A843' : 'rgba(201, 206, 221, 0.7)',  // ✅ Gold when active
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      marginBottom: 2,
                    }}>
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Growth Tools */}
            <div style={{ padding: '0 12px', flex: 1 }}>
              <div style={{
                fontSize: 9,
                fontFamily: 'var(--mono)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(201, 206, 221, 0.5)',  // ✅ Muted section label
                marginBottom: 8,
                paddingLeft: 8,
              }}>
                {locale === 'ar' ? 'أدوات النمو' : 'Growth tools'}
              </div>
              {growthTools.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: isActive ? 'rgba(212, 168, 67, 0.15)' : 'transparent',
                      color: isActive ? '#D4A843' : 'rgba(201, 206, 221, 0.7)',  // ✅ Gold when active
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      marginBottom: 2,
                    }}>
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Add Listing Button - Dark Gold */}
            <div style={{ padding: '16px 12px' }}>
              <Link href={`/${locale}/owner/listings/new`} style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px',
                  background: '#B8860B',      // ✅ Dark Gold for button
                  color: '#FFFFFF',           // ✅ White text
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}>
                  <Plus size={16} />
                  {tx.addListing}
                </button>
              </Link>
            </div>

            {/* Footer Links */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(201, 206, 221, 0.15)',  // ✅ Sidebar border
            }}>
              <Link href={`/${locale}`} target="_blank" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 0',
                color: 'rgba(201, 206, 221, 0.5)',  // ✅ Muted link
                fontSize: 12,
                textDecoration: 'none',
              }}>
                <ExternalLink size={14} />
                {tx.viewSite}
              </Link>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 0',
                color: 'rgba(201, 206, 221, 0.5)',  // ✅ Muted link
                fontSize: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                width: '100%',
              }}>
                <LogOut size={14} />
                {tx.signOut}
              </button>
            </div>
          </aside>

          {/* Main Content - Light Background */}
          <main style={{
            flex: 1,
            [isAr ? 'marginRight' : 'marginLeft']: SIDEBAR_WIDTH,
          }}>
            {children}
          </main>
        </div>
      </PermissionsProvider>
    </OwnerThemeProvider>
  )
}
