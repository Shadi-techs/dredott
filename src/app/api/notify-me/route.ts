// ============================================
// DredottSTAY — Notify Me API Route
// Saves user request to notify_me table
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, whatsapp, area, dates_from, dates_to, max_price } = body

    // Validate — must have at least email or whatsapp
    if (!email && !whatsapp) {
      return NextResponse.json(
        { error: 'Email or WhatsApp is required' },
        { status: 400 }
      )
    }

    // Save to Supabase
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('notify_me')
      .insert({
        email: email || null,
        whatsapp: whatsapp || null,
        area: area || null,
        dates_from: dates_from || null,
        dates_to: dates_to || null,
        max_price: max_price || null,
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notify me error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
