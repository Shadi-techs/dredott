// ============================================
// PIN Verification API Route (FIXED)
// Path: src/app/api/admin/verify-pin/route.ts
// ✅ بيتحقق من JWT بدل Supabase Auth
// ✅ PIN مخزن في admin_users table
// ✅ bcrypt comparison
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'
import * as bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)


export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json()

    // ✅ تحقق من JWT
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.json({ success: false }, { status: 401 })

    let payload: jose.JWTPayload
    try {
      const verified = await jose.jwtVerify(token, JWT_SECRET)
      payload = verified.payload
      if (payload.type !== 'admin') return NextResponse.json({ success: false }, { status: 401 })
    } catch {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    // ✅ جيب الـ admin من admin_users
    const { data: admin } = await supabaseAdmin
      .from('admin_users')
      .select('id, pin_hash, role')
      .eq('id', payload.sub)
      .eq('is_active', true)
      .single()

    if (!admin) return NextResponse.json({ success: false }, { status: 401 })

    // ✅ تحقق من الـ PIN
    let pinValid = false

    if (admin.pin_hash.startsWith('PLAIN:')) {
      pinValid = pin === admin.pin_hash.replace('PLAIN:', '')

      // حول لـ bcrypt
      if (pinValid) {
        const hashed = await bcrypt.hash(pin, 12)
        await supabaseAdmin
          .from('admin_users')
          .update({ pin_hash: hashed })
          .eq('id', admin.id)
      }
    } else {
      pinValid = await bcrypt.compare(pin, admin.pin_hash)
    }

    try {
      await getSupabaseAdmin().from('super_admin_pin_log').insert({
       admin_id:   admin.id,
       success:    pinValid,
       ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      })
    } catch {}

    // لو فشل — تحقق من عدد المحاولات
    if (!pinValid) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const { count } = await supabaseAdmin
        .from('super_admin_pin_log')
        .select('*', { count: 'exact', head: true })
        .eq('admin_id', admin.id)
        .eq('success', false)
        .gte('attempted_at', fiveMinAgo)

      // لو 3 محاولات فاشلة — امسح الـ token
      if ((count || 0) >= 3) {
        const response = NextResponse.json({ success: false, locked: true })
        response.cookies.delete('admin_token')
        return response
      }
    }

    return NextResponse.json({ success: pinValid })

  } catch (err) {
    console.error('Verify PIN error:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}