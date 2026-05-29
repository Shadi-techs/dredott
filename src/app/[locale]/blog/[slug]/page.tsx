// ============================================
// Blog Post Detail Page
// Path: src/app/[locale]/blog/[slug]/page.tsx
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BlogPostPage() {
  const router   = useRouter()
  const params   = useParams()
  const pathname = usePathname()
  const slug     = params.slug as string
  const locale   = pathname.split('/')[1] || 'en'

  const [post, setPost]       = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
      .then(({ data }) => { setPost(data); setLoading(false) })
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #D4A843', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!post) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 48 }}>📖</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#2C3A6B' }}>Post not found</h2>
      <button onClick={() => router.push(`/${locale}/blog`)} style={{ padding: '10px 24px', background: '#2C3A6B', color: '#D4A843', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        Back to Blog
      </button>
    </div>
  )

  const isAr    = locale === 'ar'
  const title   = isAr && post.title_ar   ? post.title_ar   : post.title
  const content = isAr && post.content_ar ? post.content_ar : post.content

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />

      {/* Cover image */}
      {post.cover_image && (
        <div style={{ height: 420, overflow: 'hidden', marginTop: 0 }}>
          <img src={post.cover_image} alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Back */}
        <button onClick={() => router.push(`/${locale}/blog`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', marginBottom: 28 }}>
          <ArrowLeft size={16} /> Back to Blog
        </button>

        {/* Category */}
        {post.category && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.25em', color: '#D4A843', textTransform: 'uppercase', marginBottom: 14 }}>
            — {post.category}
          </p>
        )}

        {/* Title */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 44, fontWeight: 400, color: '#2C3A6B',
          lineHeight: 1.15, marginBottom: 20,
          direction: isAr ? 'rtl' : 'ltr',
        }}>
          {title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36, paddingBottom: 28, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          {post.published_at && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9ca3af' }}>
              <Calendar size={14} />
              {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
          {post.read_time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9ca3af' }}>
              <Clock size={14} />
              {post.read_time} min read
            </div>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            fontSize: 16, lineHeight: 1.85, color: '#374151',
            direction: isAr ? 'rtl' : 'ltr',
          }}
          dangerouslySetInnerHTML={{ __html: content || '' }}
        />

        {/* CTA */}
        <div style={{
          marginTop: 48, padding: 28,
          background: '#0e1428', borderRadius: 16,
          border: '1px solid rgba(212,168,67,0.2)',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: '#FBF0D0', marginBottom: 8 }}>
            Ready to visit Sharm?
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
            Browse our curated stays and cars.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => router.push(`/${locale}/properties`)} style={{
              padding: '10px 22px', background: '#D4A843', color: '#0e1428',
              borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
            }}>Browse Stays</button>
            <button onClick={() => router.push(`/${locale}/cars`)} style={{
              padding: '10px 22px', background: 'rgba(255,255,255,0.08)', color: '#FBF0D0',
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: 13,
            }}>Browse Cars</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}