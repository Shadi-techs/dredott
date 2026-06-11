'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Globe } from 'lucide-react'
import { useAdminDark } from '@/contexts/AdminDarkContext'
import SiteVisibilityToggle from '@/components/admin/SiteVisibilityToggle'

interface Post {
  id: string; slug: string; category: string; is_published: boolean
  reading_time: number; published_at: string | null; created_at: string
  title_en: string; title_ar: string; cover_image: string | null; tags: string[]
}

export default function AdminBlogListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { dark } = useAdminDark()
  const router = useRouter()

  const [posts, setPosts]     = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const bg     = dark ? '#0e1428' : '#F4F6FA'
  const card   = dark ? '#1e2d4f' : '#fff'
  const text   = dark ? '#FBF0D0' : '#1a2240'
  const sub    = dark ? '#7a8aaa' : '#6B7280'
  const border = dark ? 'rgba(212,168,67,0.1)' : '#e5e7eb'

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/blog?limit=100')
    if (res.ok) { const data = await res.json(); setPosts(data.posts || []) }
    setLoading(false)
  }

  const togglePublish = async (post: Post) => {
    setToggling(post.id)
    await fetch('/api/admin/blog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id, is_published: !post.is_published }),
    })
    await fetchPosts()
    setToggling(null)
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return
    setDeleting(id)
    await fetch('/api/admin/blog', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setPosts(p => p.filter(x => x.id !== id))
    setDeleting(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '32px 24px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, color: text, fontWeight: 400, margin: '0 0 4px' }}>Blog</h1>
            <p style={{ fontSize: 12, color: sub, fontFamily: "'JetBrains Mono',monospace" }}>{posts.length} posts</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <SiteVisibilityToggle moduleKey="module_blog" dark={dark} />
            <a href={`/${locale}/blog`} target="_blank" rel="noopener"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 9, color: sub, fontSize: 13, textDecoration: 'none' }}>
              <Globe size={14} /> View Blog
            </a>
            <button onClick={() => router.push(`/${locale}/admin/blog/new`)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: '#D4A843', color: '#0e1428', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              <Plus size={15} /> New Post
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Loader2 size={28} color="#D4A843" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: sub }}>
            <p style={{ fontSize: 16, margin: '0 0 20px' }}>No posts yet — create your first one</p>
            <button onClick={() => router.push(`/${locale}/admin/blog/new`)}
              style={{ padding: '11px 24px', background: '#D4A843', color: '#0e1428', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700 }}>
              Create Post
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {posts.map(post => (
              <div key={post.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 40, borderRadius: 8, flexShrink: 0, background: post.cover_image ? `url(${post.cover_image}) center/cover` : 'linear-gradient(135deg,#2C3A6B,#1a2540)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, color: text, fontWeight: 500, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title_en || '(no title)'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: '#D4A843', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{post.category}</span>
                    <span style={{ fontSize: 11, color: sub }}>{post.reading_time} min</span>
                    <span style={{ fontSize: 11, color: sub }}>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-GB') : 'Draft'}</span>
                    {post.title_ar && <span style={{ fontSize: 10, color: '#D4A843' }}>AR ✓</span>}
                  </div>
                </div>
                <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", flexShrink: 0,
                  background: post.is_published ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                  color: post.is_published ? '#4ade80' : sub,
                  border: `1px solid ${post.is_published ? 'rgba(34,197,94,0.25)' : border}` }}>
                  {post.is_published ? 'Published' : 'Draft'}
                </span>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => router.push(`/${locale}/admin/blog/${post.id}`)}
                    style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${border}`, borderRadius: 8, color: sub, cursor: 'pointer', display: 'flex' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => togglePublish(post)} disabled={toggling === post.id}
                    style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${border}`, borderRadius: 8, color: post.is_published ? '#fbbf24' : '#4ade80', cursor: 'pointer', display: 'flex', opacity: toggling === post.id ? 0.5 : 1 }}>
                    {toggling === post.id ? <Loader2 size={13} style={{ animation: 'spin 0.6s linear infinite' }} /> : post.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => deletePost(post.id)} disabled={deleting === post.id}
                    style={{ padding: '7px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', display: 'flex', opacity: deleting === post.id ? 0.5 : 1 }}>
                    {deleting === post.id ? <Loader2 size={13} style={{ animation: 'spin 0.6s linear infinite' }} /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
