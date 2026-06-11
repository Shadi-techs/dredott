'use client'

import { use, useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Mail, Lock, Eye, EyeOff, User, Phone,
  Upload, Camera, Loader2, Check, ArrowRight, ArrowLeft,
} from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TX = {
  en: {
    brand: 'DREDOTT',
    tagline: 'Your dot on the Red Sea',
    headline: 'Create Account',
    subGate: 'Register to unlock this property',
    subDefault: 'Join thousands of guests on the Red Sea',
    step1: 'Account',
    step2: 'Profile',
    step3: 'Photo',
    email: 'Email address',
    emailPh: 'you@example.com',
    password: 'Password',
    passwordPh: 'Minimum 6 characters',
    confirm: 'Confirm password',
    confirmPh: 'Re-enter your password',
    firstName: 'First name',
    lastName: 'Last name',
    phone: 'Phone number',
    phonePh: '+20 100 000 0000',
    nationality: 'Nationality',
    nationalityPh: 'Select your country',
    photoTitle: 'Profile photo',
    photoSub: 'Optional — helps owners recognise you',
    photoClick: 'Upload photo',
    marketing: 'I agree to receive emails about offers and new properties',
    continueBtn: 'Continue',
    back: 'Back',
    createBtn: 'Create account',
    creating: 'Creating…',
    or: 'or',
    googleBtn: 'Continue with Google',
    alreadyAccount: 'Already have an account?',
    login: 'Sign in',
    errMinPw: 'Password must be at least 6 characters',
    errPwMatch: 'Passwords do not match',
    errName: 'Please enter your full name',
    errPhone: 'Please enter your phone number',
    errGeneral: 'Registration failed. Please try again.',
    registrationClosed: 'Registration Closed',
    registrationClosedSub: 'New registrations are temporarily disabled. Contact us on WhatsApp.',
    whatsapp: 'WhatsApp Us',
    backHome: '← Back to home',
  },
  ar: {
    brand: 'DREDOTT',
    tagline: 'نقطتك على البحر الأحمر',
    headline: 'إنشاء حساب',
    subGate: 'سجّل للوصول إلى هذا العقار',
    subDefault: 'انضم لآلاف الضيوف على البحر الأحمر',
    step1: 'الحساب',
    step2: 'البيانات',
    step3: 'الصورة',
    email: 'البريد الإلكتروني',
    emailPh: 'example@email.com',
    password: 'كلمة المرور',
    passwordPh: '٦ أحرف على الأقل',
    confirm: 'تأكيد كلمة المرور',
    confirmPh: 'أعد إدخال كلمة المرور',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    phone: 'رقم الهاتف',
    phonePh: '+20 100 000 0000',
    nationality: 'الجنسية',
    nationalityPh: 'اختر دولتك',
    photoTitle: 'صورة الملف الشخصي',
    photoSub: 'اختياري — تساعد أصحاب العقارات على التعرف عليك',
    photoClick: 'رفع صورة',
    marketing: 'أوافق على تلقّي رسائل بريدية عن العروض والعقارات الجديدة',
    continueBtn: 'التالي',
    back: 'رجوع',
    createBtn: 'إنشاء حساب',
    creating: '…جاري الإنشاء',
    or: 'أو',
    googleBtn: 'المتابعة بـ Google',
    alreadyAccount: 'لديك حساب بالفعل؟',
    login: 'تسجيل الدخول',
    errMinPw: 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل',
    errPwMatch: 'كلمتا المرور غير متطابقتين',
    errName: 'أدخل اسمك الكامل',
    errPhone: 'أدخل رقم هاتفك',
    errGeneral: 'فشل التسجيل. يرجى المحاولة مرة أخرى.',
    registrationClosed: 'التسجيل مغلق',
    registrationClosedSub: 'التسجيل معطّل مؤقتاً. تواصل معنا عبر واتساب.',
    whatsapp: 'واتساب',
    backHome: 'العودة للرئيسية ←',
  },
  ru: {
    brand: 'DREDOTT',
    tagline: 'Ваша точка на Красном море',
    headline: 'Создать аккаунт',
    subGate: 'Зарегистрируйтесь для доступа',
    subDefault: 'Присоединяйтесь к тысячам гостей Красного моря',
    step1: 'Аккаунт',
    step2: 'Профиль',
    step3: 'Фото',
    email: 'Электронная почта',
    emailPh: 'you@example.com',
    password: 'Пароль',
    passwordPh: 'Минимум 6 символов',
    confirm: 'Подтвердите пароль',
    confirmPh: 'Повторите пароль',
    firstName: 'Имя',
    lastName: 'Фамилия',
    phone: 'Номер телефона',
    phonePh: '+7 000 000 0000',
    nationality: 'Национальность',
    nationalityPh: 'Выберите страну',
    photoTitle: 'Фото профиля',
    photoSub: 'Необязательно — помогает хозяевам вас узнать',
    photoClick: 'Загрузить фото',
    marketing: 'Согласен получать письма об акциях и новых объектах',
    continueBtn: 'Продолжить',
    back: 'Назад',
    createBtn: 'Создать аккаунт',
    creating: 'Создание…',
    or: 'или',
    googleBtn: 'Войти через Google',
    alreadyAccount: 'Уже есть аккаунт?',
    login: 'Войти',
    errMinPw: 'Пароль должен содержать не менее 6 символов',
    errPwMatch: 'Пароли не совпадают',
    errName: 'Введите ваше полное имя',
    errPhone: 'Введите ваш номер телефона',
    errGeneral: 'Ошибка регистрации. Попробуйте снова.',
    registrationClosed: 'Регистрация закрыта',
    registrationClosedSub: 'Регистрация временно отключена. Свяжитесь с нами в WhatsApp.',
    whatsapp: 'WhatsApp',
    backHome: '← На главную',
  },
  uk: {
    brand: 'DREDOTT',
    tagline: 'Ваша точка на Червоному морі',
    headline: 'Створити акаунт',
    subGate: 'Зареєструйтесь для доступу',
    subDefault: 'Приєднуйтесь до тисяч гостей Червоного моря',
    step1: 'Акаунт',
    step2: 'Профіль',
    step3: 'Фото',
    email: 'Електронна пошта',
    emailPh: 'you@example.com',
    password: 'Пароль',
    passwordPh: 'Мінімум 6 символів',
    confirm: 'Підтвердіть пароль',
    confirmPh: 'Повторіть пароль',
    firstName: 'Ім\'я',
    lastName: 'Прізвище',
    phone: 'Номер телефону',
    phonePh: '+380 00 000 0000',
    nationality: 'Національність',
    nationalityPh: 'Оберіть країну',
    photoTitle: 'Фото профілю',
    photoSub: 'Необов\'язково — допомагає господарям вас впізнати',
    photoClick: 'Завантажити фото',
    marketing: 'Погоджуюсь отримувати листи про акції та нові об\'єкти',
    continueBtn: 'Продовжити',
    back: 'Назад',
    createBtn: 'Створити акаунт',
    creating: 'Створення…',
    or: 'або',
    googleBtn: 'Увійти через Google',
    alreadyAccount: 'Вже маєте акаунт?',
    login: 'Увійти',
    errMinPw: 'Пароль має містити щонайменше 6 символів',
    errPwMatch: 'Паролі не збігаються',
    errName: 'Введіть ваше повне ім\'я',
    errPhone: 'Введіть ваш номер телефону',
    errGeneral: 'Помилка реєстрації. Спробуйте ще раз.',
    registrationClosed: 'Реєстрацію закрито',
    registrationClosedSub: 'Реєстрація тимчасово вимкнена. Зв\'яжіться з нами у WhatsApp.',
    whatsapp: 'WhatsApp',
    backHome: '← На головну',
  },
  de: {
    brand: 'DREDOTT',
    tagline: 'Ihr Punkt am Roten Meer',
    headline: 'Konto erstellen',
    subGate: 'Registrieren Sie sich für Zugang',
    subDefault: 'Schließen Sie sich tausenden Gästen am Roten Meer an',
    step1: 'Konto',
    step2: 'Profil',
    step3: 'Foto',
    email: 'E-Mail-Adresse',
    emailPh: 'you@example.com',
    password: 'Passwort',
    passwordPh: 'Mindestens 6 Zeichen',
    confirm: 'Passwort bestätigen',
    confirmPh: 'Passwort wiederholen',
    firstName: 'Vorname',
    lastName: 'Nachname',
    phone: 'Telefonnummer',
    phonePh: '+49 000 0000 0000',
    nationality: 'Nationalität',
    nationalityPh: 'Land auswählen',
    photoTitle: 'Profilfoto',
    photoSub: 'Optional — hilft Gastgebern, Sie zu erkennen',
    photoClick: 'Foto hochladen',
    marketing: 'Ich stimme zu, E-Mails über Angebote und neue Objekte zu erhalten',
    continueBtn: 'Weiter',
    back: 'Zurück',
    createBtn: 'Konto erstellen',
    creating: 'Wird erstellt…',
    or: 'oder',
    googleBtn: 'Mit Google fortfahren',
    alreadyAccount: 'Haben Sie bereits ein Konto?',
    login: 'Anmelden',
    errMinPw: 'Das Passwort muss mindestens 6 Zeichen haben',
    errPwMatch: 'Passwörter stimmen nicht überein',
    errName: 'Bitte geben Sie Ihren vollständigen Namen ein',
    errPhone: 'Bitte geben Sie Ihre Telefonnummer ein',
    errGeneral: 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    registrationClosed: 'Registrierung geschlossen',
    registrationClosedSub: 'Neue Registrierungen sind vorübergehend deaktiviert. Kontaktieren Sie uns auf WhatsApp.',
    whatsapp: 'WhatsApp',
    backHome: '← Zurück zur Startseite',
  },
  it: {
    brand: 'DREDOTT',
    tagline: 'Il tuo punto sul Mar Rosso',
    headline: 'Crea account',
    subGate: 'Registrati per accedere a questa proprietà',
    subDefault: 'Unisciti a migliaia di ospiti sul Mar Rosso',
    step1: 'Account',
    step2: 'Profilo',
    step3: 'Foto',
    email: 'Indirizzo email',
    emailPh: 'you@example.com',
    password: 'Password',
    passwordPh: 'Minimo 6 caratteri',
    confirm: 'Conferma password',
    confirmPh: 'Reinserisci la password',
    firstName: 'Nome',
    lastName: 'Cognome',
    phone: 'Numero di telefono',
    phonePh: '+39 000 000 0000',
    nationality: 'Nazionalità',
    nationalityPh: 'Seleziona paese',
    photoTitle: 'Foto profilo',
    photoSub: 'Facoltativo — aiuta i proprietari a riconoscerti',
    photoClick: 'Carica foto',
    marketing: 'Accetto di ricevere email su offerte e nuove proprietà',
    continueBtn: 'Continua',
    back: 'Indietro',
    createBtn: 'Crea account',
    creating: 'Creazione…',
    or: 'oppure',
    googleBtn: 'Continua con Google',
    alreadyAccount: 'Hai già un account?',
    login: 'Accedi',
    errMinPw: 'La password deve avere almeno 6 caratteri',
    errPwMatch: 'Le password non corrispondono',
    errName: 'Inserisci il tuo nome completo',
    errPhone: 'Inserisci il tuo numero di telefono',
    errGeneral: 'Registrazione fallita. Riprova.',
    registrationClosed: 'Registrazione chiusa',
    registrationClosedSub: 'Le nuove registrazioni sono temporaneamente disabilitate. Contattaci su WhatsApp.',
    whatsapp: 'WhatsApp',
    backHome: '← Torna alla home',
  },
}

const NATIONALITIES = [
  { code: 'EG', flag: '🇪🇬', en: 'Egypt',          ar: 'مصر',       ru: 'Египет',   uk: 'Єгипет',   de: 'Ägypten',        it: 'Egitto' },
  { code: 'RU', flag: '🇷🇺', en: 'Russia',         ar: 'روسيا',     ru: 'Россия',   uk: 'Росія',    de: 'Russland',       it: 'Russia' },
  { code: 'UA', flag: '🇺🇦', en: 'Ukraine',        ar: 'أوكرانيا',  ru: 'Украина',  uk: 'Україна',  de: 'Ukraine',        it: 'Ucraina' },
  { code: 'DE', flag: '🇩🇪', en: 'Germany',        ar: 'ألمانيا',   ru: 'Германия', uk: 'Німеччина', de: 'Deutschland',   it: 'Germania' },
  { code: 'IT', flag: '🇮🇹', en: 'Italy',          ar: 'إيطاليا',   ru: 'Италия',   uk: 'Італія',   de: 'Italien',        it: 'Italia' },
  { code: 'GB', flag: '🇬🇧', en: 'United Kingdom', ar: 'المملكة المتحدة', ru: 'Великобритания', uk: 'Великобританія', de: 'Vereinigtes Königreich', it: 'Regno Unito' },
  { code: 'US', flag: '🇺🇸', en: 'United States',  ar: 'الولايات المتحدة', ru: 'США',  uk: 'США',      de: 'USA',            it: 'Stati Uniti' },
  { code: 'FR', flag: '🇫🇷', en: 'France',         ar: 'فرنسا',     ru: 'Франция',  uk: 'Франція',  de: 'Frankreich',     it: 'Francia' },
  { code: 'PL', flag: '🇵🇱', en: 'Poland',         ar: 'بولندا',    ru: 'Польша',   uk: 'Польща',   de: 'Polen',          it: 'Polonia' },
  { code: 'other', flag: '🌍', en: 'Other', ar: 'أخرى', ru: 'Другое', uk: 'Інше', de: 'Andere', it: 'Altro' },
]

export default function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const tx = TX[locale as keyof typeof TX] || TX.en
  const isRTL = locale === 'ar'

  const redirectTo = searchParams.get('redirect') || `/${locale}/properties`
  const propertyId = searchParams.get('property')
  const reason = searchParams.get('reason')

  const [step,              setStep]             = useState(1)
  const [email,             setEmail]            = useState('')
  const [password,          setPassword]         = useState('')
  const [confirmPassword,   setConfirmPassword]  = useState('')
  const [showPassword,      setShowPassword]     = useState(false)
  const [firstName,         setFirstName]        = useState('')
  const [lastName,          setLastName]         = useState('')
  const [phone,             setPhone]            = useState('')
  const [nationality,       setNationality]      = useState('')
  const [profilePhoto,      setProfilePhoto]     = useState<File | null>(null)
  const [photoPreview,      setPhotoPreview]     = useState('')
  const [marketingConsent,  setMarketingConsent] = useState(false)
  const [loading,           setLoading]          = useState(false)
  const [error,             setError]            = useState('')

  const fileRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProfilePhoto(file)
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const step1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError(tx.errMinPw); return }
    if (password !== confirmPassword) { setError(tx.errPwMatch); return }
    setStep(2)
  }

  const step2 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!firstName.trim() || !lastName.trim()) { setError(tx.errName); return }
    if (!phone.trim()) { setError(tx.errPhone); return }
    setStep(3)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName, phone, nationality } },
      })
      if (signUpError) throw signUpError
      if (!authData.user) throw new Error(tx.errGeneral)

      let photoUrl: string | null = null
      if (profilePhoto) {
        const ext = profilePhoto.name.split('.').pop()
        const name = `${authData.user.id}-${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage.from('profile-photos').upload(name, profilePhoto)
        if (!uploadErr) {
          photoUrl = supabase.storage.from('profile-photos').getPublicUrl(name).data.publicUrl
        }
      }

      await supabase.from('profiles').update({
        first_name: firstName, last_name: lastName, phone, nationality,
        avatar_url: photoUrl,
        registration_source: propertyId ? 'price_gate' : 'direct',
        marketing_consent: marketingConsent,
        registered_at: new Date().toISOString(),
      }).eq('id', authData.user.id)

      if (propertyId && reason) {
        await supabase.from('property_inquiries').insert({
          property_id: propertyId, user_id: authData.user.id,
          inquiry_type: reason === 'price' ? 'price_view' : 'contact_click',
        })
      }

      fetch('/api/admin/notifications/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_user', category: 'user',
          title: 'New user registered',
          body: `${firstName} ${lastName} just registered on DREDOTT`,
          link: '/admin/owners', priority: 'normal',
        }),
      }).catch(() => {})

      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      setError(err.message || tx.errGeneral)
    } finally {
      setLoading(false)
    }
  }

  const googleSignup = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}` },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  // ── Styles ────────────────────────────────────────────────────
  const dir = isRTL ? 'rtl' : 'ltr'

  const inpStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', paddingLeft: isRTL ? 16 : 44, paddingRight: isRTL ? 44 : 16,
    background: '#FAF9F6', border: '1.5px solid transparent', borderRadius: 12,
    color: '#1a2240', fontSize: 15, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s, background 0.2s',
    direction: 'ltr',
  }

  const inpNoIcon: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: '#FAF9F6', border: '1.5px solid transparent', borderRadius: 12,
    color: '#1a2240', fontSize: 15, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s, background 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600, color: '#2C3A6B',
    marginBottom: 6, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em',
    textTransform: 'uppercase',
  }

  const btnPrimary: React.CSSProperties = {
    width: '100%', padding: '13px 20px', background: '#2C3A6B',
    border: 'none', borderRadius: 12, color: '#D4A843', fontSize: 15,
    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8, transition: 'background 0.2s',
  }

  const btnSecondary: React.CSSProperties = {
    flex: 1, padding: '12px 20px', background: '#F0F2F7',
    border: '1.5px solid #e5e7eb', borderRadius: 12, color: '#6B7280',
    fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  }

  const STEPS = [tx.step1, tx.step2, tx.step3]

  return (
    <div dir={dir} style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href={`/${locale}`} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: '#2C3A6B', textDecoration: 'none', letterSpacing: '0.05em' }}>
          {tx.brand}
        </Link>
        <Link href={`/${locale}/login${propertyId ? `?property=${propertyId}&reason=${reason}&redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>
          {tx.alreadyAccount} <span style={{ color: '#2A9D8F', fontWeight: 600 }}>{tx.login}</span>
        </Link>
      </div>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px 40px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            {reason === 'price' && (
              <div style={{ display: 'inline-block', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.25em', color: '#B8860B', background: '#FBF0D0', padding: '6px 14px', borderRadius: 20, marginBottom: 14 }}>
                🔒 {tx.subGate.toUpperCase()}
              </div>
            )}
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, color: '#2C3A6B', margin: '0 0 8px', fontWeight: 400, lineHeight: 1.1 }}>
              {tx.headline}
            </h1>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
              {reason ? tx.subGate : tx.subDefault}
            </p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, gap: 0 }}>
            {STEPS.map((label, i) => {
              const num = i + 1
              const done = step > num
              const active = step === num
              return (
                <div key={num} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                      background: done ? '#2A9D8F' : active ? '#2C3A6B' : '#e5e7eb',
                      color: done ? '#fff' : active ? '#D4A843' : '#9CA3AF',
                      boxShadow: active ? '0 0 0 4px rgba(44,58,107,0.12)' : 'none',
                      transition: 'all 0.3s',
                    }}>
                      {done ? <Check size={15} /> : num}
                    </div>
                    <span style={{ fontSize: 10, color: active ? '#2C3A6B' : '#9CA3AF', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', fontWeight: active ? 700 : 400 }}>
                      {label}
                    </span>
                  </div>
                  {num < 3 && (
                    <div style={{ width: 48, height: 2, background: step > num ? '#2A9D8F' : '#e5e7eb', margin: '0 4px 20px', transition: 'background 0.3s' }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Card */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(26,34,64,0.08)', padding: '28px 28px', boxShadow: '0 4px 24px rgba(44,58,107,0.06)' }}>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: 18, padding: '12px 16px', background: '#FFF0F0', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#dc2626', fontSize: 14 }}>
                {error}
              </div>
            )}

            {/* ── Step 1: Email + Password ── */}
            {step === 1 && (
              <form onSubmit={step1}>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>{tx.email}</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: isRTL ? 'auto' : 14, right: isRTL ? 14 : 'auto', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder={tx.emailPh} style={inpStyle} autoComplete="email"
                      onFocus={e => e.target.style.borderColor = '#D4A843'}
                      onBlur={e => e.target.style.borderColor = 'transparent'} />
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>{tx.password}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: isRTL ? 'auto' : 14, right: isRTL ? 14 : 'auto', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                    <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                      placeholder={tx.passwordPh} style={{ ...inpStyle, paddingRight: isRTL ? 44 : 44 }}
                      autoComplete="new-password"
                      onFocus={e => e.target.style.borderColor = '#D4A843'}
                      onBlur={e => e.target.style.borderColor = 'transparent'} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: isRTL ? 'auto' : 14, left: isRTL ? 14 : 'auto', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Strength hint */}
                  {password.length > 0 && (
                    <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                      {[1,2,3,4].map(n => (
                        <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: password.length >= n*2 ? (password.length >= 8 ? '#2A9D8F' : '#D4A843') : '#e5e7eb', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label style={labelStyle}>{tx.confirm}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: isRTL ? 'auto' : 14, right: isRTL ? 14 : 'auto', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                    <input type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder={tx.confirmPh} style={{ ...inpStyle, borderColor: confirmPassword && confirmPassword !== password ? 'rgba(239,68,68,0.5)' : 'transparent' }}
                      autoComplete="new-password"
                      onFocus={e => e.target.style.borderColor = '#D4A843'}
                      onBlur={e => e.target.style.borderColor = (confirmPassword && confirmPassword !== password) ? 'rgba(239,68,68,0.5)' : 'transparent'} />
                    {confirmPassword && confirmPassword === password && (
                      <Check size={14} color="#2A9D8F" style={{ position: 'absolute', right: isRTL ? 'auto' : 14, left: isRTL ? 14 : 'auto', top: '50%', transform: 'translateY(-50%)' }} />
                    )}
                  </div>
                </div>

                <button type="submit" style={btnPrimary}>
                  {tx.continueBtn} {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </button>

                <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                  <span style={{ fontSize: 13, color: '#9CA3AF', fontFamily: "'JetBrains Mono', monospace" }}>{tx.or}</span>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                </div>

                <button type="button" onClick={googleSignup} disabled={loading}
                  style={{ width: '100%', padding: '12px 20px', background: '#fff', border: '2px solid #e5e7eb', borderRadius: 12, color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#D4A843')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {tx.googleBtn}
                </button>
              </form>
            )}

            {/* ── Step 2: Personal Info ── */}
            {step === 2 && (
              <form onSubmit={step2}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                  <div>
                    <label style={labelStyle}>{tx.firstName}</label>
                    <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                      style={inpNoIcon} autoComplete="given-name"
                      onFocus={e => e.target.style.borderColor = '#D4A843'}
                      onBlur={e => e.target.style.borderColor = 'transparent'} />
                  </div>
                  <div>
                    <label style={labelStyle}>{tx.lastName}</label>
                    <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                      style={inpNoIcon} autoComplete="family-name"
                      onFocus={e => e.target.style.borderColor = '#D4A843'}
                      onBlur={e => e.target.style.borderColor = 'transparent'} />
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>{tx.phone}</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: isRTL ? 'auto' : 14, right: isRTL ? 14 : 'auto', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder={tx.phonePh} style={{ ...inpStyle, direction: 'ltr', textAlign: 'left' }} autoComplete="tel"
                      onFocus={e => e.target.style.borderColor = '#D4A843'}
                      onBlur={e => e.target.style.borderColor = 'transparent'} />
                  </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label style={labelStyle}>{tx.nationality}</label>
                  <select value={nationality} onChange={e => setNationality(e.target.value)}
                    style={{ ...inpNoIcon, appearance: 'none', cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = '#D4A843'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}>
                    <option value="">{tx.nationalityPh}</option>
                    {NATIONALITIES.map(n => (
                      <option key={n.code} value={n.code}>
                        {n.flag} {n[locale as keyof typeof n] || n.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setStep(1)} style={btnSecondary}>
                    {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {tx.back}
                  </button>
                  <button type="submit" style={{ ...btnPrimary, flex: 2 }}>
                    {tx.continueBtn} {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 3: Photo + Finish ── */}
            {step === 3 && (
              <form onSubmit={submit}>
                <div style={{ textAlign: 'center', marginBottom: 22 }}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 12 }}>
                    {tx.photoTitle}
                  </p>
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
                    {photoPreview
                      ? <img src={photoPreview} alt="" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid #D4A843', display: 'block' }} />
                      : <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #FBF0D0 0%, #D4A843 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Camera size={32} color="#8B6914" />
                        </div>
                    }
                    <button type="button" onClick={() => fileRef.current?.click()}
                      style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#2C3A6B', border: '2px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={12} color="#D4A843" />
                    </button>
                    <input type="file" ref={fileRef} accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  </div>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>{tx.photoSub}</p>
                </div>

                <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', padding: '12px 14px', background: '#FAF9F6', borderRadius: 12, marginBottom: 22 }}>
                  <input type="checkbox" checked={marketingConsent} onChange={e => setMarketingConsent(e.target.checked)}
                    style={{ marginTop: 2, accentColor: '#2A9D8F', width: 16, height: 16, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{tx.marketing}</span>
                </label>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setStep(2)} disabled={loading} style={btnSecondary}>
                    {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {tx.back}
                  </button>
                  <button type="submit" disabled={loading} style={{ ...btnPrimary, flex: 2 }}>
                    {loading
                      ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />{tx.creating}</>
                      : <>{tx.createBtn} {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</>
                    }
                  </button>
                </div>
              </form>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>
              {tx.alreadyAccount}{' '}
              <Link href={`/${locale}/login${propertyId ? `?property=${propertyId}&reason=${reason}&redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                style={{ color: '#2A9D8F', fontWeight: 600, textDecoration: 'none' }}>
                {tx.login}
              </Link>
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input:focus, select:focus { border-color: #D4A843 !important; background: #fff !important; }
      `}</style>
    </div>
  )
}
