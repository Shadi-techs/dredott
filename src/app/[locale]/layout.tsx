// ============================================
// Root Locale Layout
// Path: src/app/[locale]/layout.tsx
// ✅ Header — مش بيظهر في /admin و /owner
// ✅ Footer — في كل الصفحات العامة
// ============================================

import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing, isRTL, type Locale } from '@/i18n'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import '../globals.css'

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
      </body>
    </html>
  )
}