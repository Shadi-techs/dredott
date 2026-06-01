'use client'
import { useState, useEffect, use } from 'react'
import { MapPin, Clock, Lock, ArrowLeft, Phone, Mail, User } from 'lucide-react'

export default function JobDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params)
  const isAr = locale === 'ar'
  const [job, setJob]           = useState<any>(null)
  const [isSubscriber, setSub]  = useState(false)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then(r => r.json())
      .then(d => { setJob(d.job); setSub(d.is_subscriber); setLoading(false) })
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e0dbd4', borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!job) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#aaa' }}>Job not found</p>
    </div>
  )

  const title = (isAr ? job.title_ar : job.title) || job.title
  const desc  = (isAr ? job.description_ar : job.description) || job.description
  const daysLeft = Math.max(0, Math.floor((new Date(job.expires_at).getTime() - Date.now()) / 86400000))

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100vh' }} dir={isAr ? 'rtl' : 'ltr'}>

      {/* Back */}
      <div style={{ background: '#2C3A6B', padding: '16px 32px' }}>
        <a href={`/${locale}/jobs`} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> {isAr ? 'العودة للوظائف' : 'Back to Jobs'}
        </a>
      </div>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #2C3A6B 0%, #3d4f8a 100%)', padding: '32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, padding: '4px 12px', borderRadius: 100, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
              background: job.job_type === 'full_time' ? 'rgba(255,255,255,0.15)' : 'rgba(212,168,67,0.2)',
              color: job.job_type === 'full_time' ? '#fff' : '#D4A843', border: '1px solid rgba(255,255,255,0.2)' }}>
              {job.job_type?.replace('_', ' ')}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> {daysLeft} {isAr ? 'يوم متبقي' : 'days left'}
            </span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, fontWeight: 700, color: '#FAF9F6', marginBottom: 8 }}>{title}</h1>
          <p style={{ fontSize: 12, color: '#D4A843', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>{job.category}</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {job.location     && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {job.location}</span>}
            {job.salary_range && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>💰 {job.salary_range}</span>}
            {job.experience_required && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>⏱ {job.experience_required}</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>

        {/* Description */}
        <div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e8e4de' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#2C3A6B', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {isAr ? 'تفاصيل الوظيفة' : 'Job Details'}
            </p>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{desc}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e8e4de', position: 'sticky', top: 20 }}>

            {isSubscriber ? (
              <>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#2C3A6B', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {isAr ? 'بيانات التواصل' : 'Contact Details'}
                </p>
                {job.contact_name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555', marginBottom: 10 }}>
                    <User size={14} color="#D4A843" /> {job.contact_name}
                  </div>
                )}
                {job.contact_whatsapp && (
                  <a href={`https://wa.me/${job.contact_whatsapp}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', background: '#25D366', color: '#fff', fontSize: 13, fontWeight: 500, padding: '10px 16px', borderRadius: 10, textAlign: 'center', textDecoration: 'none', marginBottom: 8 }}>
                    💬 WhatsApp
                  </a>
                )}
                {job.contact_email && (
                  <a href={`mailto:${job.contact_email}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f3ef', color: '#2C3A6B', fontSize: 13, padding: '10px 16px', borderRadius: 10, textDecoration: 'none' }}>
                    <Mail size={14} /> {job.contact_email}
                  </a>
                )}
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
                  <Lock size={32} color="#D4A843" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#2C3A6B', marginBottom: 6 }}>
                    {isAr ? 'اشترك للتواصل' : 'Subscribe to Contact'}
                  </p>
                  <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.5 }}>
                    {isAr ? 'اشترك سنوياً لرؤية بيانات التواصل والتقديم' : 'Subscribe annually to see contact details and apply'}
                  </p>
                  <a href={`/${locale}/subscribe`}
                    style={{ display: 'block', background: '#D4A843', color: '#2C3A6B', fontSize: 13, fontWeight: 600, padding: '12px 16px', borderRadius: 10, textAlign: 'center', textDecoration: 'none' }}>
                    {isAr ? 'اشترك الآن' : 'Subscribe Now'}
                  </a>
                </div>
                <div style={{ padding: '12px 0 0', borderTop: '1px solid #f0ece6' }}>
                  <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center' }}>
                    {isAr ? 'بيانات جهة التواصل مخفية' : 'Contact details hidden'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}