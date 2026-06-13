// ============================================
// Car Detail — Server wrapper for SEO/OG
// Client UI lives in CarDetailClient.tsx
// ============================================

import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import CarDetailClient from './CarDetailClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dredott.vercel.app'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params

  const supabase = createAdminClient()
  const { data: c } = await supabase
    .from('cars')
    .select('id, brand, model, year, description, photos, city, transmission, seats, price_per_day')
    .eq('id', id)
    .in('status', ['available', 'active'])
    .maybeSingle()

  if (!c) {
    return {
      title: 'Car Not Found — DREDOTT',
      robots: { index: false },
    }
  }

  const title       = `${c.brand} ${c.model} ${c.year || ''}`.trim()
  const location    = `${c.city || 'Sharm El-Sheikh'}, Egypt`
  const specs       = [c.seats ? `${c.seats} seats` : '', c.transmission || ''].filter(Boolean).join(' · ')
  const ogTitle     = `${title} — ${specs} | DREDOTT`
  const description = c.description
    ? c.description.slice(0, 160)
    : `Rent ${title} in ${location}. ${specs}. No commission, direct contact.`

  const image = Array.isArray(c.photos) && c.photos.length > 0
    ? c.photos[0]
    : `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&sub=${encodeURIComponent(specs)}&type=car`

  const url = `${SITE_URL}/${locale}/cars/${c.id}`

  return {
    title: ogTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
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

export default function CarDetailPage() {
  return <CarDetailClient />
}
