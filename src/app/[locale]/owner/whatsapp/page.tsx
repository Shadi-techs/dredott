'use client'
// src/app/[locale]/owner/whatsapp/page.tsx
// WhatsApp message templates for guest communication

import { use, useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import {
  MessageCircle, Plus, X, Copy, Check, Send,
  Calendar, Star, Gift, AlertCircle, Edit2
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

interface WhatsAppTemplate {
  id: string
  name: string
  category: string
  message: string
  variables: string[]
  is_active: boolean
  usage_count: number
  created_at: string
}

type TemplateCategory = 'booking_confirmation' | 'check_in_reminder' | 'check_out_reminder' | 'review_request' | 'special_offer' | 'custom'

// ============================================
// CREATE/EDIT TEMPLATE MODAL
// ============================================

function TemplateModal({
  locale,
  template,
  onClose,
  onSave,
}: {
  locale: string
  template?: WhatsAppTemplate
  onClose: () => void
  onSave: () => void
}) {
  const { t, d } = useOwnerTheme()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [form, setForm] = useState({
    name: template?.name || '',
    category: template?.category || 'booking_confirmation',
    message: template?.message || '',
    is_active: template?.is_active ?? true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.name || !form.message) {
      setError('Please fill all required fields')
      return
    }

    setSubmitting(true)
    setError('')

    // Extract variables from message (e.g., {guest_name}, {property_name})
    const variables = (form.message.match(/\{([^}]+)\}/g) || []).map(v => v.slice(1, -1))

    if (template) {
      // Update existing
      const { error: updateError } = await supabase
        .from('whatsapp_templates')
        .update({
          name: form.name,
          category: form.category,
          message: form.message,
          variables,
          is_active: form.is_active,
        })
        .eq('id', template.id)

      if (updateError) {
        setError(updateError.message)
      } else {
        onSave()
        onClose()
      }
    } else {
      // Create new
      const { error: insertError } = await supabase
        .from('whatsapp_templates')
        .insert({
          name: form.name,
          category: form.category,
          message: form.message,
          variables,
          is_active: form.is_active,
          usage_count: 0,
        })

      if (insertError) {
        setError(insertError.message)
      } else {
        onSave()
        onClose()
      }
    }

    setSubmitting(false)
  }

  const categories = [
    { value: 'booking_confirmation', label: 'Booking Confirmation', icon: Check },
    { value: 'check_in_reminder', label: 'Check-in Reminder', icon: Calendar },
    { value: 'check_out_reminder', label: 'Check-out Reminder', icon: Calendar },
    { value: 'review_request', label: 'Review Request', icon: Star },
    { value: 'special_offer', label: 'Special Offer', icon: Gift },
    { value: 'custom', label: 'Custom', icon: MessageCircle },
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
          maxWidth: 560,
          padding: 24,
          maxHeight: '90vh',
          overflow: 'auto',
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
              {template ? tx.edit + " Template" : tx.createTemplate}
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
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}>
                Template name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Welcome message"
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
              />
            </div>

            {/* Category */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}>
                Category
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8,
              }}>
                {categories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setForm({ ...form, category: cat.value })}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: `1px solid ${form.category === cat.value ? t.accent : t.border}`,
                        background: form.category === cat.value ? t.accentSoft : t.bg,
                        color: form.category === cat.value ? t.accent : t.text,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Icon size={14} />
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Message */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}>
                Message *
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Hello {guest_name}! Your booking at {property_name} is confirmed..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: t.bg,
                  color: t.text,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
              <div style={{
                fontSize: 11,
                color: t.textMuted,
                marginTop: 4,
              }}>
                Use variables: {'{guest_name}'}, {'{property_name}'}, {'{check_in}'}, {'{check_out}'}, {'{total_amount}'}
              </div>
            </div>

            {/* Preview */}
            <div style={{
              padding: 16,
              background: `${t.success}08`,
              border: `1px solid ${t.success}30`,
              borderRadius: 10,
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: t.success,
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <MessageCircle size={14} />
                Preview (with sample data)
              </div>
              <div style={{
                fontSize: 13,
                color: t.text,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {form.message
                  .replace(/\{guest_name\}/g, 'Sarah Johnson')
                  .replace(/\{property_name\}/g, 'Marina View Loft')
                  .replace(/\{check_in\}/g, 'Dec 25, 2026')
                  .replace(/\{check_out\}/g, 'Dec 28, 2026')
                  .replace(/\{total_amount\}/g, 'AED 2,400')}
              </div>
            </div>

            {/* Active toggle */}
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
                  Active
                </div>
                <div style={{ fontSize: 11, color: t.textMuted }}>
                  Make this template available for use
                </div>
              </div>
              <button
                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: form.is_active ? t.success : t.border,
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
                  left: form.is_active ? 23 : 3,
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
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Saving...' : template ? 'Update Template' : tx.createTemplate}
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

export default function WhatsAppPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { t, d } = useOwnerTheme()
  const router = useRouter()
  const tx = getStrings(locale as any)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | undefined>()
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    void fetchTemplates()
  }, [])

  async function fetchTemplates() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push(`/${locale}/login`)
      return
    }

    const { data } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false })

    setTemplates(data || [])
    setLoading(false)
  }

  async function handleCopyMessage(message: string, id: string) {
    await navigator.clipboard.writeText(message)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const categoryIcons: Record<string, any> = {
    booking_confirmation: Check,
    check_in_reminder: Calendar,
    check_out_reminder: Calendar,
    review_request: Star,
    special_offer: Gift,
    custom: MessageCircle,
  }

  const categoryColors: Record<string, string> = {
    booking_confirmation: t.success,
    check_in_reminder: t.accent,
    check_out_reminder: '#f59e0b',
    review_request: '#8b5cf6',
    special_offer: '#ec4899',
    custom: t.textMuted,
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
        kicker="WhatsApp"
        title="Message Templates"
        sub="Automate guest communication with pre-built templates"
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setEditingTemplate(undefined)
              setShowModal(true)
            }}
          >
            Create Template
          </Button>
        }
      />

      {/* Info Card */}
      <Card style={{
        marginBottom: 24,
        background: `${t.success}08`,
        borderColor: `${t.success}30`,
      }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <MessageCircle size={20} color={t.success} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: t.text,
              marginBottom: 4,
            }}>
              WhatsApp Business Integration
            </div>
            <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.6 }}>
              Send automated messages to guests at key moments in their booking journey.
              Templates support variables like guest name, property details, and booking dates.
            </div>
          </div>
        </div>
      </Card>

      {/* Templates */}
      {templates.length === 0 ? (
        <Card style={{ padding: 60, textAlign: 'center' }}>
          <MessageCircle size={48} color={t.textFaint} style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: 15, color: t.textMuted, marginBottom: 8 }}>
            No templates yet
          </div>
          <div style={{ fontSize: 13, color: t.textFaint, marginBottom: 20 }}>
            Create your first WhatsApp template to start automating guest communication
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setEditingTemplate(undefined)
              setShowModal(true)
            }}
          >
            Create Template
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {templates.map((template) => {
            const Icon = categoryIcons[template.category] || MessageCircle
            const color = categoryColors[template.category] || t.textMuted

            return (
              <Card key={template.id}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={20} color={color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 6,
                    }}>
                      <span style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: t.text,
                      }}>
                        {template.name}
                      </span>
                      <span style={{
                        fontSize: 10,
                        padding: '3px 8px',
                        borderRadius: 12,
                        background: template.is_active ? `${t.success}20` : `${t.textMuted}20`,
                        color: template.is_active ? t.success : t.textMuted,
                        fontFamily: 'var(--mono)',
                        textTransform: 'uppercase',
                      }}>
                        {template.is_active ? tx.active : 'Inactive'}
                      </span>
                      {template.usage_count > 0 && (
                        <span style={{
                          fontSize: 11,
                          color: t.textMuted,
                          fontFamily: 'var(--mono)',
                        }}>
                          Used {template.usage_count}× times
                        </span>
                      )}
                    </div>

                    <div style={{
                      fontSize: 13,
                      color: t.text,
                      lineHeight: 1.6,
                      marginBottom: 8,
                      maxWidth: 600,
                    }}>
                      {template.message}
                    </div>

                    {template.variables.length > 0 && (
                      <div style={{
                        display: 'flex',
                        gap: 6,
                        flexWrap: 'wrap',
                      }}>
                        {template.variables.map((variable) => (
                          <span
                            key={variable}
                            style={{
                              fontSize: 10,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: t.bg,
                              color: t.accent,
                              fontFamily: 'var(--mono)',
                            }}
                          >
                            {'{' + variable + '}'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: 8,
                    flexShrink: 0,
                  }}>
                    <button
                      onClick={() => handleCopyMessage(template.message, template.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: `1px solid ${t.border}`,
                        background: copiedId === template.id ? t.success : t.surface,
                        color: copiedId === template.id ? '#fff' : t.text,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {copiedId === template.id ? (
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
                      onClick={() => {
                        setEditingTemplate(template)
                        setShowModal(true)
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: t.accent,
                        color: t.accentInk,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TemplateModal
          template={editingTemplate}
          onClose={() => setShowModal(false)}
          onSave={fetchTemplates}
        />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
