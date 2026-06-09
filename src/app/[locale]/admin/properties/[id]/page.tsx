'use client'
// Admin — Property Review Detail
// Full preview + AI analysis + moderation actions

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, CheckCircle2, XCircle, MessageSquare,
  Bed, Bath, Users, MapPin, DollarSign, Calendar,
  Zap, AlertTriangle, Info, ChevronDown, Sparkles,
  RotateCcw, Home,
} from 'lucide-react'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// ── Moderation modal shared between property & car ──────────
function ModerationModal({
  action, listing, onClose, onDone, locale,
}: {
  action: 'approve' | 'reject' | 'changes_requested'
  listing: any
  onClose: () => void
  onDone: () => void
  locale: string
}) {
  const [presets, setPresets]           = useState<any[]>([])
  const [selectedPreset, setSelected]   = useState('')
  const [customReason, setCustom]       = useState('')
  const [internalNote, setNote]         = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState('')

  useEffect(() => {
    if (action === 'approve') return
    fetch(`/api/admin/moderation/queue?presets=1&type=${listing.type}&decision=${action}`)
      .then(r => r.json())
      .then(d => setPresets(d.presets || []))
      .catch(() => {})
  }, [action, listing.type])

  const labels = {
    approve:            { title: 'Approve Listing',       color: '#4ade80', btn: 'Approve' },
    reject:             { title: 'Reject Listing',        color: '#f87171', btn: 'Reject' },
    changes_requested:  { title: 'Request Changes',       color: '#fbbf24', btn: 'Send Request' },
  }
  const cfg = labels[action]

  async function submit() {
    setError(''); setSubmitting(true)
    try {
      const endpoints: Record<string, string> = {
        approve:           '/api/admin/moderation/approve',
        reject:            '/api/admin/moderation/reject',
        changes_requested: '/api/admin/moderation/request-changes',
      }
      const body: any = { entity_type: listing.type, entity_id: listing.id, internal_note: internalNote || undefined }
      if (action !== 'approve') {
        body.reason_preset_id = selectedPreset || undefined
        body.reason_custom    = customReason   || undefined
      }
      const res = await fetch(endpoints[action], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      onDone()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2240', margin: '0 0 4px' }}>{cfg.title}</h2>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px' }}>{listing.name}</p>

        {action !== 'approve' && (
          <>
            {presets.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 6 }}>REASON PRESET</label>
                <select value={selectedPreset} onChange={e => setSelected(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, background: '#fff' }}>
                  <option value="">— Choose a preset —</option>
                  {presets.map((p: any) => <option key={p.id} value={p.id}>{p.reason_en}</option>)}
                </select>
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 6 }}>CUSTOM REASON (optional)</label>
              <textarea value={customReason} onChange={e => setCustom(e.target.value)} rows={3} placeholder="Write a custom reason for the owner…" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
          </>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 6 }}>INTERNAL NOTE (not shown to owner)</label>
          <textarea value={internalNote} onChange={e => setNote(e.target.value)} rows={2} placeholder="Admin-only note…" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} disabled={submitting} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#6B7280', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={submit} disabled={submitting} style={{ flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', background: cfg.color, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Submitting…' : cfg.btn}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── AI Review Panel ──────────────────────────────────────────
function AiReviewPanel({ listingId, listingType, onUseSuggestion }: { listingId: string; listingType: string; onUseSuggestion: (text: string) => void }) {
  const [result, setResult]     = useState<any>(null)
  const [loading, setLoading]   = useState(false)
  const [dismissed, setDismiss] = useState<Set<number>>(new Set())
  const [applied, setApplied]   = useState<Set<number>>(new Set())

  async function runReview() {
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/admin/ai-review', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_type: listingType, listing_id: listingId }),
      })
      const data = await res.json()
      setResult(data)
    } catch { setResult({ error: 'AI review unavailable' }) }
    finally { setLoading(false) }
  }

  const severityColor = (s: string) => s === 'high' ? '#f87171' : s === 'medium' ? '#fbbf24' : '#60a5fa'

  return (
    <div style={{ background: 'linear-gradient(135deg,#0e1428,#1a2240)', borderRadius: 16, padding: 20, border: '1px solid rgba(212,168,67,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(212,168,67,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color="#D4A843" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#D4A843', fontFamily: 'monospace', letterSpacing: '0.05em' }}>AI REVIEW</div>
            <div style={{ fontSize: 11, color: 'rgba(201,206,221,0.5)' }}>Powered by Claude · Optional guidance</div>
          </div>
        </div>
        <button onClick={runReview} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)', color: '#D4A843', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? <><span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #D4A843', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /></> : <><RotateCcw size={12} /> {result ? 'Re-run' : 'Run Analysis'}</>}
        </button>
      </div>

      {!result && !loading && (
        <p style={{ fontSize: 13, color: 'rgba(201,206,221,0.5)', textAlign: 'center', padding: '16px 0' }}>
          Click "Run Analysis" to get AI feedback on this listing
        </p>
      )}

      {loading && (
        <p style={{ fontSize: 13, color: 'rgba(201,206,221,0.6)', textAlign: 'center', padding: '16px 0' }}>
          Analyzing listing…
        </p>
      )}

      {result && !result.error && (
        <>
          {/* Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: result.score >= 7 ? '#4ade80' : result.score >= 5 ? '#fbbf24' : '#f87171', fontFamily: 'monospace', lineHeight: 1 }}>{result.score}</div>
              <div style={{ fontSize: 10, color: 'rgba(201,206,221,0.4)', marginTop: 2 }}>/ 10</div>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(201,206,221,0.8)', margin: 0, lineHeight: 1.5 }}>{result.summary}</p>
          </div>

          {/* Auto-flags */}
          {result.auto_flags?.length > 0 && (
            <div style={{ marginBottom: 12, padding: 12, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10 }}>
              {result.auto_flags.map((f: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#f87171', marginBottom: i < result.auto_flags.length - 1 ? 6 : 0 }}>
                  <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                </div>
              ))}
            </div>
          )}

          {/* Issues */}
          {result.issues?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'rgba(201,206,221,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 8 }}>ISSUES FOUND</div>
              {result.issues.map((issue: any, i: number) => (
                dismissed.has(i) ? null : (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: severityColor(issue.severity), flexShrink: 0, marginTop: 5 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: 'rgba(201,206,221,0.5)', marginBottom: 2 }}>{issue.field}</div>
                      <div style={{ fontSize: 12, color: 'rgba(201,206,221,0.85)' }}>{issue.message}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {!applied.has(i) && (
                        <button onClick={() => { onUseSuggestion(issue.message); setApplied(s => new Set(s).add(i)) }} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(212,168,67,0.3)', background: 'rgba(212,168,67,0.1)', color: '#D4A843', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Use
                        </button>
                      )}
                      {applied.has(i) && <span style={{ fontSize: 10, color: '#4ade80' }}>✓ Used</span>}
                      <button onClick={() => setDismiss(s => new Set(s).add(i))} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(201,206,221,0.4)', cursor: 'pointer' }}>✕</button>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: 'rgba(201,206,221,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 8 }}>SUGGESTIONS (OPTIONAL)</div>
              {result.suggestions.map((s: string, i: number) => (
                dismissed.has(100 + i) ? null : (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 6 }}>
                    <Info size={13} color="rgba(201,206,221,0.4)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: 'rgba(201,206,221,0.7)', margin: 0, flex: 1, lineHeight: 1.5 }}>{s}</p>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {!applied.has(100 + i) && (
                        <button onClick={() => { onUseSuggestion(s); setApplied(a => new Set(a).add(100 + i)) }} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(212,168,67,0.3)', background: 'rgba(212,168,67,0.1)', color: '#D4A843', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Use
                        </button>
                      )}
                      {applied.has(100 + i) && <span style={{ fontSize: 10, color: '#4ade80' }}>✓ Used</span>}
                      <button onClick={() => setDismiss(d => new Set(d).add(100 + i))} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(201,206,221,0.4)', cursor: 'pointer' }}>✕</button>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </>
      )}
      {result?.error && <p style={{ fontSize: 13, color: '#f87171', textAlign: 'center', padding: '12px 0' }}>{result.error}</p>}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────
export default function AdminPropertyDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params)
  const router = useRouter()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState<'approve' | 'reject' | 'changes_requested' | null>(null)
  const [prefill, setPrefill]   = useState('')

  useEffect(() => {
    fetch(`/api/admin/properties/${id}`)
      .then(r => r.json())
      .then(d => { setProperty(d.property); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading…</div>
  if (!property) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Property not found</div>

  const statusColors: Record<string, { bg: string; color: string }> = {
    pending_review:     { bg: '#FEF3C7', color: '#92400E' },
    approved:           { bg: '#D1FAE5', color: '#065F46' },
    rejected:           { bg: '#FEE2E2', color: '#991B1B' },
    changes_requested:  { bg: '#FEF9C3', color: '#854D0E' },
  }
  const sc = statusColors[property.review_status] || statusColors.pending_review
  const isPending = property.review_status === 'pending_review'

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 28 }}>

      {/* Back */}
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 14, marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Review Queue
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F0F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home size={22} color="#1a2240" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2240', margin: 0 }}>{property.name}</h1>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '3px 0 0' }}>{property.type} · {property.area?.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <span style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.color }}>
          {property.review_status?.replace(/_/g, ' ')}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

        {/* ── Left Column ── */}
        <div>

          {/* Photos */}
          {property.photos?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 4, borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
              <img src={property.photos[0]} alt="" style={{ width: '100%', height: 280, objectFit: 'cover' }} />
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 4 }}>
                {property.photos.slice(1, 3).map((p: string, i: number) => (
                  <img key={i} src={p} alt="" style={{ width: '100%', height: 138, objectFit: 'cover' }} />
                ))}
              </div>
            </div>
          )}

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div style={{ background: '#F4F6FA', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.15em', margin: '0 0 10px' }}>PROPERTY INFO</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1a2240' }}><Bed size={14} color="#9CA3AF" /> {property.bedrooms || '—'} bedrooms</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1a2240' }}><Bath size={14} color="#9CA3AF" /> {property.bathrooms || '—'} bathrooms</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1a2240' }}><Users size={14} color="#9CA3AF" /> Max {property.max_guests || '—'} guests</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1a2240' }}><MapPin size={14} color="#9CA3AF" /> {property.area?.replace(/_/g, ' ') || '—'}</div>
                {property.size_sqm && <div style={{ fontSize: 13, color: '#1a2240' }}>📐 {property.size_sqm} sqm</div>}
              </div>
            </div>
            <div style={{ background: '#F4F6FA', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.15em', margin: '0 0 10px' }}>PRICING</p>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#D4A843', marginBottom: 6 }}>EGP {property.price_per_night?.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 400, color: '#9CA3AF' }}>/night</span></div>
              {property.price_per_week  && <div style={{ fontSize: 12, color: '#6B7280' }}>EGP {property.price_per_week?.toLocaleString()} / week</div>}
              {property.price_per_month && <div style={{ fontSize: 12, color: '#6B7280' }}>EGP {property.price_per_month?.toLocaleString()} / month</div>}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div style={{ background: '#F4F6FA', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.15em', margin: '0 0 10px' }}>DESCRIPTION</p>
              <p style={{ fontSize: 14, color: '#1a2240', lineHeight: 1.75, margin: 0 }}>{property.description}</p>
            </div>
          )}

          {/* Owner */}
          {property.owner && (
            <div style={{ background: '#F4F6FA', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.15em', margin: '0 0 10px' }}>OWNER</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#1a2240', margin: '0 0 4px' }}>{property.owner.first_name} {property.owner.last_name}</p>
              {property.owner.email && <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 3px' }}>✉️ {property.owner.email}</p>}
              {property.owner.phone && <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>📞 {property.owner.phone}</p>}
            </div>
          )}

          {/* Submission date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#9CA3AF' }}>
            <Calendar size={13} />
            Submitted {new Date(property.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* ── Right Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Action buttons — only if pending */}
          {isPending && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20 }}>
              <p style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.15em', margin: '0 0 14px' }}>MODERATION DECISION</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => setModal('approve')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', borderRadius: 10, border: 'none', background: 'rgba(74,222,128,0.12)', color: '#16a34a', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  <CheckCircle2 size={18} /> Approve Listing
                </button>
                <button onClick={() => setModal('changes_requested')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', borderRadius: 10, border: 'none', background: 'rgba(251,191,36,0.12)', color: '#b45309', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  <MessageSquare size={18} /> Request Changes
                </button>
                <button onClick={() => setModal('reject')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', borderRadius: 10, border: 'none', background: 'rgba(248,113,113,0.12)', color: '#b91c1c', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  <XCircle size={18} /> Reject Listing
                </button>
              </div>
            </div>
          )}

          {/* AI Review Panel */}
          <AiReviewPanel
            listingId={id}
            listingType="property"
            onUseSuggestion={(text) => setPrefill(text)}
          />

          {/* Prefill hint */}
          {prefill && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: 14 }}>
              <p style={{ fontSize: 11, color: '#92400E', fontFamily: 'monospace', letterSpacing: '0.1em', margin: '0 0 6px' }}>AI SUGGESTION COPIED</p>
              <p style={{ fontSize: 12, color: '#78350F', margin: 0, lineHeight: 1.5 }}>{prefill}</p>
              <p style={{ fontSize: 11, color: '#B45309', margin: '8px 0 0' }}>This will be pre-filled when you click "Request Changes"</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <ModerationModal
          action={modal}
          listing={{ ...property, type: 'property' }}
          locale={locale}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); router.push(`/${locale}/admin/review`) }}
        />
      )}
    </div>
  )
}
