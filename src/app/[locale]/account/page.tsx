'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useCurrency, type Currency } from '@/contexts/CurrencyContext'
import { User, Globe, LogOut, ChevronLeft } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CURRENCIES: { code: Currency; symbol: string; label: string; labelAr: string }[] = [
  { code: 'EGP', symbol: 'ج.م', label: 'Egyptian Pound', labelAr: 'جنيه مصري' },
  { code: 'USD', symbol: '$',   label: 'US Dollar',      labelAr: 'دولار أمريكي' },
  { code: 'EUR', symbol: '€',   label: 'Euro',           labelAr: 'يورو' },
]

const TX = {
  en: {
    title: 'My Account', back: 'Back',
    name: 'Name', email: 'Email',
    currency_title: 'Display Currency',
    currency_sub: 'All prices on the site will be shown in this currency. Detected automatically based on your location.',
    sign_out: 'Sign out',
    not_logged: 'Please log in to view your account.',
    login: 'Log in',
  },
  ar: {
    title: 'حسابي', back: 'رجوع',
    name: 'الاسم', email: 'البريد الإلكتروني',
    currency_title: 'عملة العرض',
    currency_sub: 'كل الأسعار على الموقع ستظهر بهذه العملة. يتم اكتشافها تلقائياً بناءً على موقعك.',
    sign_out: 'تسجيل الخروج',
    not_logged: 'يرجى تسجيل الدخول للوصول إلى حسابك.',
    login: 'تسجيل الدخول',
  },
  ru: {
    title: 'Мой аккаунт', back: 'Назад',
    name: 'Имя', email: 'Email',
    currency_title: 'Валюта отображения',
    currency_sub: 'Все цены на сайте будут отображаться в этой валюте. Определяется автоматически по вашему местоположению.',
    sign_out: 'Выйти',
    not_logged: 'Войдите, чтобы просмотреть аккаунт.',
    login: 'Войти',
  },
  uk: {
    title: 'Мій акаунт', back: 'Назад',
    name: "Ім'я", email: 'Email',
    currency_title: 'Валюта відображення',
    currency_sub: 'Усі ціни на сайті відображатимуться в цій валюті. Визначається автоматично за вашим місцезнаходженням.',
    sign_out: 'Вийти',
    not_logged: 'Увійдіть, щоб переглянути акаунт.',
    login: 'Увійти',
  },
  de: {
    title: 'Mein Konto', back: 'Zurück',
    name: 'Name', email: 'E-Mail',
    currency_title: 'Anzeigewährung',
    currency_sub: 'Alle Preise auf der Website werden in dieser Währung angezeigt. Wird automatisch anhand Ihres Standorts erkannt.',
    sign_out: 'Abmelden',
    not_logged: 'Bitte melden Sie sich an, um Ihr Konto anzuzeigen.',
    login: 'Anmelden',
  },
  it: {
    title: 'Il mio account', back: 'Indietro',
    name: 'Nome', email: 'Email',
    currency_title: 'Valuta di visualizzazione',
    currency_sub: 'Tutti i prezzi sul sito saranno mostrati in questa valuta. Rilevata automaticamente in base alla tua posizione.',
    sign_out: 'Esci',
    not_logged: 'Accedi per visualizzare il tuo account.',
    login: 'Accedi',
  },
}

export default function AccountPage() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const tx = TX[locale as keyof typeof TX] || TX.en
  const isAr = locale === 'ar'
  const router = useRouter()

  const { currency, setCurrency } = useCurrency()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) { setLoading(false); return }
      setUser(u)
      supabase.from('profiles').select('first_name, last_name, phone').eq('id', u.id).single()
        .then(({ data }) => { setProfile(data); setLoading(false) })
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(`/${locale}`)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #D4A843', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <p style={{ fontSize: 16, color: '#6b7280' }}>{tx.not_logged}</p>
      <button onClick={() => router.push(`/${locale}/login`)} style={{ background: '#2C3A6B', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{tx.login}</button>
    </div>
  )

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user.email?.split('@')[0]

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', direction: isAr ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 20px 60px' }}>

        {/* Back */}
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', marginBottom: 28, padding: 0 }}>
          <ChevronLeft size={16} style={{ transform: isAr ? 'rotate(180deg)' : 'none' }} />
          {tx.back}
        </button>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: '#2C3A6B', margin: '0 0 28px' }}>{tx.title}</h1>

        {/* Profile card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(44,58,107,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={22} color="#2C3A6B" />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#2C3A6B', margin: '0 0 2px' }}>{fullName}</p>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{user.email}</p>
          </div>
        </div>

        {/* Currency card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Globe size={18} color="#2A9D8F" />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#2C3A6B', margin: 0 }}>{tx.currency_title}</p>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 16px', lineHeight: 1.6 }}>{tx.currency_sub}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                style={{
                  flex: 1, minWidth: 90, padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                  border: currency === c.code ? '2px solid #2A9D8F' : '2px solid #e5e7eb',
                  background: currency === c.code ? 'rgba(42,157,143,0.06)' : '#fafafa',
                  color: currency === c.code ? '#2A9D8F' : '#6b7280',
                  fontWeight: currency === c.code ? 700 : 500,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{c.symbol}</div>
                <div style={{ fontSize: 12 }}>{c.code}</div>
                <div style={{ fontSize: 10, color: 'inherit', opacity: 0.7 }}>{isAr ? c.labelAr : c.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <button onClick={handleSignOut} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', borderRadius: 12, border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.04)', color: '#f87171', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <LogOut size={15} />
          {tx.sign_out}
        </button>

      </div>
    </div>
  )
}
