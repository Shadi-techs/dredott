'use client'

import { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const MESSAGES = {
  en: { loading: 'Confirming your account...', success: 'Account confirmed!', error: 'Confirmation failed', retry: 'Try again', redirecting: 'Redirecting...' },
  ar: { loading: 'جاري تأكيد حسابك...', success: 'تم تأكيد الحساب!', error: 'فشل التأكيد', retry: 'حاول مرة أخرى', redirecting: 'جاري التحويل...' },
  ru: { loading: 'Подтверждение аккаунта...', success: 'Аккаунт подтверждён!', error: 'Ошибка подтверждения', retry: 'Попробовать снова', redirecting: 'Перенаправление...' },
  uk: { loading: 'Підтвердження акаунту...', success: 'Акаунт підтверджено!', error: 'Помилка підтвердження', retry: 'Спробувати знову', redirecting: 'Перенаправлення...' },
  de: { loading: 'Konto wird bestätigt...', success: 'Konto bestätigt!', error: 'Bestätigung fehlgeschlagen', retry: 'Erneut versuchen', redirecting: 'Weiterleitung...' },
  it: { loading: 'Conferma account...', success: 'Account confermato!', error: 'Conferma fallita', retry: 'Riprova', redirecting: 'Reindirizzamento...' },
}

export default function AuthCallbackPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const tx = MESSAGES[locale as keyof typeof MESSAGES] || MESSAGES.en

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const code = searchParams.get('code')
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }

      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        setStatus('error')
        return
      }

      // ✅ جيب الـ role وحول حسبه
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single()

      setStatus('success')

      setTimeout(() => {
        const role = profile?.role
        if (role === 'super_admin' || role === 'admin' || role === 'viewer') {
          router.push(`/${locale}/admin`)
        } else if (role === 'property_owner') {
          router.push(`/${locale}/owner`)
        } else {
          // guest أو أي حاجة تانية → الصفحة الرئيسية
          router.push(`/${locale}`)
        }
      }, 1500)
    }

    handleCallback()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '48px 40px', textAlign: 'center', maxWidth: 400, width: '100%', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>

        {/* Logo */}
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, letterSpacing: '0.2em', color: '#0e1428', marginBottom: 32 }}>
          DREDOTT
        </div>

        {status === 'loading' && (
          <>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(212,168,67,0.2)', borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ fontSize: 14, color: '#6b7280' }}>{tx.loading}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: 56, height: 56, background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#2C3A6B', marginBottom: 8 }}>{tx.success}</h2>
            <p style={{ fontSize: 13, color: '#9ca3af', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>{tx.redirecting}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ width: 56, height: 56, background: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#2C3A6B', marginBottom: 16 }}>{tx.error}</h2>
            <button onClick={() => router.push(`/${locale}/sign-up`)}
              style={{ padding: '10px 24px', background: '#D4A843', color: '#0e1428', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              {tx.retry}
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}