// ============================================
// DredottSTAY — RBAC Utilities v13
// Path: src/lib/utils/rbac.ts
// Changes:
//   - Added review_listings permission
//   - Added manage_subscriptions permission
//   - Added can_grant_free_listing
//   - Added can_delegate_admins
//   - Added isPremiumOwner helper
//   - Admin domain validation helper
// ============================================

import { createClient } from '@/lib/supabase/server'
import type { UserRole, AdminPermissions } from '@/types'

// ============================================
// PERMISSIONS MATRIX
// ============================================

export const DEFAULT_PERMISSIONS: Record<string, AdminPermissions> = {
  super_admin: {
    // Properties & Cars
    can_create_property: true,
    can_edit_property: true,
    can_delete_property: true,
    can_review_listings: true,       // ✅ مراجعة وحدات جديدة
    // Bookings & Guests
    can_view_bookings: true,
    can_manage_bookings: true,
    can_view_guests: true,
    can_view_passport: true,         // super_admin فقط
    // Financials
    can_view_financials: true,       // super_admin فقط
    can_change_commission: true,     // super_admin فقط
    can_manage_subscriptions: true,  // super_admin فقط
    can_grant_free_listing: true,    // super_admin فقط
    // Inventory & Staff
    can_manage_inventory: true,
    can_manage_staff: true,
    can_manage_admins: true,         // super_admin فقط
    can_delegate_admins: true,       // super_admin فقط — يخول sub-admins
    // Feature Flags
    can_manage_feature_flags: true,  // super_admin فقط
  },

  admin: {
    // Properties & Cars
    can_create_property: true,
    can_edit_property: true,
    can_delete_property: false,
    can_review_listings: true,       // ✅ لو super_admin فوّضه
    // Bookings & Guests
    can_view_bookings: true,
    can_manage_bookings: true,
    can_view_guests: true,
    can_view_passport: false,
    // Financials
    can_view_financials: false,
    can_change_commission: false,
    can_manage_subscriptions: false,
    can_grant_free_listing: false,
    // Inventory & Staff
    can_manage_inventory: true,
    can_manage_staff: false,
    can_manage_admins: false,
    can_delegate_admins: false,
    // Feature Flags
    can_manage_feature_flags: false,
  },

  viewer: {
    can_create_property: false,
    can_edit_property: false,
    can_delete_property: false,
    can_review_listings: false,
    can_view_bookings: true,
    can_manage_bookings: false,
    can_view_guests: true,
    can_view_passport: false,
    can_view_financials: false,
    can_change_commission: false,
    can_manage_subscriptions: false,
    can_grant_free_listing: false,
    can_manage_inventory: false,
    can_manage_staff: false,
    can_manage_admins: false,
    can_delegate_admins: false,
    can_manage_feature_flags: false,
  },
}

// ============================================
// ADMIN HELPERS
// ============================================

// جيب permissions اليوزر الحالي
export async function getAdminPermissions(): Promise<AdminPermissions | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!adminUser) return null

  return adminUser as AdminPermissions
}

// هل اليوزر super_admin؟
export async function isSuperAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .eq('role', 'super_admin')
    .single()

  return !!data
}

// هل sub-admin مخوّل (email domain + delegated_by موجود)؟
export async function isValidSubAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email, admin_email_domain, delegated_by')
    .eq('id', userId)
    .single()

  if (!profile) return false
  if (profile.role === 'super_admin') return true
  if (!['admin', 'viewer'].includes(profile.role)) return false

  // لازم يكون متخوّل
  if (!profile.delegated_by) return false

  // لازم email من domain الشركة
  if (!profile.admin_email_domain || !profile.email) return false
  const emailDomain = profile.email.split('@')[1]?.toLowerCase()
  return emailDomain === profile.admin_email_domain.toLowerCase()
}

// ============================================
// PERMISSION CHECK HELPER
// ============================================

export function hasPermission(
  permissions: AdminPermissions | null,
  permission: keyof AdminPermissions
): boolean {
  if (!permissions) return false
  return permissions[permission] === true
}

// ============================================
// OWNER / PREMIUM HELPERS
// ============================================

// هل المالك premium نشط؟
export async function isPremiumOwner(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, premium_expires_at')
    .eq('id', userId)
    .single()

  if (!profile?.is_premium) return false
  if (!profile.premium_expires_at) return true // premium بلا تاريخ انتهاء

  return new Date(profile.premium_expires_at) > new Date()
}

// هل الاشتراك free (courtesy)؟
export async function isFreeOwner(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('is_free, free_until')
    .eq('owner_id', userId)
    .single()

  if (!sub?.is_free) return false
  if (!sub.free_until) return true

  return new Date(sub.free_until) > new Date()
}

// ============================================
// CONSTANTS
// ============================================

// Actions تحتاج super_admin فقط
export const SUPER_ADMIN_ONLY_ACTIONS = [
  'delete_property',
  'delete_guest',
  'change_commission',
  'view_passport',
  'view_financials',
  'manage_admins',
  'delegate_admins',
  'manage_feature_flags',
  'manage_subscriptions',
  'grant_free_listing',
] as const

// Premium features — تُمنع لو مش premium
export const PREMIUM_ONLY_FEATURES = [
  'calendar',
  'ical_sync',
  'visitor_stats',
  'analytics_export',
] as const