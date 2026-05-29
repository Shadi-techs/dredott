// ============================================
// Service Provider Profile Page
// Path: src/app/[locale]/services/[id]/page.tsx
// Public profile + ratings + contact
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useParams } from 'next/navigation'
import {
  Star, MapPin, Globe,
  MessageCircle, Check, ArrowLeft,
  ShieldCheck, Crown, ExternalLink
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ServiceProviderProfilePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [provider, setProvider] = useState<any>(null)
  const [ratings, setRatings]   = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [user, setUser]         = useState<any>(null)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [canRate, setCanRate]   = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    loadData()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [id])

  const loadData = async () => {
    const [{ data: prov }, { data: rats }] = await Promise.all([
      supabase.from('service_providers')
        .select('*, service_categories(name_en, name_ar, icon)')
        .eq('id', id)
        .eq('review_status', 'approved')
        .eq('is_active', true)
        .single(),
      supabase.from('service_ratings')
        .select('*, profiles(first_name, last_name)')
        .eq('provider_id', id)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (!prov) { setNotFound(true); setLoading(false); return }
    setProvider(prov)
    setRatings(rats || [])

    // Increment view count
    try { await supabase.rpc('increment_provider_view', { p_id: id }) } catch (_) {}
    setLoading(false)
  }

  const checkCanRate = async () => {
    if (!user) return
    // Check if user has contacted this provider (clicked WhatsApp)
    const { data } = await supabase
      .from('provider_contacts')
      .select('contacted_at')
      .eq('user_id', user.id)
      .eq('provider_id', id)
      .single()

    if (data) {
      const hoursSince = (Date.now() - new Date(data.contacted_at).getTime()) / 3600000
      setCanRate(hoursSince >= 24)
    }
  }

  useEffect(() => { if (user) checkCanRate() }, [user])

  const handleContact = async () => {
    if (!user) {
      router.push(`/en/login?redirect=/en/services/${id}&reason=contact`)
      return
    }

    // Log contact for rating eligibility
    await supabase.from('provider_contacts').upsert({
      user_id: user.id,
      provider_id: id,
      contacted_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider_id', ignoreDuplicates: true })

    // Increment contact count
    await supabase.from('service_providers')
      .update({ contact_count: (provider.contact_count || 0) + 1 })
      .eq('id', id)

    const msg = encodeURIComponent(`Hi, I found you on DREDOTT. I'm interested in your ${provider.service_categories?.name_en} service.`)
    window.open(`https://wa.me/${provider.whatsapp || provider.phone}?text=${msg}`, '_blank')
  }

  const submitRating = async () => {
    if (!user || !userRating) return
    setSubmitting(true)
    await supabase.from('service_ratings').upsert({
      provider_id: id,
      user_id: user.id,
      rating: userRating,
      review_text: reviewText || null,
    }, { onConflict: 'provider_id,user_id' })
    setSubmitting(false)
    loadData()
  }

  const renderStars = (rating: number, interactive = false, size = 16) => (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={size}
          color="#D4A843"
          fill={i <= rating ? '#D4A843' : 'none'}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
          onClick={() => interactive && setUserRating(i)}
        />
      ))}
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #D4A843', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
      <Footer />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 16 }}>
        <p style={{ fontSize: 48 }}>🔍</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#2C3A6B' }}>Provider not found</h2>
        <button onClick={() => router.push('/en/services')} style={{ padding: '10px 24px', background: '#2C3A6B', color: '#D4A843', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          Back to Services
        </button>
      </div>
      <Footer />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 60px' }}>

        {/* Back */}
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to Services
        </button>

        {/* Profile header */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.06)', padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

            {/* Logo */}
            <div style={{ width: 80, height: 80, borderRadius: 16, background: 'linear-gradient(135deg, #0e1428, #1a2240)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid rgba(212,168,67,0.2)' }}>
              {provider.logo_url
                ? <img src={provider.logo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: 14, objectFit: 'cover' }} />
                : <span style={{ fontSize: 36 }}>{provider.service_categories?.icon || '🏢'}</span>
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#2C3A6B', fontWeight: 400 }}>
                  {provider.business_name}
                </h1>
                {provider.is_verified && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(42,157,143,0.1)', border: '1px solid rgba(42,157,143,0.25)', padding: '3px 10px', borderRadius: 20 }}>
                    <ShieldCheck size={13} color="#2A9D8F" />
                    <span style={{ fontSize: 11, color: '#2A9D8F', fontWeight: 600 }}>Verified</span>
                  </div>
                )}
                {provider.featured && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#D4A843', padding: '3px 10px', borderRadius: 20 }}>
                    <Crown size={11} color="#0e1428" />
                    <span style={{ fontSize: 11, color: '#0e1428', fontWeight: 700 }}>Featured</span>
                  </div>
                )}
              </div>

              <p style={{ fontSize: 13, color: '#D4A843', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                {provider.service_categories?.name_en}
              </p>

              {/* Rating */}
              {provider.rating_count > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  {renderStars(provider.rating_avg)}
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#2C3A6B' }}>{provider.rating_avg?.toFixed(1)}</span>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>({provider.rating_count} reviews)</span>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>No reviews yet — be the first!</p>
              )}

              {provider.area && (
                <p style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MapPin size={13} color="#D4A843" />
                  {provider.area.replace(/_/g, ' ')}{provider.address && ` · ${provider.address}`}
                </p>
              )}
            </div>

            {/* Contact button */}
            <button onClick={handleContact} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 20px', background: '#25D366',
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            }}>
              <MessageCircle size={16} /> Contact
            </button>
          </div>

          {/* Description */}
          {provider.description && (
            <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              {provider.description}
            </p>
          )}

          {/* Links */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            {provider.website_url && (
              <a href={provider.website_url} target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#2A9D8F', textDecoration: 'none' }}>
                <Globe size={14} /> Website
              </a>
            )}
            {provider.facebook_url && (
              <a href={provider.facebook_url} target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#1877F2', textDecoration: 'none' }}>
                <ExternalLink size={14} /> Facebook
              </a>
            )}
          </div>
        </div>

        {/* Rating submission */}
        {user && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#2C3A6B', marginBottom: 12 }}>
              {canRate ? 'Leave a Review' : 'Rate this Service'}
            </h3>
            {!canRate ? (
              <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px' }}>
                <p style={{ fontSize: 13, color: '#92400e' }}>
                  📋 To leave a review, first contact this provider via WhatsApp. You can submit a rating 24 hours after your first contact.
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>How was your experience?</p>
                <div style={{ marginBottom: 12 }}>
                  {renderStars(userRating || 0, true, 28)}
                </div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your experience (optional)..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, fontSize: 13, color: '#374151', resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                />
                <button
                  onClick={submitRating}
                  disabled={!userRating || submitting}
                  style={{ padding: '10px 24px', background: '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, opacity: !userRating ? 0.5 : 1 }}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reviews list */}
        {ratings.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: 24 }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#2C3A6B', marginBottom: 16 }}>
              Reviews ({ratings.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ratings.map((r, i) => (
                <div key={i} style={{ paddingBottom: 16, borderBottom: i < ratings.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2C3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#D4A843', flexShrink: 0 }}>
                      {r.profiles?.first_name?.[0]}{r.profiles?.last_name?.[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#2C3A6B' }}>
                        {r.profiles?.first_name} {r.profiles?.last_name?.[0]}.
                      </p>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {renderStars(r.rating, false, 12)}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>
                      {new Date(r.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  {r.review_text && (
                    <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, marginLeft: 42 }}>
                      {r.review_text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}