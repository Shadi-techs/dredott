import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import BlogPostClient from './BlogPostClient'

const BASE_URL = 'https://dredott.com'
const LOCALES  = ['en', 'ar', 'ru', 'uk', 'de', 'it']

async function getPost(slug: string) {
  const { data } = await getSupabaseAdmin()
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> }
): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Not Found' }

  const title       = post[`meta_title_${locale}`]       || post[`title_${locale}`]       || post.title_en       || ''
  const description = post[`meta_description_${locale}`] || post[`excerpt_${locale}`]      || post.excerpt_en      || ''
  const image       = post.cover_image || `${BASE_URL}/og-default.jpg`

  const alternates: Record<string, string> = {}
  for (const l of LOCALES) alternates[l] = `${BASE_URL}/${l}/blog/${slug}`

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/${locale}/blog/${slug}`, languages: alternates },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/blog/${slug}`,
      siteName: 'DREDOTT',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author || 'DREDOTT Team'],
      tags: post.tags || [],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const title   = post[`title_${locale}`]   || post.title_en   || ''
  const content = post[`content_${locale}`] || post.content_en || ''
  const excerpt = post[`excerpt_${locale}`] || post.excerpt_en || ''

  // Fetch related posts (same category, different slug)
  const { data: related } = await getSupabaseAdmin()
    .from('blog_posts')
    .select('id,slug,category,cover_image,reading_time,title_en,title_ar,title_ru,title_uk,title_de,title_it,excerpt_en')
    .eq('is_published', true)
    .eq('category', post.category)
    .neq('slug', slug)
    .limit(3)

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    image: post.cover_image || `${BASE_URL}/og-default.jpg`,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { '@type': 'Organization', name: post.author || 'DREDOTT Team', url: BASE_URL },
    publisher: { '@type': 'Organization', name: 'DREDOTT', url: BASE_URL, logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/${locale}/blog/${slug}` },
    inLanguage: locale,
  }

  // hreflang link tags
  const hreflangLinks = LOCALES.map(l => ({ rel: 'alternate', hrefLang: l, href: `${BASE_URL}/${l}/blog/${slug}` }))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {hreflangLinks.map(link => (
        <link key={link.hrefLang} rel={link.rel} hrefLang={link.hrefLang} href={link.href} />
      ))}
      <BlogPostClient
        post={post}
        locale={locale}
        title={title}
        content={content}
        excerpt={excerpt}
        related={related || []}
        slug={slug}
      />
    </>
  )
}
