'use client'
// Admin — Owner Full Profile
// Co-hosts + read-only dashboard view from admin perspective

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Crown, Phone, Mail, Building2, Car,
  Users, Shield, CheckCircle2, Clock, XCircle,
  TrendingUp, Eye, DollarSign, Calendar, Star,
  BarChart2, Home, ExternalLink, Package,
} from 'lucide-react'

// ── Role label ───────────────────────────────────────────────
const ROLE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  co_host:  { label: 'Co-host',  color: '#D4A843', bg: 'rgba(212,168,67,0.12)' },
  manager:  { label: 'Manager',  color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  viewer:   { label: 'Viewer',   color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
  cleaner:  { label: 'Cleaner',  color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
}

// ── Status badge ─────────────────────────────────────────────
const VERIF_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:            { label: 'Pending',        color: '#fbbf24', bg: '#FEF3C7' },
  documents_uploaded: { label: 'Docs uploaded',  color: '#60a5fa', bg: '#EFF6FF' },
  under_review:       { label: 'Under review',   color: '#D4A843', bg: '#FFFBEB' },
  approved:           { label: 'Approved',        color: '#22c55e', bg: '#F0FDF4' },
  rejected:           { label: 'Rejected',        color: '#ef4444', bg: '#FEF2F2' },
  changes_requested:  { label: 'Changes needed',  color: '#f97316', bg: '#FFF7ED' },
  not_submitted:      { label: 'Not submitted',   color: '#9ca3af', bg: '#F9FAFB' },
}

function VerifBadge({ status }: { status: string }) {
  const cfg = VERIF_STATUS[status] || VERIF_STATUS.not_submitted
  return (
    <span style={{ padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  )
}

// ── KPI Card ─────────────────────────────────────────────────
function KPI({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1a2240', fontFamily: 'monospace' }}>{value}</div>
    </div>
  )
}

// ── Review status label for listings ────────────────────────
const LISTING_STATUS: Record<string, { label: string; color: string }> = {
  pending_review:    { label: 'Pending',   color: '#fbbf24' },
  approved:          { label: 'Live',      color: '#22c55e' },
  rejected:          { label: 'Rejected',  color: '#ef4444' },
  changes_requested: { label: 'Needs edit',color: '#f97316' },
}

// ── Main Page ────────────────────────────────────────────────
export default function AdminOwnerDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params)
  const router = useRouter()
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]       = useState<'dashboard' | 'listings' | 'bookings'>('dashboard')

  useEffect(() => {
    fetch(`/api/admin/owners/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  if (!data || data.error) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Owner not found</div>

  const { owner, coHosts, listings, kpi, recentBookings } = data
  const fullName   = `${owner.first_name || ''} ${owner.last_name || ''}`.trim() || 'Owner'
  const verif      = owner.verification
  const sub        = owner.subscription
  const allListings = [...(listings.properties || []), ...(listings.cars || [])]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 28 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Back */}
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 14, marginBottom: 22 }}>
        <ArrowLeft size={16} /> Back to Owners
      </button>

      {/* ── Profile Header ─────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#0e1428,#1a2240)', borderRadius: 20, padding: 28, marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(212,168,67,0.2)', border: '2px solid rgba(212,168,67,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#D4A843', fontFamily: 'serif', flexShrink: 0 }}>
          {fullName[0] || '?'}
        </div>
        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'Cormorant Garamond, serif' }}>{fullName}</h1>
            {owner.is_premium && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 100, background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)', fontSize: 11, fontWeight: 600, color: '#D4A843' }}>
                <Crown size={11} /> Premium
              </span>
            )}
            {verif && <VerifBadge status={verif.status} />}
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {owner.email && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(201,206,221,0.7)' }}><Mail size={13} />{owner.email}</span>}
            {owner.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(201,206,221,0.7)' }}><Phone size={13} />{owner.phone}</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(201,206,221,0.5)' }}>
              <Calendar size={13} />
              Joined {new Date(owner.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Properties', value: listings.properties?.length || 0, icon: Building2 },
            { label: 'Cars',       value: listings.cars?.length       || 0, icon: Car },
            { label: 'Co-hosts',   value: coHosts?.length             || 0, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ textAlign: 'center', padding: '12px 18px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#D4A843', fontFamily: 'monospace' }}>{value}</div>
              <div style={{ fontSize: 10, color: 'rgba(201,206,221,0.5)', fontFamily: 'monospace', letterSpacing: '0.1em', marginTop: 2 }}>{label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

        {/* ── Main Content ───────────────────────────────────── */}
        <div>

          {/* Tab navigation */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F4F6FA', borderRadius: 12, padding: 4 }}>
            {(['dashboard', 'listings', 'bookings'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#1a2240' : '#6B7280', fontSize: 13, fontWeight: tab === t ? 700 : 500, cursor: 'pointer', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', textTransform: 'capitalize' }}>
                {t === 'dashboard' ? '📊 Dashboard' : t === 'listings' ? '🏠 Listings' : '📅 Bookings'}
              </button>
            ))}
          </div>

          {/* ── Dashboard tab ──────────────────────────────── */}
          {tab === 'dashboard' && (
            <>
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
                <KPI label="Revenue"   value={`$${kpi.revenue.toLocaleString()}`}  icon={DollarSign}  color="#D4A843" />
                <KPI label="Bookings"  value={kpi.bookings.toString()}              icon={Calendar}    color="#22c55e" />
                <KPI label="ADR"       value={kpi.adr > 0 ? `$${kpi.adr}` : '—'}   icon={TrendingUp}  color="#60a5fa" />
                <KPI label="Views"     value={kpi.views.toLocaleString()}           icon={Eye}         color="#9ca3af" />
                <KPI label="Occupancy" value={`${kpi.occupancy}%`}                  icon={BarChart2}   color="#f97316" />
                <KPI label="Listings"  value={allListings.length.toString()}        icon={Building2}   color="#a78bfa" />
              </div>

              {/* Recent bookings */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 20 }}>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.15em', marginBottom: 16 }}>RECENT BOOKINGS</div>
                {recentBookings.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>No bookings yet</p>
                ) : recentBookings.slice(0, 6).map((b: any, i: number) => (
                  <div key={b.id} style={{ padding: '11px 0', borderTop: i === 0 ? 'none' : '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1a2240' }}>
                        {b.profiles ? `${b.profiles.first_name || ''} ${b.profiles.last_name || ''}`.trim() : '—'}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{(b.properties as any)?.name || '—'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#1a2240' }}>
                        {new Date(b.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: 11, color: b.status === 'confirmed' ? '#22c55e' : '#fbbf24', fontWeight: 600 }}>
                        {b.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Listings tab ───────────────────────────────── */}
          {tab === 'listings' && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              {allListings.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>No listings yet</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {['Listing', 'Type', 'Status', 'Price', 'Views', 'Bookings'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: '#9ca3af', fontWeight: 600, borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allListings.map((l: any) => {
                      const sc = LISTING_STATUS[l.review_status] || LISTING_STATUS.pending_review
                      const isProperty = !!l.price_per_night
                      return (
                        <tr key={l.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F4F6FA', flexShrink: 0, overflow: 'hidden' }}>
                                {l.photos?.[0] ? <img src={l.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isProperty ? <Home size={14} color="#9ca3af" /> : <Car size={14} color="#9ca3af" />}</div>}
                              </div>
                              <span style={{ fontWeight: 500, color: '#1a2240', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{l.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#6B7280' }}>{isProperty ? 'Property' : 'Car'}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: sc.color }}>{sc.label}</span>
                          </td>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#1a2240' }}>
                            ${(l.price_per_night || l.price_per_day || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#6B7280' }}>{(l.view_count || 0).toLocaleString()}</td>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#6B7280' }}>{l.booking_count || 0}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Bookings tab ───────────────────────────────── */}
          {tab === 'bookings' && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              {recentBookings.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>No bookings yet</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {['Guest', 'Listing', 'Check-in', 'Nights', 'Total', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: '#9ca3af', fontWeight: 600, borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b: any, i: number) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 500, color: '#1a2240' }}>
                          {b.profiles ? `${b.profiles.first_name || ''} ${b.profiles.last_name || ''}`.trim() : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#6B7280', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(b.properties as any)?.name || '—'}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#1a2240', whiteSpace: 'nowrap' }}>
                          {new Date(b.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#6B7280' }}>{b.nights || '—'}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#D4A843', fontWeight: 600 }}>
                          ${(b.total_amount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: b.status === 'confirmed' ? '#22c55e' : b.status === 'pending_confirmation' ? '#fbbf24' : '#9ca3af' }}>
                            {b.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* ── Right Sidebar ──────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Subscription */}
          {sub ? (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 18 }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.15em', marginBottom: 14 }}>SUBSCRIPTION</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(212,168,67,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={16} color="#D4A843" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2240' }}>{sub.packages?.name_en || 'Plan'}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    {sub.expires_at ? `Renews ${new Date(sub.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Lifetime'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
                <span>Slots used</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a2240' }}>
                  {allListings.length} / {sub.total_slots || sub.packages?.slots_count || '?'}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ background: '#FEF2F2', borderRadius: 14, border: '1px solid #fecaca', padding: 18, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#991b1b', margin: 0 }}>No active subscription</p>
            </div>
          )}

          {/* Co-hosts */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 18 }}>
            <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.15em', marginBottom: 14 }}>
              CO-HOSTS · {coHosts.length}
            </div>
            {coHosts.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>No co-hosts added</p>
            ) : coHosts.map((ch: any, i: number) => {
              const m      = ch.member || {}
              const name   = `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Unknown'
              const roleCfg = ROLE_LABEL[ch.role] || ROLE_LABEL.viewer
              return (
                <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: i === 0 ? 0 : 12, marginTop: i === 0 ? 0 : 12, borderTop: i === 0 ? 'none' : '1px solid #f3f4f6' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F4F6FA', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#6B7280', flexShrink: 0 }}>
                    {name[0] || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2240', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    {m.email && <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>}
                  </div>
                  <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, color: roleCfg.color, background: roleCfg.bg, flexShrink: 0 }}>
                    {roleCfg.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Verification */}
          {verif && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 18 }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.15em', marginBottom: 14 }}>VERIFICATION</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Status',     value: <VerifBadge status={verif.status} /> },
                  { label: 'Type',       value: verif.verification_type || '—' },
                  { label: 'Company',    value: verif.company_name || '—' },
                  { label: 'Submitted',  value: verif.submitted_at ? new Date(verif.submitted_at).toLocaleDateString('en-GB') : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid #f9fafb' }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{label}</span>
                    <span style={{ fontSize: 12, color: '#1a2240' }}>{value}</span>
                  </div>
                ))}
                {verif.admin_notes && (
                  <div style={{ marginTop: 4, padding: 10, background: '#F4F6FA', borderRadius: 8, fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
                    💬 {verif.admin_notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 18 }}>
            <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.15em', marginBottom: 14 }}>QUICK LINKS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'View in Review Queue', href: `/${locale}/admin/review` },
                { label: 'Owner Listings', href: `/${locale}/admin/owners?highlight=${id}` },
                { label: 'Send Notification', href: `/${locale}/admin/notifications` },
              ].map(({ label, href }) => (
                <a key={label} href={href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, color: '#1a2240', textDecoration: 'none', fontWeight: 500 }}>
                  {label} <ExternalLink size={12} color="#9ca3af" />
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
