'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastKind = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: number
  kind: ToastKind
  title?: string
  message: string
}

// ── Global event bus ─────────────────────────────────────────
type Listener = (t: ToastItem) => void
const listeners: Listener[] = []
let counter = 0

function emit(kind: ToastKind, message: string, title?: string) {
  const item: ToastItem = { id: ++counter, kind, message, title }
  listeners.forEach((fn) => fn(item))
}

export const toast = {
  success: (msg: string, title?: string) => emit('success', msg, title),
  error:   (msg: string, title?: string) => emit('error',   msg, title),
  warning: (msg: string, title?: string) => emit('warning', msg, title),
  info:    (msg: string, title?: string) => emit('info',    msg, title),
}

// ── Config ───────────────────────────────────────────────────
const DURATION: Record<ToastKind, number> = {
  success: 3500,
  error:   6000,
  warning: 5000,
  info:    4000,
}

const STYLES: Record<ToastKind, { bg: string; border: string; icon: string; titleColor: string }> = {
  success: { bg: '#f0fdf4', border: '#22c55e', icon: '#22c55e', titleColor: '#15803d' },
  error:   { bg: '#fef2f2', border: '#ef4444', icon: '#ef4444', titleColor: '#b91c1c' },
  warning: { bg: '#fffbeb', border: '#f59e0b', icon: '#d97706', titleColor: '#b45309' },
  info:    { bg: '#eff6ff', border: '#3b82f6', icon: '#2563eb', titleColor: '#1d4ed8' },
}

const ICONS: Record<ToastKind, React.FC<any>> = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
}

// ── ToastContainer ───────────────────────────────────────────
export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (t: ToastItem) => {
      setItems((prev) => [...prev.slice(-4), t])
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== t.id))
      }, DURATION[t.kind])
    }
    listeners.push(handler)
    return () => {
      const idx = listeners.indexOf(handler)
      if (idx !== -1) listeners.splice(idx, 1)
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      maxWidth: 380, width: 'calc(100vw - 48px)',
      pointerEvents: 'none',
    }}>
      {items.map((item) => {
        const s = STYLES[item.kind]
        const Icon = ICONS[item.kind]
        return (
          <div
            key={item.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '14px 16px',
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderLeft: `4px solid ${s.border}`,
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              pointerEvents: 'auto',
              animation: 'toast-in 0.25s ease-out',
            }}
          >
            <Icon size={18} color={s.icon} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {item.title && (
                <div style={{ fontSize: 13, fontWeight: 700, color: s.titleColor, marginBottom: 2 }}>
                  {item.title}
                </div>
              )}
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, wordBreak: 'break-word' }}>
                {item.message}
              </div>
            </div>
            <button
              onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#9ca3af', flexShrink: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
      <style>{`@keyframes toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
