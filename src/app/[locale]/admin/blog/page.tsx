// ============================================
// Admin Blog Management
// Path: src/app/[locale]/admin/blog/page.tsx
// Super admin + admin can write/publish posts
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, X, Check } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORIES = ['guides', 'tips', 'news', 'local', 'properties', 'cars']

interface Post {
  id: string
  slug: string
  title: string
  category: string
  status: string
  published_at: string | null
  read_time: number
  created_at: string
}

export default function AdminBlogPage() {
  const [posts, setPosts]       = useState<Post[]>([])
  const [loading, setLoading]   = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [editPost, setEditPost] = useState<any>(null)

  // Editor form
  const [form, setForm] = useState({
    title: '', title_ar: '',
    slug: '', excerpt: '', excerpt_ar: '',
    content: '', content_ar: '',
    cover_image: '', category: 'guides',
    read_time: 3, status: 'draft',
  })

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, slug, title, category, status, published_at, read_time, created_at')
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  const openNew = () => {
    setEditPost(null)
    setForm({ title: '', title_ar: '', slug: '', excerpt: '', excerpt_ar: '', content: '', content_ar: '', cover_image: '', category: 'guides', read_time: 3, status: 'draft' })
    setShowEditor(true)
  }

  const openEdit = (post: any) => {
    setEditPost(post)
    setForm({
      title:       post.title || '',
      title_ar:    post.title_ar || '',
      slug:        post.slug || '',
      excerpt:     post.excerpt || '',
      excerpt_ar:  post.excerpt_ar || '',
      content:     post.content || '',
      content_ar:  post.content_ar || '',
      cover_image: post.cover_image || '',
      category:    post.category || 'guides',
      read_time:   post.read_time || 3,
      status:      post.status || 'draft',
    })
    setShowEditor(true)
  }

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSave = async (publish = false) => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const payload = {
      ...form,
      slug:         form.slug || generateSlug(form.title),
      status:       publish ? 'published' : form.status,
      published_at: publish ? new Date().toISOString() : (form.status === 'published' ? new Date().toISOString() : null),
      author_id:    user.id,
    }

    let error
    if (editPost?.id) {
      const { error: e } = await supabase.from('blog_posts').update(payload).eq('id', editPost.id)
      error = e
    } else {
      const { error: e } = await supabase.from('blog_posts').insert(payload)
      error = e
    }

    setSaving(false)
    if (!error) { setShowEditor(false); fetchPosts() }
  }

  const togglePublish = async (post: Post) => {
    const isPublished = post.status === 'published'
    await supabase.from('blog_posts').update({
      status: isPublished ? 'draft' : 'published',
      published_at: isPublished ? null : new Date().toISOString(),
    }).eq('id', post.id)
    fetchPosts()
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    fetchPosts()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0e1428', padding: 24 }}>

      {/* Editor Modal */}
      {showEditor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>
          <div style={{ background: '#1a2240', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 16, width: '100%', maxWidth: 720, padding: 28 }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: '#FBF0D0', fontWeight: 400 }}>
                {editPost ? 'Edit Post' : 'New Post'}
              </h2>
              <button onClick={() => setShowEditor(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Title EN/AR */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#D4A843', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Title (EN)</label>
                  <input value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value, slug: generateSlug(e.target.value) })) }}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#D4A843', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Title (AR)</label>
                  <input value={form.title_ar} onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))} dir="rtl"
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Slug + Category + Read time */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Slug</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13, boxSizing: 'border-box', fontFamily: "'JetBrains Mono', monospace" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Read time (min)</label>
                  <input type="number" min={1} max={30} value={form.read_time} onChange={e => setForm(f => ({ ...f, read_time: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#fff', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Cover image */}
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Cover image URL</label>
                <input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="https://..."
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#fff', fontSize: 13, boxSizing: 'border-box' }} />
              </div>

              {/* Excerpt EN/AR */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Excerpt (EN)</label>
                  <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#fff', fontSize: 13, resize: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Excerpt (AR)</label>
                  <textarea value={form.excerpt_ar} onChange={e => setForm(f => ({ ...f, excerpt_ar: e.target.value }))} rows={2} dir="rtl"
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#fff', fontSize: 13, resize: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Content EN/AR */}
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Content (EN) — HTML supported</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#fff', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Content (AR)</label>
                <textarea value={form.content_ar} onChange={e => setForm(f => ({ ...f, content_ar: e.target.value }))} rows={6} dir="rtl"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#fff', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7 }} />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button onClick={() => handleSave(false)} disabled={saving} style={{
                  padding: '10px 20px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                }}>
                  Save Draft
                </button>
                <button onClick={() => handleSave(true)} disabled={saving} style={{
                  padding: '10px 20px', background: '#D4A843', color: '#0e1428',
                  border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {saving ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={14} />}
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#FBF0D0', fontWeight: 400, marginBottom: 4 }}>Blog</h1>
          <p style={{ fontSize: 12, color: '#7a8aaa', fontFamily: "'JetBrains Mono', monospace" }}>{posts.length} posts</p>
        </div>
        <button onClick={openNew} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', background: '#D4A843', color: '#0e1428',
          border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13,
        }}>
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Posts list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={28} color="#D4A843" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#7a8aaa' }}>
          No posts yet — create your first one
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {posts.map(post => (
            <div key={post.id} style={{
              background: '#1a2240', border: '1px solid rgba(212,168,67,0.08)',
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, color: '#FBF0D0', fontWeight: 500, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.title}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em', color: '#D4A843', textTransform: 'uppercase' }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: 11, color: '#7a8aaa' }}>{post.read_time} min</span>
                  <span style={{ fontSize: 11, color: '#7a8aaa' }}>
                    {post.published_at ? new Date(post.published_at).toLocaleDateString('en-GB') : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <span style={{
                fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em',
                background: post.status === 'published' ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                color: post.status === 'published' ? '#4ade80' : '#7a8aaa',
                border: `1px solid ${post.status === 'published' ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
              }}>
                {post.status}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(post)} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#7a8aaa', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Edit2 size={14} />
                </button>
                <button onClick={() => togglePublish(post)} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: post.status === 'published' ? '#fbbf24' : '#4ade80', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {post.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => deletePost(post.id)} style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}