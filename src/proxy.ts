// ============================================
// Proxy (Next.js 16)
// Path: src/proxy.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import * as jose from 'jose'

const LOCALES = ['en', 'ar', 'ru', 'uk', 'de', 'it']
const DEFAULT = 'en'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

const intlMiddleware = createIntlMiddleware({
  locales:       LOCALES,
  defaultLocale: DEFAULT,
  localePrefix:  'always',
})

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ Skip API routes — لازم يكون أول حاجة قبل أي حاجة تانية
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Skip static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/auth')  ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const locale       = LOCALES.find(l => pathname.startsWith(`/${l}`)) || DEFAULT
  const isAdminLogin = pathname === `/${locale}/admin/login` || pathname === `/${locale}/admin/verify-pin`
  const isAdminRoute = pathname.startsWith(`/${locale}/admin`) && !isAdminLogin
  const isOwnerRoute = pathname.startsWith(`/${locale}/owner`)
  const isMaintPage  = pathname.includes('/maintenance')

  // ── 1. Admin routes — JWT only ──
  if (isAdminRoute) {
    const adminToken = req.cookies.get('admin_token')?.value

    if (!adminToken) {
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, req.url))
    }

    try {
      const { payload } = await jose.jwtVerify(adminToken, JWT_SECRET)
      if (payload.type !== 'admin') {
        return NextResponse.redirect(new URL(`/${locale}/admin/login`, req.url))
      }
    } catch {
      const response = NextResponse.redirect(new URL(`/${locale}/admin/login`, req.url))
      response.cookies.delete('admin_token')
      return response
    }
  }

  // ── 2. User routes — Supabase Auth ──
  const res = NextResponse.next()

  if (isOwnerRoute || !isMaintPage) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll:  () => req.cookies.getAll(),
          setAll: (cs) => cs.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          ),
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Maintenance mode
    if (!isMaintPage) {
      const { data: flag } = await supabase
        .from('feature_flags')
        .select('enabled')
        .eq('key', 'maintenance_mode')
        .single()

      if (flag?.enabled === true && !user) {
        return NextResponse.redirect(new URL('/maintenance', req.url))
      }
    }

    // Owner protection
    if (isOwnerRoute && !user) {
      const loginUrl = new URL(`/${locale}/login`, req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)'],
}