// ============================================
// Payment Method Selector — DREDOTT
// Path: src/components/PaymentMethodSelector.tsx
// Choose: Stripe Online or Manual Transfer
// ============================================

'use client'

import { CreditCard, Smartphone } from 'lucide-react'
import Link from 'next/link'

interface PaymentMethodSelectorProps {
  propertyId: string
  locale: string
}

export default function PaymentMethodSelector({ propertyId, locale }: PaymentMethodSelectorProps) {
  const isRtl = locale === 'ar'

  return (
    <div className="space-y-4">
      <div 
        className="text-xs tracking-[0.2em] text-[var(--gold)] mb-3"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        — {isRtl ? 'اختر طريقة الحجز' : 'CHOOSE BOOKING METHOD'}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Online Payment (Stripe) */}
        <Link href={`/${locale}/booking/${propertyId}`}>
          <div className="group cursor-pointer bg-white hover:bg-[var(--cream)] border-2 border-[var(--line)] hover:border-[var(--gold)] rounded-xl p-6 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--gold-soft)] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--gold)] transition-colors">
                <CreditCard className="w-6 h-6 text-[var(--navy)] group-hover:text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--navy)] mb-2">
                  {isRtl ? 'الدفع الإلكتروني' : 'Online Payment'}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {isRtl 
                    ? 'دفع آمن بالبطاقة الائتمانية - تأكيد فوري'
                    : 'Secure card payment - Instant confirmation'
                  }
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>✓ {isRtl ? 'Visa/Mastercard' : 'Visa/Mastercard'}</li>
                  <li>✓ {isRtl ? 'تأكيد فوري' : 'Instant booking'}</li>
                  <li>✓ {isRtl ? 'آمن 100%' : '100% secure'}</li>
                </ul>
              </div>
            </div>
          </div>
        </Link>

        {/* Manual Payment (Bank Transfer) */}
        <Link href={`/${locale}/booking/request/${propertyId}`}>
          <div className="group cursor-pointer bg-white hover:bg-[var(--cream)] border-2 border-[var(--line)] hover:border-[var(--teal)] rounded-xl p-6 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--teal)] transition-colors">
                <Smartphone className="w-6 h-6 text-[var(--teal)] group-hover:text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--navy)] mb-2">
                  {isRtl ? 'التحويل المباشر' : 'Direct Transfer'}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {isRtl 
                    ? 'تحويل بنكي أو InstaPay - بدون عمولة'
                    : 'Bank transfer or InstaPay - Zero fees'
                  }
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>✓ {isRtl ? 'InstaPay فوري' : 'InstaPay instant'}</li>
                  <li>✓ {isRtl ? 'تحويل بنكي' : 'Bank transfer'}</li>
                  <li>✓ {isRtl ? 'بدون عمولة' : 'No fees'}</li>
                </ul>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Info Note */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-1">
          {isRtl ? 'ℹ️ معلومة' : 'ℹ️ Note'}
        </p>
        <p>
          {isRtl 
            ? 'الدفع الإلكتروني: تأكيد فوري. التحويل المباشر: يتطلب تأكيد المالك (عادة خلال 24 ساعة).'
            : 'Online payment: Instant confirmation. Direct transfer: Requires owner confirmation (usually within 24 hours).'
          }
        </p>
      </div>
    </div>
  )
}