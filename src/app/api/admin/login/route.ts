// ============================================
// Admin Login API Route
// Path: src/app/api/admin/login/route.ts
//
// ✅ مفيش Supabase Auth — منفصل تماماً
// ✅ بيتحقق من admin_users table فقط
// ✅ بيعمل JWT token خاص بالـ admin
// ✅ بيحط الـ token في httpOnly cookie
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as bcrypt from 'bcryptjs'
import * as jose from 'jose'

// Service role client — مش بيتأثر بـ RLS

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

export async function POST(req: NextRequest) {
    console.log('SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)

  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    // ── 1. جيب الـ admin من الـ table ──
    console.log('Searching for username:', username.trim().toLowerCase())
    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('username', username.trim().toLowerCase())
      .eq('is_active', true)
      .single()

      console.log('Admin query result:', JSON.stringify(admin))
      console.log('Admin query error:', JSON.stringify(error))

    if (error || !admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // ── 2. تحقق من الـ password ──
    let passwordValid = false

    if (admin.password_hash.startsWith('PLAIN:')) {
      // مؤقت — plain text للأول
      passwordValid = password === admin.password_hash.replace('PLAIN:', '')

      // لو صح — حول لـ bcrypt hash
      if (passwordValid) {
        const hashed = await bcrypt.hash(password, 12)
        await supabaseAdmin
          .from('admin_users')
          .update({ password_hash: hashed })
          .eq('id', admin.id)
      }
    } else {
      // bcrypt hash
      passwordValid = await bcrypt.compare(password, admin.password_hash)
    }

    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // ── 3. عمل JWT token ──
    const token = await new jose.SignJWT({
      sub:        admin.id,
      username:   admin.username,
      email:      admin.email,
      role:       admin.role,
      first_name: admin.first_name,
      last_name:  admin.last_name,
      type:       'admin', // مهم — يميز الـ admin token
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(JWT_SECRET)

    // ── 4. حدّث last_login ──
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id)

    // ── 5. رجّع الـ token في httpOnly cookie ──
    const response = NextResponse.json({
      success: true,
      admin: {
        id:         admin.id,
        username:   admin.username,
        email:      admin.email,
        role:       admin.role,
        first_name: admin.first_name,
        last_name:  admin.last_name,
      }
    })

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   8 * 60 * 60, // 8 ساعات
      path:     '/',
    })

    return response

  } catch (err) {
    console.error('Admin login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}