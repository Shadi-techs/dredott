// ============================================
// Pricing Page — v4 (with pending_claim subscription)
// Path: src/app/[locale]/pricing/page.tsx
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Tag, ChevronRight, Crown } from 'lucide-react'

const supabase = createClient()

// ── Packages — change numbers here anytime ──────────────────
const PACKAGES = [
  {
    posts:    1,
    label:    '1 listing',
    normal:   600,
    premium:  1200,
    popular:  false,
    launch:   true,
  },
  {
    posts:    3,
    label:    '3 listings',
    normal:   1500,
    premium:  3000,
    popular:  false,
    launch:   false,
  },
  {
    posts:    7,
    label:    '7 listings',
    normal:   3000,
    premium:  6000,
    popular:  true,
    launch:   false,
  },
  {
    posts:    15,
    label:    '15 listings',
    normal:   5500,
    premium:  11000,
    popular:  false,
    launch:   false,
  },
]

const NORMAL_FEATURES = [
  { text: 'Property & car listings',     included: true },
  { text: 'WhatsApp contact button',     included: true },
  { text: 'Photo gallery',               included: true },
  { text: 'Admin review & approval',     included: true },
  { text: 'Annual invoice',              included: true },
  { text: 'Availability calendar',       included: false },
  { text: 'Featured badge in search',    included: false },
  { text: 'Priority in search results',  included: false },
  { text: 'Visitor statistics',          included: false },
  { text: 'Red Sea Deal (flash offers)', included: false },
]

const PREMIUM_EXTRAS = [
  'Availability calendar',
  'Featured badge in search',
  'Priority in search results',
  'Visitor statistics',
  'Red Sea Deal (flash offers)',
  'AI listing description',
]

export default function PricingPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params.locale as string

  const [selected, setSelected] = useState<number | null>(null)
  const [planType, setPlanType] = useState<'normal' | 'premium'>('normal')
  const [promoCode, setPromoCode] = useState('')
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null)
  const [checkingPromo, setCheckingPromo] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false)

  const pkg = selected !== null ? PACKAGES[selected] : null
  const basePrice = pkg ? (planType === 'premium' ? pkg.premium : pkg.normal) : 0
  const discount = promoResult?.valid ? Math.round(basePrice * promoResult.discount / 100) : 0
  const total = basePrice - discount

  const reason = searchParams.get('reason')
  const context = searchParams.get('context')

  useEffect(() => {
    if (reason === 'upgrade_to_manager') {
      setShowUpgradeMessage(true)
      const timer = setTimeout(() => setShowUpgradeMessage(false), 6000)
      return () => clearTimeout(timer)
    }
  }, [reason])

  const checkPromo = async () => {
    if (!promoCode.trim()) return
    setCheckingPromo(true)
    try {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('discount_pct, is_active, max_uses, uses_count, expires_at')
        .eq('code', promoCode.toUpperCase().trim())
        .single()

      if (!promo || !promo.is_active) {
        const { data: ref } = await supabase
          .from('referral_codes')
          .select('discount_pct, is_active')
          .eq('code', promoCode.toUpperCase().trim())
          .single()

        if (!ref || !ref.is_active) {
          setPromoResult({ valid: false, discount: 0, message: 'Invalid or inactive code' })
        } else {
          setPromoResult({ valid: true, discount: ref.discount_pct, message: `✓ ${ref.discount_pct}% discount applied` })
        }
      } else {
        if (promo.max_uses && promo.uses_count >= promo.max_uses) {
          setPromoResult({ valid: false, discount: 0, message: 'This code has reached its usage limit' })
        } else if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
          setPromoResult({ valid: false, discount: 0, message: 'This code has expired' })
        } else {
          setPromoResult({ valid: true, discount: promo.discount_pct, message: `✓ ${promo.discount_pct}% discount applied` })
        }
      }
    } catch {
      setPromoResult({ valid: false, discount: 0, message: 'Invalid code' })
    }
    setCheckingPromo(false)
  }

  const handleContinue = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/${locale}/login?redirect=/${locale}/pricing&reason=subscribe`)
      return
    }
    if (selected === null) return

    setProcessing(true)
    const selectedPkg = PACKAGES[selected]
    const amount = planType === 'premium' ? selectedPkg.premium : selectedPkg.normal
    const finalAmount = amount - discount

    try {
      // 1. Create subscription record (pending_claim)
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          package_name: `${selectedPkg.posts}_${planType}`,
          price_paid: finalAmount,
          status: 'pending_claim',
          start_date: new Date().toISOString(),
          end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
          posts_limit: selectedPkg.posts,
        })
        .select()
        .single()

      if (subError) throw subError

      // 2. Create Stripe Checkout Session via API
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: subscription.id,
          amount: finalAmount,
          currency: 'egp',
          success_url: `${window.location.origin}/${locale}/payment/success?subscription_id=${subscription.id}`,
          cancel_url: `${window.location.origin}/${locale}/pricing?canceled=true`,
        }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Payment initiation failed:', err)
      alert('Could not start payment. Please try again.')
      setProcessing(false)
    }
  }

  const isRtl = locale === 'ar'

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* Jobs context — unlock job contacts */}
        {context === 'jobs' && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 18px', marginBottom: 24, textAlign: 'center' }}>
            <p style={{ color: '#1d4ed8', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
              {isRtl ? '🔓 اشترك للوصول لبيانات التواصل' : '🔓 Subscribe to Unlock Job Contact Details'}
            </p>
            <p style={{ color: '#3b82f6', fontSize: 12 }}>
              {isRtl ? 'باقة واحدة تفتح لك كل بيانات أصحاب العمل' : 'One plan gives you access to all employer contact information'}
            </p>
          </div>
        )}

        {/* Marketing message when redirected from property-manager */}
        {showUpgradeMessage && (
          <div className="bg-gold/10 border border-gold rounded-lg p-4 mb-6 text-center max-w-xl mx-auto">
            <p className="text-navy font-semibold">
              🚀 {isRtl 
                ? 'للوصول إلى لوحة مدير العقارات، يرجى اختيار باقة مناسبة والاشتراك. ستحصل على أدوات كاملة لإدارة الوحدات العقارية.'
                : 'To access Property Manager Dashboard, please choose a plan and subscribe. You will get full tools to manage properties.'}
            </p>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.3em', color: '#D4A843', textTransform: 'uppercase', marginBottom: 12 }}>
            — Simple, transparent pricing
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 400, color: '#2C3A6B', marginBottom: 12 }}>
            List on DREDOTT
          </h1>
          <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 440, margin: '0 auto' }}>
            Annual subscription. Zero commission. One listing = one property or one car.
          </p>
        </div>

        {/* Normal / Premium toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <div style={{ background: '#f3f4f6', borderRadius: 12, padding: 4, display: 'flex', gap: 4 }}>
            {(['normal', 'premium'] as const).map(type => (
              <button key={type} onClick={() => setPlanType(type)} style={{
                padding: '8px 28px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                background: planType === type ? '#2C3A6B' : 'transparent',
                color: planType === type ? '#D4A843' : '#6b7280',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {type === 'premium' && <Crown size={14} />}
                {type === 'normal' ? 'Normal' : 'Premium'}
              </button>
            ))}
          </div>
        </div>

        {/* What's included */}
        {planType === 'normal' ? (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', padding: '20px 24px', marginBottom: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
              {NORMAL_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: f.included ? '#374151' : '#9ca3af' }}>
                  {f.included ? <Check size={14} color="#D4A843" /> : <X size={14} color="#d1d5db" />}
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 14, padding: '16px 24px', marginBottom: 32 }}>
            <p style={{ fontSize: 12, color: '#D4A843', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Crown size={13} /> Everything in Normal, plus:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
              {PREMIUM_EXTRAS.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                  <Check size={14} color="#D4A843" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Package cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16, marginBottom: 36 }}>
          {PACKAGES.map((pkg, i) => {
            const price = planType === 'premium' ? pkg.premium : pkg.normal
            const isActive = selected === i
            const savings = i > 0
              ? Math.round((1 - (price / pkg.posts) / (planType === 'premium' ? PACKAGES[0].premium : PACKAGES[0].normal)) * 100)
              : 0

            return (
              <div key={i}
                onClick={() => setSelected(i)}
                style={{
                  background: isActive ? '#2C3A6B' : '#fff',
                  border: `2px solid ${isActive ? '#2C3A6B' : pkg.popular ? 'rgba(212,168,67,0.4)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: 16, padding: '20px 18px',
                  cursor: 'pointer', position: 'relative',
                  transition: 'all 0.2s',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                }}>
                {pkg.popular && !isActive && (
                  <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#D4A843', color: '#0e1428', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    Most Popular
                  </span>
                )}
                {pkg.launch && !isActive && (
                  <span style={{ position: 'absolute', top: -10, right: 12, background: '#2A9D8F', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    Launch Price
                  </span>
                )}

                <p style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#D4A843' : '#2C3A6B', marginBottom: 4 }}>
                  {pkg.label}
                </p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: isActive ? '#FBF0D0' : '#D4A843', lineHeight: 1 }}>
                  {price.toLocaleString()}
                </p>
                <p style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.5)' : '#9ca3af', marginBottom: 10 }}>EGP / year</p>

                {savings > 0 && (
                  <p style={{ fontSize: 11, color: isActive ? '#4ade80' : '#2A9D8F', fontWeight: 600 }}>
                    Save {savings}% vs 1 listing
                  </p>
                )}

                {i === 0 && (
                  <p style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.5)' : '#9ca3af' }}>
                    {(price).toLocaleString()} EGP/listing
                  </p>
                )}
                {i > 0 && (
                  <p style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.5)' : '#9ca3af' }}>
                    {Math.round(price / pkg.posts).toLocaleString()} EGP/listing
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Promo code */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', padding: '20px 24px', marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#2C3A6B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tag size={14} color="#D4A843" />
            Have a promo or referral code?
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={promoCode}
              onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null) }}
              placeholder="Enter code..."
              style={{
                flex: 1, padding: '10px 14px',
                border: `1px solid ${promoResult ? (promoResult.valid ? '#4ade80' : '#f87171') : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 10, fontSize: 14, outline: 'none',
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em',
                color: '#2C3A6B', background: '#f9fafb',
              }}
            />
            <button onClick={checkPromo} disabled={checkingPromo || !promoCode.trim()} style={{
              padding: '10px 20px', background: '#2C3A6B', color: '#D4A843',
              border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13,
              opacity: !promoCode.trim() ? 0.5 : 1,
            }}>
              {checkingPromo ? '...' : 'Apply'}
            </button>
          </div>
          {promoResult && (
            <p style={{ fontSize: 13, marginTop: 8, color: promoResult.valid ? '#16a34a' : '#ef4444', fontWeight: 500 }}>
              {promoResult.message}
            </p>
          )}
        </div>

        {/* Summary + CTA */}
        {selected !== null && (
          <div style={{ background: '#2C3A6B', borderRadius: 16, padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                  {PACKAGES[selected].label} · {planType === 'premium' ? 'Premium' : 'Normal'} · 1 year
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  {promoResult?.valid && (
                    <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                      EGP {basePrice.toLocaleString()}
                    </span>
                  )}
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: '#D4A843', fontWeight: 600 }}>
                    EGP {total.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>/year</span>
                </div>
                {promoResult?.valid && (
                  <p style={{ fontSize: 12, color: '#4ade80', marginTop: 2 }}>
                    You save EGP {discount.toLocaleString()}
                  </p>
                )}
              </div>
              <button onClick={handleContinue} disabled={processing} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', background: '#D4A843',
                color: '#0e1428', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: processing ? 0.6 : 1,
              }}>
                {processing ? 'Processing...' : 'Get Started'} <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#2C3A6B', marginBottom: 24, textAlign: 'center' }}>
            Common questions
          </h2>
          <div style={{ display: 'grid', gap: 14 }}>
            {[
              { q: 'What counts as 1 listing?', a: 'One property or one car. Both have the same value.' },
              { q: 'Can I mix properties and cars?', a: 'Yes. With a 3-listing plan, you can list 2 properties and 1 car — any combination.' },
              { q: 'Do you take commission?', a: 'Never. Guests contact you directly on WhatsApp. You keep 100% of your rental income.' },
              { q: 'What happens after 1 year?', a: 'Your listings stay visible. You renew to keep editing or adding new ones.' },
              { q: 'What is Premium?', a: 'Premium adds: availability calendar, Featured badge, priority in search, visitor stats, and Red Sea Deal flash offers.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#2C3A6B', marginBottom: 6 }}>{faq.q}</p>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}