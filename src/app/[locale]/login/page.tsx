'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Eye, EyeOff } from 'lucide-react'

const TRANSLATIONS = {
  en: {
    tagline: 'Your dot on the Red Sea',
    welcome: 'Welcome Back',
    subtitle: 'Sign in to your account',
    email: 'Email',
    password: 'Password',
    forgot: 'Forgot password?',
    signIn: 'Sign In',
    or: 'OR',
    google: 'Continue with Google',
    noAccount: "Don't have an account?",
    createOne: 'Create one',
    terms: 'Terms',
    privacy: 'Privacy',
    success: 'Login successful! Redirecting...',
    errorInvalid: 'Invalid email or password',
    errorConfirm: 'Please confirm your email before logging in',
    resetTitle: 'Reset Password',
    resetSubtitle: 'We will send you a reset link',
    resetEmail: 'Email',
    resetSend: 'Send Reset Link',
    resetBack: 'Back to Login',
    resetSent: 'Reset link sent! Check your email.',
  },
  ar: {
    tagline: 'نقطتك على البحر الأحمر',
    welcome: 'مرحباً بعودتك',
    subtitle: 'سجّل الدخول إلى حسابك',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgot: 'نسيت كلمة المرور؟',
    signIn: 'تسجيل الدخول',
    or: 'أو',
    google: 'الدخول بـ Google',
    noAccount: 'ليس لديك حساب؟',
    createOne: 'إنشاء حساب',
    terms: 'الشروط',
    privacy: 'الخصوصية',
    success: 'تم تسجيل الدخول! جاري التحويل...',
    errorInvalid: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    errorConfirm: 'يرجى تأكيد بريدك الإلكتروني أولاً',
    resetTitle: 'إعادة تعيين كلمة المرور',
    resetSubtitle: 'سنرسل لك رابط إعادة التعيين',
    resetEmail: 'البريد الإلكتروني',
    resetSend: 'إرسال رابط إعادة التعيين',
    resetBack: 'رجوع إلى تسجيل الدخول',
    resetSent: 'تم إرسال رابط إعادة التعيين! تحقق من بريدك.',
  },
  ru: {
    tagline: 'Ваша точка на Красном море',
    welcome: 'С возвращением',
    subtitle: 'Войдите в свой аккаунт',
    email: 'Электронная почта',
    password: 'Пароль',
    forgot: 'Забыли пароль?',
    signIn: 'Войти',
    or: 'ИЛИ',
    google: 'Войти через Google',
    noAccount: 'Нет аккаунта?',
    createOne: 'Создать',
    terms: 'Условия',
    privacy: 'Конфиденциальность',
    success: 'Вход выполнен! Перенаправление...',
    errorInvalid: 'Неверный email или пароль',
    errorConfirm: 'Пожалуйста, подтвердите ваш email',
    resetTitle: 'Сброс пароля',
    resetSubtitle: 'Мы отправим вам ссылку для сброса',
    resetEmail: 'Электронная почта',
    resetSend: 'Отправить ссылку',
    resetBack: 'Назад',
    resetSent: 'Ссылка отправлена! Проверьте почту.',
  },
  uk: {
    tagline: 'Ваша точка на Червоному морі',
    welcome: 'З поверненням',
    subtitle: 'Увійдіть до свого облікового запису',
    email: 'Електронна пошта',
    password: 'Пароль',
    forgot: 'Забули пароль?',
    signIn: 'Увійти',
    or: 'АБО',
    google: 'Увійти через Google',
    noAccount: 'Немає акаунту?',
    createOne: 'Створити',
    terms: 'Умови',
    privacy: 'Конфіденційність',
    success: 'Вхід виконано! Перенаправлення...',
    errorInvalid: 'Невірний email або пароль',
    errorConfirm: 'Будь ласка, підтвердіть ваш email',
    resetTitle: 'Скидання пароля',
    resetSubtitle: 'Ми надішлемо вам посилання',
    resetEmail: 'Електронна пошта',
    resetSend: 'Надіслати посилання',
    resetBack: 'Назад',
    resetSent: 'Посилання надіслано! Перевірте пошту.',
  },
  de: {
    tagline: 'Ihr Punkt am Roten Meer',
    welcome: 'Willkommen zurück',
    subtitle: 'Melden Sie sich an',
    email: 'E-Mail',
    password: 'Passwort',
    forgot: 'Passwort vergessen?',
    signIn: 'Anmelden',
    or: 'ODER',
    google: 'Mit Google anmelden',
    noAccount: 'Kein Konto?',
    createOne: 'Erstellen',
    terms: 'AGB',
    privacy: 'Datenschutz',
    success: 'Anmeldung erfolgreich! Weiterleitung...',
    errorInvalid: 'Ungültige E-Mail oder Passwort',
    errorConfirm: 'Bitte bestätigen Sie Ihre E-Mail',
    resetTitle: 'Passwort zurücksetzen',
    resetSubtitle: 'Wir senden Ihnen einen Link',
    resetEmail: 'E-Mail',
    resetSend: 'Link senden',
    resetBack: 'Zurück',
    resetSent: 'Link gesendet! Überprüfen Sie Ihre E-Mail.',
  },
  it: {
    tagline: 'Il tuo punto sul Mar Rosso',
    welcome: 'Bentornato',
    subtitle: 'Accedi al tuo account',
    email: 'Email',
    password: 'Password',
    forgot: 'Password dimenticata?',
    signIn: 'Accedi',
    or: 'OPPURE',
    google: 'Continua con Google',
    noAccount: 'Non hai un account?',
    createOne: 'Creane uno',
    terms: 'Termini',
    privacy: 'Privacy',
    success: 'Accesso effettuato! Reindirizzamento...',
    errorInvalid: 'Email o password non validi',
    errorConfirm: 'Conferma prima la tua email',
    resetTitle: 'Reimposta password',
    resetSubtitle: 'Ti invieremo un link',
    resetEmail: 'Email',
    resetSend: 'Invia link',
    resetBack: 'Torna al login',
    resetSent: 'Link inviato! Controlla la tua email.',
  },
}

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = React.use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAr = locale === 'ar'
  const tx = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS.en

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [success,    setSuccess]    = useState(false)
  const [showReset,  setShowReset]  = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent,  setResetSent]  = useState(false)
  const [showPass,   setShowPass]   = useState(false)

  // ✅ redirect حسب الـ role
  const redirectByRole = (role: string, userId: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
      case 'viewer':
        router.push(`/${locale}/admin`)
        break
      case 'property_owner':
        router.push(`/${locale}/owner`)
        break
      case 'service_provider':
        router.push(`/${locale}/provider`)
        break
      default:
        router.push(searchParams.get('redirect') || `/${locale}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const email    = fd.get('email') as string
    const password = fd.get('password') as string

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError(err.message.includes('Email not confirmed')
        ? tx.errorConfirm
        : tx.errorInvalid
      )
      setLoading(false)
      return
    }

    if (!data.user?.email_confirmed_at) {
      setError(tx.errorConfirm)
      setLoading(false)
      return
    }

    // جيب الـ role من الـ profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    setSuccess(true)
    setTimeout(() => {
      const redirectTo = searchParams.get('redirect')
      if (redirectTo) {
       router.push(redirectTo)
      } else {
        redirectByRole(profile?.role || 'guest', data.user.id)
      }
    }, 1000)
    setLoading(false)
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    })

    if (error) { setError(error.message) }
    else {
      setResetSent(true)
      setTimeout(() => { setShowReset(false); setResetSent(false); setResetEmail('') }, 3000)
    }
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
  const btn: React.CSSProperties = {
    padding: '13px', background: '#D4A843', color: '#0e1428',
    border: 'none', borderRadius: 12,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, fontWeight: 500, letterSpacing: '0.15em',
    textTransform: 'uppercase', cursor: 'pointer',
    opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s',
    width: '100%',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }} dir={isAr ? 'rtl' : 'ltr'}>
      <div style={{ width: '100%', maxWidth: 440 }}>

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

          {/* Header */}
          <div style={{ background: '#0e1428', padding: '24px 32px' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, color: '#fff', marginBottom: 4 }}>
              {showReset ? tx.resetTitle : tx.welcome}
            </h2>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
              {showReset ? tx.resetSubtitle : tx.subtitle}
            </p>
          </div>

          {/* Reset Form */}
          {showReset ? (
            <form onSubmit={handleReset} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error      && <div style={{ background: '#fef2f2', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13 }}>{error}</div>}
              {resetSent  && <div style={{ background: '#e6f7e6', border: '1px solid rgba(0,128,0,0.2)', borderRadius: 10, padding: '10px 14px', color: '#2e7d32', fontSize: 13 }}>{tx.resetSent}</div>}
              <div>
                <label style={lbl}>{tx.resetEmail}</label>
                <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required style={inp} placeholder="you@example.com"
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.1)')} />
              </div>
              <button type="submit" disabled={loading} style={btn}>{loading ? '...' : tx.resetSend}</button>
              <button type="button" onClick={() => setShowReset(false)} style={{ ...btn, background: 'transparent', color: '#7a8aaa', border: '1px solid rgba(0,0,0,0.1)' }}>{tx.resetBack}</button>
            </form>

          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {success && <div style={{ background: '#e6f7e6', border: '1px solid rgba(0,128,0,0.2)', borderRadius: 10, padding: '10px 14px', color: '#2e7d32', fontSize: 13 }}>{tx.success}</div>}
              {error   && <div style={{ background: '#fef2f2', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13 }}>{error}</div>}

              <div>
                <label style={lbl}>{tx.email}</label>
                <input name="email" type="email" required style={inp} placeholder="you@example.com"
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.1)')} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ ...lbl, marginBottom: 0 }}>{tx.password}</label>
                  <button type="button" onClick={() => setShowReset(true)} style={{ fontSize: 11, color: '#D4A843', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>
                    {tx.forgot}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input name="password" type={showPass ? 'text' : 'password'} required style={{ ...inp, paddingRight: isAr ? 14 : 40, paddingLeft: isAr ? 40 : 14 }} placeholder="••••••••"
                    onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.1)')} />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{
                    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                    [isAr ? 'left' : 'right']: 12,
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex',
                  }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={btn}>{loading ? '...' : tx.signIn}</button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.07)' }} />
                <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: "'JetBrains Mono', monospace" }}>{tx.or}</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.07)' }} />
              </div>

              <button type="button" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/${locale}/auth/callback` } })}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px', background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, fontSize: 13, color: '#374151', cursor: 'pointer', width: '100%' }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {tx.google}
              </button>

              {/* Sign up link — واضح وكبير */}
              <div style={{ textAlign: 'center', padding: '12px 0 4px', borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: 4 }}>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{tx.noAccount}</p>
                <Link href={`/${locale}/sign-up`} style={{
                  display: 'inline-block', padding: '10px 28px',
                  border: '2px solid #2C3A6B', borderRadius: 10,
                  color: '#2C3A6B', fontWeight: 600, fontSize: 13,
                  textDecoration: 'none', transition: 'all 0.2s',
                }}>
                  {tx.createOne} →
                </Link>
              </div>
            </form>
          )}
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