// ============================================
// Root Locale Layout
// Path: src/app/[locale]/layout.tsx
// ✅ Header — مش بيظهر في /admin و /owner
// ✅ Footer — في كل الصفحات العامة
// ✅ Base SEO metadata + OG tags
// ============================================

import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing, isRTL, type Locale } from '@/i18n'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import AnalyticsScripts from '@/components/AnalyticsScripts'
import '../globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dredott.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'DREDOTT — Stays, Cars & Services in Sharm El-Sheikh',
    template: '%s | DREDOTT',
  },
  description: 'Book curated holiday stays, car rentals, and local services in Sharm El-Sheikh, Egypt. No commission. Direct WhatsApp contact. Arabic · English · Russian.',
  keywords: ['sharm el sheikh', 'rental', 'stays', 'apartments', 'cars', 'egypt', 'red sea', 'holiday', 'شرم الشيخ', 'إيجار', 'شاليه', 'فيلا'],
  authors: [{ name: 'DREDOTT', url: SITE_URL }],
  creator: 'DREDOTT',
  publisher: 'DREDOTT',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    siteName: 'DREDOTT',
    title: 'DREDOTT — Stays, Cars & Services in Sharm El-Sheikh',
    description: 'Book curated holiday stays, car rentals, and local services in Sharm El-Sheikh, Egypt. No commission.',
    images: [{ url: `${SITE_URL}/api/og?title=DREDOTT&sub=Stays · Cars · Services · Sharm El-Sheikh`, width: 1200, height: 630, alt: 'DREDOTT — Sharm El-Sheikh' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dredott',
    title: 'DREDOTT — Stays, Cars & Services in Sharm El-Sheikh',
    description: 'Book curated holiday stays, car rentals, and local services in Sharm El-Sheikh, Egypt.',
    images: [`${SITE_URL}/api/og?title=DREDOTT&sub=Stays · Cars · Services · Sharm El-Sheikh`],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    other: {
      'facebook-domain-verification': process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION || '',
    },
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Locale)) notFound()

  const messages = await getMessages()
  const dir = isRTL(locale as Locale) ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <CurrencyProvider>
            <Header />
            {children}
            <Footer />
          </CurrencyProvider>
        </NextIntlClientProvider>
        <AnalyticsScripts />
      </body>
    </html>
  )
}
