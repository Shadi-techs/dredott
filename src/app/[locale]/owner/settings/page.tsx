'use client'
// src/app/[locale]/owner/settings/page.tsx

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Moon, Sun, Globe } from 'lucide-react'
import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { Card } from '@/components/owner/Card'
import { ScreenHeader } from '@/components/owner/ScreenHeader'
import { getStrings } from '@/lib/owner/strings'

const LANG_OPTIONS = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
]

const SECTIONS_TX: Record<string, { items: string[] }[]> = {
  en: [
    { items: ['Profile information', 'Email & phone', 'Password & 2FA', 'Verified ID'] },
    { items: ['Bank accounts', 'Tax info', 'Invoice settings'] },
    { items: ['House rules', 'Check-in instructions', 'Cancellation policy', 'Pricing rules'] },
    { items: ['Email digest', 'WhatsApp alerts', 'Marketing'] },
    { items: ['Pause all listings', 'Close account'] },
  ],
  ar: [
    { items: ['معلومات الملف الشخصي', 'البريد والهاتف', 'كلمة المرور و2FA', 'هوية موثقة'] },
    { items: ['الحسابات البنكية', 'بيانات الضرائب', 'إعدادات الفواتير'] },
    { items: ['قواعد المنزل', 'تعليمات تسجيل الدخول', 'سياسة الإلغاء', 'قواعد التسعير'] },
    { items: ['ملخص البريد', 'تنبيهات واتساب', 'التسويق'] },
    { items: ['إيقاف كل الإعلانات', 'إغلاق الحساب'] },
  ],
  ru: [
    { items: ['Информация профиля', 'Email и телефон', 'Пароль и 2FA', 'Подтверждённый ID'] },
    { items: ['Банковские счета', 'Налоговая информация', 'Настройки счетов'] },
    { items: ['Правила дома', 'Инструкция по заезду', 'Политика отмены', 'Правила ценообразования'] },
    { items: ['Email-дайджест', 'Уведомления WhatsApp', 'Маркетинг'] },
    { items: ['Приостановить все объявления', 'Закрыть аккаунт'] },
  ],
  uk: [
    { items: ['Інформація профілю', 'Email і телефон', 'Пароль і 2FA', 'Підтверджений ID'] },
    { items: ['Банківські рахунки', 'Податкова інформація', 'Налаштування рахунків'] },
    { items: ['Правила будинку', 'Інструкція з заїзду', 'Політика скасування', 'Правила ціноутворення'] },
    { items: ['Email-дайджест', 'Сповіщення WhatsApp', 'Маркетинг'] },
    { items: ['Призупинити всі оголошення', 'Закрити акаунт'] },
  ],
  de: [
    { items: ['Profilinformationen', 'E-Mail & Telefon', 'Passwort & 2FA', 'Verifizierte ID'] },
    { items: ['Bankkonten', 'Steuerinformationen', 'Rechnungseinstellungen'] },
    { items: ['Hausregeln', 'Check-in-Anweisungen', 'Stornierungsrichtlinie', 'Preisregeln'] },
    { items: ['E-Mail-Digest', 'WhatsApp-Benachrichtigungen', 'Marketing'] },
    { items: ['Alle Inserate pausieren', 'Konto schließen'] },
  ],
  it: [
    { items: ['Informazioni profilo', 'Email e telefono', 'Password e 2FA', 'ID verificato'] },
    { items: ['Conti bancari', 'Informazioni fiscali', 'Impostazioni fattura'] },
    { items: ['Regole della casa', 'Istruzioni check-in', 'Politica cancellazione', 'Regole di prezzo'] },
    { items: ['Digest email', 'Avvisi WhatsApp', 'Marketing'] },
    { items: ['Metti in pausa tutti gli annunci', 'Chiudi account'] },
  ],
}

const SECTION_TITLES: Record<string, string[]> = {
  en: ['Account', 'Payouts', 'Listings defaults', 'Notifications', 'Danger zone'],
  ar: ['الحساب', 'المدفوعات', 'إعدادات الإعلانات', 'الإشعارات', 'منطقة الخطر'],
  ru: ['Аккаунт', 'Выплаты', 'Настройки объявлений', 'Уведомления', 'Опасная зона'],
  uk: ['Акаунт', 'Виплати', 'Налаштування оголошень', 'Сповіщення', 'Небезпечна зона'],
  de: ['Konto', 'Auszahlungen', 'Inserate-Standardwerte', 'Benachrichtigungen', 'Gefahrenzone'],
  it: ['Account', 'Pagamenti', 'Impostazioni annunci', 'Notifiche', 'Zona pericolosa'],
}

const HEADER_SUB: Record<string, string> = {
  en: 'Manage your account, payouts, and listing defaults.',
  ar: 'إدارة حسابك ومدفوعاتك وإعدادات الإعلانات.',
  ru: 'Управляйте аккаунтом, выплатами и настройками объявлений.',
  uk: 'Керуйте акаунтом, виплатами та налаштуваннями оголошень.',
  de: 'Verwalten Sie Ihr Konto, Auszahlungen und Inserate-Einstellungen.',
  it: 'Gestisci il tuo account, i pagamenti e le impostazioni degli annunci.',
}

export default function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const { t, d, darkMode, toggleDarkMode } = useOwnerTheme()
  const router = useRouter()
  const tx = getStrings(locale as any)

  const sectionItems = SECTIONS_TX[locale] || SECTIONS_TX.en
  const sectionTitles = SECTION_TITLES[locale] || SECTION_TITLES.en

  const handleLangChange = (code: string) => {
    if (code === locale) return
    localStorage.setItem('preferred_locale', code)
    window.location.href = `/${code}/owner/settings`
  }

  return (
    <div style={{ padding: d.pad, maxWidth: 800 }}>
      <ScreenHeader
        kicker={tx.settings}
        title={tx.settings}
        sub={HEADER_SUB[locale] || HEADER_SUB.en}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: d.gap }}>

        {/* Appearance Section */}
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: `14px ${d.pad}px`, borderBottom: `1px solid ${t.border}` }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, color: t.text }}>
              {tx.appearance}
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `14px ${d.pad}px`,
            borderBottom: `1px solid ${t.borderSoft}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {darkMode
                ? <Moon size={16} color={t.accent} />
                : <Sun size={16} color={t.accent} />
              }
              <span style={{ fontSize: 13.5, color: t.text }}>{tx.darkModeLabel}</span>
            </div>
            <button
              onClick={toggleDarkMode}
              aria-label={tx.darkModeLabel}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: darkMode ? t.accent : t.border,
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.25s',
                flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute',
                top: 3, left: darkMode ? 23 : 3,
                width: 18, height: 18,
                borderRadius: '50%',
                background: darkMode ? '#0e1428' : '#fff',
                transition: 'left 0.25s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
              }} />
            </button>
          </div>

          {/* Language Selector */}
          <div style={{ padding: `14px ${d.pad}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Globe size={16} color={t.accent} />
              <span style={{ fontSize: 13.5, color: t.text, fontWeight: 500 }}>{tx.chooseLang}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {LANG_OPTIONS.map(lang => {
                const isActive = lang.code === locale
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLangChange(lang.code)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px',
                      borderRadius: 20,
                      border: isActive ? `1.5px solid ${t.accent}` : `1.5px solid ${t.border}`,
                      background: isActive ? t.accentSoft : 'transparent',
                      color: isActive ? t.accent : t.textMuted,
                      fontSize: 12.5,
                      fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Other Settings Sections */}
        {sectionTitles.map((title, si) => (
          <Card key={si} padding={0} style={{ overflow: 'hidden' }}>
            <div style={{ padding: `14px ${d.pad}px`, borderBottom: `1px solid ${t.border}` }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, color: t.text }}>
                {title}
              </div>
            </div>
            {(sectionItems[si]?.items ?? []).map((it, j) => (
              <div key={j} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `13px ${d.pad}px`,
                borderTop: j === 0 ? 'none' : `1px solid ${t.borderSoft}`,
                cursor: 'pointer',
              }}>
                <span style={{
                  fontSize: 13.5,
                  color: si === sectionTitles.length - 1 ? t.danger : t.text,
                }}>{it}</span>
                <ChevronRight size={14} color={t.textFaint} />
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  )
}
