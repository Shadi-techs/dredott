'use client'
import { useState, useEffect, use } from 'react'
import { Plus, Clock, Eye, Users, Trash2, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function OwnerJobsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const isAr = locale === 'ar'
  const supabase = createClient()
  const [jobs, setJobs]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '', salary_range: '', job_type: 'full_time', experience_required: '', contact_whatsapp: '', contact_email: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchJobs() }, [])

  async function fetchJobs() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('job_listings').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  async function handleSubmit() {
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('job_listings').insert({ ...form, owner_id: user.id, poster_type: 'owner', status: 'pending_review', expires_at: new Date(Date.now() + 30 * 86400000).toISOString() })
    setForm({ title: '', description: '', category: '', location: '', salary_range: '', job_type: 'full_time', experience_required: '', contact_whatsapp: '', contact_email: '' })
    setShowForm(false)
    setSubmitting(false)
    fetchJobs()
  }

  async function deleteJob(id: string) {
    if (!confirm(isAr ? 'حذف الوظيفة؟' : 'Delete this job?')) return
    await supabase.from('job_listings').delete().eq('id', id)
    fetchJobs()
  }

  const statusColor: Record<string, string> = { pending_review: '#fbbf24', live: '#4ade80', rejected: '#f87171', expired: '#94a3b8' }

  return (
    <div style={{ padding: 24, background: '#FAF9F6', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: '#2C3A6B' }}>{isAr ? 'الوظائف' : 'Job Listings'}</h1>
            <p style={{ fontSize: 13, color: '#888' }}>{isAr ? 'إدارة وظائفك' : 'Manage your job posts'}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2C3A6B', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none' }}>
            <Plus size={16} /> {isAr ? 'نشر وظيفة' : 'Post Job'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 24, border: '1px solid #e8e4de' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#2C3A6B', marginBottom: 20 }}>{isAr ? 'نشر وظيفة جديدة' : 'Post New Job'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { key: 'title', label: isAr ? 'المسمى الوظيفي *' : 'Job Title *', placeholder: isAr ? 'مثال: مدير فندق' : 'e.g. Hotel Manager' },
                { key: 'category', label: isAr ? 'التصنيف' : 'Category', placeholder: isAr ? 'مثال: ضيافة' : 'e.g. Hospitality' },
                { key: 'location', label: isAr ? 'الموقع' : 'Location', placeholder: isAr ? 'نعمة باي' : 'Naama Bay' },
                { key: 'salary_range', label: isAr ? 'الراتب' : 'Salary Range', placeholder: isAr ? '5000-8000 جنيه' : '5000-8000 EGP' },
                { key: 'experience_required', label: isAr ? 'الخبرة' : 'Experience', placeholder: isAr ? '3 سنوات+' : '3+ years' },
                { key: 'contact_whatsapp', label: isAr ? 'واتساب التواصل' : 'Contact WhatsApp', placeholder: '+201234567890' },
                { key: 'contact_email', label: isAr ? 'البريد الإلكتروني' : 'Contact Email', placeholder: 'hr@company.com' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>{field.label}</label>
                  <input value={(form as any)[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} placeholder={field.placeholder}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>{isAr ? 'نوع الوظيفة' : 'Job Type'}</label>
                <select value={form.job_type} onChange={e => setForm({ ...form, job_type: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
                  <option value="full_time">{isAr ? 'دوام كامل' : 'Full Time'}</option>
                  <option value="part_time">{isAr ? 'دوام جزئي' : 'Part Time'}</option>
                  <option value="freelance">{isAr ? 'فريلانس' : 'Freelance'}</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>{isAr ? 'الوصف *' : 'Description *'}</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} placeholder={isAr ? 'اكتب وصف الوظيفة...' : 'Describe the job...'}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: 13, cursor: 'pointer' }}>{isAr ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={handleSubmit} disabled={submitting || !form.title || !form.description}
                style={{ padding: '9px 18px', borderRadius: 8, background: '#D4A843', color: '#2C3A6B', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', opacity: submitting ? 0.6 : 1 }}>
                {submitting ? '...' : (isAr ? 'نشر' : 'Submit')}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #e0dbd4', borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 14, border: '1px solid #e8e4de' }}>
            <p style={{ color: '#aaa', fontSize: 15 }}>{isAr ? 'لا توجد وظائف بعد' : 'No job posts yet'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {jobs.map(job => (
              <div key={job.id} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e8e4de', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, fontWeight: 600, color: '#2C3A6B' }}>{job.title}</p>
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 100, background: `${statusColor[job.status] || '#94a3b8'}20`, color: statusColor[job.status] || '#94a3b8', fontWeight: 600 }}>
                      {job.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {job.location && <span style={{ fontSize: 12, color: '#888' }}>📍 {job.location}</span>}
                    {job.salary_range && <span style={{ fontSize: 12, color: '#888' }}>💰 {job.salary_range}</span>}
                    <span style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={11} /> {job.views_count || 0}</span>
                    <span style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {job.applications_count || 0}</span>
                    {job.expires_at && <span style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {new Date(job.expires_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <button onClick={() => deleteJob(job.id)} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff', color: '#f87171', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}