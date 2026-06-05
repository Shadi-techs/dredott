'use client'
import { use, useState, useEffect } from 'react'
import { Plus, Link2, Home, Car as CarIcon, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { Card } from '@/components/owner/Card'
import { Button } from '@/components/owner/Button'
import { ScreenHeader } from '@/components/owner/ScreenHeader'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Listing {
  id: string
  title: string
  kind: 'property' | 'car'
  price: number
}

interface BlockedSpan {
  id: string
  start: Date
  end: Date
  label: string
  type: 'booking' | 'blocked'
  reason?: string
}

export default function CalendarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { t, d } = useOwnerTheme()

  const [listings, setListings]   = useState<Listing[]>([])
  const [spans, setSpans]         = useState<Record<string, BlockedSpan[]>>({})
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd]     = useState('')
  const [blockReason, setBlockReason] = useState('booked')
  const [saving, setSaving]         = useState(false)

  const now = new Date()
  const [viewYear, setViewYear]   = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const today = now.getDate()
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

  useEffect(() => { fetchData() }, [viewMonth, viewYear])

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [propsRes, carsRes] = await Promise.all([
      supabase.from('properties').select('id, name').eq('owner_user_id', user.id).eq('status', 'available'),
      supabase.from('cars').select('id, brand, model, price_per_day').eq('owner_id', user.id).eq('status', 'available'),
    ])

    const props: Listing[] = (propsRes.data || []).map(p => ({ id: p.id, title: p.name, kind: 'property', price: 0 }))
    const cars: Listing[]  = (carsRes.data || []).map(c => ({ id: c.id, title: `${c.brand} ${c.model}`, kind: 'car', price: c.price_per_day || 0 }))
    const allListings = [...props, ...cars]
    setListings(allListings)

    const monthStart = new Date(viewYear, viewMonth, 1).toISOString().split('T')[0]
    const monthEnd   = new Date(viewYear, viewMonth + 1, 0).toISOString().split('T')[0]

    const propIds = props.map(p => p.id)
    const carIds  = cars.map(c => c.id)

    const spansMap: Record<string, BlockedSpan[]> = {}

    if (propIds.length > 0) {
      const { data: bookings } = await supabase.from('bookings')
        .select('id, property_id, check_in, check_out, guest_id')
        .in('property_id', propIds)
        .gte('check_out', monthStart)
        .lte('check_in', monthEnd)
        .eq('status', 'confirmed')

      for (const b of bookings || []) {
        if (!spansMap[b.property_id]) spansMap[b.property_id] = []
        spansMap[b.property_id].push({
          id: b.id, start: new Date(b.check_in), end: new Date(b.check_out),
          label: 'Booked', type: 'booking'
        })
      }
    }

    const allIds = [...propIds, ...carIds]
    if (allIds.length > 0) {
      const { data: blocked } = await supabase.from('blocked_dates')
        .select('*')
        .in('entity_id', allIds)
        .gte('end_date', monthStart)
        .lte('start_date', monthEnd)

      for (const b of blocked || []) {
        if (!spansMap[b.entity_id]) spansMap[b.entity_id] = []
        spansMap[b.entity_id].push({
          id: b.id, start: new Date(b.start_date), end: new Date(b.end_date),
          label: b.reason || 'Blocked', type: 'blocked', reason: b.reason
        })
      }
    }

    setSpans(spansMap)
    setLoading(false)
  }

  const handleBlockDates = async () => {
    if (!selectedListing || !blockStart || !blockEnd) return
    setSaving(true)
    await supabase.from('blocked_dates').insert({
      entity_type: selectedListing.kind,
      entity_id: selectedListing.id,
      start_date: blockStart,
      end_date: blockEnd,
      reason: blockReason,
    })
    setSaving(false)
    setModalOpen(false)
    setBlockStart(''); setBlockEnd(''); setBlockReason('booked')
    fetchData()
  }

  const handleDeleteBlock = async (blockId: string) => {
    await supabase.from('blocked_dates').delete().eq('id', blockId)
    fetchData()
  }

  const getSpanStyle = (span: BlockedSpan) => {
    const startDay = Math.max(1, span.start.getDate())
    const endDay   = Math.min(daysInMonth, span.end.getDate())
    const left  = ((startDay - 1) / daysInMonth) * 100
    const width = ((endDay - startDay + 1) / daysInMonth) * 100
    return { left: `${left}%`, width: `${width}%` }
  }

  return (
    <div style={{ padding: d.pad }}>
      <ScreenHeader
        kicker="Calendar"
        title="Calendar"
        sub="Manage availability across all your listings."
        actions={
          <>
            <Button variant="ghost" icon={Link2}>iCal sync</Button>
            <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>Block dates</Button>
          </>
        }
      />

      {/* Month Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1) } else setViewMonth(m => m-1) }}
          style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: t.text }}>
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: t.text, minWidth: 140, textAlign: 'center' }}>
          {monthNames[viewMonth]} {viewYear}
        </span>
        <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1) } else setViewMonth(m => m+1) }}
          style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: t.text }}>
          <ChevronRight size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: t.textMuted }}>Loading...</div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: t.textMuted }}>No active listings found.</div>
      ) : (
        <Card padding={0} style={{ overflow: 'auto' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}`, background: t.bg, minWidth: 800 }}>
            <div style={{ width: 200, padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textFaint, flexShrink: 0, borderRight: `1px solid ${t.border}` }}>
              {monthNames[viewMonth]} {viewYear}
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${daysInMonth}, 1fr)` }}>
              {days.map(day => (
                <div key={day} style={{ padding: '10px 0', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 10, color: isCurrentMonth && day === today ? t.accent : t.textFaint, fontWeight: isCurrentMonth && day === today ? 700 : 500, background: isCurrentMonth && day === today ? t.accentSoft : 'transparent', borderRight: `1px solid ${t.borderSoft}` }}>
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Listing Rows */}
          {listings.map((l, idx) => (
            <div key={l.id} style={{ display: 'flex', borderTop: idx === 0 ? 'none' : `1px solid ${t.borderSoft}`, minWidth: 800 }}>
              <div style={{ width: 200, padding: '14px', flexShrink: 0, borderRight: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                {l.kind === 'car' ? <CarIcon size={14} color={t.textMuted} /> : <Home size={14} color={t.textMuted} />}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                  <div style={{ fontSize: 10, color: t.textFaint, fontFamily: 'var(--mono)' }}>{l.kind === 'car' ? 'Car' : 'Property'}</div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${daysInMonth}, 1fr)`, position: 'relative', minHeight: 56 }}>
                {days.map(day => (
                  <div key={day} style={{ borderRight: `1px solid ${t.borderSoft}`, background: isCurrentMonth && day === today ? t.accentSoft : 'transparent' }} />
                ))}
                {(spans[l.id] || []).map((sp, i) => {
                  const style = getSpanStyle(sp)
                  return (
                    <div key={i} style={{ position: 'absolute', top: 10, bottom: 10, left: style.left, width: style.width, background: sp.type === 'booking' ? t.accent : 'rgba(248,113,113,0.8)', color: '#fff', borderRadius: 6, padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{sp.label}</span>
                      {sp.type === 'blocked' && (
                        <button onClick={() => handleDeleteBlock(sp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '0 0 0 4px', flexShrink: 0 }}>
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Block Dates Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: t.surface, borderRadius: 16, padding: 24, width: 400, border: `1px solid ${t.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: t.text }}>Block Dates</span>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted }}><X size={18} /></button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: t.textMuted, fontFamily: 'var(--mono)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>LISTING</label>
              <select value={selectedListing?.id || ''} onChange={e => setSelectedListing(listings.find(l => l.id === e.target.value) || null)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: 13 }}>
                <option value="">Select listing...</option>
                {listings.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: t.textMuted, fontFamily: 'var(--mono)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>FROM</label>
                <input type="date" value={blockStart} onChange={e => setBlockStart(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: t.textMuted, fontFamily: 'var(--mono)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>TO</label>
                <input type="date" value={blockEnd} onChange={e => setBlockEnd(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: 13 }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: t.textMuted, fontFamily: 'var(--mono)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>REASON</label>
              <select value={blockReason} onChange={e => setBlockReason(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: 13 }}>
                <option value="booked">Booked externally</option>
                <option value="maintenance">Maintenance</option>
                <option value="personal">Personal use</option>
              </select>
            </div>

            <Button variant="primary" onClick={handleBlockDates} disabled={saving || !selectedListing || !blockStart || !blockEnd} style={{ width: '100%' }}>
              {saving ? 'Saving...' : 'Block Dates'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
