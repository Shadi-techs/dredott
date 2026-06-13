import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dredott.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/en/admin/', '/ar/admin/', '/ru/admin/', '/uk/admin/', '/de/admin/', '/it/admin/',
          '/en/owner/',  '/ar/owner/',  '/ru/owner/',  '/uk/owner/',  '/de/owner/',  '/it/owner/',
        ],
      },
      { userAgent: 'GPTBot',        allow: '/' },
      { userAgent: 'ClaudeBot',     allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'anthropic-ai',  allow: '/' },
      { userAgent: 'Googlebot',     allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
