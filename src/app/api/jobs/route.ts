import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const job_type = searchParams.get('job_type')
    const limit    = parseInt(searchParams.get('limit') || '20')
    const offset   = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('job_listings')
      .select(`
        id, title, title_ar, category, location,
        salary_range, job_type, experience_required,
        poster_type, status,
        views_count, applications_count,
        published_at, expires_at, created_at
      `)
      .eq('status', 'live')
      .gt('expires_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) query = query.eq('category', category)
    if (job_type) query = query.eq('job_type', job_type)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ jobs: data || [], total: data?.length || 0 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}