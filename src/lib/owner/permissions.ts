// src/lib/owner/permissions.ts
// Permission resolution for the Owner Portal.
//
// The Supabase migration exposes a stored function `user_permissions_for`
// that returns a JSON map of permissions the current auth.uid() has when
// acting on behalf of a given owner_id. We mirror the same shape in TS
// so the UI can gate sections consistently.

import { createBrowserClient } from '@supabase/ssr'

export const PERM_KEYS = [
  'view_financials',
  'view_analytics',
  'manage_listings',
  'manage_bookings',
  'manage_calendar',
  'manage_pricing',
  'manage_flash_deals',
  'view_guest_contact',
  'manage_team',
  'manage_settings',
] as const

export type PermKey = typeof PERM_KEYS[number]
export type Perms   = Record<PermKey, boolean>

export type RoleId  = 'owner' | 'co_host' | 'operations' | 'cleaner' | 'accountant' | 'custom'

export interface RoleDef {
  id: RoleId
  label_en: string; label_ar: string
  desc_en: string;  desc_ar: string
  perms: PermKey[]
}

// Mirror of the role catalog in the SQL migration — kept here so the UI
// can show role pickers without a round-trip to the server.
export const ROLES: Record<RoleId, RoleDef> = {
  owner: {
    id: 'owner', label_en: 'Owner', label_ar: 'المالك',
    desc_en: 'Full access.', desc_ar: 'صلاحيات كاملة.',
    perms: [...PERM_KEYS],
  },
  co_host: {
    id: 'co_host', label_en: 'Co-host', label_ar: 'مساعد المالك',
    desc_en: 'Helps run everything except money & the team.',
    desc_ar: 'يساعد في كل شيء ما عدا الفلوس وإدارة الفريق.',
    perms: ['manage_listings','manage_bookings','manage_calendar','manage_pricing','manage_flash_deals','view_guest_contact','view_analytics'],
  },
  operations: {
    id: 'operations', label_en: 'Operations', label_ar: 'التشغيل',
    desc_en: 'Handles bookings, check-ins, and the calendar.',
    desc_ar: 'يتعامل مع الحجوزات والوصول والتقويم.',
    perms: ['manage_bookings','manage_calendar','view_guest_contact'],
  },
  cleaner: {
    id: 'cleaner', label_en: 'Cleaner', label_ar: 'النظافة',
    desc_en: 'Sees only the calendar — when units are free vs booked.',
    desc_ar: 'يرى التقويم فقط — الوحدات الفارغة والمحجوزة.',
    perms: ['manage_calendar'],
  },
  accountant: {
    id: 'accountant', label_en: 'Accountant', label_ar: 'المحاسب',
    desc_en: 'Sees only the financials — no guest details.',
    desc_ar: 'يرى الماليات فقط — بدون بيانات الضيوف.',
    perms: ['view_financials','view_analytics'],
  },
  custom: {
    id: 'custom', label_en: 'Custom', label_ar: 'مخصص',
    desc_en: 'Pick exactly which permissions to grant.',
    desc_ar: 'اختر الصلاحيات واحدة واحدة.',
    perms: [],
  },
}

export const ROLE_ORDER: RoleId[] = ['co_host', 'operations', 'cleaner', 'accountant', 'custom']

// ── Permission label catalog (for UI) ──────────────────────────
export const PERMISSIONS: { id: PermKey; label_en: string; label_ar: string }[] = [
  { id: 'view_financials',    label_en: 'View financials',     label_ar: 'عرض الماليات' },
  { id: 'view_analytics',     label_en: 'View analytics',      label_ar: 'عرض الإحصائيات' },
  { id: 'manage_listings',    label_en: 'Edit listings',       label_ar: 'تعديل الإعلانات' },
  { id: 'manage_bookings',    label_en: 'Manage bookings',     label_ar: 'إدارة الحجوزات' },
  { id: 'manage_calendar',    label_en: 'Block / unblock dates', label_ar: 'حجب التواريخ' },
  { id: 'manage_pricing',     label_en: 'Change pricing',      label_ar: 'تعديل الأسعار' },
  { id: 'manage_flash_deals', label_en: 'Create flash deals',  label_ar: 'إنشاء عروض' },
  { id: 'view_guest_contact', label_en: 'See guest contacts',  label_ar: 'عرض بيانات الضيوف' },
  { id: 'manage_team',        label_en: 'Manage team',         label_ar: 'إدارة الفريق' },
  { id: 'manage_settings',    label_en: 'Account & payouts',   label_ar: 'الحساب والدفع' },
]

const ALL_TRUE: Perms = PERM_KEYS.reduce((acc, k) => ({ ...acc, [k]: true }), {} as Perms)
const ALL_FALSE: Perms = PERM_KEYS.reduce((acc, k) => ({ ...acc, [k]: false }), {} as Perms)

/**
 * Resolve permissions for `auth.uid()` acting on behalf of `ownerId`.
 *
 * Calls the SQL function `user_permissions_for(target_owner_id)` which
 * returns ALL_TRUE for the owner themselves, or a role-scoped map for
 * a team member.
 *
 * Safe-by-default: any RPC failure returns all-false so the UI locks
 * rather than leaks. Errors are logged to console for debugging.
 */
export async function loadPermissions(ownerId: string): Promise<Perms> {
  if (!ownerId) return ALL_FALSE
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await supabase.rpc('user_permissions_for', {
      target_owner_id: ownerId,
    })
    if (error) {
      console.error('[permissions] RPC failed:', error.message)
      return ALL_FALSE
    }
    // data is JSON like { view_financials: true, ... } — fill missing keys with false
    const out = { ...ALL_FALSE }
    if (data && typeof data === 'object') {
      for (const k of PERM_KEYS) {
        out[k] = data[k] === true
      }
    }
    return out
  } catch (e) {
    console.error('[permissions] unexpected:', e)
    return ALL_FALSE
  }
}

/** For the local "View as" toggle in the design — synchronously resolve
 *  a role to its permission map without hitting the network. Useful for
 *  the Tweaks panel preview / Storybook / tests. */
export function permsForRole(role: RoleId, customPerms: Partial<Perms> = {}): Perms {
  if (role === 'owner') return ALL_TRUE
  if (role === 'custom') {
    return { ...ALL_FALSE, ...customPerms }
  }
  const granted = ROLES[role].perms
  return PERM_KEYS.reduce((acc, k) => {
    acc[k] = granted.includes(k)
    return acc
  }, {} as Perms)
}
