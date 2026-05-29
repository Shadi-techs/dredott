'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function ResetPasswordPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasMinLength: false,
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const t = (en: string, ar: string) => (locale === 'ar' ? ar : en);

  const checkPasswordStrength = (pwd: string) => {
    setPasswordStrength({
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasMinLength: pwd.length >= 8,
    });
  };

  const isPasswordValid = () => {
    return (
      passwordStrength.hasUpper &&
      passwordStrength.hasLower &&
      passwordStrength.hasNumber &&
      passwordStrength.hasMinLength
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError(t('Passwords do not match', 'كلمة المرور غير متطابقة'));
      setLoading(false);
      return;
    }

    if (!isPasswordValid()) {
      setError(
        t(
          'Password must contain uppercase, lowercase, number, and be at least 8 characters',
          'كلمة المرور يجب أن تحتوي على حرف كبير، حرف صغير، رقم، و8 أحرف على الأقل'
        )
      );
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAF9F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 36,
                fontWeight: 300,
                letterSpacing: '0.2em',
                color: '#0e1428',
              }}
            >
              DREDOTT
            </h1>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#D4A843',
                marginTop: 4,
              }}
            >
              {t('Your dot on the Red Sea', 'نقطتك على البحر الأحمر')}
            </p>
          </Link>
        </div>

        {/* Reset Password Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            border: '1px solid rgba(0,0,0,0.06)',
            overflow: 'hidden',
            boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              background: '#0e1428',
              padding: '24px 32px',
            }}
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 24,
                fontWeight: 400,
                color: '#fff',
                marginBottom: 4,
              }}
            >
              {t('Reset Password', 'إعادة تعيين كلمة المرور')}
            </h2>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              {t('Enter your new password', 'أدخل كلمة المرور الجديدة')}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#ef4444',
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  background: '#e6f7e6',
                  border: '1px solid rgba(0,128,0,0.2)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#2e7d32',
                  fontSize: 13,
                }}
              >
                {t('Password updated! Redirecting to login...', 'تم تحديث كلمة المرور! جاري التحويل إلى تسجيل الدخول...')}
              </div>
            )}

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#7a8aaa',
                  marginBottom: 6,
                }}
              >
                {t('New Password', 'كلمة المرور الجديدة')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  checkPasswordStrength(e.target.value);
                }}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: '#f9fafb',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 10,
                  fontSize: 13,
                  color: '#0e1428',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(212,168,67,0.5)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.1)')}
                placeholder="••••••••"
              />
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 10,
                      color: passwordStrength.hasUpper ? '#2e7d32' : '#9ca3af',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {passwordStrength.hasUpper ? '✓' : '○'} {t('Uppercase', 'حرف كبير')}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: passwordStrength.hasLower ? '#2e7d32' : '#9ca3af',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {passwordStrength.hasLower ? '✓' : '○'} {t('Lowercase', 'حرف صغير')}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: passwordStrength.hasNumber ? '#2e7d32' : '#9ca3af',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {passwordStrength.hasNumber ? '✓' : '○'} {t('Number', 'رقم')}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: passwordStrength.hasMinLength ? '#2e7d32' : '#9ca3af',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {passwordStrength.hasMinLength ? '✓' : '○'} {t('8+ characters', '8 أحرف+')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#7a8aaa',
                  marginBottom: 6,
                }}
              >
                {t('Confirm Password', 'تأكيد كلمة المرور')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: '#f9fafb',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 10,
                  fontSize: 13,
                  color: '#0e1428',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(212,168,67,0.5)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.1)')}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              style={{
                padding: '13px',
                background: '#D4A843',
                color: '#0e1428',
                border: 'none',
                borderRadius: 12,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                opacity: loading || success ? 0.6 : 1,
                transition: 'opacity 0.2s',
                marginTop: 8,
              }}
            >
              {loading ? '...' : t('Update Password', 'تحديث كلمة المرور')}
            </button>

            <p
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: '#9ca3af',
                marginTop: 8,
              }}
            >
              <Link
                href={`/${locale}/login`}
                style={{
                  color: '#D4A843',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                {t('Back to Login', 'رجوع إلى تسجيل الدخول')}
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: '#9ca3af',
            marginTop: 20,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.1em',
          }}
        >
          <Link href={`/${locale}/terms`} style={{ color: '#D4A843', textDecoration: 'none' }}>
            {t('Terms', 'الشروط')}
          </Link>
          {' · '}
          <Link href={`/${locale}/privacy`} style={{ color: '#D4A843', textDecoration: 'none' }}>
            {t('Privacy', 'الخصوصية')}
          </Link>
        </p>
      </div>
    </div>
  );
}