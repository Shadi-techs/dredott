// ============================================
// DredottSTAY — Utility Functions
// Feature Flags, Price Gate, Currency Conversion
// Path: src/lib/utils.ts
// ============================================

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ============================================
// FEATURE FLAGS
// ============================================

/**
 * Check if a feature is enabled
 * @param featureKey - The feature flag key (e.g., 'car_rentals')
 * @returns Promise<boolean>
 */
export async function isFeatureEnabled(featureKey: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('feature_flags')
    .select('enabled')
    .eq('key', featureKey)
    .single()

  if (error || !data) {
    // Default to disabled if error
    return false
  }

  return data.enabled
}

/**
 * Get all feature flags at once (for performance)
 * @returns Promise<Record<string, boolean>>
 */
export async function getAllFeatureFlags(): Promise<Record<string, boolean>> {
  const supabase = getSupabaseClient()
  
  const { data } = await supabase
    .from('feature_flags')
    .select('key, enabled')

  if (!data) return {}

  return data.reduce((acc, flag) => {
    acc[flag.key] = flag.enabled
    return acc
  }, {} as Record<string, boolean>)
}

// ============================================
// PRICE VISIBILITY
// ============================================

/**
 * Check if user can see price for a property
 * @param priceHidden - Is price hidden for this property?
 * @param userId - Current user ID (null if not logged in)
 * @returns boolean
 */
export function canSeePrice(priceHidden: boolean, userId: string | null): boolean {
  // If price is NOT hidden, everyone can see it
  if (!priceHidden) return true
  
  // If price IS hidden, only logged-in users can see it
  return !!userId
}

/**
 * Check if property has full booking flow or WhatsApp only
 * @param platformManaged - Is this a Dredottmanaged property?
 * @returns 'booking' | 'whatsapp'
 */
export function getContactMethod(platformManaged: boolean): 'booking' | 'whatsapp' {
  return platformManaged ? 'booking' : 'whatsapp'
}

// ============================================
// CURRENCY CONVERSION (via CBE API)
// ============================================

/**
 * Convert USD to target currency using CBE API
 * @param amountUSD - Amount in USD
 * @param targetCurrency - 'EUR' | 'EGP'
 * @returns Promise<number>
 */
export async function convertCurrency(
  amountUSD: number,
  targetCurrency: 'EUR' | 'EGP'
): Promise<number> {
  try {
    // Cache key for localStorage
    const cacheKey = `exchange_rates_${new Date().toDateString()}`
    
    // Check cache first (rates updated daily)
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const rates = JSON.parse(cached)
        return Math.round(amountUSD * rates[targetCurrency] * 100) / 100
      }
    }

    // Fetch from CBE API
    const response = await fetch('https://www.cbe.org.eg/_vti_bin/DWS/ExchangeRates/ExchangeRates.json')
    const data = await response.json()

    // Parse rates (CBE returns EGP rates, need to calculate EUR)
    const usdToEgp = parseFloat(data.Rates.find((r: any) => r.Currency === 'USD')?.SaleRate || 30.9)
    const eurToEgp = parseFloat(data.Rates.find((r: any) => r.Currency === 'EUR')?.SaleRate || 33.5)
    
    const rates = {
      EGP: usdToEgp,
      EUR: usdToEgp / eurToEgp, // Cross rate
    }

    // Cache for today
    if (typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify(rates))
    }

    return Math.round(amountUSD * rates[targetCurrency] * 100) / 100
  } catch (error) {
    console.error('Currency conversion failed:', error)
    
    // Fallback rates if API fails
    const fallbackRates = {
      EGP: 30.9,
      EUR: 0.92,
    }
    
    return Math.round(amountUSD * fallbackRates[targetCurrency] * 100) / 100
  }
}

/**
 * Format price with currency symbol
 * @param amount - Price amount
 * @param currency - 'USD' | 'EUR' | 'EGP'
 * @returns Formatted string (e.g., "$150", "€138", "EGP 4,635")
 */
export function formatPrice(amount: number, currency: 'USD' | 'EUR' | 'EGP'): string {
  const symbols = {
    USD: '$',
    EUR: '€',
    EGP: 'EGP ',
  }

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)

  return `${symbols[currency]}${formatted}`
}

/**
 * Detect user's preferred currency based on location
 * @param countryCode - ISO country code (e.g., 'EG', 'IT', 'DE')
 * @returns 'USD' | 'EUR' | 'EGP'
 */
export function detectCurrency(countryCode?: string): 'USD' | 'EUR' | 'EGP' {
  if (!countryCode) return 'USD'

  // European countries use EUR
  const europeanCountries = ['IT', 'DE', 'FR', 'ES', 'NL', 'BE', 'AT', 'GR', 'PT', 'IE', 'FI']
  if (europeanCountries.includes(countryCode.toUpperCase())) {
    return 'EUR'
  }

  // Egypt and Arab countries use EGP
  const arabCountries = ['EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'JO', 'LB']
  if (arabCountries.includes(countryCode.toUpperCase())) {
    return 'EGP'
  }

  // Default to USD
  return 'USD'
}

// ============================================
// RATING CALCULATIONS
// ============================================

/**
 * Convert internal score (1-10) to display rating (1-5)
 * @param internalScore - Score from 1-10
 * @returns Rating from 1-5 (with 1 decimal)
 */
export function calculateDisplayRating(internalScore: number): number {
  if (internalScore < 1 || internalScore > 10) {
    throw new Error('Internal score must be between 1 and 10')
  }
  
  return Math.round((internalScore / 10) * 5 * 10) / 10
}

/**
 * Generate star icons array for display
 * @param rating - Display rating (1-5)
 * @returns Array of 'full' | 'half' | 'empty'
 */
export function generateStarArray(rating: number): ('full' | 'half' | 'empty')[] {
  const stars: ('full' | 'half' | 'empty')[] = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push('full')
    } else if (i === fullStars && hasHalfStar) {
      stars.push('half')
    } else {
      stars.push('empty')
    }
  }

  return stars
}

// ============================================
// URL HELPERS
// ============================================

/**
 * Generate WhatsApp link with pre-filled message
 * @param phoneNumber - WhatsApp number (format: +201234567890)
 * @param propertyName - Name of property
 * @param locale - Current locale
 * @returns WhatsApp URL
 */
export function generateWhatsAppLink(
  phoneNumber: string,
  propertyName: string,
  locale: string,
  customMessage?: string
): string {
  const messages = {
    en: `Hi! I'm interested in ${propertyName}. Can we discuss availability?`,
    ar: `مرحباً! أنا مهتم بـ ${propertyName}. هل يمكننا مناقشة التوفر؟`,
    it: `Ciao! Sono interessato a ${propertyName}. Possiamo discutere della disponibilità?`,
    ru: `Привет! Меня интересует ${propertyName}. Можем обсудить наличие?`,
    de: `Hallo! Ich interessiere mich für ${propertyName}. Können wir die Verfügbarkeit besprechen?`,
  }

  const message = customMessage || messages[locale as keyof typeof messages] || messages.en
  const encodedMessage = encodeURIComponent(message)
  
  return `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`
}

// ============================================
// ADMIN PERMISSION CHECKS
// ============================================

/**
 * Check if user has specific admin permission
 * @param userId - User ID
 * @param permission - Permission name
 * @returns Promise<boolean>
 */
export async function hasAdminPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  const supabase = getSupabaseClient()
  
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (!data) return false

  // Super admin has all permissions
  if (data.role === 'super_admin') return true
  
  // Admin has most permissions except financial/deletion
  if (data.role === 'admin') {
    const restrictedPermissions = ['can_delete_property', 'can_view_financials', 'can_change_commission', 'can_manage_admins']
    return !restrictedPermissions.includes(permission)
  }
  
  // Viewer has read-only
  if (data.role === 'viewer') {
    const viewerPermissions = ['can_view_bookings', 'can_view_guests']
    return viewerPermissions.includes(permission)
  }

  return false
}

/**
 * Check if user is Super Admin
 * @param userId - User ID
 * @returns Promise<boolean>
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return data?.role === 'super_admin'
}

// ============================================
// DATE HELPERS
// ============================================

/**
 * Check if date is blocked for a property
 * @param propertyId - Property ID
 * @param date - Date to check
 * @returns Promise<boolean>
 */
export async function isDateBlocked(propertyId: string, date: Date): Promise<boolean> {
  const supabase = getSupabaseClient()
  
  const dateStr = date.toISOString().split('T')[0]
  
  const { data } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('property_id', propertyId)
    .eq('date', dateStr)
    .maybeSingle()

  return !!data
}

// ============================================
// SLUG GENERATION
// ============================================

/**
 * Generate URL-friendly slug from text
 * @param text - Text to convert
 * @returns Slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .trim()
}