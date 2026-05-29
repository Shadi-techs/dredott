// ============================================
// AI Description Generator — Owner Portal
// Path: src/app/api/owner/ai-description/route.ts
// Called from: owner/properties/new/page.tsx
// Generates unique property description using Claude
// Cost: ~$0.003 per generation
// Feature flag: ai_description
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ── Auth: owner only ─────────────────────────
async function getOwnerUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check owner_portal_access
  const { data: access } = await supabase
    .from('owner_portal_access')
    .select('is_owner')
    .eq('user_id', user.id)
    .single()

  if (!access?.is_owner) return null
  return user
}

// ── Build prompt ─────────────────────────────
function buildDescriptionPrompt(data: {
  property_type: string
  area: string
  compound_id?: string
  bedrooms: number
  bathrooms: number
  max_guests: number
  floor_area: number
  title: string
}): string {
  const areaLabels: Record<string, string> = {
    naama_bay: 'Naama Bay',
    sharks_bay: 'Sharks Bay',
    hadaba: 'Hadaba',
    montazah: 'Montazah',
    nabq: 'Nabq Bay',
    um_el_sid: 'Um El Sid',
    el_salam: 'El Salam',
    old_market: 'Old Market Area',
  }

  const areaName = areaLabels[data.area] || data.area

  return `You are a professional listing copywriter for DredottStay, a premium rental platform in Sharm El-Sheikh, Egypt.

Write a compelling, unique, and honest property description for this listing.

Property details:
- Title: ${data.title}
- Type: ${data.property_type}
- Location: ${areaName}, Sharm El-Sheikh
- In compound: ${data.compound_id ? 'Yes' : 'No'}
- Bedrooms: ${data.bedrooms === 0 ? 'Studio' : data.bedrooms}
- Bathrooms: ${data.bathrooms}
- Max guests: ${data.max_guests}
- Floor area: ${data.floor_area > 0 ? `${data.floor_area} m²` : 'Not specified'}

Requirements:
- Write in English only
- 80-120 words — concise and punchy
- Highlight what makes it special for Sharm El-Sheikh visitors (beach, diving, relaxation)
- Mention the area naturally — don't just list specs
- Sound human and warm, not robotic
- Do NOT mention prices
- Do NOT use "I" or "we" — write in third person
- Return ONLY the description text, no title, no markdown, no quotes`
}

// ── POST /api/owner/ai-description ───────────
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const user = await getOwnerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Feature flag check
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { data: flag } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('key', 'ai_description')
      .single()

    if (!flag?.enabled) {
      return NextResponse.json(
        { error: 'AI description is not enabled yet' },
        { status: 503 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI not configured' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const prompt = buildDescriptionPrompt(body)

    // Call Claude Haiku
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()
    const description = data.content?.[0]?.text?.trim() || ''

    return NextResponse.json({ description })
  } catch (err: any) {
    console.error('AI description error:', err)
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    )
  }
}