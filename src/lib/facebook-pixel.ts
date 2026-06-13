// ============================================
// Facebook Pixel Helper
// Path: src/lib/facebook-pixel.ts
// ============================================

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

declare global {
  interface Window {
    fbq: (...args: any[]) => void
    _fbq: any
  }
}

/** Fire a standard PageView event */
export function pageview() {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', 'PageView')
}

/** Fire any standard or custom event */
export function event(name: string, options?: Record<string, any>) {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', name, options)
}

// ── Predefined events ─────────────────────────────────────────

/** Fired when a user views a property or car listing */
export function viewContent(params: {
  content_name: string
  content_category: 'property' | 'car' | 'service'
  content_ids: string[]
  value?: number
  currency?: string
}) {
  event('ViewContent', params)
}

/** Fired when a user performs a search */
export function search(params: { search_string: string; content_category?: string }) {
  event('Search', params)
}

/** Fired when a user submits a registration or lead form */
export function lead(params?: { content_name?: string; content_category?: string }) {
  event('Lead', params)
}

/** Fired when a booking / checkout is initiated */
export function initiateCheckout(params: {
  content_name: string
  value: number
  currency: string
  num_items?: number
}) {
  event('InitiateCheckout', params)
}

/** Fired on completed purchase / booking */
export function purchase(params: {
  content_name: string
  value: number
  currency: string
  transaction_id?: string
}) {
  event('Purchase', params)
}
