import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
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

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  // Single post — full fields, used by editor
  if (id) {
    const { data, error } = await getSupabaseAdmin()
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ post: data })
  }

  const page   = parseInt(searchParams.get('page')  || '1')
  const limit  = parseInt(searchParams.get('limit') || '50')
  const offset = (page - 1) * limit

  const { data, count, error } = await getSupabaseAdmin()
    .from('blog_posts')
    .select('id, slug, category, author, published_at, reading_time, is_published, tags, title_en, title_ar, cover_image, created_at, updated_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data, total: count, page, limit })
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const slug = body.slug || generateSlug(body.title_en || '')
  const now = new Date().toISOString()

  const { data, error } = await getSupabaseAdmin()
    .from('blog_posts')
    .insert({
      ...body,
      slug,
      published_at: body.is_published ? (body.published_at || now) : null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}

export async function PUT(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...fields } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (fields.is_published && !fields.published_at) {
    fields.published_at = new Date().toISOString()
  }
  fields.updated_at = new Date().toISOString()

  const { data, error } = await getSupabaseAdmin()
    .from('blog_posts')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}

export async function DELETE(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await getSupabaseAdmin()
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${Date.now()}`
}
