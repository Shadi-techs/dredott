'use client'
// src/app/[locale]/owner/page.tsx

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DollarSign, Calendar, Eye, Plus, MessageCircle,
  Home, Car, ChevronRight, Zap, BarChart2,
  CheckCircle2, XCircle, Timer, Link2
} from 'lucide-react'
import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { getStrings } from '@/lib/owner/strings'

export default function OwnerDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { t, d } = useOwnerTheme()
  const tx = getStrings(locale as any)
  const router = useRouter()
  const supabase = createClient()
  const isAr = locale === 'ar'

  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, properties: 0, cars: 0, views: 0 })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [myProperties, setMyProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { void loadData() }, [])

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push(`/${locale}/login`); return }
    const uid = session.user.id

    // Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single()
    setUser(profile)

    // My properties
    const { data: props, count: propCount } = await supabase
      .from('properties')
      .select('id, name, area, status, display_rating, photos, price_per_night, view_count', { count: 'exact' })
      .eq('owner_id', uid)
      .order('created_at', { ascending: false })
      .limit(4)
    setMyProperties(props || [])

    // My cars count
    const { count: carCount } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', uid)

    // Bookings for my properties
    const propertyIds = (props || []).map((p: any) => p.id)
    let bookings: any[] = []
    let totalRevenue = 0
    if (propertyIds.length > 0) {
      const { data: bks } = await supabase
        .from('bookings')
        .select('id, check_in, check_out, total_amount, status, nights, num_guests, property_id, guest_id, properties(name), profiles(first_name, last_name)')
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })
        .limit(5)
      bookings = bks || []

      // Revenue from confirmed bookings
      const { data: revData } = await supabase
        .from('bookings')
        .select('total_amount')
        .in('property_id', propertyIds)
        .eq('status', 'confirmed')
      totalRevenue = (revData || []).reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0)
    }

    setRecentBookings(bookings)

    // Views: sum of view_count on properties
    const totalViews = (props || []).reduce((sum: number, p: any) => sum + (p.view_count || 0), 0)

    setStats({
      revenue: totalRevenue,
      bookings: bookings.length,
      properties: propCount || 0,
      cars: carCount || 0,
      views: totalViews,
    })

    setLoading(false)
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (isAr) {
      if (h < 12) return 'صباح الخير'
      if (h < 18) return 'مساء الخير'
      return 'مساء النور'
    }
    if (h < 12) return tx.goodMorning
    if (h < 18) return tx.goodAfternoon
    return tx.goodEvening
  }

  const statusColor = (s: string) => {
    if (s === 'confirmed') return '#4ade80'
    if (s === 'pending') return '#D4A843'
    if (s === 'cancelled') return '#f87171'
    return '#9ca3af'
  }

  const statusIcon = (s: string) => {
    if (s === 'confirmed') return <CheckCircle2 size={13} />
    if (s === 'pending') return <Timer size={13} />
    if (s === 'cancelled') return <XCircle size={13} />
    return null
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6' }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${t.border}`, borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: d.pad, maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Greeting ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D4A843', marginBottom: 6 }}>
          {getGreeting()}
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 38, fontWeight: 500, color: t.text, margin: '0 0 6px' }}>
          {user?.first_name} {user?.last_name}
        </h1>
        <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>
          {isAr ? 'نظرة عامة على أداء عقاراتك وسياراتك' : 'Overview of your listings performance'}
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>

        {/* Revenue */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${t.border}`, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: t.textFaint }}>
              {isAr ? 'الإيرادات' : 'Revenue'}
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(212,168,67,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={15} color="#D4A843" />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 500, color: t.text }}>
            ${stats.revenue.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: '#4ade80', marginTop: 6, fontFamily: 'var(--mono)' }}>
            {isAr ? 'الحجوزات المؤكدة' : 'Confirmed bookings'}
          </div>
        </div>

        {/* Bookings */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${t.border}`, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: t.textFaint }}>
              {isAr ? 'الحجوزات' : 'Bookings'}
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(42,157,143,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={15} color="#2A9D8F" />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 500, color: t.text }}>
            {stats.bookings}
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6, fontFamily: 'var(--mono)' }}>
            {isAr ? 'آخر الحجوزات' : 'Latest bookings'}
          </div>
        </div>

        {/* Properties */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${t.border}`, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: t.textFaint }}>
              {isAr ? 'الوحدات' : 'Properties'}
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(44,58,107,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Home size={15} color="#2C3A6B" />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 500, color: t.text }}>
            {stats.properties}
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6, fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Car size={10} color={t.textFaint} /> {stats.cars} {isAr ? 'سيارة' : 'cars'}
          </div>
        </div>

        {/* Views */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${t.border}`, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: t.textFaint }}>
              {isAr ? 'المشاهدات' : 'Views'}
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={15} color="#a855f7" />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 500, color: t.text }}>
            {stats.views.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6, fontFamily: 'var(--mono)' }}>
            {isAr ? 'إجمالي المشاهدات' : 'Total page views'}
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20, marginBottom: 24 }}>

        {/* Recent Bookings */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: t.textFaint }}>
              {isAr ? 'آخر الحجوزات' : 'Recent Bookings'}
            </div>
            <Link href={`/${locale}/owner/bookings`} style={{ fontSize: 12, color: '#D4A843', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              {isAr ? 'الكل' : 'View all'} <ChevronRight size={12} />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: t.textMuted }}>
              <Calendar size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: t.textMuted, marginBottom: 6 }}>
                {isAr ? 'لا توجد حجوزات بعد' : 'No bookings yet'}
              </div>
              <p style={{ fontSize: 13, color: t.textFaint, margin: 0 }}>
                {isAr ? 'سيظهر هنا الحجوزات عند وصولها' : 'Bookings will appear here once received'}
              </p>
            </div>
          ) : (
            <div>
              {recentBookings.map((booking: any, i: number) => {
                const guest = booking.profiles
                const guestName = guest ? `${guest.first_name || ''} ${guest.last_name || ''}`.trim() : '—'
                const initials = guest ? `${guest.first_name?.[0] || ''}${guest.last_name?.[0] || ''}`.toUpperCase() : '?'
                return (
                  <div key={booking.id} style={{ padding: '14px 20px', borderTop: i === 0 ? 'none' : `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(212,168,67,0.12)', color: '#D4A843', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)', flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {guestName}
                      </div>
                      <div style={{ fontSize: 11, color: t.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(booking.properties as any)?.name || '—'}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: t.textFaint, fontFamily: 'var(--mono)', textAlign: 'center', flexShrink: 0 }}>
                      <div>{new Date(booking.check_in).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}</div>
                      <div style={{ fontSize: 10, color: t.textFaint }}>→ {new Date(booking.check_out).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: statusColor(booking.status), flexShrink: 0, background: `${statusColor(booking.status)}15`, padding: '4px 8px', borderRadius: 6 }}>
                      {statusIcon(booking.status)}
                      {booking.status}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: t.textFaint }}>
              {isAr ? 'إجراءات سريعة' : 'Quick Actions'}
            </div>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href={`/${locale}/owner/listings/new`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: '#2C3A6B', color: '#D4A843', cursor: 'pointer', transition: 'opacity 0.15s' }}>
                <Plus size={16} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{tx.addListing}</span>
              </div>
            </Link>
            {[
              { icon: Zap,            label: isAr ? 'عرض خاص'      : 'Flash Deal',     href: `/${locale}/owner/flash-deals` },
              { icon: Calendar,       label: isAr ? 'تقويم الحجز'  : 'Booking Calendar', href: `/${locale}/owner/calendar` },
              { icon: BarChart2,      label: isAr ? 'التحليلات'    : 'Analytics',       href: `/${locale}/owner/analytics` },
              { icon: MessageCircle,  label: isAr ? 'واتساب'       : 'WhatsApp',        href: `/${locale}/owner/whatsapp` },
              { icon: Link2,          label: isAr ? 'مزامنة iCal'  : 'iCal Sync',       href: `/${locale}/owner/ical` },
            ].map(({ icon: Icon, label, href }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: `1px solid ${t.border}`, background: t.surface, color: t.text, cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'border-color 0.15s' }}>
                  <Icon size={15} color={t.textMuted} />{label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── My Listings ── */}
      {myProperties.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: t.textFaint }}>
              {isAr ? 'وحداتي' : 'My Listings'}
            </div>
            <Link href={`/${locale}/owner/listings`} style={{ fontSize: 12, color: '#D4A843', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              {isAr ? 'الكل' : 'View all'} <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 0 }}>
            {myProperties.map((prop: any, i: number) => (
              <Link key={prop.id} href={`/${locale}/owner/listings`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '14px 20px', borderTop: i >= 1 ? `1px solid ${t.border}` : 'none', borderRight: (i % 2 === 0 && i < myProperties.length - 1) ? `1px solid ${t.border}` : 'none', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f3f4f6' }}>
                    {prop.photos?.[0] ? (
                      <img src={prop.photos[0]} alt={prop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(44,58,107,0.08)' }}>
                        <Home size={18} color="#2C3A6B" style={{ opacity: 0.4 }} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {prop.name}
                    </div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                      {prop.area?.replace(/_/g, ' ')} · ${prop.price_per_night}/night
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: prop.status === 'available' ? '#4ade80' : '#f87171', flexShrink: 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                    {prop.status}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No listings CTA */}
      {myProperties.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 14, border: `2px dashed ${t.border}`, padding: '48px 32px', textAlign: 'center' }}>
          <Home size={40} style={{ margin: '0 auto 16px', opacity: 0.2, color: '#2C3A6B', display: 'block' }} />
          <div style={{ fontFamily: 'var(--serif)', fontSize: 24, color: t.text, marginBottom: 8 }}>
            {isAr ? 'لم تضف أي وحدة بعد' : 'No listings yet'}
          </div>
          <p style={{ color: t.textMuted, fontSize: 14, marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
            {isAr ? 'أضف وحدتك الأولى وابدأ في استقبال الحجوزات من خلال DREDOTT' : 'Add your first property or car and start receiving bookings through DREDOTT'}
          </p>
          <Link href={`/${locale}/owner/listings/new`} style={{ textDecoration: 'none' }}>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Plus size={16} />{tx.addListing}
            </button>
          </Link>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
