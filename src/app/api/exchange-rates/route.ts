import { NextResponse } from 'next/server'

// Cached at the edge for 24 hours — one external call per day max
export const revalidate = 86400

// Fallback if the external API is down (update periodically)
const FALLBACK = { USD: 0.0198, EUR: 0.0182 }  // 1 EGP in USD/EUR

export async function GET() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/EGP', {
      next: { revalidate: 86400 },
    })
    if (!res.ok) throw new Error('API error')
    const data = await res.json()

    return NextResponse.json({
      // Rates are: 1 EGP = X of each currency
      USD: data.rates?.USD ?? FALLBACK.USD,
      EUR: data.rates?.EUR ?? FALLBACK.EUR,
      EGP: 1,
      updatedAt: data.time_last_updated ?? Date.now(),
    }, {
      headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600' },
    })
  } catch {
    return NextResponse.json({
      USD: FALLBACK.USD,
      EUR: FALLBACK.EUR,
      EGP: 1,
      updatedAt: null,
    })
  }
}
