'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function ConfirmPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const confirmEmail = async () => {
      const email = searchParams.get('email');
      if (!email) {
        setStatus('error');
        return;
      }

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // تحديث user metadata عشان يبقى confirmed
      const { error } = await supabase.auth.updateUser({
        data: { email_confirmed: true }
      });

      if (error) {
        setStatus('error');
      } else {
        setStatus('success');
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 3000);
      }
    };

    confirmEmail();
  }, []);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-navy">
              {locale === 'ar' ? 'جاري تأكيد حسابك...' : 'Confirming your account...'}
            </h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-600">
              {locale === 'ar' ? 'تم التأكيد بنجاح!' : 'Successfully confirmed!'}
            </h2>
            <p className="text-gray-500 mt-2">
              {locale === 'ar' ? 'جاري تحويلك لتسجيل الدخول...' : 'Redirecting to login...'}
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-600">
              {locale === 'ar' ? 'فشل التأكيد' : 'Confirmation failed'}
            </h2>
            <p className="text-gray-500 mt-2">
              {locale === 'ar' ? 'الرابط غير صالح أو منتهي الصلاحية' : 'Invalid or expired link'}
            </p>
            <button
              onClick={() => router.push(`/${locale}/signup`)}
              className="mt-4 text-gold hover:underline"
            >
              {locale === 'ar' ? 'تسجيل حساب جديد' : 'Create new account'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}