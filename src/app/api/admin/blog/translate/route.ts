import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return null
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    if (payload.type !== 'admin') return null
    return payload
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 })
  }

  const { title_en, excerpt_en, content_en, meta_title_en, meta_description_en } = await req.json()

  if (!title_en) return NextResponse.json({ error: 'title_en is required' }, { status: 400 })

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const LANGS = [
    { code: 'ar', name: 'Arabic', rtl: true },
    { code: 'ru', name: 'Russian', rtl: false },
    { code: 'uk', name: 'Ukrainian', rtl: false },
    { code: 'de', name: 'German', rtl: false },
    { code: 'it', name: 'Italian', rtl: false },
  ]

  const prompt = `You are a professional translator specialising in travel and real estate content.
Translate the following blog post fields from English into the specified languages.
Return a valid JSON object with keys for each language code.

English content to translate:
- title: ${title_en}
- excerpt: ${excerpt_en || ''}
- meta_title: ${meta_title_en || title_en}
- meta_description: ${meta_description_en || excerpt_en || ''}
- content (Markdown): ${content_en || ''}

Languages needed: ${LANGS.map(l => `${l.name} (${l.code})`).join(', ')}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "ar": { "title": "...", "excerpt": "...", "meta_title": "...", "meta_description": "...", "content": "..." },
  "ru": { "title": "...", "excerpt": "...", "meta_title": "...", "meta_description": "...", "content": "..." },
  "uk": { "title": "...", "excerpt": "...", "meta_title": "...", "meta_description": "...", "content": "..." },
  "de": { "title": "...", "excerpt": "...", "meta_title": "...", "meta_description": "...", "content": "..." },
  "it": { "title": "...", "excerpt": "...", "meta_title": "...", "meta_description": "...", "content": "..." }
}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')

    const translations = JSON.parse(jsonMatch[0])

    const result: Record<string, any> = {}
    for (const lang of LANGS) {
      const t = translations[lang.code] || {}
      result[`title_${lang.code}`]            = t.title || ''
      result[`excerpt_${lang.code}`]          = t.excerpt || ''
      result[`meta_title_${lang.code}`]       = t.meta_title || ''
      result[`meta_description_${lang.code}`] = t.meta_description || ''
      result[`content_${lang.code}`]          = t.content || ''
    }

    return NextResponse.json({ translations: result })
  } catch (err: any) {
    console.error('Translation error:', err)
    return NextResponse.json({ error: err.message || 'Translation failed' }, { status: 500 })
  }
}
