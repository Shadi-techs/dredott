import { MetadataRoute } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const BASE_URL = 'https://dredott.com'
const LOCALES = ['en', 'ar', 'ru', 'uk', 'de', 'it']

const STATIC_PAGES = [
  { path: '', priority: 1.0, changeFreq: 'daily' as const },
  { path: '/properties', priority: 0.9, changeFreq: 'daily' as const },
  { path: '/cars', priority: 0.9, changeFreq: 'daily' as const },
  { path: '/blog', priority: 0.8, changeFreq: 'daily' as const },
  { path: '/services', priority: 0.7, changeFreq: 'weekly' as const },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Blog posts — all locales
  try {
    const { data: posts } = await getSupabaseAdmin()
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    for (const post of posts || []) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE_URL}/${locale}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at || post.published_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    }
  } catch {}

  return entries
}
