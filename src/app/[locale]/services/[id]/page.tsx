'use client'

import { useState, useEffect, use } from 'react'
import { MapPin, Phone, Star, ExternalLink, ArrowLeft, MessageCircle } from 'lucide-react'
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
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-[#e5e7eb] border-t-[#D4A843] rounded-full animate-spin" />
      </div>
    </div>
  )

  if (!provider) return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <p className="text-5xl">🔍</p>
        <h2 className="text-3xl text-[#2C3A6B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {isAr ? 'مزود الخدمة غير موجود' : 'Provider not found'}
        </h2>
        <a href={`/${locale}/services`} className="text-[#2A9D8F] text-sm hover:underline">
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
    <div className="min-h-screen bg-[#FAF9F6]" dir={isAr ? 'rtl' : 'ltr'}>
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-6 pb-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0e1428 0%, #2C3A6B 60%, #1a2440 100%)' }}
      >
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

        <div className="relative z-10 max-w-5xl mx-auto px-8">
          {/* Back */}
          <a href={`/${locale}/services`}
            className="inline-flex items-center gap-2 text-white/50 hover:text-[#D4A843] text-sm transition-colors mb-8"
            style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
            <ArrowLeft size={14} />
            {isAr ? 'الخدمات' : 'Services'}
          </a>

          {/* Provider identity */}
          <div className="flex items-end gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-4xl overflow-hidden flex-shrink-0 shadow-xl">
              {provider.logo_url
                ? <img src={provider.logo_url} alt={name} className="w-full h-full object-cover rounded-xl" />
                : icon
              }
            </div>

            <div>
              <div className="text-[10px] tracking-[0.2em] text-[#D4A843] mb-2"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {icon} {catName?.toUpperCase()}
              </div>
              <h1 className="text-4xl lg:text-5xl text-white leading-none mb-3"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
                {name}
              </h1>
              {reviews?.rating && (
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4"
                        fill={i <= Math.round(reviews.rating) ? '#D4A843' : 'none'}
                        color={i <= Math.round(reviews.rating) ? '#D4A843' : 'rgba(255,255,255,0.2)'}
                      />
                    ))}
                  </div>
                  <span className="text-[#D4A843] font-bold text-lg"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {reviews.rating}
                  </span>
                  <span className="text-white/40 text-sm">
                    ({reviews.total} {isAr ? 'تقييم' : 'reviews'}) · Google
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gold divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.3), transparent)' }} />
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: About + Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {desc && (
            <div className="bg-white rounded-xl border border-[rgba(26,36,64,0.08)] p-7">
              <div className="text-[10px] tracking-[0.2em] text-[#B8860B] mb-5"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                — {isAr ? 'عن الخدمة' : 'ABOUT'}
              </div>
              <p className="text-gray-600 leading-relaxed">{desc}</p>
            </div>
          )}

          {reviews?.reviews?.length > 0 && (
            <div className="bg-white rounded-xl border border-[rgba(26,36,64,0.08)] p-7">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[10px] tracking-[0.2em] text-[#B8860B]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  — {isAr ? 'آراء GOOGLE' : 'GOOGLE REVIEWS'}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-[#2C3A6B]"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {reviews.rating}
                  </span>
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-3.5 h-3.5"
                          fill={i <= Math.round(reviews.rating) ? '#D4A843' : 'none'}
                          color={i <= Math.round(reviews.rating) ? '#D4A843' : '#e5e7eb'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{reviews.total} {isAr ? 'تقييم' : 'reviews'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {reviews.reviews.slice(0, 5).map((r: any, i: number) => (
                  <div key={i} className={i < reviews.reviews.slice(0,5).length - 1 ? 'pb-5 border-b border-gray-100' : ''}>
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#2C3A6B] flex items-center justify-center text-[#D4A843] text-sm font-bold flex-shrink-0">
                        {r.author?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-[#2C3A6B]">{r.author}</span>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(j => (
                              <Star key={j} className="w-3 h-3"
                                fill={j <= r.rating ? '#D4A843' : 'none'}
                                color={j <= r.rating ? '#D4A843' : '#e5e7eb'}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400 ml-auto">{r.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed ml-11">{r.text}</p>
                  </div>
                ))}
              </div>

              {provider.google_business_url && (
                <a href={provider.google_business_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-5 text-sm text-[#D4A843] hover:text-[#B8860B] font-medium transition-colors">
                  <ExternalLink size={13} />
                  {isAr ? 'عرض كل التقييمات على Google' : 'View all on Google'}
                </a>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Contact card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-[rgba(26,36,64,0.08)] p-6 sticky top-24">
            <div className="text-[10px] tracking-[0.2em] text-[#B8860B] mb-6"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              — {isAr ? 'التواصل' : 'CONTACT'}
            </div>

            {provider.whatsapp && (
              <a href={`https://wa.me/${provider.whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#22c55e] text-white font-semibold py-3.5 rounded-xl mb-3 transition-colors">
                <MessageCircle size={16} />
                {isAr ? 'تواصل واتساب' : 'WhatsApp'}
              </a>
            )}

            {provider.phone && (
              <a href={`tel:${provider.phone}`}
                className="flex items-center gap-3 w-full bg-[#FAF9F6] hover:bg-gray-100 text-[#2C3A6B] font-medium py-3.5 px-4 rounded-xl mb-3 border border-[rgba(26,36,64,0.08)] transition-colors text-sm">
                <Phone size={14} className="text-[#D4A843]" />
                {provider.phone}
              </a>
            )}

            {provider.area && (
              <div className="flex items-center gap-3 text-sm text-gray-500 py-3 border-t border-gray-100 mt-2">
                <MapPin size={14} className="text-[#B8860B]" />
                {provider.area.replace(/_/g, ' ')}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
