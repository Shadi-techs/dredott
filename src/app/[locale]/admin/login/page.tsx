'use client'
import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const router = useRouter()

  const [username, setUsername]       = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid credentials')
        setLoading(false)
        return
      }
      router.push(`/${locale}/admin/verify-pin`)
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F7] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A843]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2A9D8F]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-[#1e2d4f] rounded-2xl shadow-2xl border border-[#D4A843]/20 p-8">

          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4A843]/10 rounded-full mb-4">
              <Lock className="w-8 h-8 text-[#D4A843]" />
            </div>
            <h1 className="text-2xl font-bold text-[#FBF0D0] mb-2">DREDOTT Admin</h1>
            <p className="text-sm text-[#7a8aaa]">Secure access for administrators only</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-[#f87171]/10 border border-[#f87171]/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#f87171] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#f87171]">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[#FBF0D0] mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-[#7a8aaa]" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-[#F0F2F7] border border-[#D4A843]/20 rounded-lg text-[#FBF0D0] placeholder-[#7a8aaa] focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent transition-all"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#FBF0D0] mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-[#7a8aaa]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 bg-[#F0F2F7] border border-[#D4A843]/20 rounded-lg text-[#FBF0D0] placeholder-[#7a8aaa] focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7a8aaa] hover:text-[#D4A843] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D4A843] hover:bg-[#c49835] text-[#F0F2F7] font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#F0F2F7]/30 border-t-[#F0F2F7] rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#D4A843]/10">
            <p className="text-xs text-center text-[#7a8aaa]">Protected by two-factor authentication</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href={`/${locale}`} className="text-sm text-[#7a8aaa] hover:text-[#D4A843] transition-colors">
            ← Back to DREDOTT
          </a>
        </div>
      </div>
    </div>
  )
}
