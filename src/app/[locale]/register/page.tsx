// ============================================
// Register Page - Editorial Style
// Path: src/app/[locale]/register/page.tsx
// FIXED: createBrowserClient singleton outside component
// ============================================

'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, User, Phone, Upload, Camera, Loader2, Check } from 'lucide-react'
import { usePageFlag } from '@/lib/hooks/usePageFlag'



// ✅ Singleton خارج الـ component
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { enabled: registrationEnabled, loading: flagLoading } = usePageFlag('registration_enabled')

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [nationality, setNationality] = useState('')
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const redirectTo = searchParams.get('redirect') || '/en/properties'
  const propertyId = searchParams.get('property')
  const reason = searchParams.get('reason')

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setStep(2)
  }

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!firstName || !lastName) { setError('Please enter your full name'); return }
    if (!phone) { setError('Please enter your phone number'); return }
    setStep(3)
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, phone, nationality },
        },
      })

      if (signUpError) throw signUpError
      if (!authData.user) throw new Error('Registration failed')

      let photoUrl = null
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split('.').pop()
        const fileName = `${authData.user.id}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, profilePhoto)

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName)
          photoUrl = publicUrl
        }
      }

      await supabase.from('profiles').update({
        first_name: firstName,
        last_name: lastName,
        phone,
        nationality,
        avatar_url: photoUrl,
        registration_source: propertyId ? 'price_gate' : 'direct',
        marketing_consent: marketingConsent,
        registered_at: new Date().toISOString(),
      }).eq('id', authData.user.id)

      if (propertyId && reason) {
        await supabase.from('property_inquiries').insert({
          property_id: propertyId,
          user_id: authData.user.id,
          inquiry_type: reason === 'price' ? 'price_view' : 'contact_click',
        })
      }

      // Admin notification - new user
      await fetch('/api/admin/notifications/list', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          type: 'new_user',
          category: 'user',
          title: 'New user registered',
          body: firstName + ' ' + lastName + ' just registered on DREDOTT',
          link: '/admin/owners',
          priority: 'normal',
        })
      })
      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (flagLoading) return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
      <div style={{ width: 36, height: 36, border: '3px solid #D4A843', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!registrationEnabled) return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center gap-4 text-center p-8">
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: '#2C3A6B' }}>🔒</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: '#2C3A6B', margin: 0 }}>Registration Closed</h1>
      <p className="text-gray-500 max-w-md">New registrations are temporarily disabled. To create an account, please contact us on WhatsApp.</p>
      <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} className="bg-[#2A9D8F] text-white px-6 py-3 rounded-lg font-semibold text-sm">WhatsApp Us</a>
      <Link href="/en" className="text-sm text-gray-400 hover:text-gray-600">← Back to home</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
      

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {reason === 'price' && (
              <div className="inline-block text-[11px] tracking-[0.2em] text-[#B8860B] mb-4 bg-[#FBF0D0] px-4 py-2 rounded-full"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                🔒 REGISTER TO SEE PRICE
              </div>
            )}
            <h1 className="text-5xl lg:text-6xl text-[#2C3A6B] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Join <em>Dredott</em>
            </h1>
            <p className="text-gray-600">
              {reason ? 'Create an account to unlock this property' : 'Create your Dredott account'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8 gap-2">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step === num ? 'bg-[#2C3A6B] text-[#D4A843] ring-4 ring-[#D4A843]/20'
                    : step > num ? 'bg-[#2A9D8F] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
                {num < 3 && (
                  <div className={`w-12 h-1 mx-1 rounded-full transition-all ${step > num ? 'bg-[#2A9D8F]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border border-[rgba(26,36,64,0.08)] p-8 shadow-lg">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-5">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-[#2C3A6B] mb-1">Step 1: Account Details</h3>
                  <p className="text-sm text-gray-500">Create your login credentials</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3A6B] mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] focus:bg-white outline-none"
                      placeholder="you@example.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3A6B] mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] focus:bg-white outline-none"
                      placeholder="Min. 6 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3A6B] mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} required value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] focus:bg-white outline-none"
                      placeholder="Re-enter password" />
                  </div>
                </div>

                <button type="submit"
                  className="w-full bg-[#2C3A6B] hover:bg-[#2A9D8F] text-[#D4A843] px-6 py-3 rounded-lg font-semibold transition-all">
                  Continue
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Or</span></div>
                </div>

                <button type="button" onClick={handleGoogleSignup} disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-[#D4A843] text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-5">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-[#2C3A6B] mb-1">Step 2: Personal Info</h3>
                  <p className="text-sm text-gray-500">Tell us about yourself</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2C3A6B] mb-2">First Name</label>
                    <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] focus:bg-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2C3A6B] mb-2">Last Name</label>
                    <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] focus:bg-white outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3A6B] mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] focus:bg-white outline-none"
                      placeholder="+20 123 456 7890" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3A6B] mb-2">Nationality</label>
                  <select value={nationality} onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] focus:bg-white outline-none">
                    <option value="">Select nationality</option>
                    <option value="EG">Egypt 🇪🇬</option>
                    <option value="IT">Italy 🇮🇹</option>
                    <option value="RU">Russia 🇷🇺</option>
                    <option value="UA">Ukraine 🇺🇦</option>
                    <option value="DE">Germany 🇩🇪</option>
                    <option value="GB">United Kingdom 🇬🇧</option>
                    <option value="US">United States 🇺🇸</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all">
                    Back
                  </button>
                  <button type="submit"
                    className="flex-1 bg-[#2C3A6B] hover:bg-[#2A9D8F] text-[#D4A843] px-6 py-3 rounded-lg font-semibold transition-all">
                    Continue
                  </button>
                </div>
              </form>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-5">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-[#2C3A6B] mb-1">Step 3: Profile Photo</h3>
                  <p className="text-sm text-gray-500">Add a photo (optional)</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    {photoPreview
                      ? <img src={photoPreview} alt="Profile preview" className="w-32 h-32 rounded-full object-cover border-4 border-[#D4A843]" />
                      : <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FBF0D0] to-[#D4A843] flex items-center justify-center">
                          <Camera className="w-12 h-12 text-[#8B6914]" />
                        </div>
                    }
                    <label htmlFor="photo"
                      className="absolute bottom-0 right-0 w-10 h-10 bg-[#2C3A6B] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#2A9D8F] transition-colors">
                      <Upload className="w-5 h-5 text-white" />
                    </label>
                    <input type="file" id="photo" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </div>
                  <p className="text-sm text-gray-500 text-center">Click the button to upload a photo</p>
                </div>

                <div className="flex items-start gap-3 p-4 bg-[#FAF9F6] rounded-lg">
                  <input type="checkbox" id="marketing" checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#2A9D8F]" />
                  <label htmlFor="marketing" className="text-sm text-gray-600">
                    I agree to receive emails about special offers and new properties
                  </label>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} disabled={loading}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all">
                    Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-[#2C3A6B] hover:bg-[#2A9D8F] text-[#D4A843] px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Creating...</> : 'Create Account'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href={`/en/login${propertyId ? `?property=${propertyId}&reason=${reason}&redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                className="text-[#2A9D8F] hover:text-[#2C3A6B] font-semibold transition-colors">
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>

      
    </div>
  )
}