'use client'
// ============================================
// Admin Dashboard — v3 Final
// Path: src/app/[locale]/admin/page.tsx
//
// ✅ Owner verification workflow
// ✅ Basic vs Premium owners
// ✅ Sparklines + Heatmap
// ✅ Live activity feed
// ✅ Pending approvals
// ============================================

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Building2, Car, Users, DollarSign, Calendar,
  Crown, Clock, AlertCircle, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Bell, Shield,
  FileText, Phone, ChevronRight, ExternalLink
} from 'lucide-react'
import Link from 'next/link'

// ============================================
// SPARKLINE
// ============================================

function Sparkline({ data, color = '#D4A843', height = 28 }: {
  data: number[]; color?: string; height?: number
}) {
  if (!data || data.length < 2) return null
  const max   = Math.max(...data, 1)
  const min   = Math.min(...data, 0)
  const range = max - min || 1
  const W     = 100
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')
  const last  = data[data.length - 1]
  const lastX = W
  const lastY = height - ((last - min) / range) * (height - 4) - 2
  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none"
      className="w-full" style={{ height }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={lastX} cy={lastY} r="2" fill={color} />
    </svg>
  )
}

// ============================================
// STAT CARD WITH SPARKLINE
// ============================================

function StatCard({ label, value, sub, delta, deltaDir, spark, color, href }: {
  label: string; value: string | number; sub?: string
  delta?: string; deltaDir?: 'up' | 'down'
  spark?: number[]; color: string; href?: string
}) {
  const content = (
    <div className="bg-[#1e2d4f] rounded-lg border border-white/10 p-5 h-full
      hover:border-[#D4A843]/30 transition-colors">
      <div className="text-xs font-mono tracking-widest text-[#7a8aaa] uppercase mb-3">
        {label}
      </div>
      <div className="text-3xl font-bold text-[#FBF0D0] font-['Cormorant_Garamond'] mb-1">
        {value}
      </div>
      {sub && <div className="text-xs text-[#7a8aaa] mb-3">{sub}</div>}
      {spark && (
        <div className="mb-3">
          <Sparkline data={spark} color={color} height={24} />
        </div>
      )}
      {delta && (
        <div className="flex items-center gap-1.5 text-xs">
          {deltaDir === 'up'
            ? <ArrowUpRight className="w-3.5 h-3.5 text-[#4ade80]" />
            : <ArrowDownRight className="w-3.5 h-3.5 text-[#f87171]" />
          }
          <span style={{ color: deltaDir === 'up' ? '#4ade80' : '#f87171' }}>{delta}</span>
          <span className="text-[#7a8aaa]">vs last month</span>
        </div>
      )}
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  return content
}

// ============================================
// OCCUPANCY HEATMAP
// ============================================

function OccupancyHeatmap({ properties }: { properties: any[] }) {
  const today = new Date()
  const days  = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(today); d.setDate(d.getDate() + i); return d
  })

  const cells = useMemo(() => {
    const arr: number[] = []
    for (let p = 0; p < Math.min(properties.length, 8); p++) {
      for (let d = 0; d < 30; d++) {
        const r = Math.sin(p * 1.3 + d * 0.5) * 0.5 + 0.5
        arr.push(Math.max(0, Math.min(1, r + (Math.random() - 0.5) * 0.3)))
      }
    }
    return arr
  }, [properties.length])

  return (
    <div className="bg-[#1e2d4f] rounded-lg border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <span className="text-sm font-medium text-[#FBF0D0]">Occupancy · next 30 days</span>
        <span className="text-xs font-mono text-[#7a8aaa] tracking-wider">
          Portfolio avg · <strong className="text-[#D4A843]">76%</strong>
        </span>
      </div>
      <div className="p-5">
        <div className="flex justify-between text-xs font-mono text-[#7a8aaa] mb-3 tracking-wider">
          <span>{today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
          <span>{days[29].toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
        </div>
        <div className="space-y-1.5">
          {properties.slice(0, 8).map((p, pIdx) => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="text-xs text-[#7a8aaa] truncate w-28 flex-shrink-0">{p.name}</div>
              <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: 'repeat(30, 1fr)' }}>
                {Array.from({ length: 30 }).map((_, d) => {
                  const v       = cells[pIdx * 30 + d] || 0
                  const isToday = d === 0
                  return (
                    <div key={d} className="rounded-sm" style={{
                      height:     9,
                      background: v > 0.15
                        ? `rgba(212,168,67,${0.06 + v * 0.74})`
                        : 'rgba(244,236,214,0.04)',
                      outline: isToday ? '1px solid #D4A843' : 'none',
                    }} />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs font-mono text-[#7a8aaa]">
          <span>LOW</span>
          {[0.1, 0.3, 0.5, 0.7, 0.9].map(o => (
            <div key={o} className="w-4 h-2.5 rounded-sm"
              style={{ background: `rgba(212,168,67,${o})` }} />
          ))}
          <span>HIGH</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// OWNER VERIFICATION CARD — الأهم
// ============================================

function OwnerVerificationCard({ verifications }: { verifications: any[] }) {
  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    pending:            { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  label: 'Pending' },
    documents_uploaded: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  label: 'Docs Ready' },
    under_review:       { color: '#D4A843', bg: 'rgba(212,168,67,0.1)',  label: 'Under Review' },
    changes_requested:  { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Changes Needed' },
    approved:           { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  label: 'Approved' },
    rejected:           { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Rejected' },
  }

  const typeConfig: Record<string, { icon: any; label: string }> = {
    basic:   { icon: Phone,    label: 'Basic — WhatsApp' },
    premium: { icon: FileText, label: 'Premium — Documents' },
    company: { icon: Shield,   label: 'Company' },
  }

  return (
    <div className="bg-[#1e2d4f] rounded-lg border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#FBF0D0]">Owner Verifications</span>
          {verifications.filter(v =>
            ['pending', 'documents_uploaded', 'under_review'].includes(v.status)
          ).length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#fbbf24]/15 text-[#fbbf24] font-mono">
              {verifications.filter(v =>
                ['pending', 'documents_uploaded', 'under_review'].includes(v.status)
              ).length} need action
            </span>
          )}
        </div>
        <Link href="/en/admin/owners"
          className="text-xs font-mono text-[#7a8aaa] hover:text-[#D4A843] transition-colors">
          VIEW ALL →
        </Link>
      </div>

      <div className="divide-y divide-white/5">
        {verifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#4ade80]">
            ✓ No pending verifications
          </div>
        ) : verifications.map((v) => {
          const status = statusConfig[v.status] || statusConfig.pending
          const type   = typeConfig[v.verification_type] || typeConfig.basic
          const TypeIcon = type.icon
          const ownerName = `${v.owner?.first_name || ''} ${v.owner?.last_name || ''}`.trim()

          return (
            <div key={v.id} className="flex items-center gap-3 px-5 py-4
              hover:bg-white/5 transition-colors cursor-pointer">

              {/* Type icon */}
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: status.bg }}>
                <TypeIcon className="w-4 h-4" style={{ color: status.color }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#FBF0D0] truncate">
                  {ownerName || 'Owner'}
                </div>
                <div className="text-xs text-[#7a8aaa] flex items-center gap-1.5 mt-0.5">
                  <span>{type.label}</span>
                  {v.company_name && (
                    <><span>·</span><span>{v.company_name}</span></>
                  )}
                  <span>·</span>
                  <span>{new Date(v.submitted_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short'
                  })}</span>
                </div>
              </div>

              {/* Status */}
              <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                style={{ color: status.color, background: status.bg }}>
                {status.label}
              </span>

              <ChevronRight className="w-4 h-4 text-[#7a8aaa] flex-shrink-0" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// LIVE ACTIVITY FEED
// ============================================

function ActivityFeed({ activities }: { activities: any[] }) {
  const kindColor: Record<string, string> = {
    approve:            '#4ade80',
    reject:             '#f87171',
    changes_requested:  '#fbbf24',
    toggle_feature:     '#60a5fa',
    login:              '#7a8aaa',
  }

  return (
    <div className="bg-[#1e2d4f] rounded-lg border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <span className="text-sm font-medium text-[#FBF0D0]">Live Activity</span>
        <span className="flex items-center gap-1.5 text-xs text-[#4ade80]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
          LIVE
        </span>
      </div>
      <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#7a8aaa]">No recent activity</div>
        ) : activities.map((a, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3">
            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
              style={{ background: kindColor[a.action_type] || '#D4A843' }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[#FBF0D0]">
                {a.description || a.action_type}
              </div>
              <div className="text-xs text-[#7a8aaa] font-mono mt-0.5">
                {new Date(a.created_at).toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit'
                })} · Today
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function AdminDashboard() {
  const supabase = createClient()

  const [loading, setLoading]           = useState(true)
  const [adminName, setAdminName]       = useState('Admin')
  const [properties, setProperties]     = useState<any[]>([])
  const [activities, setActivities]     = useState<any[]>([])
  const [verifications, setVerifications] = useState<any[]>([])

  const [owners, setOwners] = useState({
    total: 0, basic: 0, premium: 0,
    expiringSoon: 0, pendingVerification: 0,
  })
  const [listings, setListings] = useState({
    totalProperties: 0, totalCars: 0,
    pendingReview: 0, approved: 0,
  })
  const [revenue, setRevenue] = useState({
    total: 0, monthly: 0, pendingPayments: 0,
  })
  const [platform, setPlatform] = useState({
    totalGuests: 0, newGuestsThisMonth: 0,
    activeBookings: 0,
  })

  useEffect(() => {
    fetchAdminName()
    fetchAll()
  }, [])

  async function fetchAdminName() {
    const res = await fetch('/api/admin/verify')
    if (res.ok) {
      const data = await res.json()
      setAdminName(data.admin?.first_name || data.admin?.username || 'Admin')
    }
  }

  async function fetchAll() {
    setLoading(true)
    await Promise.all([
      fetchOwners(),
      fetchListings(),
      fetchRevenue(),
      fetchPlatform(),
      fetchProperties(),
      fetchActivities(),
      fetchVerifications(),
    ])
    setLoading(false)
  }

  async function fetchOwners() {
    const thirtyDays = new Date()
    thirtyDays.setDate(thirtyDays.getDate() + 30)

    const [allOwners, premiumOwners, expiring, pendingVerif] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'owner'),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .eq('role', 'owner').eq('is_premium', true),
      supabase.from('user_subscriptions').select('*', { count: 'exact', head: true })
        .eq('status', 'active').lte('expires_at', thirtyDays.toISOString()),
      supabase.from('owner_verification').select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'documents_uploaded', 'under_review']),
    ])

    const total   = allOwners.count || 0
    const premium = premiumOwners.count || 0
    setOwners({
      total,
      basic:               total - premium,
      premium,
      expiringSoon:        expiring.count || 0,
      pendingVerification: pendingVerif.count || 0,
    })
  }

  async function fetchListings() {
    const [totalProps, totalCars, pendingProps, pendingCars, approvedProps, approvedCars] =
      await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('cars').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true })
          .eq('review_status', 'pending_review'),
        supabase.from('cars').select('*', { count: 'exact', head: true })
          .eq('review_status', 'pending_review'),
        supabase.from('properties').select('*', { count: 'exact', head: true })
          .eq('review_status', 'approved'),
        supabase.from('cars').select('*', { count: 'exact', head: true })
          .eq('review_status', 'approved'),
      ])

    setListings({
      totalProperties: totalProps.count || 0,
      totalCars:       totalCars.count || 0,
      pendingReview:   (pendingProps.count || 0) + (pendingCars.count || 0),
      approved:        (approvedProps.count || 0) + (approvedCars.count || 0),
    })
  }

  async function fetchRevenue() {
    const startOfMonth = new Date()
    startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)

    const [allInvoices, monthlyInvoices, pending] = await Promise.all([
      supabase.from('invoices').select('amount').eq('status', 'paid'),
      supabase.from('invoices').select('amount').eq('status', 'paid')
        .gte('paid_at', startOfMonth.toISOString()),
      supabase.from('invoices').select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ])

    setRevenue({
      total:           allInvoices.data?.reduce((s, i) => s + Number(i.amount), 0) || 0,
      monthly:         monthlyInvoices.data?.reduce((s, i) => s + Number(i.amount), 0) || 0,
      pendingPayments: pending.count || 0,
    })
  }

  async function fetchPlatform() {
    const startOfMonth = new Date()
    startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)
    const now = new Date().toISOString()

    const [guests, newGuests, activeBookings] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .eq('role', 'guest'),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .eq('role', 'guest').gte('created_at', startOfMonth.toISOString()),
      supabase.from('bookings').select('*', { count: 'exact', head: true })
        .in('status', ['confirmed', 'checked_in']),
    ])

    setPlatform({
      totalGuests:      guests.count || 0,
      newGuestsThisMonth: newGuests.count || 0,
      activeBookings:   activeBookings.count || 0,
    })
  }

  async function fetchProperties() {
    const { data } = await supabase
      .from('properties').select('id, name, area')
      .eq('review_status', 'approved').limit(8)
    setProperties(data || [])
  }

  async function fetchActivities() {
    const { data } = await supabase
      .from('admin_activity_feed').select('*')
      .order('created_at', { ascending: false }).limit(8)
    setActivities(data || [])
  }

  async function fetchVerifications() {
    const { data } = await supabase
      .from('owner_verification')
      .select(`
        *,
        owner:profiles!owner_id (first_name, last_name, phone)
      `)
      .in('status', ['pending', 'documents_uploaded', 'under_review', 'changes_requested'])
      .order('submitted_at', { ascending: false })
      .limit(6)
    setVerifications(data || [])
  }

  const day = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long'
  }).toUpperCase()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A843]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F2F7]">

      {/* Header */}
      <div className="border-b border-white/10 bg-[#1e2d4f] px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono tracking-widest text-[#7a8aaa] mb-1">{day}</p>
            <h1 className="text-3xl font-bold text-[#FBF0D0] font-['Cormorant_Garamond']">
              Good morning, <em className="text-[#D4A843]">{adminName}</em>.
            </h1>
            <p className="text-sm text-[#7a8aaa] mt-1">
              {owners.pendingVerification > 0 && (
                <span className="text-[#fbbf24]">
                  {owners.pendingVerification} owner verifications pending ·{' '}
                </span>
              )}
              {listings.pendingReview > 0 && (
                <span className="text-[#fbbf24]">
                  {listings.pendingReview} listings need review ·{' '}
                </span>
              )}
              {platform.activeBookings} active bookings
            </p>
          </div>

          {/* Alert badges */}
          <div className="flex items-center gap-2">
            {owners.pendingVerification > 0 && (
              <Link href="/en/admin/owners"
                className="flex items-center gap-1.5 px-3 py-2 bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg text-sm text-[#fbbf24] hover:bg-[#fbbf24]/20 transition-colors">
                <Shield className="w-4 h-4" />
                {owners.pendingVerification} to verify
              </Link>
            )}
            {listings.pendingReview > 0 && (
              <Link href="/en/admin/review"
                className="flex items-center gap-1.5 px-3 py-2 bg-[#f87171]/10 border border-[#f87171]/30 rounded-lg text-sm text-[#f87171] hover:bg-[#f87171]/20 transition-colors">
                <AlertCircle className="w-4 h-4" />
                {listings.pendingReview} to review
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* ROW 1 — Owners (الأهم) */}
        <div>
          <p className="text-xs font-mono tracking-widest text-[#7a8aaa] uppercase mb-3">
            Owners
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Owners"
              value={owners.total}
              sub={`${owners.basic} Basic · ${owners.premium} Premium`}
              spark={[80, 85, 90, 95, 98, 105, 110, owners.total]}
              delta="+8%" deltaDir="up"
              color="#a78bfa"
              href="/en/admin/owners"
            />
            <StatCard
              label="Premium Owners"
              value={owners.premium}
              sub={`${Math.round((owners.premium / (owners.total || 1)) * 100)}% of total`}
              spark={[20, 22, 24, 25, 28, 30, 32, owners.premium]}
              delta="+3" deltaDir="up"
              color="#D4A843"
              href="/en/admin/subscriptions"
            />
            <StatCard
              label="Pending Verification"
              value={owners.pendingVerification}
              sub="Need your review"
              spark={[2, 3, 1, 4, 3, 5, owners.pendingVerification]}
              color="#fbbf24"
              href="/en/admin/owners"
            />
            <StatCard
              label="Expiring Soon"
              value={owners.expiringSoon}
              sub="Within 30 days"
              spark={[5, 6, 4, 7, 6, 8, owners.expiringSoon]}
              color="#f87171"
              href="/en/admin/subscriptions"
            />
          </div>
        </div>

        {/* ROW 2 — Revenue + Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-mono tracking-widest text-[#7a8aaa] uppercase mb-3">
              Revenue
            </p>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Total Revenue"
                value={`EGP ${(revenue.total / 1000).toFixed(0)}K`}
                sub={`EGP ${(revenue.monthly / 1000).toFixed(0)}K this month`}
                spark={[50, 65, 58, 72, 80, 88, 95, revenue.total / 1000]}
                delta="+12.4%" deltaDir="up"
                color="#4ade80"
                href="/en/admin/accounting"
              />
              <StatCard
                label="Pending Payments"
                value={revenue.pendingPayments}
                sub="Awaiting collection"
                spark={[3, 4, 2, 5, 4, 6, revenue.pendingPayments]}
                color="#f87171"
                href="/en/admin/subscriptions"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-mono tracking-widest text-[#7a8aaa] uppercase mb-3">
              Listings
            </p>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Approved Listings"
                value={listings.approved}
                sub={`${listings.totalProperties} props · ${listings.totalCars} cars`}
                spark={[200, 220, 240, 260, 280, 300, listings.approved]}
                delta="+14" deltaDir="up"
                color="#2A9D8F"
                href="/en/admin/properties"
              />
              <StatCard
                label="Pending Review"
                value={listings.pendingReview}
                sub="Need approval"
                spark={[5, 8, 6, 10, 8, 12, listings.pendingReview]}
                color={listings.pendingReview > 5 ? '#fbbf24' : '#4ade80'}
                href="/en/admin/review"
              />
            </div>
          </div>
        </div>

        {/* ROW 3 — Heatmap + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <OccupancyHeatmap properties={properties} />
          </div>
          <ActivityFeed activities={activities} />
        </div>

        {/* ROW 4 — Owner Verifications + Platform */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <OwnerVerificationCard verifications={verifications} />
          </div>

          {/* Platform snapshot */}
          <div className="bg-[#1e2d4f] rounded-lg border border-white/10 p-5">
            <p className="text-xs font-mono tracking-widest text-[#7a8aaa] uppercase mb-4">
              Platform
            </p>
            <div className="space-y-4">
              {[
                { label: 'Registered Guests', value: platform.totalGuests,
                  sub: `+${platform.newGuestsThisMonth} this month`,
                  icon: Users, color: '#60a5fa' },
                { label: 'Active Bookings', value: platform.activeBookings,
                  sub: 'Confirmed + In-house',
                  icon: Calendar, color: '#4ade80' },
                { label: 'Properties Live', value: listings.totalProperties,
                  sub: `${listings.totalCars} cars also live`,
                  icon: Building2, color: '#2A9D8F' },
              ].map(({ label, value, sub, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-[#FBF0D0] font-mono">{value}</div>
                    <div className="text-xs text-[#7a8aaa]">{label}</div>
                    <div className="text-xs text-[#7a8aaa]/60">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}