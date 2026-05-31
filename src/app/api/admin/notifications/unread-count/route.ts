// ============================================
// Admin Notifications — Unread Count
// Path: src/app/api/admin/notifications/unread-count/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

const supabaseAdmin = getSupabaseAdmin()

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ count: 0 })
    }

    try {
      const verified = await jose.jwtVerify(token, JWT_SECRET)
      if (verified.payload.type !== 'admin') throw new Error()
    } catch {
      return NextResponse.json({ count: 0 })
    }

    const { count } = await supabaseAdmin
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false)

    return NextResponse.json({ count: count || 0 })

  } catch (err) {
    return NextResponse.json({ count: 0 })
  }
}