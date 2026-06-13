import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dredott.vercel.app'
const LOCALES  = ['en', 'ar', 'ru', 'uk', 'de', 'it']

const STATIC_PAGES = [
  { path: '',           priority: 1.0, changeFreq: 'daily'  as const },
  { path: '/stays',     priority: 0.9, changeFreq: 'daily'  as const },
  { path: '/cars',      priority: 0.9, changeFreq: 'daily'  as const },
  { path: '/services',  priority: 0.8, changeFreq: 'weekly' as const },
  { path: '/about',     priority: 0.5, changeFreq: 'monthly' as const },
  { path: '/contact',   priority: 0.5, changeFreq: 'monthly' as const },
  { path: '/pricing',   priority: 0.7, changeFreq: 'weekly' as const },
  { path: '/join-us',   priority: 0.6, changeFreq: 'monthly' as const },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()
  const entries: MetadataRoute.Sitemap = []

  // Static pages — all locales
  for (const page of STATIC_PAGES) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFreq,
        priority: page.priority,
      })
    }
  }

  // Property (stays) listings
  try {
    const { data: props } = await supabase
      .from('properties')
      .select('slug, id, updated_at')
      .in('status', ['available', 'active', 'live'])
      .eq('review_status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(500)

    for (const p of props || []) {
      const key = p.slug || p.id
      for (const locale of ['en', 'ar', 'ru']) {
        entries.push({
          url: `${BASE_URL}/${locale}/stays/${key}`,
          lastModified: new Date(p.updated_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
    }
  } catch {}

  // Car listings
  try {
    const { data: cars } = await supabase
      .from('cars')
      .select('id, updated_at')
      .in('status', ['available', 'active'])
      .order('updated_at', { ascending: false })
      .limit(200)

    for (const c of cars || []) {
      for (const locale of ['en', 'ar', 'ru']) {
        entries.push({
          url: `${BASE_URL}/${locale}/cars/${c.id}`,
          lastModified: new Date(c.updated_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    }
  } catch {}

  // Blog posts
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(100)

    for (const post of posts || []) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE_URL}/${locale}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at || post.published_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
  } catch {}

  return entries
}
