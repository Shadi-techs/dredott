'use client'
// src/app/[locale]/owner/page.tsx  — Full Owner Dashboard

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar, Plus, MessageCircle, AlertCircle, Clock, Home,
  TrendingUp, TrendingDown, Car, ArrowUpRight, ArrowDownRight,
  Zap, LogIn, LogOut, Star, DollarSign, Eye, Package,
  CheckCircle2, PauseCircle, FileEdit, Activity,
} from 'lucide-react'

import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { Card }     from '@/components/owner/Card'
import { Button }   from '@/components/owner/Button'
import { Badge }    from '@/components/owner/Badge'
import { KpiCard }  from '@/components/owner/KpiCard'
import { getStrings } from '@/lib/owner/strings'

// ── Types ────────────────────────────────────────────────────
interface UpcomingEvent {
  id: string; type: 'checkin' | 'checkout'
  guestName: string; listingName: string
  date: string; nights: number; isCar?: boolean
}
interface ListingPerf {
  id: string; kind: 'property' | 'car'; name: string
  status: string; price: number; views: number; bookingCount: number
}
interface PricingTip {
  id: string; name: string
  current: number; suggested: number; lift: string; reason: string; up: boolean
}
interface ActivityItem {
  id: string; kind: 'booking' | 'review' | 'payout' | 'message'
  text: string; when: string
}

export default function OwnerDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { t, d }  = useOwnerTheme()
  const tx        = getStrings(locale as any)
  const router    = useRouter()
  const isAr      = locale === 'ar'
  const supabase  = createClient()

  const [user,         setUser]         = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [stats, setStats] = useState({
    revenue: 0, occupancy: 0, adr: 0, views: 0, bookings: 0,
    revenueGrowth: 0, bookingsGrowth: 0,
  })
  const [upcoming,   setUpcoming]   = useState<UpcomingEvent[]>([])
  const [activity,   setActivity]   = useState<ActivityItem[]>([])
  const [listings,   setListings]   = useState<ListingPerf[]>([])
  const [priceTips,  setPriceTips]  = useState<PricingTip[]>([])
  const [pendingItems, setPendingItems] = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [isMobile,   setIsMobile]   = useState(false)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 900)
    fn(); window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => { void loadAll() }, [])

  const loadAll = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push(`/${locale}/login`); return }
    const uid = session.user.id

    // ── Run all queries in parallel ─────────────────────────
    const [
      { data: profile },
      { data: sub },
      { data: props },
      { data: carsRaw },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).single(),
      supabase.from('user_subscriptions')
        .select('*, packages(name_en, name_ar, slots_count)')
        .eq('user_id', uid).eq('status', 'active')
        .order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('properties').select('id, name, status, view_count, price_per_night, type').eq('owner_id', uid),
      supabase.from('cars').select('id, name, status, view_count, price_per_day').eq('owner_id', uid),
    ])

    setUser(profile)
    setSubscription(sub ?? null)

    const myProps   = props   || []
    const myCars    = carsRaw || []
    const propIds   = myProps.map((p: any) => p.id)
    const carIds    = myCars.map((c: any)  => c.id)
    const totalViews = [...myProps, ...myCars].reduce((s: number, l: any) => s + (l.view_count || 0), 0)

    // Pending items
    setPendingItems(myProps.filter((p: any) => p.status === 'coming_soon'))

    // ── Bookings queries ────────────────────────────────────
    const now    = new Date()
    const in7    = new Date(now.getTime() + 7  * 864e5).toISOString()
    const ago30  = new Date(now.getTime() - 30 * 864e5).toISOString()
    const ago60  = new Date(now.getTime() - 60 * 864e5).toISOString()

    let allConfirmed: any[] = []
    let recentBks:    any[] = []
    let upcomingBks:  any[] = []

    if (propIds.length > 0) {
      const [
        { data: confirmed },
        { data: recent },
        { data: soon },
      ] = await Promise.all([
        supabase.from('bookings')
          .select('total_amount, nights, created_at, status')
          .in('property_id', propIds).eq('status', 'confirmed'),
        supabase.from('bookings')
          .select('id, check_in, check_out, total_amount, status, nights, property_id, properties(name), profiles(first_name, last_name)')
          .in('property_id', propIds)
          .order('created_at', { ascending: false }).limit(8),
        supabase.from('bookings')
          .select('id, check_in, check_out, nights, property_id, properties(name), profiles(first_name, last_name)')
          .in('property_id', propIds)
          .gte('check_in', now.toISOString()).lte('check_in', in7)
          .order('check_in', { ascending: true }),
      ])
      allConfirmed = confirmed || []
      recentBks    = recent    || []
      upcomingBks  = soon      || []
    }

    // ── KPI calculations ────────────────────────────────────
    const totalRevenue   = allConfirmed.reduce((s: number, b: any) => s + (b.total_amount || 0), 0)
    const totalNights    = allConfirmed.reduce((s: number, b: any) => s + (b.nights || 0), 0)
    const adr            = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0
    const occupancy      = myProps.length > 0 ? Math.min(100, Math.round((totalNights / (myProps.length * 30)) * 100)) : 0

    // Month-over-month growth
    const thisMonthRev = allConfirmed.filter((b: any) => b.created_at >= ago30).reduce((s: number, b: any) => s + (b.total_amount || 0), 0)
    const lastMonthRev = allConfirmed.filter((b: any) => b.created_at >= ago60 && b.created_at < ago30).reduce((s: number, b: any) => s + (b.total_amount || 0), 0)
    const revenueGrowth  = lastMonthRev > 0 ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 1000) / 10 : 0

    const thisMonthBks = allConfirmed.filter((b: any) => b.created_at >= ago30).length
    const lastMonthBks = allConfirmed.filter((b: any) => b.created_at >= ago60 && b.created_at < ago30).length
    const bookingsGrowth = lastMonthBks > 0 ? Math.round(((thisMonthBks - lastMonthBks) / lastMonthBks) * 1000) / 10 : 0

    setStats({ revenue: totalRevenue, occupancy, adr, views: totalViews, bookings: allConfirmed.length, revenueGrowth, bookingsGrowth })

    // ── Upcoming events ─────────────────────────────────────
    const events: UpcomingEvent[] = upcomingBks.map((b: any) => ({
      id: b.id,
      type: 'checkin' as const,
      guestName: b.profiles ? `${b.profiles.first_name || ''} ${b.profiles.last_name || ''}`.trim() : '—',
      listingName: (b.properties as any)?.name || '—',
      date: b.check_in,
      nights: b.nights || 0,
    }))
    setUpcoming(events)

    // ── Activity feed ────────────────────────────────────────
    const acts: ActivityItem[] = recentBks.map((b: any) => {
      const gName = b.profiles ? `${b.profiles.first_name || ''} ${b.profiles.last_name || ''}`.trim() : '—'
      const lName = (b.properties as any)?.name || '—'
      const kind  = b.status === 'confirmed' ? 'booking' : 'message'
      const text  = b.status === 'confirmed'
        ? tx.bookedActivity.replace('{gName}', gName).replace('{lName}', lName)
        : tx.requestActivity.replace('{gName}', gName)
      const when = new Date(b.check_in).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
      return { id: b.id, kind, text, when }
    })
    setActivity(acts)

    // ── Listings performance ─────────────────────────────────
    const propBookingCounts: Record<string, number> = {}
    allConfirmed.forEach((b: any) => {
      propBookingCounts[b.property_id] = (propBookingCounts[b.property_id] || 0) + 1
    })

    const perfProps: ListingPerf[] = myProps.map((p: any) => ({
      id: p.id, kind: 'property', name: p.name,
      status: p.status === 'available' ? 'live' : p.status === 'coming_soon' ? 'pending' : 'paused',
      price: p.price_per_night || 0,
      views: p.view_count || 0,
      bookingCount: propBookingCounts[p.id] || 0,
    }))
    const perfCars: ListingPerf[] = myCars.map((c: any) => ({
      id: c.id, kind: 'car', name: c.name,
      status: c.status === 'available' ? 'live' : c.status === 'coming_soon' ? 'pending' : 'paused',
      price: c.price_per_day || 0,
      views: c.view_count || 0,
      bookingCount: 0,
    }))
    const allListings = [...perfProps, ...perfCars].sort((a, b) => b.views - a.views)
    setListings(allListings)

    // ── Pricing tips (simple heuristic) ─────────────────────
    const tips: PricingTip[] = allListings
      .filter((l) => l.status === 'live' && l.price > 0)
      .slice(0, 3)
      .map((l) => {
        const ratio = l.bookingCount / Math.max(1, l.views / 100)
        const up    = ratio > 5 || occupancy > 80
        const pct   = up ? 10 : -8
        const suggested = Math.round(l.price * (1 + pct / 100))
        const lift  = `${pct > 0 ? '+' : ''}${pct}%`
        const reason = up
          ? tx.highDemandReason
          : tx.lowConversionReason
        return { id: l.id, name: l.name, current: l.price, suggested, lift, reason, up }
      })
    setPriceTips(tips)

    setLoading(false)
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    return h < 12 ? tx.goodMorning : h < 18 ? tx.goodAfternoon : tx.goodEvening
  }

  const overviewLabel: Record<string, string> = {
    ar: 'نظرة عامة على أداء عقاراتك', ru: 'Обзор ваших объектов',
    uk: 'Огляд ваших об\'єктів',        de: 'Übersicht Ihrer Objekte',
    it: 'Panoramica dei tuoi immobili', en: 'Overview of your properties performance',
  }

  const statusColor = (s: string) => s === 'live' ? t.success : s === 'pending' ? t.warning : t.textMuted
  const statusLabel = (s: string) =>
    s === 'live' ? tx.live : s === 'pending' ? tx.pending : tx.paused

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div style={{ padding: d.pad, paddingTop: 60, display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: 32, height: 32, border: `3px solid ${t.border}`,
        borderTopColor: t.accent, borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )

  return (
    <div style={{ padding: d.pad }}>

      {/* ── Greeting ─────────────────────────────────────── */}
      <div style={{ marginBottom: d.gap }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.2em', textTransform: 'uppercase', color: t.accent, marginBottom: 8 }}>
          {getGreeting()}
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: isMobile ? 26 : 36, fontWeight: 500, color: t.text, margin: 0, marginBottom: 6 }}>
          {user?.first_name} {user?.last_name}
        </h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>
          {overviewLabel[locale] ?? overviewLabel.en}
        </p>
      </div>

      {/* ── Subscription Banner ───────────────────────────── */}
      {subscription ? (
        <div style={{
          marginBottom: d.gap,
          padding: '14px 20px',
          borderRadius: 12,
          background: `linear-gradient(135deg, #2C3A6B 0%, #1a2240 100%)`,
          border: `1px solid rgba(212,168,67,0.3)`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} color="#D4A843" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#D4A843', fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>
                {locale === 'ar' ? (subscription.packages?.name_ar || subscription.packages?.name_en) : subscription.packages?.name_en}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(201,206,221,0.6)', marginTop: 2 }}>
                {subscription.expires_at
                  ? `${tx.renewsOn} ${new Date(subscription.expires_at).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : tx.lifetimePlan}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: isAr ? 'left' : 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'var(--serif)' }}>
                {subscription.total_slots || subscription.packages?.slots_count || '—'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(201,206,221,0.5)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {tx.totalSlotsLbl}
              </div>
            </div>
            <Link href={`/${locale}/owner/packages`} style={{
              padding: '8px 16px', borderRadius: 8, background: 'rgba(212,168,67,0.15)',
              border: '1px solid rgba(212,168,67,0.4)', color: '#D4A843',
              fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}>
              {tx.upgradeBtn}
            </Link>
          </div>
        </div>
      ) : (
        <Card style={{ marginBottom: d.gap, background: t.accentSoft, borderColor: t.accent, borderWidth: 1.5 }}>
          <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: t.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={24} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: t.text, marginBottom: 4 }}>{tx.noSub}</div>
              <div style={{ fontSize: 13, color: t.textMuted }}>
                {tx.choosePkgSub}
              </div>
            </div>
            <Link href={`/${locale}/owner/packages`} style={{ textDecoration: 'none' }}>
              <Button variant="primary">{tx.browsePkg}</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ── 5 KPI Cards ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: d.gap, marginBottom: d.gap }}>
        <KpiCard label={tx.revenue}   value={`$${stats.revenue.toLocaleString()}`}   delta={stats.revenueGrowth}  sparkData={[45,52,48,61,55,67,58,72,65,78]} color={t.accent} />
        <KpiCard label={tx.occupancy} value={`${stats.occupancy}%`}                   delta={0}                    sparkData={[65,68,64,71,69,75,73,78,76,82]} color={t.success} />
        <KpiCard label={tx.adr}       value={stats.adr > 0 ? `$${stats.adr}` : '—'}  delta={0}                    sparkData={[55,58,54,61,59,65,63,68,66,72]} color={t.info ?? '#2A9D8F'} />
        <KpiCard label={tx.bookingsLbl} value={stats.bookings.toString()}              delta={stats.bookingsGrowth} sparkData={[12,15,13,18,16,21,19,23,21,25]} color={t.text} />
        <KpiCard label={tx.views}     value={stats.views.toLocaleString()}             delta={0}                    sparkData={[1200,1350,1180,1520,1440,1680,1590,1847,1720,1920]} color={t.textMuted} />
      </div>

      {/* ── Upcoming Events + Quick Actions ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: d.gap, marginBottom: d.gap }}>

        {/* Upcoming Check-ins */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: t.textFaint }}>
              {tx.upcoming} · {tx.checkIns}
            </div>
            <Link href={`/${locale}/owner/bookings`} style={{ fontSize: 12, color: t.accent, textDecoration: 'none', fontWeight: 500 }}>
              {tx.viewAll} →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: t.textMuted, fontSize: 14 }}>
              {tx.noArrivals}
            </div>
          ) : upcoming.map((ev, i) => (
            <div key={ev.id} style={{ padding: '11px 0', borderTop: i === 0 ? 'none' : `1px solid ${t.borderSoft}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: ev.type === 'checkin' ? 'rgba(34,197,94,0.12)' : 'rgba(212,168,67,0.12)',
                color: ev.type === 'checkin' ? t.success : t.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {ev.type === 'checkin' ? <LogIn size={16} /> : <LogOut size={16} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.guestName}
                </div>
                <div style={{ fontSize: 11, color: t.textMuted }}>{ev.listingName}</div>
              </div>
              <div style={{ textAlign: isAr ? 'left' : 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: t.text, fontFamily: 'var(--mono)' }}>
                  {new Date(ev.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                </div>
                <div style={{ fontSize: 11, color: t.textMuted }}>{ev.nights}n</div>
              </div>
            </div>
          ))}
        </Card>

        {/* Quick Actions */}
        <Card>
          <div style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: t.textFaint, marginBottom: 18 }}>
            {tx.quickActions}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href={`/${locale}/owner/listings/new`} style={{ textDecoration: 'none' }}>
              <Button variant="primary" icon={Plus} style={{ width: '100%', justifyContent: 'flex-start' }}>
                {tx.addListing}
              </Button>
            </Link>
            {([
              { href: `/${locale}/owner/flash-deals`, icon: Zap,             label: tx.newDeal },
              { href: `/${locale}/owner/calendar`,    icon: Calendar,         label: tx.blockDates },
              { href: `/${locale}/owner/ical`,         icon: Clock,            label: tx.sync },
              { href: `/${locale}/owner/bookings`,     icon: MessageCircle,    label: tx.bookings },
            ] as any[]).map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${t.border}`, background: t.surface, color: t.text, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Icon size={16} style={{ flexShrink: 0 }} />{label}
                </button>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Activity Feed + Pricing Tips ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr', gap: d.gap, marginBottom: d.gap }}>

        {/* Activity */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: t.textFaint }}>
              {tx.activity}
            </div>
            <Activity size={14} color={t.textFaint} />
          </div>
          {activity.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: t.textMuted, fontSize: 14 }}>
              {tx.noActivity}
            </div>
          ) : activity.map((a, i) => {
            const iconColor = a.kind === 'booking' ? t.success : a.kind === 'review' ? t.accent : a.kind === 'payout' ? t.info ?? '#2A9D8F' : t.textMuted
            const Icon = a.kind === 'booking' ? CheckCircle2 : a.kind === 'review' ? Star : a.kind === 'payout' ? DollarSign : MessageCircle
            return (
              <div key={a.id} style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${t.borderSoft}`, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${iconColor}18`, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Icon size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: t.text, lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: t.textFaint, marginTop: 3 }}>{a.when}</div>
                </div>
              </div>
            )
          })}
        </Card>

        {/* Pricing Tips */}
        <Card>
          <div style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: t.textFaint, marginBottom: 18 }}>
            {tx.pricingTip}
          </div>
          {priceTips.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: t.textMuted, fontSize: 13 }}>
              {tx.noSuggestions}
            </div>
          ) : priceTips.map((tip, i) => (
            <div key={tip.id} style={{ padding: '12px 0', borderTop: i === 0 ? 'none' : `1px solid ${t.borderSoft}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tip.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 11, color: t.textMuted }}>
                  ${tip.current} → <span style={{ color: tip.up ? t.success : t.danger, fontWeight: 600 }}>${tip.suggested}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: tip.up ? t.success : t.danger }}>
                  {tip.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {tip.lift}
                </div>
              </div>
              <div style={{ fontSize: 10, color: t.textFaint, lineHeight: 1.4 }}>{tip.reason}</div>
            </div>
          ))}
          <Link href={`/${locale}/owner/pricing`} style={{ display: 'block', marginTop: 14, textAlign: 'center', fontSize: 12, color: t.accent, textDecoration: 'none', fontWeight: 500 }}>
            {tx.viewAllSuggestions}
          </Link>
        </Card>
      </div>

      {/* ── Listings Performance ──────────────────────────── */}
      {listings.length > 0 && (
        <Card style={{ marginBottom: d.gap }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: t.textFaint }}>
              {tx.listingPerf}
            </div>
            <Link href={`/${locale}/owner/listings`} style={{ fontSize: 12, color: t.accent, textDecoration: 'none', fontWeight: 500 }}>
              {tx.viewAll} →
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {[tx.allListings, tx.status, tx.priceCol, tx.viewsCol, tx.bookingsCol].map((h) => (
                    <th key={h} style={{ textAlign: isAr ? 'right' : 'left', padding: '8px 12px', fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: t.textFaint, borderBottom: `1px solid ${t.border}`, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id} style={{ borderBottom: `1px solid ${t.borderSoft}` }}>
                    <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: l.kind === 'property' ? 'rgba(44,58,107,0.08)' : 'rgba(212,168,67,0.1)', color: l.kind === 'property' ? t.text : t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {l.kind === 'property' ? <Home size={14} /> : <Car size={14} />}
                      </div>
                      <span style={{ fontWeight: 500, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{l.name}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: statusColor(l.status), fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {statusLabel(l.status)}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: t.text, fontFamily: 'var(--mono)', fontSize: 12 }}>
                      ${l.price.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', color: t.textMuted, fontFamily: 'var(--mono)', fontSize: 12 }}>
                      <Eye size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />{l.views.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', color: t.textMuted, fontFamily: 'var(--mono)', fontSize: 12 }}>
                      {l.bookingCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Pending Items ─────────────────────────────────── */}
      {pendingItems.length > 0 && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: t.textFaint, marginBottom: 6 }}>
                {tx.pendingItems}
              </div>
              <div style={{ fontSize: 14, color: t.textMuted }}>
                {pendingItems.length} {tx.awaitingReview}
              </div>
            </div>
            <Link href={`/${locale}/owner/listings`}><Button variant="quiet">{tx.viewAll}</Button></Link>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {pendingItems.slice(0, 3).map((item: any) => (
              <div key={item.id} style={{ padding: 14, borderRadius: 10, background: t.bg, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: t.accentSoft, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Home size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                    {tx.pendingAdminReview}
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
