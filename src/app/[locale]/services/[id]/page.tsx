'use client'

import { useState, useEffect, use } from 'react'
import { MapPin, Phone, Star, ExternalLink, ArrowLeft, MessageCircle, Share2 } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ProviderPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params)
  const isAr = locale === 'ar'

  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch(`/api/services/${id}`)
      .then(r => r.json())
      .then(d => { setProvider(d.provider); setLoading(false) })
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e8e4de', borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!provider) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 16 }}>
        <p style={{ fontSize: 48 }}>🔍</p>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: '#2C3A6B' }}>
          {isAr ? 'مزود الخدمة غير موجود' : 'Provider not found'}
        </p>
        <a href={`/${locale}/services`} style={{ color: '#D4A843', fontSize: 14, textDecoration: 'none' }}>
          ← {isAr ? 'عودة للخدمات' : 'Back to Services'}
        </a>
      </div>
    </div>
  )

  const name    = (isAr ? provider.business_name_ar : provider.business_name) || provider.business_name
  const desc    = (isAr ? provider.description_ar : provider.description) || provider.description
  const catName = isAr ? provider.service_provider_categories?.name_ar : provider.service_provider_categories?.name_en
  const icon    = provider.service_provider_categories?.icon || '🏢'
  const reviews = provider.google_reviews_cache

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100vh' }} dir={isAr ? 'rtl' : 'ltr'}>
      <Header />

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #0e1428 0%, #2C3A6B 55%, #1a3a5c 100%)',
        padding: '0 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* back link */}
        <div style={{ maxWidth: 900, margin: '0 auto', paddingTop: 16 }}>
          <a href={`/${locale}/services`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'rgba(201,206,221,0.6)', fontSize: 13, textDecoration: 'none',
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#D4A843'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(201,206,221,0.6)'}
          >
            <ArrowLeft size={14} />
            {isAr ? 'الخدمات' : 'Services'}
          </a>
        </div>

        {/* Provider identity */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 0 36px', display: 'flex', alignItems: 'flex-end', gap: 20 }}>
          {/* Logo */}
          <div style={{
            width: 80, height: 80, borderRadius: 18, flexShrink: 0,
            background: '#fff', border: '3px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}>
            {provider.logo_url
              ? <img src={provider.logo_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 15 }} />
              : icon
            }
          </div>

          <div>
            {/* Category tag */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
                color: '#D4A843', fontFamily: 'var(--font-mono, monospace)',
              }}>{icon} {catName}</span>
            </div>
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(22px, 4vw, 36px)',
              fontWeight: 400, color: '#FAF9F6',
              lineHeight: 1.15, marginBottom: 8,
            }}>
              {name}
            </h1>
            {reviews?.rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={14}
                      fill={i <= Math.round(reviews.rating) ? '#D4A843' : 'none'}
                      color={i <= Math.round(reviews.rating) ? '#D4A843' : 'rgba(255,255,255,0.2)'}
                    />
                  ))}
                </div>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600, color: '#D4A843' }}>{reviews.rating}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>({reviews.total} {isAr ? 'تقييم' : 'reviews'}) · Google</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom divider */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.25), transparent)' }} />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28 }}>

        {/* LEFT: About + Reviews */}
        <div>
          {desc && (
            <section style={{ background: '#fff', borderRadius: 16, padding: 28, marginBottom: 24, border: '1px solid #e8e4de' }}>
              <p style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: '#D4A843', marginBottom: 14,
              }}>
                — {isAr ? 'عن الخدمة' : 'About'}
              </p>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8 }}>{desc}</p>
            </section>
          )}

          {reviews?.reviews?.length > 0 && (
            <section style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e8e4de' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <p style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#9ca3af',
                }}>
                  — {isAr ? 'آراء Google' : 'Google Reviews'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 28, fontWeight: 700, color: '#2C3A6B',
                  }}>{reviews.rating}</span>
                  <div>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={13}
                          fill={i <= Math.round(reviews.rating) ? '#D4A843' : 'none'}
                          color={i <= Math.round(reviews.rating) ? '#D4A843' : '#e5e7eb'}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{reviews.total} {isAr ? 'تقييم' : 'reviews'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {reviews.reviews.slice(0, 5).map((r: any, i: number) => (
                  <div key={i} style={{ padding: '16px 0', borderBottom: i < 4 ? '1px solid #f3f0ec' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2C3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {r.author?.[0] || '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#2C3A6B' }}>{r.author}</span>
                          <div style={{ display: 'flex', gap: 1 }}>
                            {[1,2,3,4,5].map(j => (
                              <Star key={j} size={10} fill={j <= r.rating ? '#D4A843' : 'none'} color={j <= r.rating ? '#D4A843' : '#e5e7eb'} />
                            ))}
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{r.date}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{r.text}</p>
                  </div>
                ))}
              </div>

              {provider.google_business_url && (
                <a href={provider.google_business_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 12, color: '#D4A843', textDecoration: 'none', fontWeight: 500 }}>
                  <ExternalLink size={12} />
                  {isAr ? 'عرض كل التقييمات على Google' : 'View all on Google'}
                </a>
              )}
            </section>
          )}
        </div>

        {/* RIGHT: Contact card */}
        <div>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e8e4de', position: 'sticky', top: 88 }}>
            <p style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#9ca3af', marginBottom: 20,
            }}>
              — {isAr ? 'التواصل' : 'Contact'}
            </p>

            {provider.whatsapp && (
              <a href={`https://wa.me/${provider.whatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#25D366', color: '#fff',
                  fontSize: 14, fontWeight: 600,
                  padding: '13px 16px', borderRadius: 12,
                  textDecoration: 'none', marginBottom: 10,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.9'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
              >
                <MessageCircle size={16} />
                {isAr ? 'واتساب' : 'WhatsApp'}
              </a>
            )}

            {provider.phone && (
              <a href={`tel:${provider.phone}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#f5f3ef', color: '#2C3A6B',
                  fontSize: 14, padding: '12px 16px', borderRadius: 12,
                  textDecoration: 'none', marginBottom: 10,
                  border: '1px solid #e8e4de',
                }}>
                <Phone size={15} color="#D4A843" />
                {provider.phone}
              </a>
            )}

            {provider.area && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280', padding: '12px 4px' }}>
                <MapPin size={14} color="#D4A843" />
                {provider.area.replace(/_/g, ' ')}
              </div>
            )}

            <div style={{ height: 1, background: '#f3f0ec', margin: '16px 0' }} />

            {/* Share */}
            <button
              onClick={() => {
                if (navigator.share) navigator.share({ title: name, url: window.location.href })
                else { navigator.clipboard.writeText(window.location.href) }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#9ca3af', fontSize: 12, padding: '4px 0',
              }}>
              <Share2 size={13} />
              {isAr ? 'مشاركة' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      <Footer />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 768px) {
          .provider-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
