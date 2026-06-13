// ============================================
// Stay Detail — Server wrapper for SEO/OG + JSON-LD
// Client UI lives in PropertyDetailClient.tsx
// ============================================

import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import PropertyDetailClient from './PropertyDetailClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dredott.vercel.app'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

async function getProperty(slug: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('properties')
    .select('name, name_en, description, photos, area, city, slug, id, bedrooms, max_guests, price_per_night, display_rating, lat, lng')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .in('status', ['available', 'active', 'live'])
    .maybeSingle()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const p = await getProperty(slug)

  if (!p) {
    return { title: 'Stay Not Found — DREDOTT', robots: { index: false } }
  }

  const title     = p.name || p.name_en || 'Stay in Sharm El-Sheikh'
  const areaLabel = p.area?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Sharm El-Sheikh'
  const location  = [areaLabel, p.city || 'Sharm El-Sheikh', 'Egypt'].filter(Boolean).join(', ')
  const rooms     = p.bedrooms === 0 ? 'Studio' : p.bedrooms ? `${p.bedrooms} BR` : ''
  const guests    = p.max_guests ? ` · Up to ${p.max_guests} guests` : ''
  const ogTitle   = `${title}${rooms ? ' — ' + rooms : ''}${guests} | DREDOTT`
  const description = p.description
    ? p.description.slice(0, 160)
    : `Book ${title} in ${location}. No commission. Direct WhatsApp contact.`

  const image = Array.isArray(p.photos) && p.photos.length > 0
    ? p.photos[0]
    : `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&sub=${encodeURIComponent(location)}&type=property`

  const key = p.slug || p.id
  const url = `${SITE_URL}/${locale}/stays/${key}`

  return {
    title: ogTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en/stays/${key}`,
        ar: `${SITE_URL}/ar/stays/${key}`,
        ru: `${SITE_URL}/ru/stays/${key}`,
      },
    },
    openGraph: {
      type: 'website',
      url,
      siteName: 'DREDOTT',
      title: ogTitle,
      description,
      images: [{ url: image, width: 1200, height: 800, alt: title }],
      locale: locale === 'ar' ? 'ar_EG' : locale === 'ru' ? 'ru_RU' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [image],
      site: '@dredott',
    },
  }
}

export default async function StayDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const p = await getProperty(slug)

  // JSON-LD structured data for Google
  const jsonLd = p ? {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: p.name || p.name_en,
    description: p.description,
    image: Array.isArray(p.photos) ? p.photos : [],
    url: `${SITE_URL}/${locale}/stays/${p.slug || p.id}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: p.city || 'Sharm El-Sheikh',
      addressRegion: p.area?.replace(/_/g, ' ') || 'South Sinai',
      addressCountry: 'EG',
    },
    ...(p.lat && p.lng ? { geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng } } : {}),
    ...(p.display_rating ? {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: p.display_rating, bestRating: 5, worstRating: 1 },
    } : {}),
    ...(p.price_per_night ? {
      priceRange: `EGP ${p.price_per_night}/night`,
    } : {}),
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PropertyDetailClient />
    </>
  )
}
