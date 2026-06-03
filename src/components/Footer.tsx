'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TX: Record<string, any> = {
  en: {
    tagline: 'Curated stays and cars in Sharm El-Sheikh. Zero commission. Direct owner contact.',
    slogan: 'Your dot on the Red Sea.',
    explore: 'Explore',
    stays: 'Stays', cars: 'Cars', services: 'Services', blog: 'Blog', pricing: 'Pricing',
    forOwners: 'For Owners',
    listProperty: 'List Your Property', listCar: 'List Your Car', listService: 'List Your Service',
    dashboard: 'Owner Dashboard', about: 'About',
    legal: 'Legal',
    privacy: 'Privacy Policy', terms: 'Terms of Service', contact: 'Contact Us',
    languages: 'Languages',
    rights: 'All rights reserved.',
    badge: 'Zero commission · Direct contact · 6 languages',
  },
  ar: {
    tagline: 'إقامات وسيارات مختارة في شرم الشيخ. بدون عمولة. تواصل مباشر مع المالك.',
    slogan: 'نقطتك على البحر الأحمر.',
    explore: 'استكشف',
    stays: 'إقامات', cars: 'سيارات', services: 'خدمات', blog: 'مدونة', pricing: 'الأسعار',
    forOwners: 'للملاك',
    listProperty: 'أضف عقارك', listCar: 'أضف سيارتك', listService: 'أضف خدمتك',
    dashboard: 'لوحة المالك', about: 'عن الموقع',
    legal: 'قانوني',
    privacy: 'سياسة الخصوصية', terms: 'شروط الخدمة', contact: 'تواصل معنا',
    languages: 'اللغات',
    rights: 'جميع الحقوق محفوظة.',
    badge: 'بدون عمولة · تواصل مباشر · 6 لغات',
  },
  ru: {
    tagline: 'Отобранные апартаменты и авто в Шарм-эль-Шейхе. Без комиссии. Прямой контакт.',
    slogan: 'Ваша точка на Красном море.',
    explore: 'Каталог',
    stays: 'Жильё', cars: 'Авто', services: 'Услуги', blog: 'Блог', pricing: 'Цены',
    forOwners: 'Владельцам',
    listProperty: 'Разместить жильё', listCar: 'Разместить авто', listService: 'Разместить услугу',
    dashboard: 'Панель владельца', about: 'О нас',
    legal: 'Правовое',
    privacy: 'Политика конфиденциальности', terms: 'Условия использования', contact: 'Контакты',
    languages: 'Языки',
    rights: 'Все права защищены.',
    badge: 'Без комиссии · Прямой контакт · 6 языков',
  },
  uk: {
    tagline: 'Відібране житло та авто в Шарм-ель-Шейху. Без комісії. Прямий контакт.',
    slogan: 'Ваша точка на Червоному морі.',
    explore: 'Каталог',
    stays: 'Житло', cars: 'Авто', services: 'Послуги', blog: 'Блог', pricing: 'Ціни',
    forOwners: 'Власникам',
    listProperty: 'Розмістити житло', listCar: 'Розмістити авто', listService: 'Розмістити послугу',
    dashboard: 'Панель власника', about: 'Про нас',
    legal: 'Правове',
    privacy: 'Політика конфіденційності', terms: 'Умови використання', contact: 'Контакти',
    languages: 'Мови',
    rights: 'Всі права захищені.',
    badge: 'Без комісії · Прямий контакт · 6 мов',
  },
  de: {
    tagline: 'Ausgewählte Unterkünfte und Autos in Sharm El-Sheikh. Keine Provision. Direktkontakt.',
    slogan: 'Ihr Punkt am Roten Meer.',
    explore: 'Entdecken',
    stays: 'Unterkünfte', cars: 'Autos', services: 'Dienste', blog: 'Blog', pricing: 'Preise',
    forOwners: 'Für Eigentümer',
    listProperty: 'Unterkunft eintragen', listCar: 'Auto eintragen', listService: 'Dienst eintragen',
    dashboard: 'Eigentümer-Dashboard', about: 'Über uns',
    legal: 'Rechtliches',
    privacy: 'Datenschutz', terms: 'Nutzungsbedingungen', contact: 'Kontakt',
    languages: 'Sprachen',
    rights: 'Alle Rechte vorbehalten.',
    badge: 'Keine Provision · Direktkontakt · 6 Sprachen',
  },
  it: {
    tagline: 'Soggiorni e auto selezionati a Sharm El-Sheikh. Zero commissioni. Contatto diretto.',
    slogan: 'Il tuo punto sul Mar Rosso.',
    explore: 'Esplora',
    stays: 'Soggiorni', cars: 'Auto', services: 'Servizi', blog: 'Blog', pricing: 'Prezzi',
    forOwners: 'Per Proprietari',
    listProperty: 'Inserisci proprietà', listCar: 'Inserisci auto', listService: 'Inserisci servizio',
    dashboard: 'Dashboard proprietario', about: 'Chi siamo',
    legal: 'Legale',
    privacy: 'Privacy', terms: 'Termini di servizio', contact: 'Contattaci',
    languages: 'Lingue',
    rights: 'Tutti i diritti riservati.',
    badge: 'Zero commissioni · Contatto diretto · 6 lingue',
  },
}

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
  { code: 'ru', label: 'RU' },
  { code: 'uk', label: 'UA' },
  { code: 'de', label: 'DE' },
  { code: 'it', label: 'IT' },
]

export default function Footer() {
  const pathname = usePathname()

  if (pathname.includes('/admin')) return null
  if (pathname.includes('/owner')) return null

  const locale = pathname.split('/')[1] || 'en'
  const tx = TX[locale] || TX.en
  const year = new Date().getFullYear()
  const isAr = locale === 'ar'

  const colHead: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9, letterSpacing: '0.25em',
    textTransform: 'uppercase', color: '#D4A843',
    marginBottom: 14,
  }

  const linkStyle: React.CSSProperties = {
    display: 'block', fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    textDecoration: 'none', marginBottom: 8,
  }

  return (
    <>
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
        .footer-link:hover { color: #D4A843 !important; }
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        @media (max-width: 600px) {
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>

      <footer style={{ background: '#0e1428', borderTop: '1px solid rgba(212,168,67,0.1)', padding: '48px 24px 24px' }} dir={isAr ? 'rtl' : 'ltr'}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div className="footer-grid">

            {/* Brand */}
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#D4A843', fontStyle: 'italic', marginBottom: 10 }}>
                DREDOTT
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 240 }}>
                {tx.tagline}
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#D4A843', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 16 }}>
                {tx.slogan}
              </p>
            </div>

            {/* Explore */}
            <div>
              <p style={colHead}>{tx.explore}</p>
              {[
                { label: tx.stays,    href: `/\${locale}/properties` },
                { label: tx.cars,     href: `/\${locale}/cars` },
                { label: tx.services, href: `/\${locale}/services` },
                { label: tx.blog,     href: `/\${locale}/blog` },
                { label: tx.pricing,  href: `/\${locale}/pricing` },
              ].map(l => (
                <Link key={l.label} href={l.href} className="footer-link" style={linkStyle}>{l.label}</Link>
              ))}
            </div>

            {/* For Owners */}
            <div>
              <p style={colHead}>{tx.forOwners}</p>
              {[
                { label: tx.listProperty, href: `/\${locale}/pricing` },
                { label: tx.listCar,      href: `/\${locale}/pricing` },
                { label: tx.listService,  href: `/\${locale}/services/register` },
                { label: tx.dashboard,    href: `/\${locale}/owner` },
                { label: tx.about,        href: `/\${locale}/about` },
              ].map(l => (
                <Link key={l.label} href={l.href} className="footer-link" style={linkStyle}>{l.label}</Link>
              ))}
            </div>

            {/* Legal + Languages */}
            <div>
              <p style={colHead}>{tx.legal}</p>
              {[
                { label: tx.privacy, href: `/\${locale}/privacy` },
                { label: tx.terms,   href: `/\${locale}/terms` },
                { label: tx.contact, href: `/\${locale}/contact` },
              ].map(l => (
                <Link key={l.label} href={l.href} className="footer-link" style={linkStyle}>{l.label}</Link>
              ))}

              <p style={{ ...colHead, marginTop: 20 }}>{tx.languages}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {LANGUAGES.map(lang => {
                  const currentPath = pathname.replace(`/\${locale}`, '') || '/'
                  return (
                    <Link key={lang.code} href={`/\${lang.code}\${currentPath}`} style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 6,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: locale === lang.code ? 'rgba(212,168,67,0.15)' : 'rgba(255,255,255,0.06)',
                      color: locale === lang.code ? '#D4A843' : 'rgba(255,255,255,0.4)',
                      textDecoration: 'none',
                      border: locale === lang.code ? '1px solid rgba(212,168,67,0.25)' : '1px solid transparent',
                    }}>
                      {lang.label}
                    </Link>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

          {/* Bottom */}
          <div className="footer-bottom">
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
              © {year} DREDOTT. {tx.rights} Sharm El-Sheikh, Egypt.
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono', monospace" }}>
              {tx.badge}
            </p>
          </div>

        </div>
      </footer>
    </>
  )
}
