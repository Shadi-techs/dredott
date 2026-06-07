'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react'

export default function AdminNotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchNotifications() }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications/list')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch {}
    setLoading(false)
  }

  const markRead = async (id: string) => {
    await fetch('/api/admin/notifications/mark-read', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id }) })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    await fetch('/api/admin/notifications/read-all', { method: 'POST' })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotif = async (id: string) => {
    await fetch('/api/admin/notifications/' + id, { method: 'DELETE' })
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#1a2240', margin: 0 }}>Notifications</h1>
          {unreadCount > 0 && (
            <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#0e1428', color: '#D4A843', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>
          <Bell size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map(n => (
            <div key={n.id} style={{ background: n.read ? '#fff' : '#FBF0D0', border: '1px solid', borderColor: n.read ? '#e5e7eb' : '#D4A843', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'transparent' : '#D4A843', marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2240', margin: '0 0 4px' }}>{n.title}</p>
                <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 8px' }}>{n.body}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, fontFamily: 'monospace' }}>
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {n.link && (
                  <button onClick={() => router.push('/' + locale + n.link)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#6B7280' }}>
                    <ExternalLink size={13} />
                  </button>
                )}
                {!n.read && (
                  <button onClick={() => markRead(n.id)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#6B7280' }}>
                    <Check size={13} />
                  </button>
                )}
                <button onClick={() => deleteNotif(n.id)} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#f87171' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
