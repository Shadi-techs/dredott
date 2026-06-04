'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, MapPin, Phone } from 'lucide-react'

export default function AdminProvidersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const supabase = createClient()
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('pending')

  useEffect(() => { fetchProviders() }, [filter])

  async function fetchProviders() {
    setLoading(true)
    const query = supabase
      .from('service_providers')
      .select('*, service_provider_categories(name_en)')
      .order('created_at', { ascending: false })

    const { data } = filter === 'all' ? await query : await query.eq('status', filter)
    setProviders(data || [])
    setLoading(false)
  }

  async function handleAction(id: string, action: 'approved' | 'rejected', reason?: string) {
    await supabase.from('service_providers').update({
      status: action,
      is_active: action === 'approved',
      reviewed_at: new Date().toISOString(),
      ...(reason ? { rejected_reason: reason } : {})
    }).eq('id', id)
    fetchProviders()
  }

  const STATUS_COLORS: Record<string, string> = {
    pending: '#fbbf24', approved: '#4ade80', rejected: '#f87171'
  }

  return (
    <div style={{ padding: 24, background: '#F0F2F7', minHeight: '100vh', color: '#FBF0D0' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, marginBottom: 8 }}>Service Providers</h1>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 16px', borderRadius: 100, fontSize: 12, cursor: 'pointer', border: '1px solid', background: filter === f ? '#D4A843' : 'transparent', color: filter === f ? '#F0F2F7' : '#D4A843', borderColor: '#D4A843', fontWeight: filter === f ? 600 : 400, textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #1e2d4f', borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : providers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#7a8aaa' }}>No providers found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {providers.map(p => (
              <div key={p.id} style={{ background: '#1e2d4f', borderRadius: 12, padding: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600 }}>{p.business_name}</p>
                      <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 100, background: `${STATUS_COLORS[p.status]}20`, color: STATUS_COLORS[p.status], fontWeight: 600, textTransform: 'capitalize' }}>
                        {p.status}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#D4A843', marginBottom: 8 }}>{p.service_provider_categories?.name_en}</p>
                    {p.description && <p style={{ fontSize: 13, color: '#7a8aaa', lineHeight: 1.5, marginBottom: 10 }}>{p.description}</p>}
                    <div style={{ display: 'flex', gap: 16 }}>
                      {p.whatsapp && <span style={{ fontSize: 12, color: '#7a8aaa', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} /> {p.whatsapp}</span>}
                      {p.area && <span style={{ fontSize: 12, color: '#7a8aaa', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {p.area}</span>}
                    </div>
                  </div>

                  {p.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                      <button onClick={() => handleAction(p.id, 'approved')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: 12, cursor: 'pointer' }}>
                        <Check size={13} /> Approve
                      </button>
                      <button onClick={() => { const r = prompt('Rejection reason:'); if (r) handleAction(p.id, 'rejected', r) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: 12, cursor: 'pointer' }}>
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