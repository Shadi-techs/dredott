// ============================================
// Admin Notifications — Mark Read
// Path: src/app/api/admin/notifications/mark-read/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)


export async function POST(req: NextRequest) {
  try {
    // ── 1. تحقق من الـ JWT ──
    const token = req.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const verified = await jose.jwtVerify(token, JWT_SECRET)
      if (verified.payload.type !== 'admin') throw new Error()
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── 2. جيب البيانات ──
    const { notification_id, mark_all } = await req.json()

    if (!notification_id && !mark_all) {
      return NextResponse.json({ error: 'notification_id or mark_all is required' }, { status: 400 })
    }

    const now = new Date().toISOString()

    if (mark_all) {
      // علّم كل الإشعارات كمقروءة
      await supabaseAdmin
        .from('admin_notifications')
        .update({ read: true, read_at: now })
        .eq('read', false)
    } else {
      // علّم إشعار واحد
      await supabaseAdmin
        .from('admin_notifications')
        .update({ read: true, read_at: now })
        .eq('id', notification_id)
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Mark read error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}