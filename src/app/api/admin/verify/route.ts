// ============================================
// Admin Verify API Route
// Path: src/app/api/admin/verify/route.ts
//
// بيتحقق من الـ admin_token cookie
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token' }, { status: 401 })
    }

    const { payload } = await jose.jwtVerify(token, JWT_SECRET)

    if (payload.type !== 'admin') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 })
    }

    return NextResponse.json({
      admin: {
        id:         payload.sub,
        username:   payload.username,
        email:      payload.email,
        role:       payload.role,
        first_name: payload.first_name,
        last_name:  payload.last_name,
      }
    })

  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}