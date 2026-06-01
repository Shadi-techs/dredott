'use client'
import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const AREAS = ['naama_bay', 'sharks_bay', 'hadaba', 'om_el_seed', 'sharm_old_market']

export default function ProviderRegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const isAr = locale === 'ar'
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState({ business_name: '', category_id: '', description: '', whatsapp: '', phone: '', area: '', google_business_url: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useState(() => {
    supabase.from('service_provider_categories').select('id, name_en, name_ar').eq('is_active', true).order('sort_order')
      .then(({ data }) => setCategories(data || []))
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(`/${locale}/login`); return }
    const { error: err } = await supabase.from('service_providers').insert({ ...form, user_id: user.id, status: 'pending', is_active: false })
    if (err) { setError(err.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, maxWidth: 480, textAlign: 'center', border: '1px solid #e8e4de' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: '#2C3A6B', marginBottom: 12 }}>
          {isAr ? 'تم إرسال طلبك!' : 'Application Submitted!'}
        </h2>
        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 24 }}>
          {isAr ? 'سيراجع فريقنا طلبك خلال 24 ساعة وسيتم إبلاغك بالنتيجة.' : 'Our team will review your application within 24 hours.'}
        </p>
        <a href={`/${locale}`} style={{ display: 'inline-block', background: '#2C3A6B', color: '#fff', padding: '10px 24px', borderRadius: 10, textDecoration: 'none', fontSize: 13 }}>
          {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }} dir={isAr ? 'rtl' : 'ltr'}>
      <div style={{ background: '#2C3A6B', padding: '40px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: 11, color: '#D4A843', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
            {isAr ? 'انضم إلينا' : 'Join Us'}
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 700, color: '#FAF9F6' }}>
            {isAr ? 'سجّل كمزود خدمة' : 'Register as Service Provider'}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e8e4de' }}>

          {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 20 }}>{error}</div>}

          {[
            { key: 'business_name', label: isAr ? 'اسم الشركة/الخدمة *' : 'Business Name *', placeholder: isAr ? 'مثال: Clean Pro' : 'e.g. Clean Pro', required: true },
            { key: 'description', label: isAr ? 'وصف الخدمة *' : 'Service Description *', placeholder: isAr ? 'اكتب وصفاً لخدمتك...' : 'Describe your service...', required: true, multiline: true },
            { key: 'whatsapp', label: isAr ? 'واتساب *' : 'WhatsApp *', placeholder: '+201234567890', required: true },
            { key: 'phone', label: isAr ? 'هاتف' : 'Phone', placeholder: '+201234567890' },
            { key: 'google_business_url', label: isAr ? 'رابط Google Business' : 'Google Business URL', placeholder: 'https://maps.google.com/...' },
          ].map(field => (
            <div key={field.key} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#2C3A6B', display: 'block', marginBottom: 6 }}>{field.label}</label>
              {field.multiline ? (
                <textarea value={(form as any)[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder} required={field.required} rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', outline: 'none' }} />
              ) : (
                <input type="text" value={(form as any)[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder} required={field.required}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none' }} />
              )}
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#2C3A6B', display: 'block', marginBottom: 6 }}>{isAr ? 'نوع الخدمة *' : 'Category *'}</label>
              <select required value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
                <option value="">{isAr ? 'اختر...' : 'Select...'}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{isAr ? c.name_ar : c.name_en}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#2C3A6B', display: 'block', marginBottom: 6 }}>{isAr ? 'المنطقة' : 'Area'}</label>
              <select value={form.area} onChange={e => setForm({ ...form, area: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
                <option value="">{isAr ? 'اختر...' : 'Select...'}</option>
                {AREAS.map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', background: '#D4A843', color: '#2C3A6B', padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : (isAr ? 'إرسال الطلب' : 'Submit Application')}
          </button>
        </form>
      </div>
    </div>
  )
}