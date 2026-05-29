// ============================================
// Owner Account Page
// Path: src/app/[locale]/owner/account/page.tsx
// Shows: subscription details, invoice history,
//        plan limits, payment info
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Crown, CreditCard, FileText, Calendar,
  CheckCircle, AlertCircle, Building2, Car,
  Download, ArrowRight
} from 'lucide-react'

interface Subscription {
  id: string
  plan: string
  started_at: string
  expires_at: string | null
  is_free: boolean
  free_until: string | null
  max_listings: number
}

interface Invoice {
  id: string
  invoice_number: string
  amount: number
  currency: string
  status: string
  payment_method: string
  issued_at: string
  paid_at: string | null
  plan: string
}

export default function OwnerAccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile]           = useState<any>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [invoices, setInvoices]         = useState<Invoice[]>([])
  const [stats, setStats]               = useState({ properties: 0, cars: 0 })
  const [loading, setLoading]           = useState(true)
  const [isPremium, setIsPremium]       = useState(false)

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/en/login'); return }

    const [{ data: prof }, { data: sub }, { data: invs }, { data: props }, { data: cars }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('subscriptions').select('*').eq('owner_id', user.id).order('started_at', { ascending: false }).limit(1).single(),
      supabase.from('invoices').select('*').eq('owner_id', user.id).order('issued_at', { ascending: false }),
      supabase.from('properties').select('id', { count: 'exact' }).eq('owner_id', user.id),
      supabase.from('cars').select('id', { count: 'exact' }).eq('owner_id', user.id),
    ])

    setProfile(prof)
    setSubscription(sub)
    setInvoices(invs || [])
    setStats({ properties: props?.length || 0, cars: cars?.length || 0 })

    const premium = prof?.is_premium === true &&
      (!prof?.premium_expires_at || new Date(prof.premium_expires_at) > new Date())
    setIsPremium(premium)
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #D4A843', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const totalListings = stats.properties + stats.cars
  const maxListings   = subscription?.max_listings || 1
  const isNearLimit   = totalListings >= maxListings
  const isAtLimit     = totalListings >= maxListings

  const planLabel = isPremium ? 'Premium' : subscription?.is_free ? 'Courtesy (Free)' : 'Normal'
  const planColor = isPremium ? '#D4A843' : subscription?.is_free ? '#16a34a' : '#2C3A6B'

  const expiryDate = isPremium
    ? profile?.premium_expires_at
    : subscription?.is_free
      ? subscription.free_until
      : subscription?.expires_at

  const isExpired = expiryDate && new Date(expiryDate) < new Date()
  const daysLeft  = expiryDate
    ? Math.max(0, Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000))
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>

      {/* Top nav */}
      <div style={{ background: '#0e1428', borderBottom: '1px solid rgba(212,168,67,0.15)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/en/owner" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#FBF0D0', fontWeight: 600, letterSpacing: '0.05em', textDecoration: 'none' }}>DREDOTT</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#D4A843', letterSpacing: '0.2em', textTransform: 'uppercase' as const }}>My Account</span>
        </div>
        <Link href="/en/owner" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>← Dashboard</Link>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

        {/* Plan card */}
        <div style={{
          background: isPremium ? 'linear-gradient(135deg, #0e1428, #1a2240)' : '#fff',
          border: isPremium ? '1px solid rgba(212,168,67,0.3)' : '1px solid rgba(0,0,0,0.08)',
          borderRadius: 20, padding: 28, marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {isPremium && <Crown size={18} color="#D4A843" />}
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11, letterSpacing: '0.2em',
                  color: planColor, textTransform: 'uppercase' as const,
                }}>
                  {planLabel} Plan
                </span>
              </div>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 28, color: isPremium ? '#FBF0D0' : '#2C3A6B',
                fontWeight: 400,
              }}>
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p style={{ fontSize: 13, color: isPremium ? 'rgba(255,255,255,0.5)' : '#6b7280', marginTop: 4 }}>
                {profile?.email}
              </p>
            </div>

            {!isExpired && daysLeft !== null && daysLeft <= 30 && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '8px 14px', textAlign: 'center' as const }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', fontFamily: "'Cormorant Garamond', serif" }}>{daysLeft}</p>
                <p style={{ fontSize: 10, color: '#ef4444', letterSpacing: '0.1em' }}>DAYS LEFT</p>
              </div>
            )}
          </div>

          {/* Subscription info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, borderTop: `1px solid ${isPremium ? 'rgba(212,168,67,0.15)' : 'rgba(0,0,0,0.06)'}`, paddingTop: 20 }}>
            {[
              { label: 'Status', value: isExpired ? '⛔ Expired' : '✅ Active' },
              { label: 'Expires', value: expiryDate ? new Date(expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never' },
              { label: 'Listings used', value: `${totalListings} / ${maxListings}` },
            ].map((item, i) => (
              <div key={i}>
                <p style={{ fontSize: 10, color: isPremium ? 'rgba(255,255,255,0.4)' : '#9ca3af', letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 14, fontWeight: 500, color: isPremium ? '#FBF0D0' : '#2C3A6B' }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Listing limit warning */}
          {isNearLimit && (
            <div style={{
              marginTop: 16, padding: '10px 14px',
              background: isAtLimit ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${isAtLimit ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
              borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertCircle size={16} color={isAtLimit ? '#ef4444' : '#f59e0b'} />
              <p style={{ fontSize: 13, color: isAtLimit ? '#dc2626' : '#d97706' }}>
                {isAtLimit
                  ? `You've reached your limit of ${maxListings} listing${maxListings > 1 ? 's' : ''}. Subscribe for an additional unit to add more.`
                  : `You're using ${totalListings} of ${maxListings} allowed listings.`
                }
              </p>
            </div>
          )}

          {/* Upgrade / Renew CTA */}
          <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
            {!isPremium && (
              <Link href="/en/pricing" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#D4A843', color: '#0e1428',
                padding: '9px 20px', borderRadius: 10,
                fontWeight: 700, fontSize: 13, textDecoration: 'none',
              }}>
                <Crown size={14} /> Upgrade to Premium
              </Link>
            )}
            <a href="https://wa.me/201200481043?text=I need to add an additional listing unit"
              target="_blank" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: isExpired ? '#2C3A6B' : 'rgba(44,58,107,0.08)',
                color: isExpired ? '#D4A843' : '#2C3A6B',
                padding: '9px 20px', borderRadius: 10,
                fontWeight: 600, fontSize: 13, textDecoration: 'none',
              }}>
              <CreditCard size={14} />
              {isExpired ? 'Renew subscription' : 'Add listing unit'}
            </a>
          </div>
        </div>

        {/* Listing summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Properties', count: stats.properties, icon: Building2, href: '/en/owner/properties' },
            { label: 'Cars', count: stats.cars, icon: Car, href: '/en/owner/cars' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <Link key={i} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 20px', background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14,
                textDecoration: 'none',
              }}>
                <Icon size={20} color="#6b7280" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#2C3A6B', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>{item.count}</p>
                  <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{item.label}</p>
                </div>
                <ArrowRight size={16} color="#9ca3af" />
              </Link>
            )
          })}
        </div>

        {/* Premium features list */}
        {isPremium && (
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: '#D4A843', textTransform: 'uppercase' as const, marginBottom: 16 }}>— Premium Features Active</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                'Interactive calendar',
                'Visitor statistics',
                'Airbnb / Booking.com iCal',
                'Priority in search results',
                'Featured gold badge',
                'AI description writer',
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={14} color="#16a34a" />
                  <span style={{ fontSize: 13, color: '#374151' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoice history */}
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <FileText size={18} color="#2C3A6B" />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2C3A6B' }}>Invoice History</h3>
          </div>

          {invoices.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center' as const, padding: '24px 0' }}>No invoices yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
              {invoices.map(inv => (
                <div key={inv.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '12px 16px', background: '#fafafa',
                  border: '1px solid rgba(0,0,0,0.04)', borderRadius: 10,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: '#2C3A6B' }}>
                        {inv.invoice_number}
                      </span>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 20,
                        background: inv.status === 'paid' ? '#dcfce7' : '#fef3c7',
                        color: inv.status === 'paid' ? '#16a34a' : '#d97706',
                        fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em',
                      }}>
                        {inv.status}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>
                      {inv.plan} · {inv.payment_method?.replace('_', ' ')} ·{' '}
                      {new Date(inv.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#2C3A6B', fontFamily: "'Cormorant Garamond', serif" }}>
                      EGP {inv.amount?.toLocaleString()}
                    </p>
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