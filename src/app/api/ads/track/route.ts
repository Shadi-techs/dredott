import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { id, type } = await request.json()
    if (!id || !['view', 'click'].includes(type)) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
    }

    const field = type === 'click' ? 'click_count' : 'view_count'
    const db = getSupabaseAdmin()

    const { data: current } = await db
      .from('ads')
      .select(field)
      .eq('id', id)
      .single()

    if (current) {
      await db
        .from('ads')
        .update({ [field]: ((current as any)[field] || 0) + 1 })
        .eq('id', id)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
