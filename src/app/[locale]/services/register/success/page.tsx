'use client'
import { use } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function ServiceProviderSuccessPage() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const searchParams = useSearchParams()
  const providerId = searchParams.get('provider_id')
  const isAr = locale === 'ar'

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={36} color="#4ade80" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2C3A6B', marginBottom: 10 }}>
          {isAr ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28, lineHeight: 1.6 }}>
          {isAr
            ? 'شكراً لك. تم تأكيد دفعتك وسيراجع فريقنا ملفك خلال 48 ساعة.'
            : 'Thank you! Your payment is confirmed and our team will review your profile within 48 hours.'}
        </p>
        <Link href={`/${locale}/services`}
          style={{ display: 'inline-block', padding: '12px 28px', background: '#2C3A6B', color: '#D4A843', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
          {isAr ? 'استعرض الخدمات' : 'Browse Services'}
        </Link>
      </div>
    </div>
  )
}
