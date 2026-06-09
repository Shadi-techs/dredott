'use client'
// src/app/[locale]/owner/page.tsx
// Owner Dashboard - Main overview page

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar, Plus, MessageCircle, AlertCircle, Clock, Home,
} from 'lucide-react'

import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { Card } from '@/components/owner/Card'
import { Button } from '@/components/owner/Button'
import { Badge } from '@/components/owner/Badge'
import { KpiCard } from '@/components/owner/KpiCard'
import { getStrings } from '@/lib/owner/strings'

export default function OwnerDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { t, d } = useOwnerTheme()
  const tx = getStrings(locale as any)
  const router = useRouter()
  const isAr = locale === 'ar'

  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [stats, setStats] = useState({
    revenue: 0,
    occupancy: 0,
    bookings: 0,
    views: 0,
    revenueGrowth: 0,
    bookingsGrowth: 0,
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [pendingItems, setPendingItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => { void loadData() }, [])

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push(`/${locale}/login`)
      return
    }
    const uid = session.user.id

    // Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single()
    setUser(profile)

    // Subscription - gracefully ignore if table doesn't exist yet
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('*, packages(*)')
      .eq('user_id', uid)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()
    setSubscription(sub ?? null)

    // My properties (owner_id is the correct FK)
    const { data: props } = await supabase
      .from('properties')
      .select('id, name, status, view_count')
      .eq('owner_id', uid)
    const myProps = props || []

    // Pending review items
    setPendingItems(myProps.filter((p: any) => p.status === 'coming_soon'))

    // Total views
    const totalViews = myProps.reduce((sum: number, p: any) => sum + (p.view_count || 0), 0)

    const propertyIds = myProps.map((p: any) => p.id)
    let bookings: any[] = []
    let totalRevenue = 0
    let occupancy = 0
    let revenueGrowth = 0
    let bookingsGrowth = 0

    if (propertyIds.length > 0) {
      // Recent bookings for the sidebar list
      const { data: bks } = await supabase
        .from('bookings')
        .select('id, check_in, check_out, total_amount, status, nights, property_id, properties(name), profiles(first_name, last_name)')
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })
        .limit(5)
      bookings = bks || []

      // All confirmed bookings for revenue + growth calculations
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

      const { data: revAll } = await supabase
        .from('bookings')
        .select('total_amount, nights, created_at')
        .in('property_id', propertyIds)
        .eq('status', 'confirmed')
      const allConfirmed = revAll || []

      // Month-over-month revenue growth
      const thisMonthRev = allConfirmed
        .filter((b: any) => new Date(b.created_at) >= thirtyDaysAgo)
        .reduce((s: number, b: any) => s + (b.total_amount || 0), 0)
      const lastMonthRev = allConfirmed
        .filter((b: any) => {
          const d = new Date(b.created_at)
          return d >= sixtyDaysAgo && d < thirtyDaysAgo
        })
        .reduce((s: number, b: any) => s + (b.total_amount || 0), 0)

      totalRevenue = allConfirmed.reduce((s: number, b: any) => s + (b.total_amount || 0), 0)

      if (lastMonthRev > 0) {
        revenueGrowth = Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 1000) / 10
      }

      // Bookings growth this month vs last
      const thisMonthBks = allConfirmed.filter((b: any) => new Date(b.created_at) >= thirtyDaysAgo).length
      const lastMonthBks = allConfirmed.filter((b: any) => {
        const d = new Date(b.created_at)
        return d >= sixtyDaysAgo && d < thirtyDaysAgo
      }).length
      if (lastMonthBks > 0) {
        bookingsGrowth = Math.round(((thisMonthBks - lastMonthBks) / lastMonthBks) * 1000) / 10
      }

      // Occupancy: confirmed nights / (properties × 30 days)
      const confirmedNights = allConfirmed.reduce((s: number, b: any) => s + (b.nights || 0), 0)
      occupancy = myProps.length > 0 ? Math.min(100, Math.round((confirmedNights / (myProps.length * 30)) * 100)) : 0
    }

    setRecentBookings(bookings)
    setStats({ revenue: totalRevenue, occupancy, bookings: bookings.length, views: totalViews, revenueGrowth, bookingsGrowth })
    setLoading(false)
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return tx.goodMorning
    if (h < 18) return tx.goodAfternoon
    return tx.goodEvening
  }

  const overviewLabel: Record<string, string> = {
    ar: 'نظرة عامة على أداء عقاراتك',
    ru: 'Обзор эффективности ваших объектов',
    uk: 'Огляд ефективності ваших об\'єктів',
    de: 'Übersicht Ihrer Immobilien',
    it: 'Panoramica delle tue proprietà',
    en: 'Overview of your properties performance',
  }

  if (loading) {
    return (
      <div style={{
        padding: d.pad,
        paddingTop: 60,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 32, height: 32,
          border: `3px solid ${t.border}`,
          borderTopColor: t.accent,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <div style={{ padding: d.pad }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: d.gap }}>
        <div style={{
          fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.2em',
          textTransform: 'uppercase', color: t.accent, marginBottom: 8,
        }}>
          {getGreeting()}
        </div>
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: isMobile ? 26 : 36,
          fontWeight: 500,
          color: t.text,
          margin: 0, marginBottom: 6,
        }}>
          {user?.first_name} {user?.last_name}
        </h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>
          {overviewLabel[locale] ?? overviewLabel.en}
        </p>
      </div>

      {/* ── No Subscription Alert ── */}
      {!subscription && (
        <Card style={{
          marginBottom: d.gap,
          background: t.accentSoft,
          borderColor: t.accent,
          borderWidth: 1.5,
        }}>
          <div style={{
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: t.accent, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertCircle size={24} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: t.text, marginBottom: 4 }}>
                {tx.noSub}
              </div>
              <div style={{ fontSize: 13, color: t.textMuted }}>
                {({
                  ar: 'اختر باقة لبدء نشر عقاراتك وسياراتك على DREDOTT',
                  ru: 'Выберите тариф для размещения объектов на DREDOTT',
                  uk: 'Виберіть тариф для розміщення об\'єктів на DREDOTT',
                  de: 'Wählen Sie ein Paket, um Ihre Objekte auf DREDOTT zu veröffentlichen',
                  it: 'Scegli un pacchetto per iniziare a pubblicare i tuoi immobili su DREDOTT',
                  en: 'Choose a package to start listing your properties and cars on DREDOTT',
                } as Record<string, string>)[locale] ?? 'Choose a package to start listing your properties and cars on DREDOTT'}
              </div>
            </div>
            <Link href={`/${locale}/owner/packages`} style={{ textDecoration: 'none' }}>
              <Button variant="primary">
                {tx.browsePkg}
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ── KPI Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: d.gap,
        marginBottom: d.gap,
      }}>
        <KpiCard
          label={tx.revenue}
          value={`$${stats.revenue.toLocaleString()}`}
          delta={stats.revenueGrowth}
          sparkData={[45, 52, 48, 61, 55, 67, 58, 72, 65, 78]}
          color={t.accent}
        />
        <KpiCard
          label={tx.occupancy}
          value={`${stats.occupancy}%`}
          delta={0}
          sparkData={[65, 68, 64, 71, 69, 75, 73, 78, 76, 82]}
          color={t.success}
        />
        <KpiCard
          label={tx.bookingsLbl}
          value={stats.bookings.toString()}
          delta={stats.bookingsGrowth}
          sparkData={[12, 15, 13, 18, 16, 21, 19, 23, 21, 25]}
          color={t.text}
        />
        <KpiCard
          label={tx.views}
          value={stats.views.toLocaleString()}
          delta={0}
          sparkData={[1200, 1350, 1180, 1520, 1440, 1680, 1590, 1847, 1720, 1920]}
          color={t.textMuted}
        />
      </div>

      {/* ── Bookings + Quick Actions ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
        gap: d.gap,
        marginBottom: d.gap,
      }}>

        {/* Recent Bookings */}
        <Card>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
          }}>
            <div style={{
              fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: t.textFaint,
            }}>
              {tx.upcoming} {tx.bookingsLbl}
            </div>
            <Link href={`/${locale}/owner/bookings`} style={{
              fontSize: 12, color: t.accent, textDecoration: 'none', fontWeight: 500,
            }}>
              {tx.viewAll} →
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: t.textMuted, fontSize: 14 }}>
              {isAr ? 'لا توجد حجوزات قادمة' : 'No upcoming bookings'}
            </div>
          ) : (
            <div>
              {recentBookings.map((booking: any, i: number) => {
                const guest = booking.profiles
                const guestName = guest
                  ? `${guest.first_name || ''} ${guest.last_name || ''}`.trim()
                  : '—'
                const initials = guest
                  ? `${guest.first_name?.[0] || ''}${guest.last_name?.[0] || ''}`.toUpperCase()
                  : '?'
                return (
                  <div key={booking.id} style={{
                    padding: '12px 0',
                    borderTop: i === 0 ? 'none' : `1px solid ${t.borderSoft}`,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: t.accentSoft, color: t.accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)',
                      flexShrink: 0,
                    }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500, color: t.text,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {guestName}
                      </div>
                      <div style={{ fontSize: 11, color: t.textMuted }}>
                        {(booking.properties as any)?.name || '—'}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 11, color: t.textFaint, fontFamily: 'var(--mono)',
                      display: isMobile ? 'none' : 'block',
                    }}>
                      <Calendar size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {new Date(booking.check_in).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                    </div>
                    <Badge tone={
                      booking.status === 'confirmed' ? 'success' :
                      booking.status === 'pending' ? 'warning' : 'neutral'
                    }>
                      {booking.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <div style={{
            fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: t.textFaint, marginBottom: 18,
          }}>
            {tx.quickActions}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href={`/${locale}/owner/listings/new`} style={{ textDecoration: 'none' }}>
              <Button variant="primary" icon={Plus} style={{ width: '100%', justifyContent: 'flex-start' }}>
                {tx.addListing}
              </Button>
            </Link>
            <Link href={`/${locale}/owner/flash-deals`} style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10, border: `1px solid ${t.border}`,
                background: t.surface, color: t.text, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <MessageCircle size={16} />
                {tx.newDeal}
              </button>
            </Link>
            <Link href={`/${locale}/owner/calendar`} style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10, border: `1px solid ${t.border}`,
                background: t.surface, color: t.text, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <Calendar size={16} />
                {tx.blockDates}
              </button>
            </Link>
            <Link href={`/${locale}/owner/ical`} style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10, border: `1px solid ${t.border}`,
                background: t.surface, color: t.text, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <Clock size={16} />
                {tx.sync}
              </button>
            </Link>
          </div>
        </Card>
      </div>

      {/* ── Pending Items ── */}
      {pendingItems.length > 0 && (
        <Card>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
          }}>
            <div>
              <div style={{
                fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.15em',
                textTransform: 'uppercase', color: t.textFaint, marginBottom: 6,
              }}>
                {tx.pendingItems}
              </div>
              <div style={{ fontSize: 14, color: t.textMuted }}>
                {pendingItems.length} {isAr ? 'عقار قيد المراجعة' : 'listings awaiting review'}
              </div>
            </div>
            <Link href={`/${locale}/owner/listings`}>
              <Button variant="quiet">{tx.viewAll}</Button>
            </Link>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {pendingItems.slice(0, 3).map((item: any) => (
              <div key={item.id} style={{
                padding: 14, borderRadius: 10,
                background: t.bg, border: `1px solid ${t.border}`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: t.accentSoft, color: t.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Home size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.text }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                    {isAr ? 'قيد المراجعة من الإدارة' : 'Pending admin review'}
                  </div>
                </div>
                <Badge tone="warning">{tx.pending}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
