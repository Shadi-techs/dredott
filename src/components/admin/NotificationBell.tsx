'use client'

import { useEffect, useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Bell, X } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props { locale?: string }

export default function NotificationBell({ locale = 'en' }: Props) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [open, setOpen]                   = useState(false)
  const ref                               = useRef<HTMLDivElement>(null)

  // Simple polling every 30s — no Realtime needed
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data)
  }

  const markRead = async (id: string) => {
    await supabase.from('admin_notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    await supabase.from('admin_notifications').update({ read: true }).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unread = notifications.filter(n => !n.read).length

  const timeAgo = (date: string) => {
    const diff  = Date.now() - new Date(date).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days  = Math.floor(diff / 86400000)
    if (mins < 1)   return 'just now'
    if (mins < 60)  return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: unread > 0 ? '#D4A843' : '#7a8aaa' }}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            width: 16, height: 16, borderRadius: '50%',
            background: '#ef4444', color: '#fff',
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, zIndex: 100,
          width: 320, background: '#1a2240',
          border: '1px solid rgba(212,168,67,0.15)',
          borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#FBF0D0' }}>
              Notifications {unread > 0 && <span style={{ color: '#ef4444' }}>({unread})</span>}
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {unread > 0 && (
                <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D4A843', fontSize: 11 }}>
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a8aaa' }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#7a8aaa', fontSize: 13 }}>
                No notifications yet
              </div>
            ) : notifications.map(n => (
              <div
                key={n.id}
                onClick={() => { markRead(n.id); if (n.link) window.location.href = n.link }}
                style={{
                  display: 'flex', gap: 10, padding: '10px 14px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: n.read ? 'transparent' : 'rgba(212,168,67,0.04)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: n.read ? 400 : 600, color: n.read ? '#7a8aaa' : '#FBF0D0', marginBottom: 2, lineHeight: 1.4 }}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p style={{ fontSize: 11, color: '#7a8aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.body}
                    </p>
                  )}
                  <p style={{ fontSize: 10, color: '#7a8aaa', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                    {timeAgo(n.created_at)}
                  </p>
                </div>
                {!n.read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4A843', flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <a href={`/${locale}/admin/notifications`} style={{ fontSize: 12, color: '#D4A843', textDecoration: 'none' }}>
              View all →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}