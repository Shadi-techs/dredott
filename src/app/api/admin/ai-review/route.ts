// ============================================
// AI Review API Endpoint (FIXED)
// Path: src/app/api/admin/ai-review/route.ts
// ✅ بيتحقق من admin_token JWT بدل Supabase Auth
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

const supabaseAdmin = getSupabaseAdmin()

// ── Auth guard — بيتحقق من JWT cookie ──
async function getAdminUser(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return null

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    if (payload.type !== 'admin') return null
    if (!['super_admin', 'admin'].includes(payload.role as string)) return null
    return payload
  } catch {
    return null
  }
}

// ── Fetch listing data ──
async function fetchListingData(listing_type: 'property' | 'car', listing_id: string) {
  if (listing_type === 'property') {
    const { data } = await supabaseAdmin
      .from('properties')
      .select(`
        title, description, area, price_per_night, bedrooms,
        max_guests, photos, amenities, compound_id,
        building_number, street_name,
        profiles!properties_owner_id_fkey(first_name, last_name)
      `)
      .eq('id', listing_id)
      .single()
    return data
  } else {
    const { data } = await supabaseAdmin
      .from('cars')
      .select(`
        description, price_per_day, seats, transmission,
        fuel_type, photos, year,
        car_makes(name), car_models(name),
        profiles!cars_owner_id_fkey(first_name, last_name)
      `)
      .eq('id', listing_id)
      .single()
    return data
  }
}

// ── Build AI prompt ──
function buildPrompt(listing_type: 'property' | 'car', data: any): string {
  const base = `You are a listing quality reviewer for DredottStay, a premium property and car rental platform in Sharm El-Sheikh, Egypt.

Review this ${listing_type} listing and return a JSON object only (no markdown, no explanation).

JSON format:
{
  "score": <1-10 integer>,
  "summary": "<one sentence summary of quality>",
  "issues": [
    {"severity": "high|medium|low", "field": "<field name>", "message": "<specific issue>"}
  ],
  "suggestions": ["<improvement suggestion>"],
  "auto_flags": ["<mandatory blocker if any>"]
}

Scoring guide:
- 9-10: Excellent — publish immediately
- 7-8: Good — minor improvements suggested  
- 5-6: Fair — needs some work
- 1-4: Poor — major issues, consider rejection

Auto-flags (hard blockers that MUST be fixed):
- No photos or less than 2 photos
- Empty or very short description (under 20 words)
- Missing price
- Missing location/area info
- Suspicious or placeholder content`

  if (listing_type === 'property') {
    const photoCount = Array.isArray(data?.photos) ? data.photos.length : 0
    const descWords = data?.description?.split(' ').length || 0
    return `${base}

LISTING DATA:
- Title: ${data?.title || 'NOT PROVIDED'}
- Description: ${data?.description || 'NOT PROVIDED'} (${descWords} words)
- Area/Location: ${data?.area || 'NOT PROVIDED'}
- Compound: ${data?.compound_id ? 'Yes' : 'No'}
- Building/Street: ${data?.building_number || ''} ${data?.street_name || ''}
- Price per night: ${data?.price_per_night ? `EGP ${data.price_per_night}` : 'NOT PROVIDED'}
- Bedrooms: ${data?.bedrooms || 'NOT PROVIDED'}
- Max guests: ${data?.max_guests || 'NOT PROVIDED'}
- Photos: ${photoCount} photos uploaded
- Has amenities data: ${data?.amenities ? 'Yes' : 'No'}
- Owner: ${data?.profiles?.first_name || ''} ${data?.profiles?.last_name || ''}`
  } else {
    const photoCount = Array.isArray(data?.photos) ? data.photos.length : 0
    const descWords = data?.description?.split(' ').length || 0
    return `${base}

LISTING DATA:
- Make: ${data?.car_makes?.name || 'NOT PROVIDED'}
- Model: ${data?.car_models?.name || 'NOT PROVIDED'}
- Year: ${data?.year || 'NOT PROVIDED'}
- Description: ${data?.description || 'NOT PROVIDED'} (${descWords} words)
- Price per day: ${data?.price_per_day ? `EGP ${data.price_per_day}` : 'NOT PROVIDED'}
- Seats: ${data?.seats || 'NOT PROVIDED'}
- Transmission: ${data?.transmission || 'NOT PROVIDED'}
- Fuel type: ${data?.fuel_type || 'NOT PROVIDED'}
- Photos: ${photoCount} photos uploaded
- Owner: ${data?.profiles?.first_name || ''} ${data?.profiles?.last_name || ''}`
  }
}

// ── Call Claude ──
async function callClaudeReview(prompt: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`)
  const data = await response.json()
  const text = data.content?.[0]?.text || ''
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

// ── Save log ──
async function saveReviewLog(listing_type: string, listing_id: string, result: any, triggered_by: string) {
  await supabaseAdmin.from('ai_review_log').insert({
    listing_type,
    listing_id,
    triggered_by,
    score:       result.score,
    summary:     result.summary,
    issues:      result.issues,
    suggestions: result.suggestions,
    auto_flags:  result.auto_flags,
    model_used:  'claude-haiku-4-5-20251001',
  })
}

// ── POST /api/admin/ai-review ──
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { listing_type, listing_id } = await req.json()

    if (!listing_type || !listing_id) {
      return NextResponse.json({ error: 'listing_type and listing_id are required' }, { status: 400 })
    }

    if (!['property', 'car'].includes(listing_type)) {
      return NextResponse.json({ error: 'listing_type must be property or car' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI review not configured. Add ANTHROPIC_API_KEY to .env.local' }, { status: 503 })
    }

    const listingData = await fetchListingData(listing_type, listing_id)
    if (!listingData) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const prompt = buildPrompt(listing_type, listingData)
    const result = await callClaudeReview(prompt)

    await saveReviewLog(listing_type, listing_id, result, admin.sub as string)

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('AI Review error:', err)
    return NextResponse.json({
      score: 0, summary: 'AI review temporarily unavailable.',
      issues: [], suggestions: [], auto_flags: [], error: err.message,
    })
  }
}