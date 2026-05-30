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

  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
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

    // Load user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    setUser(profile)

    // Load subscription
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('*, packages(*)')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    setSubscription(sub)

    // Load stats - TODO: Replace with real data
    setStats({
      revenue: 12450,
      occupancy: 78.5,
      bookings: 23,
      views: 1847,
    })

    // Load recent bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, property:properties(name), guest:profiles(first_name, last_name)')
      .eq('property.owner_user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    setRecentBookings(bookings || [])

    // Load pending items
    const { data: props } = await supabase
      .from('properties')
      .select('id, name, review_status')
      .eq('owner_user_id', session.user.id)
      .eq('review_status', 'pending_review')
    setPendingItems(props || [])

    setLoading(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
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
          {locale === 'ar' 
            ? 'نظرة عامة على أداء عقاراتك'
            : 'Overview of your properties performance'
          }
        </p>
      </div>

      {/* No Package Alert */}
      {!subscription && (
        <Card style={{ 
          marginBottom: d.gap, 
          background: t.accentSoft, 
          borderColor: t.accent, 
          borderWidth: 1.5 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: t.accent, color: t.accentInk,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertCircle size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 600, fontSize: 15, color: t.text, marginBottom: 4,
              }}>
                {tx.noSub}
              </div>
              <div style={{ fontSize: 13, color: t.textMuted }}>
                {locale === 'ar'
                  ? 'اختر باقة لبدء نشر عقاراتك وسياراتك على DREDOTT'
                  : 'Choose a package to start listing your properties and cars on DREDOTT'
                }
              </div>
            </div>
            <Link href={`/${locale}/owner/packages`}>
              <Button variant="primary">
                {tx.browsePkg}
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* KPIs */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: d.gap, 
        marginBottom: d.gap 
      }}>
        <KpiCard
          label={tx.revenue}
          value={`AED ${stats.revenue.toLocaleString()}`}
          delta={+12.5}
          sparkData={[45, 52, 48, 61, 55, 67, 58, 72, 65, 78]}
          color={t.accent}
        />
        <KpiCard
          label={tx.occupancy}
          value={`${stats.occupancy}%`}
          delta={+5.2}
          sparkData={[65, 68, 64, 71, 69, 75, 73, 78, 76, 82]}
          color={t.success}
        />
        <KpiCard
          label={tx.bookingsLbl}
          value={stats.bookings.toString()}
          delta={+8.3}
          sparkData={[12, 15, 13, 18, 16, 21, 19, 23, 21, 25]}
          color={t.text}
        />
        <KpiCard
          label={tx.views}
          value={stats.views.toLocaleString()}
          delta={-2.1}
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
              {locale === 'ar' ? 'لا توجد حجوزات قادمة' : 'No upcoming bookings'}
            </div>
          ) : (
            <div>
              {recentBookings.map((booking: any, i: number) => (
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
                    {booking.guest?.first_name?.[0]}{booking.guest?.last_name?.[0]}
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
                      {booking.guest?.first_name} {booking.guest?.last_name}
                    </div>
                    <div style={{ fontSize: 11, color: t.textMuted }}>
                      {booking.property?.name}
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
              ))}
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
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.surface,
                color: t.text,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
                <MessageCircle size={16} />
                {tx.newDeal}
              </button>
            </Link>

            <Link href={`/${locale}/owner/calendar`} style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.surface,
                color: t.text,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
                <Calendar size={16} />
                {tx.blockDates}
              </button>
            </Link>

            <Link href={`/${locale}/owner/ical`} style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.surface,
                color: t.text,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
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
                {pendingItems.length} {locale === 'ar' ? 'عقار قيد المراجعة' : 'listings awaiting review'}
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
                padding: 14,
                borderRadius: 10,
                background: t.bg,
                border: `1px solid ${t.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
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
                    {locale === 'ar' ? 'قيد المراجعة من الإدارة' : 'Pending admin review'}
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
