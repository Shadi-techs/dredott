// ============================================
// Admin Entry Point
// Path: src/app/admin/[[...path]]/page.tsx
// /admin → /en/admin/login (if not logged in)
// /admin/anything → /en/admin/anything
// ============================================

import { redirect } from 'next/navigation'

export default function AdminCatchAll({
  params,
}: {
  params: { path?: string[] }
}) {
  const subPath = params.path?.join('/') || ''
  // Default locale for admin is 'en'
  redirect(`/en/admin${subPath ? `/${subPath}` : '/login'}`)
}