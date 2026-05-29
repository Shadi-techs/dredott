// ============================================
// DredottSTAY — Open Graph Meta Tags
// For Facebook, Twitter, LinkedIn sharing
// ============================================

import { Metadata } from 'next'
import { Property, Car } from '@/types'

interface OGMetaTagsProps {
  property?: Property
  car?: Car
  locale: string
}

// ============================================
// Generate Open Graph Metadata
// ============================================

export function generatePropertyOGMetadata(property: Property, locale: string): Metadata {
  const coverImage = property.photos[property.cover_image_index || 0] || property.photos[0]
  const name = (property[`name_${locale}` as keyof Property] as string) || property.name
  const description = property[`description_${locale}` as keyof Property] || property.description
  
  const title = property.meta_title || `${name} - DredottStay`
  const desc = property.meta_description || 
    (typeof description === 'string' ? description.slice(0, 160) : 'Luxury property in Sharm El Sheikh')

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `https://whitestorkstay.com/${locale}/properties/${property.slug}`,
      siteName: 'DredottStay',
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [coverImage],
    },
    // Facebook App ID (add to .env.local)
    other: {
      'fb:app_id': process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
    },
  }
}

export function generateCarOGMetadata(car: Car, locale: string): Metadata {
  const coverImage = car.photos[car.cover_image_index || 0] || car.photos[0]
  const name = (car[`name_${locale}` as keyof Car] as string) || car.name
  const description = car[`description_${locale}` as keyof Car] || car.description
  
  const title = car.meta_title || `${name} - DredottRentals`
  const desc = car.meta_description || 
    (typeof description === 'string' ? description.slice(0, 160) : `Rent ${car.brand} ${car.model} in Sharm El Sheikh`)

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `https://whitestorkstay.com/${locale}/cars/${car.slug}`,
      siteName: 'DredottStay',
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [coverImage],
    },
  }
}

// ============================================
// Example Usage in page.tsx:
// ============================================

/*
import { generatePropertyOGMetadata } from '@/components/OGMetaTags'

export async function generateMetadata({ params }: { params: { id: string, locale: string } }): Promise<Metadata> {
  import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll() {},
    },
  }
)
  
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!property) {
    return {
      title: 'Property Not Found',
    }
  }

  return generatePropertyOGMetadata(property, params.locale)
}
*/

// ============================================
// Facebook Debugger Tool
// ============================================

/*
After deploying, test your OG tags:
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter URL: https://whitestorkstay.com/en/properties/villa-naama-bay
3. Click "Scrape Again" to refresh
4. Check if cover image appears correctly
*/

// ============================================
// Structured Data (JSON-LD for Google)
// ============================================

export function generatePropertyStructuredData(property: Property, locale: string) {
  const coverImage = property.photos[property.cover_image_index || 0]
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: property[`name_${locale}` as keyof Property] || property.name,
    description: property[`description_${locale}` as keyof Property] || property.description,
    image: property.photos,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Sharm El Sheikh',
      addressRegion: 'South Sinai',
      addressCountry: 'EG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      // Add latitude/longitude if available
    },
    aggregateRating: property.display_rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: property.display_rating,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    offers: property.price_hidden
      ? undefined
      : {
          '@type': 'Offer',
          price: property.price_per_night,
          priceCurrency: 'USD',
          availability: property.status === 'available' 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
        },
  }
}

// Usage in page.tsx:
/*
export default function PropertyPage({ property, locale }) {
  const structuredData = generatePropertyStructuredData(property, locale)
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div>Property content...</div>
    </>
  )
}
*/
