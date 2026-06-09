'use client'
// ============================================
// PIN Verification Page
// Path: src/app/[locale]/admin/verify-pin/page.tsx
//
// ✅ بتكلم /api/admin/verify-pin (JWT)
// ✅ مش بتستخدم Supabase Auth أو localStorage
// ============================================

import { useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, AlertCircle, ArrowLeft } from 'lucide-react'

export default function VerifyPinPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const router     = useRouter()

  const [pin, setPin]       = useState(['', '', '', '', '', ''])
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // ── Verify PIN ──
  const handleVerifyPin = async (pinValue: string) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinValue }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (data.locked) {
          setError('Too many failed attempts. Please login again.')
          setTimeout(() => router.push(`/${locale}/admin/login`), 2000)
          return
        }
        setError('Invalid PIN. Please try again.')
        setPin(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        setLoading(false)
        return
      }

      // نجح — روح للـ dashboard
      router.push(`/${locale}/admin`)

    } catch (err) {
      console.error('PIN verification error:', err)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  // ── PIN input handlers ──
  const handlePinChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setError('')

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newPin.every(d => d !== '') && index === 5) {
      handleVerifyPin(newPin.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pasted)) {
      setPin(pasted.split(''))
      inputRefs.current[5]?.focus()
      setTimeout(() => handleVerifyPin(pasted), 100)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pinValue = pin.join('')
    if (pinValue.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }
    handleVerifyPin(pinValue)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0F2F7", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>


      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.12)", border: "1px solid rgba(212,168,67,0.2)", padding: "32px 28px" }}>

          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4A843]/10 rounded-full mb-4">
              <Shield className="w-8 h-8 text-[#D4A843]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1a2240] mb-2">Enter Security PIN</h1>
            <p className="text-sm text-[#6B7280]">Enter your 6-digit PIN to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-[#f87171]/10 border border-[#f87171]/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#f87171] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#f87171]">{error}</p>
            </div>
          )}

          {/* PIN inputs */}
          <form onSubmit={handleManualSubmit}>
            <div className="flex justify-center gap-3 mb-8">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={loading}
                  autoFocus={index === 0}
                  className="w-14 h-14 text-center text-2xl font-bold bg-[#F0F2F7] border-2 border-[#D4A843]/20 rounded-lg text-[#1a2240] focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent transition-all disabled:opacity-50"
                />
              ))}
            </div>

            {!loading && pin.every(d => d !== '') && (
              <button
                type="submit"
                className="w-full py-3 bg-[#D4A843] hover:bg-[#c49835] text-[#F0F2F7] font-semibold rounded-lg transition-all"
              >
                Verify PIN
              </button>
            )}

            {loading && (
              <div className="flex items-center justify-center py-3">
                <div className="w-6 h-6 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
                <span className="ml-3 text-[#6B7280]">Verifying...</span>
              </div>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-[#D4A843]/10">
            <button
              onClick={() => router.push(`/${locale}/admin/login`)}
              className="w-full flex items-center justify-center gap-2 text-sm text-[#6B7280] hover:text-[#D4A843] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/50 border border-[#D4A843]/10 rounded-lg">
          <p className="text-xs text-center text-[#6B7280]">
            🔒 Secure area — session expires in 8 hours
          </p>
        </div>
      </div>
    </div>
  )
}