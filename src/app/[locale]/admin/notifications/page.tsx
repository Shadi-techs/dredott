'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, Check, CheckCheck, Trash2, ExternalLink, 
  Plus, Shield, CreditCard, Home, Car, User, 
  FileText, AlertTriangle, Settings, Filter
} from 'lucide-react'

const CATEGORIES = [
  { key: 'all',        label: 'All notifications', icon: Bell },
  { key: 'urgent',     label: 'Urgent',            icon: AlertTriangle },
  { key: 'moderation', label: 'Review queue',      icon: Shield },
  { key: 'listing',    label: 'Listing moderation',icon: Home },
  { key: 'payment',    label: 'Payments',          icon: CreditCard },
  { key: 'user',       label: 'New users',         icon: User },
  { key: 'document',   label: 'Documents',         icon: FileText },
  { key: 'system',     label: 'System',            icon: Settings },
]

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  high:   '#f97316',
  normal: '#D4A843',
  low:    '#6B7280',
}

const CATEGORY_ICONS: Record<string, any> = {
  moderation: Shield,
  listing:    Home,
  payment:    CreditCard,
  user:       User,
  document:   FileText,
  system:     Settings,
  urgent:     AlertTriangle,
}

export default function AdminNotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [showCompose, setShowCompose] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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
    await fetch('/api/admin/notifications/mark-read', { 
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({ id }) 
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    await fetch('/api/admin/notifications/mark-read', { 
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({ all: true }) 
    })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotif = async (id: string) => {
    await fetch('/api/admin/notifications/list', { 
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({ id }) 
    })
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const filtered = activeCategory === 'all' 
    ? notifications 
    : activeCategory === 'urgent'
    ? notifications.filter(n => n.priority === 'urgent')
    : notifications.filter(n => n.category === activeCategory)

  const unreadCount = notifications.filter(n => !n.read).length

  const getCategoryCount = (key: string) => {
    if (key === 'all') return notifications.filter(n => !n.read).length
    if (key === 'urgent') return notifications.filter(n => n.priority === 'urgent' && !n.read).length
    return notifications.filter(n => n.category === key && !n.read).length
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: '#F4F6FA', flexDirection: 'row' }}>
      
      {/* Sidebar */}
      {!isMobile && <div style={{ width: 260, background: '#fff', borderRight: '1px solid #e5e7eb', padding: '24px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #e5e7eb', marginBottom: 8 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', color: '#9CA3AF', fontFamily: 'monospace', margin: '0 0 4px' }}>NOTIFICATIONS · UNIFIED</p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a2240', margin: 0 }}>Inbox</h2>
          <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>All admin events in one place.</p>
        </div>

        {CATEGORIES.map(cat => {
          const count = getCategoryCount(cat.key)
          const Icon = cat.icon
          const isActive = activeCategory === cat.key
          return (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 16px', background: isActive ? 'rgba(14,20,40,0.06)' : 'transparent', border: 'none', cursor: 'pointer', borderLeft: isActive ? '3px solid #0e1428' : '3px solid transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={14} color={isActive ? '#0e1428' : '#6B7280'} />
                <span style={{ fontSize: 13, color: isActive ? '#0e1428' : '#6B7280', fontWeight: isActive ? 600 : 400 }}>{cat.label}</span>
              </div>
              {count > 0 && (
                <span style={{ fontSize: 11, background: cat.key === 'urgent' ? '#ef4444' : '#0e1428', color: '#fff', borderRadius: 100, padding: '2px 7px', fontWeight: 600 }}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      }

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Mobile Category Filter */}
        {isMobile && (
          <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '8px 16px', overflowX: 'auto', display: 'flex', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{ padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap', background: activeCategory === cat.key ? '#0e1428' : '#F4F6FA', color: activeCategory === cat.key ? '#D4A843' : '#6B7280', fontWeight: activeCategory === cat.key ? 600 : 400 }}>
              {cat.label} {getCategoryCount(cat.key) > 0 ? `(${getCategoryCount(cat.key)})` : ''}
              </button>
            ))}
          </div>
        )}
        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: '#6B7280' }}>{filtered.length} notifications</span>
            {unreadCount > 0 && <span style={{ fontSize: 12, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 100 }}>{unreadCount} unread</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#1a2240' }}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
            <button onClick={() => setShowCompose(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#D4A843', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#0e1428', fontWeight: 600 }}>
              <Plus size={14} /> New notification
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>
              <Bell size={40} style={{ opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
              <p style={{ margin: 0 }}>No notifications in this category</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.map(n => {
                const Icon = CATEGORY_ICONS[n.category] || Bell
                const priorityColor = PRIORITY_COLORS[n.priority] || PRIORITY_COLORS.normal
                return (
                  <div key={n.id} style={{ background: n.read ? '#fff' : '#FFFBEB', border: '1px solid', borderColor: n.read ? '#e5e7eb' : '#FDE68A', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: n.read ? '#F4F6FA' : 'rgba(212,168,67,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={n.read ? '#6B7280' : '#D4A843'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2240', margin: 0 }}>{n.title}</p>
                        {n.priority === 'urgent' && (
                          <span style={{ fontSize: 10, background: '#FEE2E2', color: '#DC2626', padding: '2px 6px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.05em' }}>URGENT</span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 6px' }}>{n.body}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace' }}>
                          {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} · {new Date(n.created_at).toLocaleDateString()}
                        </span>
                        {n.category && (
                          <span style={{ fontSize: 10, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{n.category}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {n.link && (
                        <button onClick={() => { const link = n.link?.startsWith('/' + locale) ? n.link : '/' + locale + n.link; router.push(link) }} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#6B7280', fontSize: 12 }}>
                          OPEN →
                        </button>
                      )}
                      {!n.read && (
                        <button onClick={() => markRead(n.id)} title="Mark as read" style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#6B7280' }}>
                          <Check size={13} />
                        </button>
                      )}
                      <button onClick={() => deleteNotif(n.id)} title="Delete" style={{ background: 'none', border: '1px solid #FEE2E2', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#f87171' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal locale={locale} onClose={() => setShowCompose(false)} onSent={fetchNotifications} />
      )}

      {/* FAB */}
      <button onClick={() => setShowCompose(true)} style={{ position: 'fixed', bottom: 32, right: 32, width: 52, height: 52, borderRadius: '50%', background: '#D4A843', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(212,168,67,0.4)', zIndex: 50 }}>
        <Plus size={22} color="#0e1428" />
      </button>
    </div>
  )
}

function ComposeModal({ locale, onClose, onSent }: { locale: string, onClose: () => void, onSent: () => void }) {
  const [target, setTarget] = useState('all')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const send = async () => {
    if (!title || !body) return
    setSending(true)
    await fetch('/api/admin/notifications/send', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ target, title, body })
    })
    setSending(false)
    onClose()
    onSent()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a2240', margin: '0 0 20px' }}>Send Notification</h3>
        
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: '#6B7280', fontFamily: 'monospace', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>SEND TO</label>
          <select value={target} onChange={e => setTarget(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#1a2240' }}>
            <option value="all">All users</option>
            <option value="owners">Property owners</option>
            <option value="providers">Service providers</option>
            <option value="job_seekers">Job seekers</option>
            <option value="guests">Guests</option>
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: '#6B7280', fontFamily: 'monospace', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>TITLE</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title..." style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#1a2240', boxSizing: 'border-box' as const }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: '#6B7280', fontFamily: 'monospace', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>MESSAGE</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..." rows={3} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#1a2240', resize: 'vertical', boxSizing: 'border-box' as const }} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#6B7280', background: '#fff' }}>Cancel</button>
          <button onClick={send} disabled={sending || !title || !body} style={{ flex: 2, padding: '10px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: '#D4A843', color: '#0e1428', opacity: (sending || !title || !body) ? 0.5 : 1 }}>
            {sending ? 'Sending...' : 'Send notification'}
          </button>
        </div>
      </div>
    </div>
  )
}
