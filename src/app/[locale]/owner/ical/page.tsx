'use client'
// src/app/[locale]/owner/ical/page.tsx
// iCal Calendar Synchronization with external platforms

import { use, useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import {
  Link2, Plus, Copy, RefreshCw, Check, X,
  ExternalLink, Calendar as CalIcon, Download, Upload
} from 'lucide-react'

import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { DENSITY } from '@/lib/owner/theme'
import { Card } from '@/components/owner/Card'
import { Button } from '@/components/owner/Button'
import { ScreenHeader } from '@/components/owner/ScreenHeader'
import { getStrings } from '@/lib/owner/strings'

// ============================================
// TYPES
// ============================================

interface CalendarSync {
  id: string
  property_id: string
  platform: string
  ical_url: string
  sync_direction: 'import' | 'export' | 'both'
  auto_sync: boolean
  sync_interval_hours: number
  last_synced_at: string | null
  status: string
  created_at: string
  property: {
    name: string
  }
}

// ============================================
// ADD SYNC MODAL
// ============================================

function AddSyncModal({
  locale,
  properties,
  onClose,
  onAdded,
}: {
  locale: string
  properties: any[]
  onClose: () => void
  onAdded: () => void
}) {
  const { t, d } = useOwnerTheme()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [form, setForm] = useState({
    property_id: '',
    platform: 'airbnb',
    ical_url: '',
    sync_direction: 'import' as 'import' | 'export' | 'both',
    auto_sync: true,
    sync_interval_hours: 6,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.property_id || !form.ical_url) {
      setError('Please select a property and enter iCal URL')
      return
    }

    setSubmitting(true)
    setError('')

    const { error: insertError } = await supabase.from('calendar_syncs').insert({
      property_id: form.property_id,
      platform: form.platform,
      ical_url: form.ical_url,
      sync_direction: form.sync_direction,
      auto_sync: form.auto_sync,
      sync_interval_hours: form.sync_interval_hours,
      status: 'active',
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      onAdded()
      onClose()
    }
    setSubmitting(false)
  }

  const platforms = [
    { value: 'airbnb', label: 'Airbnb', icon: '🏠', color: '#FF5A5F' },
    { value: 'booking', label: 'Booking.com', icon: '🌐', color: '#003580' },
    { value: 'vrbo', label: 'VRBO', icon: '🏖️', color: '#1A1A1A' },
    { value: 'google', label: 'Google Calendar', icon: '📅', color: '#4285F4' },
    { value: 'other', label: 'Other', icon: '🔗', color: '#7a8aaa' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 40,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}>
        <div style={{
          background: t.surface,
          borderRadius: 16,
          border: `1px solid ${t.border}`,
          width: '100%',
          maxWidth: 520,
          padding: 24,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              color: t.text,
            }}>
              Add Calendar Sync
            </h3>
            <button onClick={onClose} style={{
              background: 'none',
              border: 'none',
              color: t.textMuted,
              cursor: 'pointer',
              padding: 4,
            }}>
              <X size={20} />
            </button>
          </div>

          {error && (
            <div style={{
              padding: 12,
              borderRadius: 8,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444',
              fontSize: 13,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Property */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}>
                Property *
              </label>
              <select
                value={form.property_id}
                onChange={(e) => setForm({ ...form, property_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: t.bg,
                  color: t.text,
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              >
                <option value="">Select a property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Platform */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}>
                Platform
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
              }}>
                {platforms.map((platform) => (
                  <button
                    key={platform.value}
                    onClick={() => setForm({ ...form, platform: platform.value })}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 8,
                      border: `1px solid ${form.platform === platform.value ? platform.color : t.border}`,
                      background: form.platform === platform.value ? `${platform.color}15` : t.bg,
                      color: form.platform === platform.value ? platform.color : t.text,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{platform.icon}</span>
                    <span>{platform.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* iCal URL */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}>
                iCal URL *
              </label>
              <input
                type="url"
                value={form.ical_url}
                onChange={(e) => setForm({ ...form, ical_url: e.target.value })}
                placeholder="https://www.airbnb.com/calendar/ical/..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: t.bg,
                  color: t.text,
                  fontSize: 13,
                  fontFamily: 'var(--mono)',
                }}
              />
              <div style={{
                fontSize: 11,
                color: t.textMuted,
                marginTop: 4,
              }}>
                Paste the iCal link from your platform's calendar settings
              </div>
            </div>

            {/* Sync Direction */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}>
                Sync Direction
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'import' as const, label: tx.importOnly, icon: Download },
                  { value: 'export' as const, label: tx.exportOnly, icon: Upload },
                  { value: 'both' as const, label: tx.bothWays, icon: RefreshCw },
                ].map((dir) => {
                  const Icon = dir.icon
                  return (
                    <button
                      key={dir.value}
                      onClick={() => setForm({ ...form, sync_direction: dir.value })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 8,
                        border: `1px solid ${form.sync_direction === dir.value ? t.accent : t.border}`,
                        background: form.sync_direction === dir.value ? t.accentSoft : t.bg,
                        color: form.sync_direction === dir.value ? t.accent : t.text,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <Icon size={14} />
                      {dir.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Auto Sync */}
            <div style={{
              padding: 12,
              background: t.bg,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.text,
                  marginBottom: 2,
                }}>
                  Auto-sync
                </div>
                <div style={{ fontSize: 11, color: t.textMuted }}>
                  Automatically sync every {form.sync_interval_hours} hours
                </div>
              </div>
              <button
                onClick={() => setForm({ ...form, auto_sync: !form.auto_sync })}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: form.auto_sync ? t.success : t.border,
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 3,
                  left: form.auto_sync ? 23 : 3,
                  transition: 'all 0.2s',
                }} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              onClick={onClose}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: 'transparent',
                color: t.textMuted,
                fontSize: 13,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: submitting ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: t.accentDark,
                color: t.accentInk,
                fontSize: 13,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Adding...' : (
                <>
                  <Link2 size={16} />
                  Add Sync
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================
// MAIN PAGE
// ============================================
export default function ICalSyncPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const tx = getStrings(locale as any)
  const { t, d } = useOwnerTheme()
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [syncs, setSyncs] = useState<CalendarSync[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  useEffect(() => {
    void fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push(`/${locale}/login`)
      return
    }

    // Get properties
    const { data: propsData } = await supabase
      .from('properties')
      .select('id, name')
      .eq('owner_user_id', session.user.id)
      .eq('status', 'live')

    setProperties(propsData || [])

    // Get syncs
    const propertyIds = (propsData || []).map(p => p.id)
    if (propertyIds.length > 0) {
      const { data: syncsData } = await supabase
        .from('calendar_syncs')
        .select(`
          *,
          property:properties(name)
        `)
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })

      setSyncs(syncsData || [])
    }

    setLoading(false)
  }

  async function handleSyncNow(syncId: string) {
    setSyncing(syncId)
    // TODO: Implement actual sync logic
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await supabase
      .from('calendar_syncs')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', syncId)

    await fetchData()
    setSyncing(null)
  }

  async function handleCopyUrl(url: string) {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const platformColors: Record<string, string> = {
    airbnb: '#FF5A5F',
    booking: '#003580',
    vrbo: '#1A1A1A',
    google: '#4285F4',
    other: '#7a8aaa',
  }

  const platformIcons: Record<string, string> = {
    airbnb: '🏠',
    booking: '🌐',
    vrbo: '🏖️',
    google: '📅',
    other: '🔗',
  }

  if (loading) {
    return (
      <div style={{ padding: d.pad, display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
        <div style={{
          width: 32,
          height: 32,
          border: `3px solid ${t.border}`,
          borderTopColor: t.accent,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <div style={{ padding: d.pad }}>
      <ScreenHeader
        kicker="iCal Sync"
        title="Calendar Synchronization"
        sub="Keep your calendars in sync across all platforms"
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add Calendar Sync
          </Button>
        }
      />

      {/* Info Card */}
      <Card style={{
        marginBottom: 24,
        background: `${t.accent}08`,
        borderColor: `${t.accent}30`,
      }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <CalIcon size={20} color={t.accent} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: t.text,
              marginBottom: 4,
            }}>
              How iCal sync works
            </div>
            <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.6 }}>
              Import bookings from Airbnb, Booking.com, VRBO, and other platforms to prevent double bookings.
              Export your DREDOTT calendar to external platforms to keep them updated automatically.
            </div>
          </div>
        </div>
      </Card>

      {/* Syncs List */}
      {syncs.length === 0 ? (
        <Card style={{ padding: 60, textAlign: 'center' }}>
          <Link2 size={48} color={t.textFaint} style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: 15, color: t.textMuted, marginBottom: 8 }}>
            No calendar syncs yet
          </div>
          <div style={{ fontSize: 13, color: t.textFaint, marginBottom: 20 }}>
            Connect your external calendars to prevent double bookings
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add Your First Sync
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {syncs.map((sync) => (
            <Card key={sync.id}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: `${platformColors[sync.platform] || t.border}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  flexShrink: 0,
                }}>
                  {platformIcons[sync.platform] || '🔗'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4,
                  }}>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: t.text,
                      textTransform: 'capitalize',
                    }}>
                      {sync.platform}
                    </span>
                    <span style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: sync.auto_sync ? `${t.success}20` : `${t.textMuted}20`,
                      color: sync.auto_sync ? t.success : t.textMuted,
                      fontFamily: 'var(--mono)',
                    }}>
                      {sync.auto_sync ? 'Auto' : 'Manual'}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: t.textMuted,
                    marginBottom: 6,
                  }}>
                    {sync.property?.name}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: t.textFaint,
                    fontFamily: 'var(--mono)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {sync.ical_url}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  alignItems: 'flex-end',
                  flexShrink: 0,
                }}>
                  {sync.last_synced_at && (
                    <div style={{
                      fontSize: 11,
                      color: t.textMuted,
                      fontFamily: 'var(--mono)',
                    }}>
                      Last: {new Date(sync.last_synced_at).toLocaleString(locale, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleCopyUrl(sync.ical_url)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: `1px solid ${t.border}`,
                        background: copiedUrl === sync.ical_url ? t.success : t.surface,
                        color: copiedUrl === sync.ical_url ? '#fff' : t.text,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s',
                      }}
                    >
                      {copiedUrl === sync.ical_url ? (
                        <>
                          <Check size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleSyncNow(sync.id)}
                      disabled={syncing === sync.id}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: t.accentDark,
                        color: t.accentInk,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: syncing === sync.id ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        opacity: syncing === sync.id ? 0.7 : 1,
                      }}
                    >
                      {syncing === sync.id ? (
                        <>
                          <div style={{
                            width: 14,
                            height: 14,
                            border: `2px solid ${t.accentInk}40`,
                            borderTopColor: t.accentInk,
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                          }} />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={14} />
                          Sync Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddSyncModal
          locale={locale}
          properties={properties}
          onClose={() => setShowAddModal(false)}
          onAdded={fetchData}
        />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
