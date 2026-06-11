import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/en/admin/', '/ar/admin/', '/ru/admin/', '/uk/admin/', '/de/admin/', '/it/admin/'],
      },
      // Allow AI crawlers explicitly
      { userAgent: 'GPTBot',        allow: '/' },
      { userAgent: 'ClaudeBot',     allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'anthropic-ai',  allow: '/' },
      { userAgent: 'Googlebot',     allow: '/' },
    ],
    sitemap: 'https://dredott.com/sitemap.xml',
  }
}
