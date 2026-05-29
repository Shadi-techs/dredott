// ============================================
// Admin Catch-All Redirect
// Path: src/app/admin/[[...path]]/page.tsx
// dredott.com/admin → /en/admin
// dredott.com/admin/review → /en/admin/review
// dredott.com/admin/settings/admins → /en/admin/settings/admins
// ============================================

import { redirect } from 'next/navigation'

export default function AdminCatchAll({
  params,
}: {
  params: { path?: string[] }
}) {
  const subPath = params.path?.join('/') || ''
  redirect(`/en/admin${subPath ? `/${subPath}` : ''}`)
}