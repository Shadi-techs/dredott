import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// PATCH /api/services/update  { provider_id, ...fields }
// Provider updates their own profile → triggers re-review
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { provider_id, ...fields } = body

    // Verify ownership
    const { data: existing } = await getSupabaseAdmin()
      .from('service_providers')
      .select('id, user_id, review_status, submission_count, business_name, business_name_ar, description, phone, whatsapp, email, website_url, facebook_url, area, address, plan_type, services_offered')
      .eq('id', provider_id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only allow safe fields to be updated
    const ALLOWED = ['business_name','business_name_ar','description','phone','whatsapp','email','website_url','facebook_url','area','address','plan_type','services_offered','logo_url','cover_image_url']
    const safe: Record<string, any> = {}
    ALLOWED.forEach(k => { if (k in fields) safe[k] = fields[k] })

    // Snapshot the previous state before applying changes
    const snapshot = {
      business_name: existing.business_name,
      business_name_ar: existing.business_name_ar,
      description: existing.description,
      phone: existing.phone,
      whatsapp: existing.whatsapp,
      email: existing.email,
      website_url: existing.website_url,
      facebook_url: existing.facebook_url,
      area: existing.area,
      address: existing.address,
      plan_type: existing.plan_type,
      services_offered: existing.services_offered,
    }

    const { error } = await getSupabaseAdmin()
      .from('service_providers')
      .update({
        ...safe,
        review_status:       'pending',
        is_active:           false,
        submission_count:    (existing.submission_count || 1) + 1,
        last_resubmitted_at: new Date().toISOString(),
        previous_snapshot:   snapshot,
        updated_at:          new Date().toISOString(),
      })
      .eq('id', provider_id)

    if (error) throw error

    // Notify admin
    try {
      await getSupabaseAdmin().from('admin_notifications').insert({
        type:  'provider_resubmitted',
        title: 'Provider re-submitted for review',
        body:  `${existing.business_name} made changes and re-submitted (submission #${(existing.submission_count || 1) + 1})`,
      })
    } catch { /* non-fatal */ }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
