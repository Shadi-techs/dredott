// ============================================
// DredottSTAY — Analytics & Tracking
// Facebook Pixel + Google Analytics
// Respects cookie consent
// ============================================

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

// Initialize Facebook Pixel
export function initFBPixel() {
  if (typeof window === 'undefined' || !FB_PIXEL_ID) return
  const consent = localStorage.getItem('ws_cookie_consent')
  if (consent !== 'accepted') return

  ;(window as any).fbq('init', FB_PIXEL_ID)
  ;(window as any).fbq('track', 'PageView')
}

// Track page view (called on route change)
export function trackPageView(url: string) {
  if (typeof window === 'undefined') return
  const consent = localStorage.getItem('ws_cookie_consent')
  if (consent !== 'accepted') return

  // Facebook
  if ((window as any).fbq) {
    ;(window as any).fbq('track', 'PageView')
  }
  // Google Analytics
  if ((window as any).gtag) {
    ;(window as any).gtag('config', GA_ID, { page_path: url })
  }
}

// Track custom events
export function trackEvent(eventName: string, data?: Record<string, any>) {
  if (typeof window === 'undefined') return
  const consent = localStorage.getItem('ws_cookie_consent')
  if (consent !== 'accepted') return

  // Facebook
  if ((window as any).fbq) {
    ;(window as any).fbq('track', eventName, data)
  }
  // Google
  if ((window as any).gtag) {
    ;(window as any).gtag('event', eventName, data)
  }
}

// Predefined events for DredottStay
export const Analytics = {
  // Property viewed
  viewProperty: (propertyName: string, area: string) =>
    trackEvent('ViewContent', { content_name: propertyName, content_category: area }),

  // Search performed
  search: (area?: string) =>
    trackEvent('Search', { search_string: area || 'all' }),

  // Booking started
  initiateBooking: (propertyName: string, value: number, currency: string) =>
    trackEvent('InitiateCheckout', { content_name: propertyName, value, currency }),

  // Booking completed
  purchase: (bookingId: string, value: number, currency: string) =>
    trackEvent('Purchase', { content_ids: [bookingId], value, currency }),

  // Registration
  register: () => trackEvent('CompleteRegistration'),

  // Contact
  contact: () => trackEvent('Contact'),
}

// Route change tracker component
export function RouteChangeTracker() {
  const pathname = usePathname()
  useEffect(() => { trackPageView(pathname) }, [pathname])
  return null
}

