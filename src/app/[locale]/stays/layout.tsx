import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dredott.vercel.app'

export const metadata: Metadata = {
  title: 'Stays in Sharm El-Sheikh — Apartments, Villas & Chalets',
  description: 'Browse curated holiday stays in Sharm El-Sheikh: beachfront apartments, villas, studios, chalets & penthouses. No commission. Direct owner contact on WhatsApp.',
  openGraph: {
    title: 'Stays in Sharm El-Sheikh | DREDOTT',
    description: 'Curated apartments, villas, studios & chalets in Naama Bay, Sharks Bay, Hadaba & more. No booking fees.',
    images: [{ url: `${SITE_URL}/api/og?title=Stays in Sharm El-Sheikh&sub=Apartments · Villas · Chalets · Studios&type=stays`, width: 1200, height: 630, alt: 'Stays in Sharm El-Sheikh' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stays in Sharm El-Sheikh | DREDOTT',
    description: 'Curated apartments, villas, studios & chalets. No booking fees.',
    images: [`${SITE_URL}/api/og?title=Stays in Sharm El-Sheikh&sub=Apartments · Villas · Chalets · Studios&type=stays`],
  },
}

export default function StaysLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
