'use client'
// src/app/[locale]/owner/page.tsx
// Owner Dashboard - Main overview page

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, Eye, Users,
  Plus, MessageCircle, AlertCircle, Clock, Home, Car
} from 'lucide-react'

import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { Card } from '@/components/owner/Card'
import { Button } from '@/components/owner/Button'
import { Badge } from '@/components/owner/Badge'
import { KpiCard } from '@/components/owner/KpiCard'
import { getStrings } from '@/lib/owner/strings'
import { DENSITY } from '@/lib/owner/theme'

export default function OwnerDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { t, d } = useOwnerTheme()
  const tx = getStrings(locale as any)
  const router = useRouter()
  const isAr = locale === 'ar'

  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    revenue: 0,
    occupancy: 0,
    bookings: 0,
    views: 0,
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [pendingItems, setPendingItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

    // My properties
    const { data: props } = await supabase
      .from('properties')
      .select('id, name, status, view_count')
      .eq('owner_id', uid)
    const myProps = props || []

    // Pending review items
    setPendingItems(myProps.filter((p: any) => p.status === 'coming_soon'))

    // Total views
    const totalViews = myProps.reduce((sum: number, p: any) => sum + (p.view_count || 0), 0)

    // Bookings for my properties
    const propertyIds = myProps.map((p: any) => p.id)
    let bookings: any[] = []
    let totalRevenue = 0
    let occupancy = 0

    if (propertyIds.length > 0) {
      const { data: bks } = await supabase
        .from('bookings')
        .select('id, check_in, check_out, total_amount, status, nights, property_id, properties(name), profiles(first_name, last_name)')
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })
        .limit(5)
      bookings = bks || []

      const { data: revData } = await supabase
        .from('bookings')
        .select('total_amount, nights')
        .in('property_id', propertyIds)
        .eq('status', 'confirmed')
      totalRevenue = (revData || []).reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0)

      // Simple occupancy: confirmed nights in last 30 days / (properties * 30)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const confirmedNights = (revData || []).reduce((sum: number, b: any) => sum + (b.nights || 0), 0)
      occupancy = myProps.length > 0 ? Math.min(100, Math.round((confirmedNights / (myProps.length * 30)) * 100)) : 0
    }

    setRecentBookings(bookings)
    setStats({
      revenue: totalRevenue,
      occupancy,
      bookings: bookings.length,
      views: totalViews,
    })

    setLoading(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (isAr) {
      if (hour < 12) return 'صباح الخير'
      if (hour < 18) return 'مساء الخير'
      return 'مساء النور'
    }
    if (hour < 12) return tx.goodMorning
    if (hour < 18) return tx.goodAfternoon
    return tx.goodEvening
  }

  if (loading) {
    return (
      <div style={{
        paddingLeft: d.pad,
        paddingRight: d.pad,
        paddingBottom: d.pad,
        paddingTop: 60,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          width: 32, height: 32, border: `3px solid ${t.border}`,
          borderTopColor: t.accent, borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <div style={{ padding: d.pad }}>
      {/* Header */}
      <div style={{ marginBottom: d.gap }}>
        <div style={{
          fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.2em',
          textTransform: 'uppercase', color: t.accent, marginBottom: 8,
        }}>
          {getGreeting()}
        </div>
        <h1 style={{
          fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 500,
          color: t.text, margin: 0, marginBottom: 6,
        }}>
          {user?.first_name} {user?.last_name}
        </h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>
          {isAr
            ? 'نظرة عامة على أداء عقاراتك'
            : 'Overview of your properties performance'
          }
        </p>
      </div>

      {/* KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: d.gap,
        marginBottom: d.gap
      }}>
        <KpiCard
          label={tx.revenue}
          value={`$${stats.revenue.toLocaleString()}`}
          delta={stats.revenue > 0 ? 0 : 0}
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
          delta={0}
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: d.gap, marginBottom: d.gap }}>
        {/* Recent Bookings */}
        <Card>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18
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
            <div style={{
              padding: '40px 0',
              textAlign: 'center',
              color: t.textMuted
            }}>
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
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
                        fontSize: 13,
                        fontWeight: 500,
                        color: t.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {guestName}
                      </div>
                      <div style={{ fontSize: 11, color: t.textMuted }}>
                        {(booking.properties as any)?.name || '—'}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: t.textFaint, fontFamily: 'var(--mono)' }}>
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

      {/* Pending Items */}
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
              <Button variant="quiet">
                {tx.viewAll}
              </Button>
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
                <Badge tone="warning">
                  {tx.pending}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
