// ============================================
// Blog List Page
// Path: src/app/[locale]/blog/page.tsx
// Posts managed by admin from /admin/blog
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image: string | null
  published_at: string
  category: string
  read_time: number
}

export default function BlogPage() {
  const router = useRouter()
  const [posts, setPosts]     = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, cover_image, published_at, category, read_time')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false) })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />

      {/* Hero */}
      <div style={{ background: '#0e1428', padding: '100px 24px 48px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.3em', color: '#D4A843', textTransform: 'uppercase', marginBottom: 14 }}>
          — Dredott Blog
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 400, color: '#FBF0D0', marginBottom: 16 }}>
          Stories from the Red Sea
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto' }}>
          Guides, tips, and local knowledge for your stay in Sharm El-Sheikh.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 280, background: '#f3f4f6', borderRadius: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>✍️</p>
            <p style={{ fontSize: 18 }}>No posts yet. Check back soon.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 24 }}>
            {posts.map(post => (
              <article key={post.id}
                onClick={() => router.push(`/en/blog/${post.slug}`)}
                style={{
                  background: '#fff', borderRadius: 16,
                  border: '1px solid rgba(0,0,0,0.06)',
                  overflow: 'hidden', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4A843'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none' }}
              >
                {/* Cover */}
                <div style={{ height: 200, background: '#f3f4f6', overflow: 'hidden' }}>
                  {post.cover_image
                    ? <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>📖</div>
                  }
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    {post.category && (
                      <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em', color: '#D4A843', textTransform: 'uppercase' }}>
                        {post.category}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>
                      {post.read_time ? `${post.read_time} min read` : ''}
                    </span>
                  </div>

                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#2C3A6B', marginBottom: 10, fontWeight: 400, lineHeight: 1.3 }}>
                    {post.title}
                  </h2>

                  <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 14,
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                  }}>
                    {post.excerpt}
                  </p>

                  <p style={{ fontSize: 12, color: '#9ca3af' }}>
                    {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}