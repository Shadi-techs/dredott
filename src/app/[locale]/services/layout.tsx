import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dredott.vercel.app'

export const metadata: Metadata = {
  title: 'Services in Sharm El-Sheikh — Restaurants, Tours, Legal & More',
  description: 'Find trusted service providers in Sharm El-Sheikh: restaurants, tours, legal services, cleaning, maintenance, and more. Verified and rated.',
  openGraph: {
    title: 'Services in Sharm El-Sheikh | DREDOTT',
    description: 'Trusted local services: restaurants, tours, legal, cleaning & more. All verified and rated.',
    images: [{ url: `${SITE_URL}/api/og?title=Services in Sharm El-Sheikh&sub=Restaurants · Tours · Legal · Cleaning&type=services`, width: 1200, height: 630, alt: 'Services in Sharm El-Sheikh' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Services in Sharm El-Sheikh | DREDOTT',
    description: 'Trusted local service providers — verified and rated.',
    images: [`${SITE_URL}/api/og?title=Services in Sharm El-Sheikh&sub=Restaurants · Tours · Legal · Cleaning&type=services`],
  },
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
