'use client'
import { useState, useEffect, use } from 'react'
import { MapPin, Phone, Star, ExternalLink, ArrowLeft } from 'lucide-react'

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
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e0dbd4', borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!provider) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#aaa' }}>Provider not found</p>
    </div>
  )

  const name    = (isAr ? provider.business_name_ar : provider.business_name) || provider.business_name
  const desc    = (isAr ? provider.description_ar : provider.description) || provider.description
  const catName = isAr ? provider.service_provider_categories?.name_ar : provider.service_provider_categories?.name_en
  const icon    = provider.service_provider_categories?.icon || '🏢'
  const reviews = provider.google_reviews_cache

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100vh' }} dir={isAr ? 'rtl' : 'ltr'}>
      <div style={{ background: '#2C3A6B', padding: '16px 32px' }}>
        <a href={`/${locale}/services`} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> {isAr ? 'العودة للخدمات' : 'Back to Services'}
        </a>
      </div>
      <div style={{ height: 200, background: 'linear-gradient(135deg, #2C3A6B 0%, #3d4f8a 100%)', display: 'flex', alignItems: 'flex-end', padding: '0 32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, border: '3px solid rgba(255,255,255,0.3)' }}>
            {provider.logo_url ? <img src={provider.logo_url} style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover' }} /> : icon}
          </div>
          <div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: '#FAF9F6', marginBottom: 4 }}>{name}</p>
            <p style={{ fontSize: 12, color: '#D4A843', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{icon} {catName}</p>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        <div>
          {desc && (
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, border: '1px solid #e8e4de' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#2C3A6B', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{isAr ? 'عن الخدمة' : 'About'}</p>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>{desc}</p>
            </div>
          )}
          {reviews?.reviews?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e8e4de' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#2C3A6B', textTransform: 'uppercase', letterSpacing: 0.5 }}>{isAr ? 'آراء من Google' : 'Google Reviews'}</p>
                <span style={{ fontSize: 11, color: '#888', background: '#f5f3ef', padding: '2px 8px', borderRadius: 100 }}>G</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={16} fill={i <= Math.round(reviews.rating) ? '#D4A843' : 'none'} color={i <= Math.round(reviews.rating) ? '#D4A843' : '#ddd'} />)}
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 700, color: '#2C3A6B' }}>{reviews.rating}</span>
                <span style={{ fontSize: 12, color: '#aaa' }}>({reviews.total} {isAr ? 'تقييم' : 'reviews'})</span>
              </div>
              {reviews.reviews.slice(0,5).map((r: any, i: number) => (
                <div key={i} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #f0ece6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#2C3A6B' }}>{r.author}</span>
                    <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(j => <Star key={j} size={10} fill={j <= r.rating ? '#D4A843' : 'none'} color={j <= r.rating ? '#D4A843' : '#ddd'} />)}</div>
                    <span style={{ fontSize: 11, color: '#bbb', marginLeft: 'auto' }}>{r.date}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{r.text}</p>
                </div>
              ))}
              {provider.google_business_url && (
                <a href={provider.google_business_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#D4A843', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                  <ExternalLink size={12} /> {isAr ? 'عرض كل التقييمات' : 'View all on Google'}
                </a>
              )}
            </div>
          )}
        </div>
        <div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e8e4de', position: 'sticky', top: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#2C3A6B', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>{isAr ? 'التواصل' : 'Contact'}</p>
            {provider.whatsapp && (
              <a href={`https://wa.me/${provider.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#25D366', color: '#fff', fontSize: 14, fontWeight: 500, padding: '12px 16px', borderRadius: 10, textAlign: 'center', textDecoration: 'none', marginBottom: 10 }}>
                💬 WhatsApp
              </a>
            )}
            {provider.phone && (
              <a href={`tel:${provider.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f3ef', color: '#2C3A6B', fontSize: 13, padding: '10px 16px', borderRadius: 10, textDecoration: 'none', marginBottom: 10 }}>
                <Phone size={14} /> {provider.phone}
              </a>
            )}
            {provider.area && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#888', padding: '8px 0' }}>
                <MapPin size={14} /> {provider.area.replace('_', ' ')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
