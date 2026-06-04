// ============================================
// Admin Activity Monitor
// Path: src/app/[locale]/admin/activity/page.tsx
// Super Admin only — full visibility on sub-admins
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import {
  User, LogIn, LogOut, Clock, CheckCircle,
  XCircle, AlertCircle, BarChart2, Activity,
  ChevronDown, ChevronUp
} from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AdminSummary {
  id: string; name: string; role: string
  total_logins: number; last_login: string | null
  total_actions: number; approvals: number
  rejections: number; edits_requested: number
  last_action_at: string | null
}

interface Session {
  id: string; admin_id: string; admin_name: string
  admin_role: string; event: string
  ip_address: string; created_at: string
}

interface AuditEntry {
  id: string; admin_id: string; action: string
  target_type: string; target_name: string
  created_at: string
}

const EVENT_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  login:           { label: 'Logged in',      color: '#4ade80', icon: LogIn },
  logout:          { label: 'Logged out',     color: '#7a8aaa', icon: LogOut },
  pin_success:     { label: 'PIN verified',   color: '#60a5fa', icon: CheckCircle },
  pin_fail:        { label: 'PIN failed',     color: '#f87171', icon: AlertCircle },
  session_expired: { label: 'Session expired',color: '#fbbf24', icon: Clock },
}

const ACTION_CONFIG: Record<string, { color: string; icon: any }> = {
  approved_listing:     { color: '#4ade80', icon: CheckCircle },
  rejected_listing:     { color: '#f87171', icon: XCircle },
  needs_edit_listing:   { color: '#fbbf24', icon: AlertCircle },
}

export default function ActivityPage() {
  const router = useRouter()
  const [summaries, setSummaries]   = useState<AdminSummary[]>([])
  const [sessions, setSessions]     = useState<Session[]>([])
  const [actions, setActions]       = useState<AuditEntry[]>([])
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [tab, setTab]               = useState<'overview' | 'sessions' | 'actions'>('overview')
  const [days, setDays]             = useState(7)

  useEffect(() => {
    checkAccess()
  }, [])

  useEffect(() => {
    fetchData()
  }, [days])

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/en/admin/login'); return }
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (prof?.role !== 'super_admin') { router.push('/en/admin'); return }
    fetchData()
  }

  const fetchData = async () => {
    setLoading(true)
    const since = new Date(Date.now() - days * 86400000).toISOString()

    const [{ data: sum }, { data: sess }, { data: acts }] = await Promise.all([
      supabase.from('admin_activity_summary').select('*'),
      supabase.from('admin_sessions').select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase.from('admin_audit_log').select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    setSummaries(sum || [])
    setSessions(sess || [])
    setActions(acts || [])
    setLoading(false)
  }

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

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  const subAdmins = summaries.filter(s => s.role !== 'super_admin')

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '28px 32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={eyebrow}>— Super Admin · Activity Monitor</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#FBF0D0', fontWeight: 400 }}>
            Admin Activity
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setDays(d)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              background: days === d ? '#2C3A6B' : 'rgba(255,255,255,0.04)',
              color: days === d ? '#D4A843' : '#7a8aaa',
              border: days === d ? '1px solid rgba(212,168,67,0.2)' : '1px solid rgba(255,255,255,0.06)',
            }}>Last {d} days</button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0 }}>
        {(['overview', 'sessions', 'actions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 18px', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
            color: tab === t ? '#D4A843' : '#7a8aaa',
            borderBottom: tab === t ? '2px solid #D4A843' : '2px solid transparent',
            textTransform: 'capitalize', marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 28, height: 28, border: '3px solid #D4A843', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (

        <>
          {/* ── OVERVIEW ─────────────────────────────── */}
          {tab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {subAdmins.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#7a8aaa' }}>
                  No sub-admins yet
                </div>
              )}
              {subAdmins.map(admin => (
                <div key={admin.id} style={{ background: '#0e1428', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
                  {/* Summary row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === admin.id ? null : admin.id)}>

                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2C3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                      {admin.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#FBF0D0', marginBottom: 2 }}>{admin.name}</p>
                      <p style={{ fontSize: 11, color: '#7a8aaa' }}>
                        {admin.last_login ? `Last login: ${timeAgo(admin.last_login)}` : 'Never logged in'}
                        {admin.last_action_at && ` · Last action: ${timeAgo(admin.last_action_at)}`}
                      </p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                      {[
                        { label: 'Logins',    value: admin.total_logins,  color: '#60a5fa' },
                        { label: 'Approvals', value: admin.approvals,     color: '#4ade80' },
                        { label: 'Rejections',value: admin.rejections,    color: '#f87171' },
                        { label: 'Edit Req',  value: admin.edits_requested, color: '#fbbf24' },
                      ].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: s.color, lineHeight: 1 }}>{s.value}</p>
                          <p style={{ fontSize: 9, color: '#7a8aaa', marginTop: 2, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {expanded === admin.id ? <ChevronUp size={16} color="#7a8aaa" /> : <ChevronDown size={16} color="#7a8aaa" />}
                  </div>

                  {/* Expanded timeline */}
                  {expanded === admin.id && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', maxHeight: 300, overflowY: 'auto' }}>
                      <p style={{ fontSize: 10, color: '#D4A843', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>Activity Timeline — Last {days} days</p>

                      {/* Sessions for this admin */}
                      {sessions.filter(s => s.admin_id === admin.id).length === 0 &&
                       actions.filter(a => a.admin_id === admin.id).length === 0 ? (
                        <p style={{ fontSize: 12, color: '#7a8aaa' }}>No activity in this period</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {/* Merge and sort sessions + actions */}
                          {[
                            ...sessions.filter(s => s.admin_id === admin.id).map(s => ({ time: s.created_at, type: 'session', data: s })),
                            ...actions.filter(a => a.admin_id === admin.id).map(a => ({ time: a.created_at, type: 'action', data: a })),
                          ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                           .map((item, i) => {
                            if (item.type === 'session') {
                              const sess = item.data as Session
                              const cfg  = EVENT_CONFIG[sess.event] || EVENT_CONFIG.login
                              const Icon = cfg.icon
                              return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                  <Icon size={14} color={cfg.color} />
                                  <span style={{ fontSize: 12, color: cfg.color, flex: 1 }}>{cfg.label}</span>
                                  <span style={{ fontSize: 10, color: '#7a8aaa', fontFamily: "'JetBrains Mono', monospace" }}>{formatDate(sess.created_at)}</span>
                                </div>
                              )
                            } else {
                              const act  = item.data as AuditEntry
                              const cfg  = ACTION_CONFIG[act.action] || { color: '#7a8aaa', icon: Activity }
                              const Icon = cfg.icon
                              return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                  <Icon size={14} color={cfg.color} />
                                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', flex: 1 }}>
                                    {act.action.replace(/_/g, ' ')} — <span style={{ color: cfg.color }}>{act.target_name || act.target_type}</span>
                                  </span>
                                  <span style={{ fontSize: 10, color: '#7a8aaa', fontFamily: "'JetBrains Mono', monospace" }}>{formatDate(act.created_at)}</span>
                                </div>
                              )
                            }
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── SESSIONS ──────────────────────────────── */}
          {tab === 'sessions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#7a8aaa' }}>No sessions in this period</div>
              ) : sessions.map(s => {
                const cfg  = EVENT_CONFIG[s.event] || EVENT_CONFIG.login
                const Icon = cfg.icon
                return (
                  <div key={s.id} style={{ background: '#0e1428', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icon size={16} color={cfg.color} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: '#FBF0D0', fontWeight: 500 }}>{s.admin_name} <span style={{ color: cfg.color, fontWeight: 400 }}>{cfg.label}</span></p>
                      <p style={{ fontSize: 11, color: '#7a8aaa', marginTop: 2 }}>IP: {s.ip_address}</p>
                    </div>
                    <span style={{ fontSize: 11, color: '#7a8aaa', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                      {formatDate(s.created_at)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── ACTIONS ───────────────────────────────── */}
          {tab === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {actions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#7a8aaa' }}>No actions in this period</div>
              ) : actions.map(a => {
                const cfg  = ACTION_CONFIG[a.action] || { color: '#7a8aaa', icon: Activity }
                const Icon = cfg.icon
                return (
                  <div key={a.id} style={{ background: '#0e1428', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icon size={16} color={cfg.color} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: '#FBF0D0', fontWeight: 500 }}>
                        {a.action.replace(/_/g, ' ')} — <span style={{ color: cfg.color }}>{a.target_name || a.target_type}</span>
                      </p>
                      <p style={{ fontSize: 11, color: '#7a8aaa', marginTop: 2 }}>by {summaries.find(s => s.id === a.admin_id)?.name || 'Unknown'}</p>
                    </div>
                    <span style={{ fontSize: 11, color: '#7a8aaa', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                      {formatDate(a.created_at)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const eyebrow: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9, letterSpacing: '0.3em',
  textTransform: 'uppercase', color: '#D4A843', marginBottom: 6,
}