// ============================================
// Payment Form Component — DREDOTT
// Path: src/components/PaymentForm.tsx
// Stripe Elements integration
// ============================================

'use client'

import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Loader2, Lock, CreditCard } from 'lucide-react'

interface PaymentFormProps {
  amount: number
  currency: string
  onSuccess: () => void
  onError: (error: string) => void
  locale?: string
}

export default function PaymentForm({ 
  amount, 
  currency, 
  onSuccess, 
  onError,
  locale = 'en'
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isRtl = locale === 'ar'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const { error: submitError } = await elements.submit()
      
      if (submitError) {
        setErrorMessage(submitError.message || 'Payment failed')
        onError(submitError.message || 'Payment failed')
        setLoading(false)
        return
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirm`,
        },
      })

      if (error) {
        setErrorMessage(error.message || 'Payment failed')
        onError(error.message || 'Payment failed')
      } else {
        onSuccess()
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment failed')
      onError(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-[var(--gold-soft)] border border-[var(--line-gold)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-700">
            {isRtl ? 'المبلغ الإجمالي' : 'Total Amount'}
          </span>
          <span 
            className="text-2xl font-bold text-[var(--navy)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {formatAmount(amount, currency)}
          </span>
        </div>
        <p className="text-xs text-gray-600">
          {isRtl ? 'شامل جميع الرسوم' : 'Includes all fees'}
        </p>
      </div>

      {/* Stripe Payment Element */}
      <div className="bg-white rounded-xl border border-[var(--line)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-[var(--navy)]" />
          <h3 className="font-semibold text-[var(--navy)]">
            {isRtl ? 'معلومات الدفع' : 'Payment Details'}
          </h3>
        </div>
        
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">
            {isRtl ? 'دفع آمن' : 'Secure Payment'}
          </p>
          <p className="text-xs">
            {isRtl 
              ? 'معلوماتك محمية بتشفير 256-بت. لن نحفظ تفاصيل بطاقتك.'
              : 'Your information is protected with 256-bit encryption. We never store your card details.'
            }
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-[var(--navy)] hover:bg-[var(--teal)] text-[var(--gold)] font-semibold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {isRtl ? 'جاري المعالجة...' : 'Processing...'}
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            {isRtl ? 'تأكيد الدفع' : 'Confirm Payment'}
          </>
        )}
      </button>

      {/* Terms */}
      <p className="text-xs text-center text-gray-500">
        {isRtl 
          ? 'بالمتابعة، أنت توافق على شروط الخدمة وسياسة الاسترجاع الخاصة بنا.'
          : 'By proceeding, you agree to our Terms of Service and Cancellation Policy.'
        }
      </p>
    </form>
  )
}