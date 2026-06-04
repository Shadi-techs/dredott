'use client'
// ============================================
// Admin Subscriptions Page
// Path: src/app/[locale]/admin/subscriptions/page.tsx
//
// ✅ قائمة كل الـ subscriptions مع الـ owner
// ✅ Filter: all / active / expired / cancelled
// ✅ تعديل الـ slots يدوياً
// ✅ إلغاء / تجديد subscription
// ✅ عرض الـ packages
// ============================================

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Crown, Search, X, ChevronRight,
  Calendar, Package, AlertCircle,
  CheckCircle2, XCircle, RefreshCw,
  Plus, Minus, Save, Clock, Users
} from 'lucide-react'

// ============================================
// TYPES
// ============================================

interface Subscription {
  id: string
  user_id: string
  package_id: string
  total_slots: number
  used_slots: number
  status: string
  started_at: string
  expires_at: string
  cancelled_at: string
  stripe_subscription_id: string
  stripe_customer_id: string
  payment_method: string
  auto_renew: boolean
  is_premium: boolean
  admin_notes: string
  custom_total_slots: number
  custom_slots_reason: string
  created_at: string
  owner: {
    id: string
    first_name: string
    last_name: string
    phone: string
    email: string
  }
  package: {
    id: string
    name_en: string
    name_ar: string
    slots_count: number
    price: number
    currency: string
    duration_days: number
    max_photos_per_listing: number
    max_flash_deals_per_month: number
    max_featured_listings: number
    max_team_members: number
  }
}

interface Package {
  id: string
  name_en: string
  name_ar: string
  slots_count: number
  price: number
  currency: string
  duration_days: number
  is_active: boolean
  display_order: number
  max_photos_per_listing: number
  max_flash_deals_per_month: number
  max_featured_listings: number
  max_team_members: number
  max_co_hosts: number
  features: any
}

type FilterType = 'all' | 'active' | 'expired' | 'cancelled'

// ============================================
// STATUS CONFIG
// ============================================

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Active',    color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  expired:   { label: 'Expired',   color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  cancelled: { label: 'Cancelled', color: '#7a8aaa', bg: 'rgba(122,138,170,0.1)' },
  past_due:  { label: 'Past Due',  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.expired
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ color: config.color, background: config.bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
      {config.label}
    </span>
  )
}

// ============================================
// SUBSCRIPTION DRAWER
// ============================================

function SubscriptionDrawer({
  sub, onClose, onUpdate
}: {
  sub: Subscription | null
  onClose: () => void
  onUpdate: () => void
}) {
  const supabase = createClient()
  const [customSlots, setCustomSlots]   = useState(0)
  const [slotsReason, setSlotsReason]   = useState('')
  const [adminNotes, setAdminNotes]     = useState('')
  const [saving, setSaving]             = useState(false)
  const [action, setAction]             = useState<'cancel' | 'renew' | null>(null)

  useEffect(() => {
    if (sub) {
      setCustomSlots(sub.custom_total_slots || sub.total_slots)
      setSlotsReason(sub.custom_slots_reason || '')
      setAdminNotes(sub.admin_notes || '')
    }
  }, [sub])

  if (!sub) return null

  const ownerName = `${sub.owner?.first_name || ''} ${sub.owner?.last_name || ''}`.trim()
  const daysLeft  = sub.expires_at
    ? Math.ceil((new Date(sub.expires_at).getTime() - Date.now()) / 86400000)
    : 0
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 30

  async function handleSaveSlots() {
    setSaving(true)
    await supabase.from('user_subscriptions').update({
      custom_total_slots:  customSlots,
      custom_slots_reason: slotsReason,
      admin_notes:         adminNotes,
      total_slots:         customSlots,
      updated_at:          new Date().toISOString(),
    }).eq('id', sub.id)

    // سجّل في activity
    await fetch('/api/admin/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_type:  'update_subscription_slots',
        target_type:  'user_subscription',
        target_id:    sub.id,
        description:  `Updated slots to ${customSlots} for ${ownerName}`,
        before_state: { total_slots: sub.total_slots },
        after_state:  { total_slots: customSlots },
      }),
    })

    setSaving(false)
    onUpdate()
  }

  async function handleCancel() {
    setSaving(true)
    await supabase.from('user_subscriptions').update({
      status:       'cancelled',
      cancelled_at: new Date().toISOString(),
      auto_renew:   false,
      updated_at:   new Date().toISOString(),
    }).eq('id', sub.id)

    await fetch('/api/admin/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_type:  'cancel_subscription',
        target_type:  'user_subscription',
        target_id:    sub.id,
        description:  `Cancelled subscription for ${ownerName}`,
        before_state: { status: sub.status },
        after_state:  { status: 'cancelled' },
      }),
    })

    setSaving(false)
    setAction(null)
    onUpdate()
    onClose()
  }

  async function handleRenew() {
    setSaving(true)
    const newExpiry = new Date()
    newExpiry.setDate(newExpiry.getDate() + (sub.package?.duration_days || 365))

    await supabase.from('user_subscriptions').update({
      status:     'active',
      expires_at: newExpiry.toISOString(),
      auto_renew: true,
      updated_at: new Date().toISOString(),
    }).eq('id', sub.id)

    await fetch('/api/admin/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_type:  'renew_subscription',
        target_type:  'user_subscription',
        target_id:    sub.id,
        description:  `Renewed subscription for ${ownerName}`,
        before_state: { status: sub.status, expires_at: sub.expires_at },
        after_state:  { status: 'active', expires_at: newExpiry.toISOString() },
      }),
    })

    setSaving(false)
    setAction(null)
    onUpdate()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-[#1a2240]/10 z-50 flex flex-col overflow-hidden">

        {/* Head */}
        <div className="p-6 border-b border-[#1a2240]/10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-[#1a2240] font-['Cormorant_Garamond']">
                {ownerName || 'Owner'}
              </h2>
              <p className="text-sm text-[#6B7280] mt-0.5">
                {sub.package?.name_en || 'Package'}
              </p>
            </div>
            <button onClick={onClose} className="text-[#6B7280] hover:text-[#1a2240]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={sub.status} />
            {sub.is_premium && (
              <span className="flex items-center gap-1 text-xs text-[#D4A843] px-2 py-1 rounded-full bg-[#D4A843]/10">
                <Crown className="w-3 h-3" /> Premium
              </span>
            )}
            {isExpiringSoon && (
              <span className="flex items-center gap-1 text-xs text-[#fbbf24] px-2 py-1 rounded-full bg-[#fbbf24]/10">
                <Clock className="w-3 h-3" /> {daysLeft}d left
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Details */}
          <div className="space-y-0">
            <h3 className="text-xs font-mono tracking-widest text-[#6B7280] uppercase mb-2">Details</h3>
            {[
              { label: 'Package',     value: sub.package?.name_en },
              { label: 'Price',       value: `${sub.package?.currency || 'EGP'} ${sub.package?.price?.toLocaleString()}` },
              { label: 'Started',     value: sub.started_at ? new Date(sub.started_at).toLocaleDateString('en-GB') : '—' },
              { label: 'Expires',     value: sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('en-GB') : '—' },
              { label: 'Auto Renew',  value: sub.auto_renew ? 'Yes' : 'No' },
              { label: 'Payment',     value: sub.payment_method || 'Stripe' },
              { label: 'Stripe ID',   value: sub.stripe_subscription_id ? sub.stripe_subscription_id.slice(0, 20) + '...' : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2.5 border-b border-white/5">
                <span className="text-xs text-[#6B7280]">{label}</span>
                <span className="text-sm text-[#1a2240] font-mono">{value || '—'}</span>
              </div>
            ))}
          </div>

          {/* Slots editor */}
          <div>
            <h3 className="text-xs font-mono tracking-widest text-[#6B7280] uppercase mb-3">
              Slots Management
            </h3>
            <div className="bg-[#F0F2F7] rounded-lg p-4 border border-[#1a2240]/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-[#6B7280] mb-1">Used / Total</div>
                  <div className="text-2xl font-bold text-[#1a2240] font-mono">
                    {sub.used_slots}
                    <span className="text-[#6B7280]"> / {customSlots}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCustomSlots(s => Math.max(sub.used_slots, s - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-[#1a2240]/10 text-[#1a2240] hover:border-[#D4A843]/30 flex items-center justify-center transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-lg font-bold text-[#D4A843] font-mono">
                    {customSlots}
                  </span>
                  <button
                    onClick={() => setCustomSlots(s => s + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-[#1a2240]/10 text-[#1a2240] hover:border-[#D4A843]/30 flex items-center justify-center transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-white/10 rounded-full mb-3">
                <div className="h-full rounded-full transition-all"
                  style={{
                    width:      `${Math.min((sub.used_slots / customSlots) * 100, 100)}%`,
                    background: sub.used_slots >= customSlots ? '#f87171' : '#D4A843',
                  }} />
              </div>

              {customSlots !== (sub.custom_total_slots || sub.total_slots) && (
                <div className="mb-3">
                  <label className="block text-xs text-[#6B7280] mb-1.5">Reason for change *</label>
                  <input
                    type="text"
                    value={slotsReason}
                    onChange={e => setSlotsReason(e.target.value)}
                    placeholder="e.g. Promotional offer, error correction..."
                    className="w-full bg-white border border-[#1a2240]/10 rounded-lg px-3 py-2 text-sm text-[#1a2240] placeholder:text-[#6B7280] focus:outline-none focus:border-[#D4A843]/50"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Package limits */}
          {sub.package && (
            <div>
              <h3 className="text-xs font-mono tracking-widest text-[#6B7280] uppercase mb-2">Package Limits</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Photos/listing',  value: sub.package.max_photos_per_listing },
                  { label: 'Flash deals/mo',  value: sub.package.max_flash_deals_per_month },
                  { label: 'Featured',        value: sub.package.max_featured_listings },
                  { label: 'Team members',    value: sub.package.max_team_members },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#F0F2F7] rounded-lg p-3 border border-white/5">
                    <div className="text-lg font-bold text-[#D4A843] font-mono">{value || '∞'}</div>
                    <div className="text-xs text-[#6B7280] mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin notes */}
          <div>
            <h3 className="text-xs font-mono tracking-widest text-[#6B7280] uppercase mb-2">
              Admin Notes
            </h3>
            <textarea
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              placeholder="Internal notes about this subscription..."
              rows={3}
              className="w-full bg-[#F0F2F7] border border-[#1a2240]/10 rounded-lg px-3 py-2 text-sm text-[#1a2240] placeholder:text-[#6B7280] focus:outline-none focus:border-[#D4A843]/50 resize-none"
            />
          </div>

          {/* Action confirmation */}
          {action === 'cancel' && (
            <div className="bg-[#f87171]/10 border border-[#f87171]/30 rounded-lg p-4">
              <p className="text-sm text-[#f87171] mb-3">
                Cancel this subscription? The owner will lose access at the end of the current period.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setAction(null)}
                  className="flex-1 py-2 border border-[#1a2240]/10 text-[#6B7280] rounded-lg text-sm">
                  Keep it
                </button>
                <button onClick={handleCancel} disabled={saving}
                  className="flex-1 py-2 bg-[#f87171]/20 border border-[#f87171]/30 text-[#f87171] rounded-lg text-sm font-semibold">
                  {saving ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          )}

          {action === 'renew' && (
            <div className="bg-[#4ade80]/10 border border-[#4ade80]/30 rounded-lg p-4">
              <p className="text-sm text-[#4ade80] mb-3">
                Renew for another {sub.package?.duration_days || 365} days?
              </p>
              <div className="flex gap-2">
                <button onClick={() => setAction(null)}
                  className="flex-1 py-2 border border-[#1a2240]/10 text-[#6B7280] rounded-lg text-sm">
                  Cancel
                </button>
                <button onClick={handleRenew} disabled={saving}
                  className="flex-1 py-2 bg-[#4ade80]/20 border border-[#4ade80]/30 text-[#4ade80] rounded-lg text-sm font-semibold">
                  {saving ? 'Renewing...' : 'Yes, Renew'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1a2240]/10 space-y-2">
          {/* Save slots */}
          {(customSlots !== (sub.custom_total_slots || sub.total_slots) || adminNotes !== (sub.admin_notes || '')) && (
            <button
              onClick={handleSaveSlots}
              disabled={saving || (customSlots !== (sub.custom_total_slots || sub.total_slots) && !slotsReason.trim())}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#D4A843] hover:bg-[#c49835] text-[#F0F2F7] font-semibold rounded-lg text-sm transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}

          {/* Actions */}
          {!action && (
            <div className="grid grid-cols-2 gap-2">
              {sub.status !== 'cancelled' && (
                <button onClick={() => setAction('cancel')}
                  className="flex items-center justify-center gap-1.5 py-2.5 border border-[#f87171]/30 text-[#f87171] hover:bg-[#f87171]/10 rounded-lg text-sm transition-colors">
                  <XCircle className="w-4 h-4" /> Cancel
                </button>
              )}
              <button onClick={() => setAction('renew')}
                className={`flex items-center justify-center gap-1.5 py-2.5 border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/10 rounded-lg text-sm transition-colors ${sub.status === 'cancelled' ? 'col-span-2' : ''}`}>
                <RefreshCw className="w-4 h-4" /> Renew
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function AdminSubscriptionsPage() {
  const supabase = createClient()

  const [subs, setSubs]               = useState<Subscription[]>([])
  const [packages, setPackages]       = useState<Package[]>([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [showPackages, setShowPackages] = useState(false)

  const [counts, setCounts] = useState({
    all: 0, active: 0, expired: 0, cancelled: 0, expiringSoon: 0
  })

  useEffect(() => { fetchData() }, [filter])

  async function fetchData() {
    setLoading(true)
    try {
      let query = supabase
        .from('user_subscriptions')
        .select(`
          *,
          owner:profiles!user_id (
            id, first_name, last_name, phone
          ),
          package:packages!package_id (
            id, name_en, name_ar, slots_count, price, currency,
            duration_days, max_photos_per_listing,
            max_flash_deals_per_month, max_featured_listings, max_team_members
          )
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') query = query.eq('status', filter)

      const { data } = await query
      setSubs(data || [])

      // Counts
      const all       = data?.length || 0
      const active    = data?.filter(s => s.status === 'active').length || 0
      const expired   = data?.filter(s => s.status === 'expired').length || 0
      const cancelled = data?.filter(s => s.status === 'cancelled').length || 0
      const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString()
      const expiringSoon = data?.filter(s =>
        s.status === 'active' && s.expires_at && s.expires_at <= thirtyDays
      ).length || 0

      setCounts({ all, active, expired, cancelled, expiringSoon })

      // Packages
      const { data: pkgs } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      setPackages(pkgs || [])

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubs = subs.filter(s => {
    if (!searchQuery) return true
    const q    = searchQuery.toLowerCase()
    const name = `${s.owner?.first_name || ''} ${s.owner?.last_name || ''}`.toLowerCase()
    return name.includes(q) || s.owner?.phone?.includes(q)
  })

  const totalRevenue = subs
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.package?.price || 0), 0)

  const FILTERS = [
    { id: 'all',       label: `All · ${counts.all}` },
    { id: 'active',    label: `Active · ${counts.active}` },
    { id: 'expired',   label: `Expired · ${counts.expired}` },
    { id: 'cancelled', label: `Cancelled · ${counts.cancelled}` },
  ]

  return (
    <div className="min-h-screen bg-[#F0F2F7]">

      {/* Header */}
      <div className="border-b border-[#1a2240]/10 bg-white px-6 py-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-mono tracking-widest text-[#D4A843] uppercase mb-1">
              Revenue · Subscriptions
            </p>
            <h1 className="text-3xl font-bold text-[#1a2240] font-['Cormorant_Garamond'] italic">
              Subscriptions
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {counts.active} active
              {counts.expiringSoon > 0 && (
                <span className="text-[#fbbf24]"> · {counts.expiringSoon} expiring soon</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowPackages(p => !p)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F0F2F7] border border-[#1a2240]/10 rounded-lg text-sm text-[#6B7280] hover:text-[#1a2240] transition-colors">
            <Package className="w-4 h-4" />
            {showPackages ? 'Hide Packages' : 'View Packages'}
          </button>
        </div>

        {/* Quick stats */}
        <div className="flex gap-6 pt-4 border-t border-[#1a2240]/10">
          {[
            { label: 'Active Revenue',  value: `EGP ${totalRevenue.toLocaleString()}`, color: '#D4A843' },
            { label: 'Active Subs',     value: counts.active,    color: '#4ade80' },
            { label: 'Expiring Soon',   value: counts.expiringSoon, color: '#fbbf24' },
            { label: 'Cancelled',       value: counts.cancelled, color: '#f87171' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="text-xl font-bold font-mono" style={{ color }}>{value}</div>
              <div className="text-xs text-[#6B7280]">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">

        {/* Packages panel */}
        {showPackages && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-lg border border-[#1a2240]/10 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-[#1a2240] font-['Cormorant_Garamond']">
                    {pkg.name_en}
                  </h3>
                  {pkg.is_active
                    ? <span className="text-xs text-[#4ade80]">Active</span>
                    : <span className="text-xs text-[#6B7280]">Inactive</span>
                  }
                </div>
                <div className="text-3xl font-bold text-[#D4A843] font-mono mb-1">
                  {pkg.currency} {pkg.price?.toLocaleString()}
                </div>
                <div className="text-xs text-[#6B7280] mb-3">
                  per {pkg.duration_days} days · {pkg.slots_count} slots
                </div>
                <div className="space-y-1 text-xs text-[#6B7280]">
                  <div>{pkg.max_photos_per_listing} photos/listing</div>
                  <div>{pkg.max_flash_deals_per_month} flash deals/month</div>
                  <div>{pkg.max_featured_listings} featured listings</div>
                  <div>{pkg.max_team_members} team members</div>
                  <div>{pkg.max_co_hosts} co-hosts</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search + Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#1a2240]/10 rounded-lg text-sm text-[#1a2240] placeholder:text-[#6B7280] focus:outline-none focus:border-[#D4A843]/50"
            />
          </div>
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button key={f.id}
                onClick={() => setFilter(f.id as FilterType)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  filter === f.id
                    ? 'bg-[#D4A843] text-[#F0F2F7] font-semibold'
                    : 'bg-white border border-[#1a2240]/10 text-[#6B7280] hover:text-[#1a2240]'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4A843]" />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#1a2240]/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2240]/10">
                    {['Owner', 'Package', 'Slots', 'Expires', 'Revenue', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-mono tracking-widest text-[#6B7280] uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSubs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-[#6B7280]">
                        No subscriptions found
                      </td>
                    </tr>
                  ) : filteredSubs.map(s => {
                    const ownerName = `${s.owner?.first_name || ''} ${s.owner?.last_name || ''}`.trim()
                    const daysLeft  = s.expires_at
                      ? Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 86400000)
                      : 0
                    const isExpiring = daysLeft > 0 && daysLeft <= 30

                    return (
                      <tr key={s.id}
                        onClick={() => setSelectedSub(s)}
                        className="hover:bg-white/5 cursor-pointer transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-[#1a2240]">{ownerName || '—'}</div>
                          <div className="text-xs text-[#6B7280]">{s.owner?.phone || ''}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {s.is_premium && <Crown className="w-3.5 h-3.5 text-[#D4A843]" />}
                            <span className="text-sm text-[#1a2240]">{s.package?.name_en || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-mono text-[#1a2240]">
                            {s.used_slots} / {s.total_slots}
                          </div>
                          <div className="w-16 h-1 bg-white/10 rounded-full mt-1">
                            <div className="h-full rounded-full"
                              style={{
                                width:      `${Math.min((s.used_slots / s.total_slots) * 100, 100)}%`,
                                background: s.used_slots >= s.total_slots ? '#f87171' : '#D4A843',
                              }} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-mono text-[#1a2240]">
                            {s.expires_at ? new Date(s.expires_at).toLocaleDateString('en-GB') : '—'}
                          </div>
                          {isExpiring && (
                            <div className="text-xs text-[#fbbf24]">{daysLeft}d left</div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-[#D4A843]">
                          {s.package?.currency} {s.package?.price?.toLocaleString() || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <SubscriptionDrawer
        sub={selectedSub}
        onClose={() => setSelectedSub(null)}
        onUpdate={fetchData}
      />
    </div>
  )
}