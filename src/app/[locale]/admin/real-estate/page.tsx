'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Building2, Search, CheckCircle, Clock, XCircle,
  RefreshCw, MapPin, Bed, Maximize2, DollarSign, Lock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import SiteVisibilityToggle from '@/components/admin/SiteVisibilityToggle'
import { useAdminDark } from '@/contexts/AdminDarkContext'

const TX = {
  en: {
    title: 'Real Estate',
    subtitle: 'Manage property sale listings',
    locked: 'Section Locked',
    locked_sub: 'Real Estate is under development. Enable the module to activate.',
    total: 'Total Listings',
    approved: 'Approved',
    pending: 'Pending Review',
    rejected: 'Rejected',
    search: 'Search by title, location, owner...',
    all: 'All',
    no_listings: 'No listings found',
    view: 'View',
    approve: 'Approve',
    reject: 'Reject',
    commission: 'Commission: 2.5% from buyer',
    module_disabled: 'Module disabled — listings hidden from public',
  },
  ar: {
    title: 'العقارات للبيع',
    subtitle: 'إدارة قوائم بيع العقارات',
    locked: 'القسم مقفول',
    locked_sub: 'قسم العقارات قيد التطوير. فعّل الوحدة لتنشيطه.',
    total: 'إجمالي الإعلانات',
    approved: 'معتمدة',
    pending: 'قيد المراجعة',
    rejected: 'مرفوضة',
    search: 'البحث بالعنوان أو الموقع...',
    all: 'الكل',
    no_listings: 'لا توجد إعلانات',
    view: 'عرض',
    approve: 'اعتماد',
    reject: 'رفض',
    commission: 'العمولة: 2.5% من المشتري',
    module_disabled: 'الوحدة معطلة — الإعلانات مخفية من العموم',
  }
}

const PROPERTY_TYPES: Record<string, string> = {
  apartment: 'Apartment',
  villa: 'Villa',
  studio: 'Studio',
  chalet: 'Chalet',
  penthouse: 'Penthouse',
  land: 'Land',
  commercial: 'Commercial',
}

export default function AdminRealEstatePage() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const tx = TX[locale as keyof typeof TX] || TX.en
  const isAr = locale === 'ar'
  const router = useRouter()

  const [listings, setListings] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [moduleEnabled, setModuleEnabled] = useState<boolean | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const { dark } = useAdminDark()

  const c = {
    bg: dark ? '#080d1a' : '#F4F6FA',
    card: dark ? '#0e1428' : '#fff',
    border: dark ? 'rgba(212,168,67,0.12)' : '#e5e7eb',
    text: dark ? '#FBF0D0' : '#1a2240',
    sub: dark ? '#6B7280' : '#9CA3AF',
    gold: '#D4A843',
    navy: '#2C3A6B',
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const res = await fetch('/api/admin/verify')
    if (!res.ok) { router.push(`/${locale}/admin/login`); return }
    const d = await res.json()
    if (d.admin?.role !== 'super_admin') {
      router.push(`/${locale}/admin`)
      return
    }
    setIsSuperAdmin(true)
    fetchModule()
    fetchAll()
  }

  const fetchModule = async () => {
    const res = await fetch('/api/admin/feature-flags/list')
    if (res.ok) {
      const d = await res.json()
      setModuleEnabled(d.flags['module_real_estate'] ?? false)
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      let q = supabase.from('real_estate_listings').select('*').order('created_at', { ascending: false })
      if (filter !== 'all') q = q.eq('review_status', filter)
      const { data } = await q.limit(100)
      const rows = data || []
      setListings(rows)
      setStats({
        total: rows.length,
        approved: rows.filter((r: any) => r.review_status === 'approved').length,
        pending: rows.filter((r: any) => r.review_status === 'pending_review').length,
        rejected: rows.filter((r: any) => r.review_status === 'rejected').length,
      })
    } catch { /* table may not exist yet */ }
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    await fetch('/api/admin/moderation/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity_type: 'real_estate', entity_id: id }),
    })
    fetchAll()
  }

  const handleReject = async (id: string) => {
    await fetch('/api/admin/moderation/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity_type: 'real_estate', entity_id: id }),
    })
    fetchAll()
  }

  useEffect(() => {
    if (isSuperAdmin) fetchAll()
  }, [filter])

  const filtered = listings.filter(l => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      l.title?.toLowerCase().includes(q) ||
      l.location?.toLowerCase().includes(q) ||
      l.owner_name?.toLowerCase().includes(q) ||
      l.property_type?.toLowerCase().includes(q)
    )
  })

  const formatPrice = (p: number, cur = 'EGP') =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(p) + ' ' + cur

  if (!isSuperAdmin) return null

  return (
    <div style={{ minHeight: '100vh', background: c.bg, direction: isAr ? 'rtl' : 'ltr' }}>

      {/* Header */}
      <div style={{ background: dark ? '#0a0f1e' : '#fff', borderBottom: `1px solid ${c.border}`, padding: '16px 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} color={c.gold} />
              <p style={{ fontSize: 10, letterSpacing: '0.2em', color: c.sub, fontFamily: 'monospace', margin: 0 }}>SUPER ADMIN · REAL ESTATE</p>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: c.text, margin: '2px 0 0' }}>{tx.title}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <SiteVisibilityToggle moduleKey="module_real_estate" dark={dark} />
            <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'none', border: `1px solid ${c.border}`, borderRadius: 8, cursor: 'pointer', color: c.sub, fontSize: 12 }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>

        {/* Module disabled notice */}
        {moduleEnabled === false && (
          <div style={{ background: dark ? 'rgba(248,113,113,0.08)' : '#FEF2F2', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lock size={14} color="#f87171" />
            <span style={{ fontSize: 13, color: '#f87171' }}>{tx.module_disabled}</span>
          </div>
        )}

        {/* Commission badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: dark ? 'rgba(212,168,67,0.08)' : '#FFFBEB', border: `1px solid rgba(212,168,67,0.3)`, borderRadius: 20, marginBottom: 20 }}>
          <DollarSign size={12} color={c.gold} />
          <span style={{ fontSize: 11, color: c.gold, fontFamily: 'monospace', fontWeight: 600 }}>{tx.commission}</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: tx.total, value: stats.total, color: c.gold, icon: <Building2 size={16} color={c.gold} /> },
            { label: tx.approved, value: stats.approved, color: '#4ade80', icon: <CheckCircle size={16} color="#4ade80" /> },
            { label: tx.pending, value: stats.pending, color: '#f59e0b', icon: <Clock size={16} color="#f59e0b" /> },
            { label: tx.rejected, value: stats.rejected, color: '#f87171', icon: <XCircle size={16} color="#f87171" /> },
          ].map(s => (
            <div key={s.label} style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: c.sub, fontFamily: 'monospace', textTransform: 'uppercase' }}>{s.label}</span>
                {s.icon}
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: c.card, border: `1px solid ${c.border}`, borderRadius: 10, padding: '8px 14px' }}>
            <Search size={14} color={c.sub} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={tx.search}
              style={{ border: 'none', outline: 'none', background: 'transparent', color: c.text, fontSize: 13, width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'pending_review', 'approved', 'rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${filter === f ? c.gold : c.border}`, background: filter === f ? (dark ? 'rgba(212,168,67,0.12)' : '#FFFBEB') : c.card, color: filter === f ? c.gold : c.sub, fontSize: 12, fontWeight: filter === f ? 600 : 400, cursor: 'pointer' }}>
                {f === 'all' ? tx.all : f === 'pending_review' ? tx.pending : f === 'approved' ? tx.approved : tx.rejected}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Table */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: c.sub }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Building2 size={40} color={c.sub} style={{ margin: '0 auto 12px' }} />
              <p style={{ color: c.sub, fontSize: 14 }}>{tx.no_listings}</p>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', gap: 12, padding: '12px 20px', borderBottom: `1px solid ${c.border}`, background: dark ? 'rgba(0,0,0,0.2)' : '#F9FAFB' }}>
                {['Listing', 'Type', 'Price', 'Status', 'Actions'].map(h => (
                  <span key={h} style={{ fontSize: 10, fontFamily: 'monospace', color: c.sub, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>
                ))}
              </div>
              {filtered.map(listing => (
                <div key={listing.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', gap: 12, alignItems: 'center', padding: '14px 20px', borderBottom: `1px solid ${c.border}` }}>
                  {/* Listing info */}
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: c.text, margin: '0 0 2px' }}>{listing.title || 'Untitled'}</p>
                    {listing.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={11} color={c.sub} />
                        <span style={{ fontSize: 11, color: c.sub }}>{listing.location}</span>
                      </div>
                    )}
                    {(listing.bedrooms || listing.area_sqm) && (
                      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        {listing.bedrooms && <span style={{ fontSize: 11, color: c.sub, display: 'flex', alignItems: 'center', gap: 3 }}><Bed size={10} />{listing.bedrooms}bd</span>}
                        {listing.area_sqm && <span style={{ fontSize: 11, color: c.sub, display: 'flex', alignItems: 'center', gap: 3 }}><Maximize2 size={10} />{listing.area_sqm}m²</span>}
                      </div>
                    )}
                  </div>

                  {/* Type */}
                  <span style={{ fontSize: 12, color: c.sub }}>{PROPERTY_TYPES[listing.property_type] || listing.property_type || '—'}</span>

                  {/* Price */}
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.gold }}>
                    {listing.price ? formatPrice(listing.price, listing.currency || 'EGP') : '—'}
                  </span>

                  {/* Status badge */}
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      background: listing.review_status === 'approved' ? 'rgba(74,222,128,0.1)' : listing.review_status === 'rejected' ? 'rgba(248,113,113,0.1)' : 'rgba(245,158,11,0.1)',
                      color: listing.review_status === 'approved' ? '#4ade80' : listing.review_status === 'rejected' ? '#f87171' : '#f59e0b',
                    }}>
                      {listing.review_status === 'approved' ? tx.approved : listing.review_status === 'rejected' ? tx.rejected : tx.pending}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {listing.review_status === 'pending_review' && (
                      <>
                        <button onClick={() => handleApprove(listing.id)}
                          style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: 'rgba(74,222,128,0.15)', color: '#4ade80', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                          ✓
                        </button>
                        <button onClick={() => handleReject(listing.id)}
                          style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: 'rgba(248,113,113,0.15)', color: '#f87171', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
