// ============================================
// DredottSTAY — Global Types v10
// Updated for Lead Gen Model
// ============================================

// --- USER & AUTH ---

export type UserRole = 'super_admin' | 'admin' | 'viewer' | 'property_owner' | 'guest'

export interface User {
  id: string
  email: string
  role: UserRole
  first_name: string
  last_name: string
  phone?: string
  whatsapp?: string
  whatsapp_preferred?: boolean
  avatar_url?: string
  nationality?: string
  city?: string
  language_preference?: Language
  travel_style?: string[]
  interests?: string[]
  bio?: string
  date_of_birth?: string
  passport_url?: string
  instagram?: string
  created_at: string
  last_seen?: string
}

export type Language = 'en' | 'ar' | 'it' | 'ru' | 'de'

// --- PROPERTY ---

export type PropertyStatus = 'available' | 'unavailable' | 'coming_soon'
export type PropertyType = 'apartment' | 'villa' | 'studio' | 'chalet'
export type PropertyArea =
  | 'naama_bay'
  | 'sharks_bay'
  | 'old_market'
  | 'ras_um_sid'
  | 'hadaba'
  | 'montazah'
  | 'nabq'

export interface Property {
  id: string
  slug: string
  name: string
  name_ar?: string
  name_it?: string
  name_ru?: string
  name_de?: string
  description: string
  description_ar?: string
  description_it?: string
  description_ru?: string
  description_de?: string
  area: PropertyArea
  type: PropertyType
  status: PropertyStatus
  bedrooms: number
  max_guests: number
  
  // Pricing (in USD — auto converts to EUR/EGP via CBE API)
  price_per_night: number
  price_per_week: number
  price_per_month: number
  price_per_3months: number
  price_per_6months: number
  utilities_per_month: number
  
  // 🆕 LEAD GEN MODEL
  price_hidden: boolean // If true, price not shown until user registers
  platform_managed: boolean // If true, has full booking flow. If false, WhatsApp contact only
  
  // 🆕 INTERNAL QUALITY SYSTEM (replaces public reviews)
  internal_score?: number // 1-10, Admin sets this
  internal_notes?: string // Super Admin/Admin only
  display_rating?: number // Auto-calculated: (internal_score / 10) * 5
  verified_location: boolean
  verified_photos: boolean
  legal_docs_checked: boolean
  
  // Media
  photos: string[]
  cover_image_index: number // Index of cover photo for OG tags (default: 0)
  video_tour_url?: string
  walkthrough_url?: string
  
  // Amenities
  amenities: PropertyAmenities
  
  // SEO
  meta_title?: string
  meta_description?: string
  
  // Relations
  owner_id?: string
  commission_rate?: number
  
  // Stats
  view_count: number
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface PropertyAmenities {
  // Default — always shown
  wifi: boolean
  ac: boolean
  kitchen: boolean
  tv: boolean
  washing_machine: boolean
  pool_access: boolean
  balcony: boolean
  sea_view: boolean
  parking: boolean
  security_24h: boolean
  // Optional — toggle from admin
  beach_access: boolean
  baby_cot: boolean
  kid_friendly: boolean
  snorkeling_gear: boolean
  bbq_area: boolean
  garden_view: boolean
  elevator: boolean
  gym_access: boolean
  daily_cleaning: boolean
  airport_transfer: boolean
}

// --- BOOKING (only for platform_managed properties) ---

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type BookingDuration = 'nightly' | 'weekly' | 'monthly' | '3months' | '6months'

export interface Booking {
  id: string
  property_id: string
  guest_id: string
  // Dates
  check_in: string
  check_out: string
  duration_type: BookingDuration
  nights: number
  // Guests
  num_guests: number
  // Pricing
  base_price: number
  utilities_included: boolean
  utilities_amount: number
  total_amount: number
  currency: 'USD' | 'EUR' | 'EGP'
  // Payment
  stripe_payment_intent_id?: string
  payment_status: 'pending' | 'paid' | 'refunded'
  // Status
  status: BookingStatus
  // Contact
  whatsapp_confirmed: boolean
  // Timestamps
  created_at: string
  updated_at: string
}

// ❌ REVIEWS REMOVED — NO LONGER EXISTS
// Public reviews are gone. Instead, use internal_score in Property.

// --- ADMIN: STAFF ---

export type StaffType = 'individual' | 'company'

export interface StaffMember {
  id: string
  type: StaffType
  name: string
  phone: string
  specialty: string // e.g. 'cleaning', 'maintenance', 'security'
  id_card_url?: string
  // If company
  company_name?: string
  company_registration?: string
  contact_person?: string
  // Timestamps
  created_at: string
}

// --- ADMIN: INVENTORY ---

export type ReportType = 'item_log' | 'maintenance' | 'check_in_out'
export type ItemCondition = 'excellent' | 'good' | 'fair' | 'poor'

export interface InventoryReport {
  id: string
  property_id: string
  type: ReportType
  title: string
  rooms: InventoryRoom[]
  staff_id?: string
  pdf_url?: string
  admin_notes?: string
  owner_comment?: string
  appointment_id?: string
  created_at: string
}

export interface InventoryRoom {
  id: string
  name: string // e.g. "Living Room", "Bedroom 1"
  items: InventoryItem[]
}

export interface InventoryItem {
  id: string
  code: string // e.g. "LR-TV-01"
  name: string
  brand?: string
  condition: ItemCondition
  photos: string[]
  video_url?: string
  notes?: string
}

// --- ADMIN: APPOINTMENTS ---

export type AppointmentStatus = 'scheduled' | 'confirmed_owner' | 'declined_owner' | 'completed'

export interface Appointment {
  id: string
  property_id: string
  staff_id?: string
  type: string // e.g. 'inventory', 'maintenance', 'cleaning'
  scheduled_at: string
  owner_present: boolean
  owner_confirmed?: boolean
  status: AppointmentStatus
  notes?: string
  created_at: string
}

// --- OWNER PORTAL ---

export interface OwnerFinancials {
  property_id: string
  period_start: string
  period_end: string
  gross_revenue: number
  commission_rate: number
  commission_amount: number
  services_deducted: number
  net_amount: number
  bookings_count: number
  occupancy_rate: number
}

export interface PropertyQualityIndex {
  property_id: string
  furniture_condition: number // 1-5
  cleanliness: number // 1-5
  appliances_condition: number // 1-5
  overall_score: number // calculated
  suggested_price_per_night: number
  last_assessed: string
}

// --- FLASH DEALS ---

export interface FlashDeal {
  id: string
  property_id: string
  dates: string[] // blocked dates being offered
  original_price: number
  deal_price: number
  discount_percentage: number
  expires_at: string
  status: 'active' | 'claimed' | 'expired'
  created_at: string
}

// --- RBAC ---

export interface AdminUser {
  id: string
  user_id: string
  role: 'super_admin' | 'admin' | 'viewer'
  permissions: AdminPermissions
  created_by: string // super_admin id
  created_at: string
}

export interface AdminPermissions {
  // Properties & Cars
  can_create_property: boolean
  can_edit_property: boolean
  can_delete_property: boolean        // super_admin only
  can_review_listings: boolean        // ✅ v13: مراجعة وحدات جديدة
  // Bookings
  can_view_bookings: boolean
  can_manage_bookings: boolean
  // Guests
  can_view_guests: boolean
  can_view_passport: boolean          // super_admin only
  can_view_financials: boolean        // super_admin only
  // Subscriptions
  can_manage_subscriptions: boolean   // ✅ v13: super_admin only
  can_grant_free_listing: boolean     // ✅ v13: super_admin only
  // Inventory
  can_manage_inventory: boolean
  // Staff
  can_manage_staff: boolean
  // Admin management
  can_manage_admins: boolean          // super_admin only
  can_delegate_admins: boolean        // ✅ v13: super_admin only
  // Commission
  can_change_commission: boolean      // super_admin only
  // Feature Flags
  can_manage_feature_flags: boolean   // ✅ v13: super_admin only
}

// 🆕 FEATURE FLAGS ---

export interface FeatureFlag {
  key: string
  enabled: boolean
  description?: string
  updated_at: string
  updated_by?: string
}

export type FeatureFlagKey = 'car_rentals' | 'dining' | 'experiences' | 'blog'

// 🆕 CAR RENTALS ---

export type CarStatus = 'available' | 'unavailable' | 'maintenance'
export type TransmissionType = 'automatic' | 'manual'
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid'

export interface Car {
  id: string
  slug: string
  
  // Names (5 languages)
  name: string
  name_ar?: string
  name_it?: string
  name_ru?: string
  name_de?: string
  
  // Descriptions (5 languages)
  description: string
  description_ar?: string
  description_it?: string
  description_ru?: string
  description_de?: string
  
  // Car details
  brand: string
  model: string
  year?: number
  transmission: TransmissionType
  fuel_type: FuelType
  seats: number
  doors?: number
  
  // Pricing (USD per day)
  price_per_day: number
  price_per_week?: number
  price_per_month?: number
  
  // Lead Gen Model (same as properties)
  price_hidden: boolean
  internal_score?: number
  internal_notes?: string
  display_rating?: number
  
  // Media
  photos: string[]
  cover_image_index: number
  
  // Features
  ac: boolean
  gps: boolean
  bluetooth: boolean
  backup_camera: boolean
  child_seat_available: boolean
  
  // Availability
  status: CarStatus
  
  // Contact
  owner_id?: string
  whatsapp_contact?: string
  
  // SEO
  meta_title?: string
  meta_description?: string
  
  // Stats
  view_count: number
  
  // Timestamps
  created_at: string
  updated_at: string
}

// 🆕 SAFETY TIPS (for contact modals/sections)

export interface SafetyTip {
  icon: string
  text: string
}

export interface SafetyTipsContent {
  title: string
  tips: SafetyTip[]
  footer: string
}
