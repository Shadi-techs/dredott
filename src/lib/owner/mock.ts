// src/lib/owner/mock.ts
// Mock data for the Owner Portal screens. Every export here corresponds to
// a Supabase query you'll wire up in production — see each TODO for the
// recommended replacement.

export interface UserInfo {
  first: string; last: string; initials: string; city: string
}

export interface SubscriptionInfo {
  plan: string; used: number; total: number; renews: string; isPremium: boolean
}

export interface KpiPoint {
  value: number; prev: number; delta: number
  currency?: string; unit?: string
}

export interface UpcomingItem {
  id: number
  type: 'checkin' | 'checkout'
  guest: string; listing: string; when: string
  nights: number; party: number; isCar?: boolean
}

export type ListingKind = 'property' | 'car'
export type ListingStatus = 'live' | 'pending' | 'paused' | 'draft'

export interface Listing {
  id: number
  kind: ListingKind
  title: string; loc: string
  status: ListingStatus
  price: number
  beds?: number; baths?: number
  seats?: number; year?: number
  views: number; rating: number; bookings: number
}

export interface PricingTip {
  id: number
  listing: string
  current: number; suggested: number
  lift: string; reason: string
}

export interface ActivityItem {
  id: number
  kind: 'booking' | 'message' | 'review' | 'payout'
  text: string; when: string
}

// ─────────────────────────────────────────────────────────────────
// TODO Supabase: replace each MOCK.* below with a real query.
// See README.md for example Supabase snippets per section.
// ─────────────────────────────────────────────────────────────────

export const MOCK = {
  // TODO Supabase: SELECT first_name, last_name, city FROM profiles WHERE id = auth.uid()
  user: { first: 'Layla', last: 'Hadid', initials: 'LH', city: 'Dubai' } as UserInfo,

  // TODO Supabase: SELECT p.name_*, p.features, us.used_slots, us.total_slots, us.expires_at
  //   FROM user_subscriptions us JOIN packages p ON p.id = us.package_id
  //   WHERE us.user_id = auth.uid() AND us.status = 'active'
  subscription: {
    plan: 'Atelier Plus',
    used: 7, total: 12,
    renews: 'Mar 14, 2026',
    isPremium: true,
  } as SubscriptionInfo,

  // TODO Supabase: aggregate `bookings` rows by month — sum(total), count(*), avg(nightly_rate)
  kpi: {
    revenue:   { value: 18420, prev: 15290, delta: +20.5, currency: 'AED' },
    occupancy: { value: 87,    prev: 79,    delta: +8.0,  unit: '%' },
    adr:       { value: 612,   prev: 588,   delta: +4.1,  currency: 'AED' },
    views:     { value: 12483, prev: 14012, delta: -10.9 },
    bookings:  { value: 34,    prev: 29,    delta: +17.2 },
  } as Record<string, KpiPoint>,

  // TODO Supabase: 30-day daily revenue series
  spark: [12,18,14,22,19,28,24,31,27,35,30,38,33,42,36,45,40,48,43,52,46,55,49,58,53,62,57,68,61,72],

  // TODO Supabase: 7-day revenue series, sum(total) GROUP BY day
  weekRev: [820, 1240, 980, 1530, 1820, 2240, 1610],

  // TODO Supabase: SELECT b.*, l.title FROM bookings b JOIN listings l ON ...
  //   WHERE owner_id = auth.uid() AND check_in BETWEEN now() AND now() + interval '7 days'
  upcoming: [
    { id: 1, type: 'checkin',  guest: 'Marco Rossi',     listing: 'Marina View Loft',    when: 'Today, 3:00 PM',     nights: 4, party: 2 },
    { id: 2, type: 'checkout', guest: 'Anna Schmidt',    listing: 'Palm Jumeirah Villa', when: 'Tomorrow, 11:00 AM', nights: 7, party: 5 },
    { id: 3, type: 'checkin',  guest: 'Yuki Tanaka',     listing: 'Downtown Penthouse',  when: 'Wed, 2:00 PM',       nights: 3, party: 2 },
    { id: 4, type: 'checkin',  guest: 'Olena Kovalenko', listing: 'Range Rover Sport',   when: 'Thu, 9:00 AM',       nights: 5, party: 1, isCar: true },
    { id: 5, type: 'checkout', guest: 'James Park',      listing: 'Marina View Loft',    when: 'Fri, 11:00 AM',      nights: 2, party: 1 },
  ] as UpcomingItem[],

  // TODO Supabase: UNION properties + cars tables, then JOIN booking counts + avg rating
  listings: [
    { id: 1, kind: 'property', title: 'Marina View Loft',      loc: 'Dubai Marina',   status: 'live',    price: 680,  beds: 2, baths: 2, views: 3240, rating: 4.91, bookings: 18 },
    { id: 2, kind: 'property', title: 'Palm Jumeirah Villa',   loc: 'Palm Jumeirah',  status: 'live',    price: 2400, beds: 5, baths: 6, views: 5120, rating: 4.97, bookings: 9  },
    { id: 3, kind: 'property', title: 'Downtown Penthouse',    loc: 'Downtown Dubai', status: 'live',    price: 1180, beds: 3, baths: 3, views: 2890, rating: 4.85, bookings: 12 },
    { id: 4, kind: 'property', title: 'JBR Beachfront Studio', loc: 'JBR',            status: 'pending', price: 420,  beds: 1, baths: 1, views: 0,    rating: 0,    bookings: 0  },
    { id: 5, kind: 'car',      title: 'Range Rover Sport',     loc: 'Dubai',          status: 'live',    price: 950,  seats: 5, year: 2024, views: 1820, rating: 4.88, bookings: 7 },
    { id: 6, kind: 'car',      title: 'Mercedes G63 AMG',      loc: 'Dubai',          status: 'live',    price: 1850, seats: 5, year: 2025, views: 2410, rating: 5.0,  bookings: 5 },
    { id: 7, kind: 'car',      title: 'Porsche 911 Carrera',   loc: 'Dubai',          status: 'paused',  price: 1400, seats: 4, year: 2024, views: 940,  rating: 4.92, bookings: 3 },
  ] as Listing[],

  // TODO Supabase: call your pricing-suggestion edge function or RPC
  pricing: [
    { id: 1, listing: 'Marina View Loft',    current: 680,  suggested: 740,  lift: '+8.8%', reason: 'High demand Mar 18–22 (event surge)' },
    { id: 2, listing: 'Range Rover Sport',   current: 950,  suggested: 880,  lift: '−7.4%', reason: 'Competitor undercut, low booking velocity' },
    { id: 3, listing: 'Downtown Penthouse',  current: 1180, suggested: 1290, lift: '+9.3%', reason: 'Weekend premium signals' },
  ] as PricingTip[],

  // TODO Supabase: same pending count you already compute in layout.tsx
  pending: 1,

  // TODO Supabase: SELECT * FROM activity_log WHERE owner_id = ... ORDER BY created_at DESC LIMIT 10
  activity: [
    { id: 1, kind: 'booking', text: 'Anna Schmidt booked Palm Jumeirah Villa', when: '12 min ago' },
    { id: 2, kind: 'message', text: 'New message from Marco Rossi',            when: '1 h ago' },
    { id: 3, kind: 'review',  text: 'Yuki Tanaka left a 5★ review',           when: '3 h ago' },
    { id: 4, kind: 'payout',  text: 'Payout of AED 8,420 sent to bank',        when: 'Yesterday' },
  ] as ActivityItem[],
}

export function fmtCurrency(n: number, cur = 'AED') {
  return `${cur} ${n.toLocaleString('en-US')}`
}
export function fmtDelta(n: number) {
  const s = n >= 0 ? '+' : ''
  return `${s}${n.toFixed(1)}%`
}
