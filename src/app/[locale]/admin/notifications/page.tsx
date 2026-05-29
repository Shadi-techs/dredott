'use client'
// ============================================
// Admin Notifications Page
// Path: src/app/[locale]/admin/notifications/page.tsx
// ============================================

import { useState, useEffect } from 'use'
import { createClient } from '@/lib/supabase/client'
import {
  Bell, Check, CheckCheck, Trash2,
  Building2, Car, Calendar, CreditCard,
  Flag, AlertCircle, Filter
} from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  link: string
  read: boolean
  read_at: string
  created_at: string
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  new_property:    { icon: Building2,   color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  new_car:         { icon: Car,         color: '#2A9D8F', bg: 'rgba(42,157,143,0.1)' },
  new_booking:     { icon: Calendar,    color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  new_subscription:{ icon: CreditCard,  color: '#D4A843', bg: 'rgba(212,168,67,0.1)' },
  payment_failed:  { icon: AlertCircle, color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  review_flagged:  { icon: Flag,        color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
  system_alert:    { icon: AlertCircle, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
}

export default function AdminNotificationsPage() {
  const supabase = createClient()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading]             = useState(true)
  const [filter, setFilter]               = useState<'all' | 'unread'>('all')
  const [markingAll, setMarkingAll]       = useState(false)

  useEffect(() => { fetchNotifications() }, [filter])

  async function fetchNotifications() {
    setLoading(true)
    let query = supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (filter === 'unread') query = query.eq('read', false)

    const { data } = await query
    setNotifications(data || [])
    setLoading(false)
  }

  async function markAsRead(id: string) {
    await supabase.from('admin_notifications').update({
      read: true, read_at: new Date().toISOString()
    }).eq('id', id)
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
  }

  async function markAllAsRead() {
    setMarkingAll(true)
    await fetch('/api/admin/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mark_all: true }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setMarkingAll(false)
  }

  async function deleteNotification(id: string) {
    await supabase.from('admin_notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-[#0e1428]">
      <div className="border-b border-white/10 bg-[#1a2240] px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono tracking-widest text-[#D4A843] uppercase mb-1">Inbox</p>
            <h1 className="text-3xl font-bold text-[#FBF0D0] font-['Cormorant_Garamond'] italic">
              Notifications
            </h1>
            <p className="text-sm text-[#7a8aaa] mt-1">
              {unreadCount > 0
                ? <span className="text-[#fbbf24]">{unreadCount} unread</span>
                : 'All caught up ✓'}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-[#0e1428] border border-white/10 rounded-lg p-1">
              {(['all', 'unread'] as const).map(f => (
                <button key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase transition-colors ${
                    filter === f ? 'bg-[#D4A843] text-[#0e1428]' : 'text-[#7a8aaa] hover:text-[#FBF0D0]'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} disabled={markingAll}
                className="flex items-center gap-2 px-4 py-2 bg-[#0e1428] border border-white/10 rounded-lg text-sm text-[#7a8aaa] hover:text-[#FBF0D0] transition-colors disabled:opacity-50">
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4A843]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-10 h-10 text-[#7a8aaa] mx-auto mb-3" />
            <p className="text-[#7a8aaa]">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system_alert
              const Icon   = config.icon
              return (
                <div key={n.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    n.read
                      ? 'bg-[#1a2240] border-white/5'
                      : 'bg-[#1a2240] border-[#D4A843]/20'
                  }`}>
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: config.bg }}>
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-medium ${n.read ? 'text-[#7a8aaa]' : 'text-[#FBF0D0]'}`}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-xs text-[#7a8aaa] mt-0.5">{n.body}</p>
                        )}
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-[#D4A843] flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[#7a8aaa] font-mono">
                        {new Date(n.created_at).toLocaleString('en-GB', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                      {n.link && (
                        <a href={n.link}
                          className="text-xs text-[#D4A843] hover:underline">
                          View →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.read && (
                      <button onClick={() => markAsRead(n.id)}
                        title="Mark as read"
                        className="p-1.5 text-[#7a8aaa] hover:text-[#4ade80] transition-colors rounded-lg hover:bg-white/5">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(n.id)}
                      title="Delete"
                      className="p-1.5 text-[#7a8aaa] hover:text-[#f87171] transition-colors rounded-lg hover:bg-white/5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}