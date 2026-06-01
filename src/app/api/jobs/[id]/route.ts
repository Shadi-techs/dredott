import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check if user is a job seeker subscriber
    const { data: { user } } = await supabase.auth.getUser()
    let isSubscriber = false

    if (user) {
      const { data: sub } = await supabase
        .from('job_seeker_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()
      isSubscriber = !!sub
    }

    const { data: job, error } = await supabase
      .from('job_listings')
      .select(`
        id, title, title_ar, description, description_ar,
        category, location, salary_range, job_type,
        experience_required, poster_type,
        views_count, applications_count,
        published_at, expires_at,
        ${isSubscriber ? 'contact_whatsapp, contact_email, contact_name,' : ''}
        status
      `)
      .eq('id', id)
      .eq('status', 'live')
      .single()

    if (error) throw error

    // Increment view count
    await supabase
      .from('job_listings')
      .update({ views_count: (job.views_count || 0) + 1 })
      .eq('id', id)

    return NextResponse.json({ job, is_subscriber: isSubscriber })
  } catch (err) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }
}