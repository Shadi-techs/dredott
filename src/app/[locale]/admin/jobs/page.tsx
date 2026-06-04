'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, MapPin, Clock } from 'lucide-react'

export default function AdminJobsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const supabase = createClient()
  const [jobs, setJobs]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('pending_review')

  useEffect(() => { fetchJobs() }, [filter])

  async function fetchJobs() {
    setLoading(true)
    const query = supabase.from('job_listings').select('*').order('created_at', { ascending: false })
    const { data } = filter === 'all' ? await query : await query.eq('status', filter)
    setJobs(data || [])
    setLoading(false)
  }

  async function handleAction(id: string, action: 'live' | 'rejected', reason?: string) {
    await supabase.from('job_listings').update({
      status: action,
      reviewed_at: new Date().toISOString(),
      ...(action === 'live' ? { published_at: new Date().toISOString(), expires_at: new Date(Date.now() + 30 * 86400000).toISOString() } : {}),
      ...(reason ? { rejection_reason: reason } : {})
    }).eq('id', id)
    fetchJobs()
  }

  const STATUS_COLORS: Record<string, string> = {
    pending_review: '#fbbf24', live: '#4ade80', rejected: '#f87171', expired: '#94a3b8'
  }

  return (
    <div style={{ padding: 24, background: '#ffffff', minHeight: '100vh', color: '#FBF0D0' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, marginBottom: 8 }}>Job Listings Review</h1>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['pending_review', 'live', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 16px', borderRadius: 100, fontSize: 12, cursor: 'pointer', border: '1px solid', background: filter === f ? '#D4A843' : 'transparent', color: filter === f ? '#ffffff' : '#D4A843', borderColor: '#D4A843', fontWeight: filter === f ? 600 : 400 }}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #0e1428', borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#7a8aaa' }}>No jobs found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {jobs.map(job => (
              <div key={job.id} style={{ background: '#0e1428', borderRadius: 12, padding: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600 }}>{job.title}</p>
                      <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 100, background: `${STATUS_COLORS[job.status]}20`, color: STATUS_COLORS[job.status], fontWeight: 600 }}>
                        {job.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#D4A843', marginBottom: 8 }}>{job.category} · {job.job_type?.replace('_', ' ')}</p>
                    {job.description && <p style={{ fontSize: 13, color: '#7a8aaa', lineHeight: 1.5, marginBottom: 10 }}>{job.description.substring(0, 150)}...</p>}
                    <div style={{ display: 'flex', gap: 16 }}>
                      {job.location && <span style={{ fontSize: 12, color: '#7a8aaa', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {job.location}</span>}
                      {job.salary_range && <span style={{ fontSize: 12, color: '#7a8aaa' }}>💰 {job.salary_range}</span>}
                      <span style={{ fontSize: 12, color: '#7a8aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {job.status === 'pending_review' && (
                    <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                      <button onClick={() => handleAction(job.id, 'live')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: 12, cursor: 'pointer' }}>
                        <Check size={13} /> Approve
                      </button>
                      <button onClick={() => { const r = prompt('Rejection reason:'); if (r) handleAction(job.id, 'rejected', r) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: 12, cursor: 'pointer' }}>
                        <X size={13} /> Reject
                      </button>
                    </div>
                  )}
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