import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
      const verified = await jose.jwtVerify(token, JWT_SECRET)
      if (verified.payload.type !== 'admin') throw new Error()
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { id } = await params
    const { data: car } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single()

    if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // جيب الـ owner
    if (car?.owner_id) {
      const { data: owner } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone')
        .eq('id', car.owner_id)
        .single()
      car.owner = owner
    }

    return NextResponse.json({ car })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
