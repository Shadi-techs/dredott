// ============================================
// Translation API
// Path: src/app/api/owner/translate/route.ts
// Translates listing description to 6 languages
// Called at save time — not on every view
// Cost: ~$0.008 per listing (all 6 languages)
// Max input: 150 words
// Only for paid subscribers
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const LANGUAGES = [
  { code: 'ar', name: 'Arabic' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Russian' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
]

const MAX_WORDS = 150

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check active subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, expires_at, is_free, free_until')
      .eq('owner_id', user.id)
      .single()

    const hasActiveSub = sub && (
      sub.is_free
        ? (!sub.free_until || new Date(sub.free_until) > new Date())
        : (!sub.expires_at || new Date(sub.expires_at) > new Date())
    )

    if (!hasActiveSub) {
      return NextResponse.json(
        { error: 'Translation requires an active subscription.' },
        { status: 403 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
    }

    const { text, source_locale = 'en' } = await req.json()
    if (!text?.trim()) return NextResponse.json({ error: 'No text provided' }, { status: 400 })

    // Enforce word limit
    const wordCount = text.trim().split(/\s+/).length
    if (wordCount > MAX_WORDS) {
      return NextResponse.json({
        error: `Text too long. Maximum ${MAX_WORDS} words, you have ${wordCount}.`,
      }, { status: 400 })
    }

    const targetLangs = LANGUAGES.filter(l => l.code !== source_locale)

    const prompt = `You are a professional translator for a real estate rental platform in Sharm El-Sheikh, Egypt.

Translate the following property/car description into all of these languages:
${targetLangs.map(l => `- ${l.name} (${l.code})`).join('\n')}

Important rules:
- Keep the tone warm, professional, and natural
- Preserve any location names (Naama Bay, Sharm El-Sheikh, etc.)
- Do NOT add or remove information
- Return ONLY a JSON object with language codes as keys
- No markdown, no extra text

Original text (${LANGUAGES.find(l => l.code === source_locale)?.name || 'English'}):
"${text}"

Return format:
{
  "ar": "...",
  "en": "...",
  "ru": "...",
  "uk": "...",
  "de": "...",
  "it": "..."
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) throw new Error(`Claude API error: ${response.status}`)

    const data = await response.json()
    const rawText = data.content?.[0]?.text || ''
    const clean   = rawText.replace(/```json|```/g, '').trim()
    const translations = JSON.parse(clean)

    // Always include source
    translations[source_locale] = text

    return NextResponse.json({ translations, word_count: wordCount })
  } catch (err: any) {
    console.error('Translation error:', err)
    return NextResponse.json({ error: 'Translation failed: ' + err.message }, { status: 500 })
  }
}