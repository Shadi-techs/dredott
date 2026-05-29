import { defineRouting } from 'next-intl/routing'
import { getRequestConfig } from 'next-intl/server'

export const routing = defineRouting({
  locales: ['en', 'ar', 'it', 'ru', 'de'],
  defaultLocale: 'en',
})

export type Locale = (typeof routing.locales)[number]
export const locales = routing.locales
export const defaultLocale = routing.defaultLocale

export const isRTL = (locale: Locale) => locale === 'ar'

export const localeNames = {
  en: { name: 'English', native: 'English', flag: '🇬🇧' },
  ar: { name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  it: { name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  ru: { name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  de: { name: 'German', native: 'Deutsch', flag: '🇩🇪' },
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale
  }
  
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})