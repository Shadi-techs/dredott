import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

// IMAP credentials - هتتضاف في Vercel env variables
const IMAP_CONFIG = {
  host: process.env.IMAP_HOST || '',
  port: parseInt(process.env.IMAP_PORT || '993'),
  user: process.env.IMAP_USER || '',
  password: process.env.IMAP_PASSWORD || '',
  tls: true,
}

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
      const verified = await jose.jwtVerify(token, JWT_SECRET)
      if (verified.payload.type !== 'admin') throw new Error()
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // لو مفيش IMAP credentials
    if (!IMAP_CONFIG.host || !IMAP_CONFIG.user || !IMAP_CONFIG.password) {
      return NextResponse.json({ 
        emails: [],
        configured: false,
        message: 'IMAP not configured yet'
      })
    }

    // هنا هيجي الـ IMAP reading code بعد ما تجيب الـ credentials
    return NextResponse.json({ 
      emails: [],
      configured: true,
      message: 'IMAP configured but reader not implemented yet'
    })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
