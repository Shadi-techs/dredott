'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, RefreshCw, Star, Trash2, Reply, Inbox, Send, AlertCircle } from 'lucide-react'

export default function AdminEmailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [activeFolder, setActiveFolder] = useState('inbox')

  useEffect(() => { fetchEmails() }, [])

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/email')
      if (res.ok) {
        const data = await res.json()
        setEmails(data.emails || [])
        setConfigured(data.configured || false)
      }
    } catch {}
    setLoading(false)
  }

  const FOLDERS = [
    { key: 'inbox',  label: 'Inbox',  icon: Inbox },
    { key: 'sent',   label: 'Sent',   icon: Send  },
  ]

  return (
    <div style={{ display: 'flex', height: '100%', background: '#F4F6FA' }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: '#fff', borderRight: '1px solid #e5e7eb', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #e5e7eb', marginBottom: 8 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', color: '#9CA3AF', fontFamily: 'monospace', margin: '0 0 4px' }}>EMAIL · UNIFIED</p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a2240', margin: 0 }}>Mail</h2>
        </div>

        {FOLDERS.map(f => {
          const Icon = f.icon
          const isActive = activeFolder === f.key
          return (
            <button key={f.key} onClick={() => setActiveFolder(f.key)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', background: isActive ? 'rgba(14,20,40,0.06)' : 'transparent', border: 'none', cursor: 'pointer', borderLeft: isActive ? '3px solid #0e1428' : '3px solid transparent' }}>
              <Icon size={14} color={isActive ? '#0e1428' : '#6B7280'} />
              <span style={{ fontSize: 13, color: isActive ? '#0e1428' : '#6B7280', fontWeight: isActive ? 600 : 400 }}>{f.label}</span>
            </button>
          )
        })}
      </div>

      {/* Email List */}
      <div style={{ width: 320, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a2240' }}>
            {activeFolder === 'inbox' ? 'Inbox' : 'Sent'}
          </span>
          <button onClick={fetchEmails} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
            <RefreshCw size={14} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!configured ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <AlertCircle size={32} style={{ color: '#D4A843', marginBottom: 12 }} />
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 8px' }}>Email not configured yet</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>Add IMAP credentials to Vercel environment variables to connect your email.</p>
            </div>
          ) : loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
          ) : emails.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <Mail size={32} style={{ opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>No emails</p>
            </div>
          ) : (
            emails.map(email => (
              <div key={email.id} onClick={() => setSelected(email)} style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: selected?.id === email.id ? '#F4F6FA' : email.read ? '#fff' : '#FFFBEB', borderLeft: email.read ? 'none' : '3px solid #D4A843' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: email.read ? 400 : 700, color: '#1a2240' }}>{email.from}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{email.date}</span>
                </div>
                <p style={{ fontSize: 13, color: '#1a2240', margin: '0 0 4px', fontWeight: email.read ? 400 : 600 }}>{email.subject}</p>
                <p style={{ fontSize: 12, color: '#6B7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.preview}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Email View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selected ? (
          <>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a2240', margin: '0 0 4px' }}>{selected.subject}</h3>
                <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>From: {selected.from} · {selected.date}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#0e1428', color: '#D4A843', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                  <Reply size={13} /> Reply
                </button>
                <button style={{ padding: '7px 10px', background: 'none', border: '1px solid #fee2e2', borderRadius: 8, cursor: 'pointer', color: '#f87171' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
                <pre style={{ fontSize: 14, color: '#1a2240', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{selected.body}</pre>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <Mail size={48} style={{ opacity: 0.15 }} />
            <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>Select an email to read</p>
          </div>
        )}
      </div>
    </div>
  )
}
