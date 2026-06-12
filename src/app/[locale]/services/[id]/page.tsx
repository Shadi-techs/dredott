'use client'

import { useState, useEffect, use } from 'react'
import { MapPin, Phone, Star, ExternalLink, ArrowLeft, MessageCircle } from 'lucide-react'

export default function ProviderPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params)
  const isAr = locale === 'ar'
  const isRTL = isAr

  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch(`/api/services/${id}`)
      .then(r => r.json())
      .then(d => { setProvider(d.provider); setLoading(false) })
  }, [id])

  const labelStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9, letterSpacing: '0.25em',
    textTransform: 'uppercase', color: '#9ca3af', marginBottom: 12,
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (!provider) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 16 }}>
        <p style={{ fontSize: 48 }}>🔍</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#2C3A6B' }}>
          {isAr ? 'مزود الخدمة غير موجود' : 'Provider not found'}
        </h2>
        <a href={`/${locale}/services`} style={{ color: '#2A9D8F', fontSize: 14, textDecoration: 'none' }}>
          ← {isAr ? 'عودة للخدمات' : 'Back to Services'}
        </a>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const name    = (isAr ? provider.business_name_ar : provider.business_name) || provider.business_name
  const desc    = (isAr ? provider.description_ar : provider.description) || provider.description
  const catName = isAr ? provider.service_provider_categories?.name_ar : provider.service_provider_categories?.name_en
  const icon    = provider.service_provider_categories?.icon || '🏢'
  const reviews = provider.google_reviews_cache

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Hero — same structure as properties/cars pages ───────────────── */}
      <div style={{ position: 'relative', paddingTop: 64, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #0e1428 0%, #1a2c50 50%, #0d2b26 100%)', padding: '32px 24px 40px', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=60')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1 }} />
          <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>

            {/* Back link */}
            <a href={`/${locale}/services`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none', marginBottom: 20, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
              <ArrowLeft size={13} /> {isAr ? 'الخدمات' : 'Services'}
            </a>

            {/* Provider identity */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                {provider.logo_url
                  ? <img src={provider.logo_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : icon
                }
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.26em', color: '#D4A843', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                  {icon} {catName?.toUpperCase()}
                </div>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(26px, 4vw, 42px)', color: '#fff', margin: '0 0 10px', lineHeight: 1.1 }}>
                  {name}
                </h1>
                {reviews?.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={14} fill={i <= Math.round(reviews.rating) ? '#D4A843' : 'none'} color={i <= Math.round(reviews.rating) ? '#D4A843' : 'rgba(255,255,255,0.2)'} />
                      ))}
                    </div>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: '#D4A843' }}>{reviews.rating}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>({reviews.total} {isAr ? 'تقييم' : 'reviews'}) · Google</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>

        {/* LEFT */}
        <div>
          {desc && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 20, border: '1px solid rgba(0,0,0,0.06)' }}>
              <p style={labelStyle}>— {isAr ? 'عن الخدمة' : 'About'}</p>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8 }}>{desc}</p>
            </div>
          )}

          {reviews?.reviews?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <p style={{ ...labelStyle, marginBottom: 0 }}>— {isAr ? 'آراء Google' : 'Google Reviews'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: '#2C3A6B' }}>{reviews.rating}</span>
                  <div>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                      {[1,2,3,4,5].map(i => <Star key={i} size={13} fill={i <= Math.round(reviews.rating) ? '#D4A843' : 'none'} color={i <= Math.round(reviews.rating) ? '#D4A843' : '#e5e7eb'} />)}
                    </div>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{reviews.total} {isAr ? 'تقييم' : 'reviews'}</span>
                  </div>
                </div>
              </div>

              {reviews.reviews.slice(0, 5).map((r: any, i: number) => (
                <div key={i} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: i < 4 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2C3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {r.author?.[0] || '?'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#2C3A6B' }}>{r.author}</span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map(j => <Star key={j} size={10} fill={j <= r.rating ? '#D4A843' : 'none'} color={j <= r.rating ? '#D4A843' : '#e5e7eb'} />)}
                        </div>
                        <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>{r.date}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, paddingLeft: 42 }}>{r.text}</p>
                </div>
              ))}

              {provider.google_business_url && (
                <a href={provider.google_business_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#D4A843', textDecoration: 'none', fontWeight: 500, marginTop: 4 }}>
                  <ExternalLink size={12} /> {isAr ? 'عرض كل التقييمات على Google' : 'View all on Google'}
                </a>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Contact card */}
        <div>
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 88 }}>
            <p style={labelStyle}>— {isAr ? 'التواصل' : 'Contact'}</p>

            {provider.whatsapp && (
              <a href={`https://wa.me/${provider.whatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D366', color: '#fff', fontSize: 14, fontWeight: 600, padding: '13px 16px', borderRadius: 12, textDecoration: 'none', marginBottom: 10 }}>
                <MessageCircle size={16} /> {isAr ? 'واتساب' : 'WhatsApp'}
              </a>
            )}

            {provider.phone && (
              <a href={`tel:${provider.phone}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', color: '#2C3A6B', fontSize: 14, padding: '12px 16px', borderRadius: 12, textDecoration: 'none', marginBottom: 10, border: '1px solid rgba(0,0,0,0.08)' }}>
                <Phone size={14} color="#D4A843" /> {provider.phone}
              </a>
            )}

            {provider.area && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280', padding: '12px 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <MapPin size={14} color="#D4A843" /> {provider.area.replace(/_/g, ' ')}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
