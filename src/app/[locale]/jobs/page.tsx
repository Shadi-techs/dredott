'use client'
import { useState, useEffect, use } from 'react'
import { Search, MapPin, Clock, Lock, Briefcase } from 'lucide-react'
import { usePageFlag } from '@/lib/hooks/usePageFlag'

const CATEGORIES = ['hospitality', 'maintenance', 'cleaning', 'restaurants', 'security', 'admin']
const JOB_TYPES  = ['full_time', 'part_time', 'freelance']

export default function JobsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const isAr = locale === 'ar'
  const { enabled: pageEnabled, loading: flagLoading } = usePageFlag('jobs_page_enabled')
  const [jobs, setJobs]     = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [jobType, setJobType]   = useState('')
  const [search, setSearch]     = useState('')

  useEffect(() => { fetchJobs() }, [category, jobType])

  async function fetchJobs() {
    setLoading(true)
    const p = new URLSearchParams()
    if (category) p.set('category', category)
    if (jobType)  p.set('job_type', jobType)
    const res = await fetch(`/api/jobs?${p}`)
    const data = await res.json()
    setJobs(data.jobs || [])
    setLoading(false)
  }

  const filtered = jobs.filter(j => {
    if (!search) return true
    const title = (isAr ? j.title_ar : j.title) || j.title
    return title?.toLowerCase().includes(search.toLowerCase())
  })

  const daysLeft = (expires_at: string) => {
    const diff = new Date(expires_at).getTime() - Date.now()
    return Math.max(0, Math.floor(diff / 86400000))
  }

  if (flagLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #D4A843', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!pageEnabled) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6', gap: 16, textAlign: 'center', padding: 32 }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: '#2C3A6B' }}>💼</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: '#2C3A6B', margin: 0 }}>{isAr ? 'الوظائف — قريباً' : 'Jobs — Coming Soon'}</h1>
      <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 400 }}>{isAr ? 'هذا القسم غير متاح حالياً. تواصل معنا عبر واتساب.' : 'This section is currently unavailable. Contact us on WhatsApp.'}</p>
      <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} style={{ background: '#2A9D8F', color: '#fff', padding: '10px 24px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>WhatsApp</a>
    </div>
  )

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100vh' }} dir={isAr ? 'rtl' : 'ltr'}>

      {/* Hero */}
      <div style={{ background: '#2C3A6B', padding: '48px 32px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, color: '#D4A843', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            {isAr ? 'لوحة الوظائف' : 'Jobs Board'}
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 700, color: '#FAF9F6', marginBottom: 8 }}>
            {isAr ? 'وظائف في شرم الشيخ' : 'Jobs in Sharm El Sheikh'}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>
            {isAr ? 'اشترك لرؤية بيانات التواصل والتقديم على الوظائف' : 'Subscribe to see contact details and apply'}
          </p>
          <div style={{ position: 'relative', maxWidth: 480 }}>
            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888', width: 16, height: 16 }} />
            <input
              type="text"
              placeholder={isAr ? 'ابحث عن وظيفة...' : 'Search jobs...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: 10, border: 'none', fontSize: 14, outline: 'none' }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {['', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{ padding: '7px 16px', borderRadius: 100, fontSize: 12, border: '1px solid', cursor: 'pointer', background: category === cat ? '#2C3A6B' : '#fff', color: category === cat ? '#fff' : '#555', borderColor: category === cat ? '#2C3A6B' : '#ddd' }}>
              {cat === '' ? (isAr ? 'الكل' : 'All') : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {['', ...JOB_TYPES].map(type => (
            <button key={type} onClick={() => setJobType(type)}
              style={{ padding: '5px 14px', borderRadius: 100, fontSize: 11, border: '1px solid', cursor: 'pointer', background: jobType === type ? '#D4A843' : '#fff', color: jobType === type ? '#2C3A6B' : '#777', borderColor: jobType === type ? '#D4A843' : '#ddd', fontWeight: jobType === type ? 600 : 400 }}>
              {type === '' ? (isAr ? 'كل الأنواع' : 'All Types') : type.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e0dbd4', borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Briefcase size={40} color="#ddd" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: '#aaa' }}>{isAr ? 'لا توجد وظائف حالياً' : 'No jobs found'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filtered.map(job => (
              <div key={job.id} style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: 14, padding: 20, transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2C3A6B'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e8e4de'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 100, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5,
                    background: job.job_type === 'full_time' ? '#e8f0fd' : job.job_type === 'part_time' ? '#fef3e2' : '#e8f8f0',
                    color: job.job_type === 'full_time' ? '#2C3A6B' : job.job_type === 'part_time' ? '#b37d0a' : '#1a7a45' }}>
                    {job.job_type?.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> {daysLeft(job.expires_at)}d left
                  </span>
                </div>

                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 19, fontWeight: 600, color: '#2C3A6B', marginBottom: 4, lineHeight: 1.3 }}>
                  {(isAr ? job.title_ar : job.title) || job.title}
                </p>
                <p style={{ fontSize: 11, color: '#D4A843', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 12 }}>
                  {job.category}
                </p>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                  {job.location && <span style={{ fontSize: 12, color: '#777', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} /> {job.location}</span>}
                  {job.salary_range && <span style={{ fontSize: 12, color: '#777' }}>💰 {job.salary_range}</span>}
                  {job.experience_required && <span style={{ fontSize: 12, color: '#777' }}>⏱ {job.experience_required}</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f0ece6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8ecf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#2C3A6B' }}>?</div>
                    <span style={{ fontSize: 12, color: '#ccc', filter: 'blur(4px)', userSelect: 'none' }}>Company Name</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#D4A843', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Lock size={11} /> {isAr ? 'اشترك' : 'Subscribe'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}