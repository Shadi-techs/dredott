'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Eye, EyeOff } from 'lucide-react'

const countryList = [
  { code: "EG", nameAr: "مصر", nameEn: "Egypt", nameRu: "Египет", nameUk: "Єгипет", nameDe: "Ägypten", nameIt: "Egitto" },
  { code: "SA", nameAr: "السعودية", nameEn: "Saudi Arabia", nameRu: "Саудовская Аравия", nameUk: "Саудівська Аравія", nameDe: "Saudi-Arabien", nameIt: "Arabia Saudita" },
  { code: "AE", nameAr: "الإمارات", nameEn: "UAE", nameRu: "ОАЭ", nameUk: "ОАЕ", nameDe: "VAE", nameIt: "Emirati Arabi" },
  { code: "KW", nameAr: "الكويت", nameEn: "Kuwait", nameRu: "Кувейт", nameUk: "Кувейт", nameDe: "Kuwait", nameIt: "Kuwait" },
  { code: "QA", nameAr: "قطر", nameEn: "Qatar", nameRu: "Катар", nameUk: "Катар", nameDe: "Katar", nameIt: "Qatar" },
  { code: "RU", nameAr: "روسيا", nameEn: "Russia", nameRu: "Россия", nameUk: "Росія", nameDe: "Russland", nameIt: "Russia" },
  { code: "UA", nameAr: "أوكرانيا", nameEn: "Ukraine", nameRu: "Украина", nameUk: "Україна", nameDe: "Ukraine", nameIt: "Ucraina" },
  { code: "DE", nameAr: "ألمانيا", nameEn: "Germany", nameRu: "Германия", nameUk: "Німеччина", nameDe: "Deutschland", nameIt: "Germania" },
  { code: "FR", nameAr: "فرنسا", nameEn: "France", nameRu: "Франция", nameUk: "Франція", nameDe: "Frankreich", nameIt: "Francia" },
  { code: "IT", nameAr: "إيطاليا", nameEn: "Italy", nameRu: "Италия", nameUk: "Італія", nameDe: "Italien", nameIt: "Italia" },
  { code: "GB", nameAr: "المملكة المتحدة", nameEn: "United Kingdom", nameRu: "Великобритания", nameUk: "Велика Британія", nameDe: "Vereinigtes Königreich", nameIt: "Regno Unito" },
  { code: "US", nameAr: "الولايات المتحدة", nameEn: "United States", nameRu: "США", nameUk: "США", nameDe: "USA", nameIt: "Stati Uniti" },
  { code: "OTHER", nameAr: "أخرى", nameEn: "Other", nameRu: "Другое", nameUk: "Інше", nameDe: "Andere", nameIt: "Altro" },
]

const TRANSLATIONS = {
  en: {
    tagline: 'Your dot on the Red Sea',
    title: 'Create Account',
    subtitle: 'Join DREDOTT today',
    firstName: 'First Name', lastName: 'Last Name',
    email: 'Email', country: 'Country',
    password: 'Password', confirm: 'Confirm Password',
    upper: 'Uppercase', lower: 'Lowercase', number: 'Number', length: '8+ characters',
    submit: 'Create Account',
    haveAccount: 'Already have an account?', signIn: 'Sign In',
    terms: 'Terms', privacy: 'Privacy',
    successMsg: 'Account created! Redirecting to homepage...',
    errorMatch: 'Passwords do not match',
    errorWeak: 'Password must contain uppercase, lowercase, number, and be at least 8 characters',
    countryLabel: (c: any) => c.nameEn,
  },
  ar: {
    tagline: 'نقطتك على البحر الأحمر',
    title: 'إنشاء حساب',
    subtitle: 'انضم إلى DREDOTT اليوم',
    firstName: 'الاسم الأول', lastName: 'الاسم الأخير',
    email: 'البريد الإلكتروني', country: 'الدولة',
    password: 'كلمة المرور', confirm: 'تأكيد كلمة المرور',
    upper: 'حرف كبير', lower: 'حرف صغير', number: 'رقم', length: '8 أحرف+',
    submit: 'إنشاء حساب',
    haveAccount: 'لديك حساب بالفعل؟', signIn: 'تسجيل الدخول',
    terms: 'الشروط', privacy: 'الخصوصية',
    successMsg: 'تم إنشاء الحساب! جاري التوجيه للصفحة الرئيسية...',
    errorMatch: 'كلمة المرور غير متطابقة',
    errorWeak: 'كلمة المرور يجب أن تحتوي على حرف كبير، حرف صغير، رقم، و8 أحرف على الأقل',
    countryLabel: (c: any) => c.nameAr,
  },
  ru: {
    tagline: 'Ваша точка на Красном море',
    title: 'Создать аккаунт',
    subtitle: 'Присоединяйтесь к DREDOTT сегодня',
    firstName: 'Имя', lastName: 'Фамилия',
    email: 'Электронная почта', country: 'Страна',
    password: 'Пароль', confirm: 'Подтвердить пароль',
    upper: 'Заглавная', lower: 'Строчная', number: 'Цифра', length: '8+ символов',
    submit: 'Создать аккаунт',
    haveAccount: 'Уже есть аккаунт?', signIn: 'Войти',
    terms: 'Условия', privacy: 'Конфиденциальность',
    successMsg: 'Аккаунт создан! Перенаправление...',
    errorMatch: 'Пароли не совпадают',
    errorWeak: 'Пароль должен содержать заглавную, строчную букву, цифру и не менее 8 символов',
    countryLabel: (c: any) => c.nameRu,
  },
  uk: {
    tagline: 'Ваша точка на Червоному морі',
    title: 'Створити акаунт',
    subtitle: 'Приєднуйтесь до DREDOTT сьогодні',
    firstName: "Ім'я", lastName: 'Прізвище',
    email: 'Електронна пошта', country: 'Країна',
    password: 'Пароль', confirm: 'Підтвердити пароль',
    upper: 'Велика', lower: 'Мала', number: 'Цифра', length: '8+ символів',
    submit: 'Створити акаунт',
    haveAccount: 'Вже є акаунт?', signIn: 'Увійти',
    terms: 'Умови', privacy: 'Конфіденційність',
    successMsg: 'Акаунт створено! Перенаправлення...',
    errorMatch: 'Паролі не збігаються',
    errorWeak: 'Пароль повинен містити велику, малу букву, цифру та не менше 8 символів',
    countryLabel: (c: any) => c.nameUk,
  },
  de: {
    tagline: 'Ihr Punkt am Roten Meer',
    title: 'Konto erstellen',
    subtitle: 'Treten Sie DREDOTT heute bei',
    firstName: 'Vorname', lastName: 'Nachname',
    email: 'E-Mail', country: 'Land',
    password: 'Passwort', confirm: 'Passwort bestätigen',
    upper: 'Großbuchstabe', lower: 'Kleinbuchstabe', number: 'Zahl', length: '8+ Zeichen',
    submit: 'Konto erstellen',
    haveAccount: 'Bereits ein Konto?', signIn: 'Anmelden',
    terms: 'AGB', privacy: 'Datenschutz',
    successMsg: 'Konto erstellt! Weiterleitung...',
    errorMatch: 'Passwörter stimmen nicht überein',
    errorWeak: 'Passwort muss Groß-, Kleinbuchstaben, Zahl und mindestens 8 Zeichen enthalten',
    countryLabel: (c: any) => c.nameDe,
  },
  it: {
    tagline: 'Il tuo punto sul Mar Rosso',
    title: 'Crea account',
    subtitle: 'Unisciti a DREDOTT oggi',
    firstName: 'Nome', lastName: 'Cognome',
    email: 'Email', country: 'Paese',
    password: 'Password', confirm: 'Conferma password',
    upper: 'Maiuscola', lower: 'Minuscola', number: 'Numero', length: '8+ caratteri',
    submit: 'Crea account',
    haveAccount: 'Hai già un account?', signIn: 'Accedi',
    terms: 'Termini', privacy: 'Privacy',
    successMsg: 'Account creato! Reindirizzamento...',
    errorMatch: 'Le password non corrispondono',
    errorWeak: 'La password deve contenere maiuscola, minuscola, numero e almeno 8 caratteri',
    countryLabel: (c: any) => c.nameIt,
  },
}

export default function SignUpPage() {
  const params  = useParams()
  const locale  = params.locale as string
  const router  = useRouter()
  const isAr    = locale === 'ar'
  const tx      = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS.en

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', country: 'EG',
  })
  const [strength, setStrength] = useState({ upper: false, lower: false, number: false, length: false })

  const checkStrength = (p: string) => setStrength({
    upper: /[A-Z]/.test(p), lower: /[a-z]/.test(p),
    number: /[0-9]/.test(p), length: p.length >= 8,
  })

  const isValid = () => Object.values(strength).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.password !== form.confirmPassword) { setError(tx.errorMatch); setLoading(false); return }
    if (!isValid()) { setError(tx.errorWeak); setLoading(false); return }

    const country = countryList.find(c => c.code === form.country)

    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          full_name: `${form.firstName} ${form.lastName}`,
          country: country?.nameEn || 'Other',
          country_code: form.country,
        },
        emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`,
      },
    })

    if (err) { setError(err.message); setLoading(false); return }

    setSuccess(true)
    // ✅ بعد التسجيل يروح للصفحة الرئيسية مباشرة
    setTimeout(() => router.push(`/${locale}`), 2000)
    setLoading(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: '#f9fafb', border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 10, fontSize: 13, color: '#0e1428',
    outline: 'none', fontFamily: 'inherit', transition: 'border 0.2s',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.15em', textTransform: 'uppercase',
    color: '#7a8aaa', marginBottom: 6,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }} dir={isAr ? 'rtl' : 'ltr'}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, letterSpacing: '0.2em', color: '#0e1428' }}>DREDOTT</h1>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#D4A843', marginTop: 4 }}>
              {tx.tagline}
            </p>
          </Link>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>

          <div style={{ background: '#0e1428', padding: '24px 32px' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, color: '#fff', marginBottom: 4 }}>{tx.title}</h2>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{tx.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error   && <div style={{ background: '#fef2f2', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13 }}>{error}</div>}
            {success && <div style={{ background: '#e6f7e6', border: '1px solid rgba(0,128,0,0.2)', borderRadius: 10, padding: '10px 14px', color: '#2e7d32', fontSize: 13 }}>{tx.successMsg}</div>}

            {/* Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={lbl}>{tx.firstName}</label>
                <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required style={inp}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.5)')} onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.1)')} />
              </div>
              <div>
                <label style={lbl}>{tx.lastName}</label>
                <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required style={inp}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.5)')} onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.1)')} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={lbl}>{tx.email}</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inp} placeholder="you@example.com"
                onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.5)')} onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.1)')} />
            </div>

            {/* Country */}
            <div>
              <label style={lbl}>{tx.country}</label>
              <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required style={{ ...inp, cursor: 'pointer' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.5)')} onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.1)')}>
                {countryList.map(c => (
                  <option key={c.code} value={c.code}>{tx.countryLabel(c)}</option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label style={lbl}>{tx.password}</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); checkStrength(e.target.value) }}
                  required style={{ ...inp, paddingRight: isAr ? 14 : 40, paddingLeft: isAr ? 40 : 14 }} placeholder="••••••••"
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.5)')} onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.1)')} />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isAr ? 'left' : 'right']: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {[
                  { ok: strength.upper,  label: tx.upper },
                  { ok: strength.lower,  label: tx.lower },
                  { ok: strength.number, label: tx.number },
                  { ok: strength.length, label: tx.length },
                ].map((s, i) => (
                  <span key={i} style={{ fontSize: 10, color: s.ok ? '#16a34a' : '#9ca3af', fontFamily: "'JetBrains Mono', monospace" }}>
                    {s.ok ? '✓' : '○'} {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label style={lbl}>{tx.confirm}</label>
              <div style={{ position: 'relative' }}>
                <input type={showConf ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required style={{ ...inp, paddingRight: isAr ? 14 : 40, paddingLeft: isAr ? 40 : 14 }} placeholder="••••••••"
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.5)')} onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.1)')} />
                <button type="button" onClick={() => setShowConf(p => !p)} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isAr ? 'left' : 'right']: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                  {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || success} style={{
              padding: '13px', background: '#D4A843', color: '#0e1428', border: 'none', borderRadius: 12,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500,
              letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
              opacity: loading || success ? 0.6 : 1, marginTop: 4, width: '100%',
            }}>
              {loading ? '...' : tx.submit}
            </button>

            <div style={{ textAlign: 'center', paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{tx.haveAccount}</p>
              <Link href={`/${locale}/login`} style={{
                display: 'inline-block', padding: '10px 28px',
                border: '2px solid #2C3A6B', borderRadius: 10,
                color: '#2C3A6B', fontWeight: 600, fontSize: 13,
                textDecoration: 'none',
              }}>
                {tx.signIn} →
              </Link>
            </div>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 20, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
          <Link href={`/${locale}/terms`} style={{ color: '#D4A843', textDecoration: 'none' }}>{tx.terms}</Link>
          {' · '}
          <Link href={`/${locale}/privacy`} style={{ color: '#D4A843', textDecoration: 'none' }}>{tx.privacy}</Link>
        </p>
      </div>
    </div>
  )
}