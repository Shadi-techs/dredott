// ============================================
// Admin Login Page
// Path: src/app/[locale]/login-admin/page.tsx
// FIXED: createBrowserClient singleton outside component
// ============================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// ✅ Singleton خارج الـ component
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginAdminPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile && ['super_admin', 'admin', 'viewer'].includes(profile.role)) {
        router.push('/en/admin')
        router.refresh()
      } else {
        setError('You do not have admin access')
        await supabase.auth.signOut()
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e1428]">
      <div className="w-full max-w-md px-8 py-10 bg-[#1a2240] border border-[rgba(212,168,67,0.18)] rounded-2xl shadow-2xl">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl italic text-[#D4A843] mb-1"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            DREDOTT
          </h1>
          <p className="text-xs font-mono tracking-widest text-[#7a8aaa] uppercase">
            Admin Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-mono tracking-widest text-[#7a8aaa] uppercase mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#0e1428] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder-[#7a8aaa] focus:outline-none focus:border-[rgba(212,168,67,0.5)] transition-colors text-sm"
              placeholder="admin@whitestork.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-widest text-[#7a8aaa] uppercase mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#0e1428] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder-[#7a8aaa] focus:outline-none focus:border-[rgba(212,168,67,0.5)] transition-colors text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4A843] hover:bg-[#c49835] disabled:opacity-50 text-[#0e1428] font-bold py-3 rounded-xl transition-colors text-sm tracking-wide"
          >
            {loading ? 'loging in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}