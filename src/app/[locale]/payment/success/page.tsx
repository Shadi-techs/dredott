// src/app/[locale]/payment/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const subscriptionId = searchParams.get('subscription_id');
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!subscriptionId) {
      setError('Missing subscription ID');
      return;
    }

    const checkAndRedirect = async () => {
      // Optional: verify subscription status is now 'pending_claim' (should be already)
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('id', subscriptionId)
        .single();

      if (!sub || sub.status !== 'pending_claim') {
        setError('Subscription not found or already active');
        return;
      }

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(`/${locale}/stays/claim?subscription_id=${subscriptionId}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    };

    checkAndRedirect();
  }, [subscriptionId, router, locale, supabase]);

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-navy mb-2">Payment Error</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href={`/${locale}/pricing`} className="text-gold hover:underline">
            Back to Pricing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-md text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-navy mb-2">
          {locale === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
        </h1>
        <p className="text-gray-500 mb-4">
          {locale === 'ar'
            ? 'سيتم تحويلك إلى صفحة إضافة العقار خلال'
            : 'Redirecting you to property submission in'}
        </p>
        <div className="text-3xl font-bold text-gold mb-6">{countdown}</div>
        <div className="text-sm text-gray-400">
          {locale === 'ar' ? 'جاري التحويل...' : 'Redirecting...'}
        </div>
      </div>
    </div>
  );
}