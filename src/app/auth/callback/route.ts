// ============================================
// Auth Callback Route
// Path: src/app/auth/callback/route.ts
// Handles:
//   - Google OAuth redirect
//   - Email confirmation redirect
//   - Password reset redirect
// After auth → smart redirect by role
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code     = searchParams.get('code')
  const next     = searchParams.get('next') ?? '/'
  const redirect = searchParams.get('redirect')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll:  () => cookieStore.getAll(),
          setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Explicit redirect param (from price gate) → use it
      if (redirect) {
        return NextResponse.redirect(`${origin}${redirect}`)
      }

      // Smart redirect by role
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = prof?.role || 'guest'

        if (role === 'property_owner') {
          return NextResponse.redirect(`${origin}/en/owner`)
        }
        if (['admin', 'super_admin', 'viewer'].includes(role)) {
          return NextResponse.redirect(`${origin}/en/admin`)
        }
      }

      // Default → properties page
      return NextResponse.redirect(`${origin}/en/properties`)
    }
  }

  // Error fallback
  return NextResponse.redirect(`${origin}/en/login?error=auth_callback_failed`)
}