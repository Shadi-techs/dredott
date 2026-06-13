import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dredott.vercel.app'

export const metadata: Metadata = {
  title: 'Car Rentals in Sharm El-Sheikh — Best Rates',
  description: 'Rent a car in Sharm El-Sheikh at the best rates. Sedans, SUVs, and luxury vehicles. Daily, weekly & monthly rental. Direct owner contact, no middleman.',
  openGraph: {
    title: 'Car Rentals in Sharm El-Sheikh | DREDOTT',
    description: 'Sedans, SUVs, and luxury cars in Sharm El-Sheikh. Daily, weekly & monthly rates. No booking fees.',
    images: [{ url: `${SITE_URL}/api/og?title=Car Rentals in Sharm El-Sheikh&sub=Sedans · SUVs · Luxury Vehicles&type=cars`, width: 1200, height: 630, alt: 'Car Rentals in Sharm El-Sheikh' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Car Rentals in Sharm El-Sheikh | DREDOTT',
    description: 'Sedans, SUVs, and luxury cars. No booking fees.',
    images: [`${SITE_URL}/api/og?title=Car Rentals in Sharm El-Sheikh&sub=Sedans · SUVs · Luxury Vehicles&type=cars`],
  },
}

export default function CarsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
