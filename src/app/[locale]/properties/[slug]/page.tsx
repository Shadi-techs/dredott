'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useParams } from 'next/navigation'
import {
  MapPin, Users, Bed,
  Star, ArrowLeft, ChevronLeft,
  ChevronRight, X, MessageCircle, Lock, Check,
  Wifi, Wind, Car, Waves, Shield, Coffee, CalendarDays
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const AREA_LABELS: Record<string, string> = {
  naama_bay: 'Naama Bay', sharks_bay: 'Sharks Bay',
  hadaba: 'Hadaba', montazah: 'Montazah',
  nabq: 'Nabq Bay', um_el_sid: 'Um El Sid',
  el_salam: 'El Salam', old_market: 'Old Market',
}

const SELECT_COLS = 'id, slug, name, name_en, description, area, type, bedrooms, max_guests, photos, display_rating, price_hidden, price_per_night, price_per_week, price_per_month, wifi, ac, pool_access, sea_view, parking, security_24h, kitchen, balcony, city, lat, lng, compound_id'

export default function PropertyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const slug   = params.slug as string
  const isAr   = locale === 'ar'

  const [property, setProperty]     = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [user, setUser]             = useState<any>(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [lightbox, setLightbox]     = useState(false)
  const [notFound, setNotFound]     = useState(false)

  useEffect(() => {
    loadProperty()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [slug])

  const loadProperty = async () => {
    let { data } = await supabase
      .from('properties')
      .select(SELECT_COLS)
      .eq('slug', slug)
      .in('status', ['available', 'active', 'live'])
      .maybeSingle()

    if (!data) {
      const { data: byId } = await supabase
        .from('properties')
        .select(SELECT_COLS)
        .eq('id', slug)
        .in('status', ['available', 'active', 'live'])
        .maybeSingle()
      data = byId
    }

    if (!data) { setNotFound(true); setLoading(false); return }
    setProperty(data)
    setLoading(false)
  }

  const handleWhatsApp = () => {
    if (!user) {
      router.push(`/${locale}/login?redirect=/${locale}/properties/${slug}&reason=contact`)
      return
    }
    const msg = encodeURIComponent(`Hi, I'm interested in your property: ${property.name}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const handleBookNow = () => {
    if (!user) {
      router.push(`/${locale}/login?redirect=/${locale}/booking/${property.id}`)
      return
    }
    router.push(`/${locale}/booking/${property.id}`)
  }

  const photos       = property?.photos?.filter(Boolean) || []
  const priceVisible = !property?.price_hidden || !!user

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
        <p style={{ fontSize: 48 }}>🏠</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#2C3A6B' }}>
          {isAr ? 'العقار غير موجود' : 'Property not found'}
        </h2>
        <button onClick={() => router.push(`/${locale}/properties`)} style={{ padding: '10px 24px', background: '#2C3A6B', color: '#D4A843', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          {isAr ? 'تصفح كل الشقق' : 'Browse all stays'}
        </button>
      </div>
      <Footer />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!property) return null

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />

      {lightbox && photos.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <X size={20} />
          </button>
          <button onClick={e => { e.stopPropagation(); setPhotoIndex(i => (i - 1 + photos.length) % photos.length) }}
            style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <ChevronLeft size={22} />
          </button>
          <img src={photos[photoIndex]} alt="" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }} onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); setPhotoIndex(i => (i + 1) % photos.length) }}
            style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <ChevronRight size={22} />
          </button>
          <p style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{photoIndex + 1} / {photos.length}</p>
        </div>
      )}

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px 0' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>
          <ArrowLeft size={16} /> {isAr ? 'عودة' : 'Back to stays'}
        </button>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 24px 60px' }}>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 400, color: '#2C3A6B', lineHeight: 1.2, marginBottom: 8 }}>
            {property.name}
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} color="#D4A843" />
            {AREA_LABELS[property.area] || property.area}
            {property.city && `, ${property.city}`}
          </p>
        </div>

        {photos.length > 0 && (
          <div style={{ marginBottom: 28, borderRadius: 16, overflow: 'hidden', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 4, height: 400 }}>
            <div style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => { setPhotoIndex(0); setLightbox(true) }}>
              <img src={photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 4 }}>
              {photos.slice(1, 3).map((photo: string, i: number) => (
                <div key={i} style={{ overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                  onClick={() => { setPhotoIndex(i + 1); setLightbox(true) }}>
                  <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {i === 1 && photos.length > 3 && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 600 }}>
                      +{photos.length - 3} more
                    </div>
                  )}
                </div>
              ))}
              {photos.length === 1 && <div style={{ background: '#f3f4f6' }} />}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', gap: 24, padding: 20, background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', marginBottom: 24, flexWrap: 'wrap' }}>
              {[
                { icon: Bed,   label: property.bedrooms === 0 ? (isAr ? 'استوديو' : 'Studio') : `${property.bedrooms} ${isAr ? 'غرف' : 'bedrooms'}` },
                { icon: Users, label: isAr ? `حتى ${property.max_guests} ضيوف` : `Up to ${property.max_guests} guests` },
              ].map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={18} color="#D4A843" />
                    <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{s.label}</span>
                  </div>
                )
              })}
            </div>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#2C3A6B', marginBottom: 12 }}>
                {isAr ? 'عن هذا العقار' : 'About this stay'}
              </h2>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{property.description}</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#2C3A6B', marginBottom: 14 }}>
                {isAr ? 'المرافق' : "What's included"}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { key: 'wifi',         label: isAr ? 'واي فاي' : 'WiFi',     icon: Wifi },
                  { key: 'ac',           label: isAr ? 'تكييف' : 'AC',         icon: Wind },
                  { key: 'pool_access',  label: isAr ? 'حمام سباحة' : 'Pool',  icon: Waves },
                  { key: 'sea_view',     label: isAr ? 'إطلالة بحر' : 'Sea view', icon: MapPin },
                  { key: 'parking',      label: isAr ? 'جراج' : 'Parking',     icon: Car },
                  { key: 'security_24h', label: isAr ? 'أمن 24/7' : 'Security', icon: Shield },
                  { key: 'kitchen',      label: isAr ? 'مطبخ' : 'Kitchen',     icon: Coffee },
                  { key: 'balcony',      label: isAr ? 'بلكونة' : 'Balcony',   icon: Check },
                ].filter(a => property[a.key]).map((a, i) => {
                  const Icon = a.icon
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(212,168,67,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} color="#D4A843" />
                      </div>
                      <span style={{ fontSize: 14, color: '#374151' }}>{a.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#2C3A6B', marginBottom: 14 }}>
                {isAr ? 'الموقع' : 'Location'}
              </h2>
              <div style={{ background: '#f3f4f6', borderRadius: 12, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                <MapPin size={32} color="#D4A843" />
                <p style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>{AREA_LABELS[property.area] || property.area}</p>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>{property.city || 'Sharm El-Sheikh'}, Egypt</p>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div>
            <div style={{ position: 'sticky', top: 80, background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)', padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div style={{ marginBottom: 20 }}>
                {priceVisible ? (
                  <div>
                    {property.price_per_night && (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: '#D4A843' }}>
                          EGP {property.price_per_night.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 13, color: '#9ca3af' }}>/{isAr ? 'ليلة' : 'night'}</span>
                      </div>
                    )}
                    {property.price_per_week && <p style={{ fontSize: 13, color: '#6b7280' }}>EGP {property.price_per_week.toLocaleString()} / {isAr ? 'أسبوع' : 'week'}</p>}
                    {property.price_per_month && <p style={{ fontSize: 13, color: '#6b7280' }}>EGP {property.price_per_month.toLocaleString()} / {isAr ? 'شهر' : 'month'}</p>}
                  </div>
                ) : (
                  <div style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Lock size={18} color="#D4A843" />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#2C3A6B' }}>{isAr ? 'سجّل الدخول لرؤية السعر' : 'Login to see price'}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{isAr ? 'التسجيل مجاني' : 'Free registration required'}</p>
                    </div>
                  </div>
                )}
              </div>

              {property.display_rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #f3f4f6' }}>
                  <Star size={16} color="#D4A843" fill="#D4A843" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#2C3A6B' }}>{property.display_rating.toFixed(1)}</span>
                </div>
              )}

              {/* Primary: Book Now */}
              <button onClick={handleBookNow} style={{
                width: '100%', padding: 14,
                background: '#2C3A6B',
                color: '#D4A843', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontSize: 15, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 10,
              }}>
                <CalendarDays size={18} />
                {isAr ? 'احجز الآن' : 'Book Now'}
              </button>

              {/* Secondary: WhatsApp (only for logged-in users) */}
              {user && (
                <button onClick={handleWhatsApp} style={{
                  width: '100%', padding: 12,
                  background: 'transparent',
                  color: '#25D366', borderRadius: 12, border: '1.5px solid #25D366', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginBottom: 10,
                }}>
                  <MessageCircle size={16} />
                  {isAr ? 'تواصل عبر واتساب' : 'Contact on WhatsApp'}
                </button>
              )}

              {!user && (
                <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 1.5 }}>
                  {isAr ? 'أنشئ حساباً مجانياً للتواصل والحجز' : 'Create a free account to book or contact owners'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
