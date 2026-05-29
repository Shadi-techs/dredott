// ============================================
// Service Provider Registration
// Path: src/app/[locale]/services/register/page.tsx
// Separate from regular user registration
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import {
  Check, ChevronRight, ChevronLeft,
  Upload, AlertCircle, Loader2, Star
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STEPS = ['Category', 'Business Info', 'Contact', 'Documents', 'Plan']

export default function ServiceProviderRegisterPage() {
  const router = useRouter()
  const [step, setStep]           = useState(0)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors]       = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    category_id:      '',
    business_name:    '',
    business_name_ar: '',
    description:      '',
    phone:            '',
    whatsapp:         '',
    email:            '',
    website_url:      '',
    facebook_url:     '',
    area:             '',
    address:          '',
    plan_type:        'basic' as 'basic' | 'premium',
    // docs uploaded separately
  })

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    setCategories(data || [])
  }

  const set = (field: keyof typeof form, val: string) => {
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = (s: number) => {
    const errs: Record<string, string> = {}
    if (s === 0 && !form.category_id) errs.category_id = 'Please select a category'
    if (s === 1 && !form.business_name.trim()) errs.business_name = 'Business name is required'
    if (s === 2 && !form.phone.trim()) errs.phone = 'Phone number is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Check if user is logged in — if not, redirect to login first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/en/login?redirect=/en/services/register&reason=service_provider')
        return
      }

      const { error } = await supabase.from('service_providers').insert({
        user_id:          user.id,
        category_id:      form.category_id,
        business_name:    form.business_name,
        business_name_ar: form.business_name_ar || null,
        description:      form.description || null,
        phone:            form.phone,
        whatsapp:         form.whatsapp || form.phone,
        email:            form.email || null,
        website_url:      form.website_url || null,
        facebook_url:     form.facebook_url || null,
        area:             form.area || null,
        address:          form.address || null,
        plan_type:        form.plan_type,
        review_status:    'pending',
        is_active:        false,
      })

      if (error) throw error
      setSubmitted(true)
    } catch (err) {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = categories.find(c => c.id === form.category_id)

  // ── Success ──────────────────────────────────────────────
  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(42,157,143,0.1)', border: '2px solid #2A9D8F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Check size={32} color="#2A9D8F" />
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: '#2C3A6B', marginBottom: 12 }}>
          Application Submitted!
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 8 }}>
          <strong>{form.business_name}</strong> has been submitted for review.
        </p>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
          Our team will verify your documents within <strong>48 hours</strong> and notify you by phone.
        </p>
        <button onClick={() => router.push('/en')} style={{ padding: '12px 28px', background: '#2C3A6B', color: '#D4A843', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          Back to Home
        </button>
      </div>
      <Footer />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />

      <div style={{ maxWidth: 580, margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.3em', color: '#D4A843', textTransform: 'uppercase', marginBottom: 10 }}>
            — Service Provider Registration
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 400, color: '#2C3A6B' }}>
            List Your Service on DREDOTT
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>
            Reach guests and property owners in Sharm El-Sheikh.<br />
            Get real ratings from verified customers.
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step > i ? '#2C3A6B' : step === i ? '#D4A843' : '#e5e7eb',
                color: step > i ? '#D4A843' : step === i ? '#0e1428' : '#9ca3af',
                fontSize: 12, fontWeight: 700,
              }}>
                {step > i ? <Check size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: step > i ? '#2C3A6B' : '#e5e7eb', margin: '0 4px' }} />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2C3A6B', marginBottom: 20 }}>{STEPS[step]}</h2>

          {/* STEP 0: Category */}
          {step === 0 && (
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>What type of service do you provide?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => set('category_id', cat.id)}
                    style={{
                      padding: '14px 12px', borderRadius: 12, cursor: 'pointer',
                      border: `2px solid ${form.category_id === cat.id ? '#2C3A6B' : 'rgba(0,0,0,0.08)'}`,
                      background: form.category_id === cat.id ? '#2C3A6B' : '#fff',
                      display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                    }}>
                    <span style={{ fontSize: 22 }}>{cat.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: form.category_id === cat.id ? '#D4A843' : '#374151' }}>
                      {cat.name_en}
                    </span>
                  </button>
                ))}
              </div>
              {errors.category_id && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{errors.category_id}</p>}
            </div>
          )}

          {/* STEP 1: Business Info */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lbl}>Business Name (English) *</label>
                <input value={form.business_name} onChange={e => set('business_name', e.target.value)}
                  placeholder="e.g. Red Sea Supermarket" style={inp} />
                {errors.business_name && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.business_name}</p>}
              </div>
              <div>
                <label style={lbl}>Business Name (Arabic)</label>
                <input value={form.business_name_ar} onChange={e => set('business_name_ar', e.target.value)}
                  placeholder="اسم النشاط بالعربي" dir="rtl" style={inp} />
              </div>
              <div>
                <label style={lbl}>Short Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={3} placeholder="Briefly describe your service..." style={{ ...inp, resize: 'none' as const }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Area</label>
                  <select value={form.area} onChange={e => set('area', e.target.value)} style={{ ...inp }}>
                    <option value="">Select area</option>
                    {['naama_bay','sharks_bay','hadaba','montazah','nabq','um_el_sid','el_salam','old_market'].map(a => (
                      <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Address</label>
                  <input value={form.address} onChange={e => set('address', e.target.value)}
                    placeholder="Street / building" style={inp} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Contact */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lbl}>Phone Number *</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+20 1XX XXX XXXX" style={inp} />
                {errors.phone && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.phone}</p>}
              </div>
              <div>
                <label style={lbl}>WhatsApp (if different)</label>
                <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
                  placeholder="+20 1XX XXX XXXX" style={inp} />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="business@email.com" style={inp} />
              </div>
              <div>
                <label style={lbl}>Website URL</label>
                <input value={form.website_url} onChange={e => set('website_url', e.target.value)}
                  placeholder="https://..." style={inp} />
              </div>
              <div>
                <label style={lbl}>Facebook Page URL</label>
                <input value={form.facebook_url} onChange={e => set('facebook_url', e.target.value)}
                  placeholder="https://facebook.com/..." style={inp} />
              </div>
            </div>
          )}

          {/* STEP 3: Documents */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                Upload your documents for verification. This helps us confirm you're a legitimate business and builds trust with customers.
              </p>

              {[
                { label: 'Commercial Registration (سجل تجاري)', required: true, note: 'Required for businesses' },
                { label: 'National ID / Passport', required: true, note: 'Owner identification' },
                { label: 'Professional License (if applicable)', required: false, note: 'e.g. lawyer bar card, pharmacy license' },
              ].map((doc, i) => (
                <div key={i} style={{ padding: 16, background: '#f9fafb', borderRadius: 12, border: '1px dashed rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
                      {doc.label} {doc.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </p>
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>{doc.note}</p>
                  <p style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Upload size={14} /> You can upload this after registration — our team will contact you.
                  </p>
                </div>
              ))}

              <div style={{ padding: 14, background: 'rgba(42,157,143,0.06)', border: '1px solid rgba(42,157,143,0.2)', borderRadius: 10 }}>
                <p style={{ fontSize: 12, color: '#2A9D8F', lineHeight: 1.6 }}>
                  📋 After submission, our team will review your application within 48 hours and contact you to verify documents before your listing goes live.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Plan */}
          {step === 4 && (
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                Choose your plan. Both include a public profile and customer ratings.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                {[
                  {
                    type: 'basic' as const,
                    price: selectedCategory?.price_basic || 800,
                    label: 'Basic',
                    features: [
                      'Public profile page',
                      'Customer ratings & reviews',
                      'WhatsApp contact button',
                      'Listed in directory',
                    ],
                  },
                  {
                    type: 'premium' as const,
                    price: selectedCategory?.price_premium || 1500,
                    label: 'Premium',
                    features: [
                      'Everything in Basic',
                      'Featured badge ✓',
                      'Priority in search results',
                      'Highlighted profile card',
                    ],
                    popular: true,
                  },
                ].map(plan => (
                  <div key={plan.type} onClick={() => set('plan_type', plan.type)}
                    style={{
                      padding: 20, borderRadius: 14, cursor: 'pointer',
                      border: `2px solid ${form.plan_type === plan.type ? '#2C3A6B' : 'rgba(0,0,0,0.08)'}`,
                      background: form.plan_type === plan.type ? '#2C3A6B' : '#fff',
                      position: 'relative',
                    }}>
                    {plan.popular && (
                      <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#D4A843', color: '#0e1428', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                        Recommended
                      </span>
                    )}
                    <p style={{ fontSize: 14, fontWeight: 700, color: form.plan_type === plan.type ? '#D4A843' : '#2C3A6B', marginBottom: 4 }}>{plan.label}</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: form.plan_type === plan.type ? '#FBF0D0' : '#D4A843', marginBottom: 12 }}>
                      EGP {plan.price.toLocaleString()}<span style={{ fontSize: 13, color: form.plan_type === plan.type ? 'rgba(255,255,255,0.5)' : '#9ca3af' }}>/yr</span>
                    </p>
                    {plan.features.map((f, i) => (
                      <p key={i} style={{ fontSize: 12, color: form.plan_type === plan.type ? 'rgba(255,255,255,0.7)' : '#6b7280', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Check size={12} color={form.plan_type === plan.type ? '#D4A843' : '#2A9D8F'} />
                        {f}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              {/* Rating value prop */}
              <div style={{ padding: 16, background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, display: 'flex', gap: 12 }}>
                <Star size={20} color="#d97706" fill="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Why ratings matter here</p>
                  <p style={{ fontSize: 12, color: '#b45309', lineHeight: 1.6 }}>
                    DREDOTT users are property owners and guests who actively need local services. A 5-star rating here carries more weight than anywhere else — it comes from real customers in Sharm.
                  </p>
                </div>
              </div>

              {errors.submit && (
                <div style={{ marginTop: 12, padding: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: '#ef4444', display: 'flex', gap: 8 }}>
                    <AlertCircle size={16} /> {errors.submit}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: 13 }}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <button onClick={() => { if (validate(step)) setStep(s => s + 1) }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', background: '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', background: '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={16} />}
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 500, color: '#6b7280', marginBottom: 6 }
const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, fontSize: 14, color: '#2C3A6B', outline: 'none', background: '#f9fafb', boxSizing: 'border-box' as const }