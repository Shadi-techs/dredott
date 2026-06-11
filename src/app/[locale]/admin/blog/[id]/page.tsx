'use client'

import { useEffect, useState, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Save, Globe, ArrowLeft, Loader2, Eye, EyeOff, Sparkles, Upload, X, Tag, Clock } from 'lucide-react'
import { useAdminDark } from '@/contexts/AdminDarkContext'

const LANGS = [
  { code: 'en', label: 'EN', name: 'English',   rtl: false },
  { code: 'ar', label: 'عر', name: 'Arabic',    rtl: true  },
  { code: 'ru', label: 'RU', name: 'Russian',   rtl: false },
  { code: 'uk', label: 'UK', name: 'Ukrainian', rtl: false },
  { code: 'de', label: 'DE', name: 'German',    rtl: false },
  { code: 'it', label: 'IT', name: 'Italian',   rtl: false },
]

const CATEGORIES = ['guides', 'travel', 'cars', 'tips', 'news', 'family', 'general']

interface FormLang {
  title: string; excerpt: string; content: string
  meta_title: string; meta_description: string
}

type LangKey = 'en' | 'ar' | 'ru' | 'uk' | 'de' | 'it'

const emptyLang = (): FormLang => ({ title: '', excerpt: '', content: '', meta_title: '', meta_description: '' })

export default function AdminBlogEditorPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params)
  const isNew = id === 'new'
  const { dark } = useAdminDark()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeLang, setActiveLang]   = useState<LangKey>('en')
  const [langs, setLangs]             = useState<Record<LangKey, FormLang>>({
    en: emptyLang(), ar: emptyLang(), ru: emptyLang(), uk: emptyLang(), de: emptyLang(), it: emptyLang()
  })
  const [category, setCategory]       = useState('guides')
  const [slug, setSlug]               = useState('')
  const [tags, setTags]               = useState('')
  const [readingTime, setReadingTime] = useState(5)
  const [isPublished, setIsPublished] = useState(false)
  const [coverImage, setCoverImage]   = useState('')
  const [uploading, setUploading]     = useState(false)
  const [saving, setSaving]           = useState(false)
  const [translating, setTranslating] = useState(false)
  const [loading, setLoading]         = useState(!isNew)
  const [saved, setSaved]             = useState(false)
  const [error, setError]             = useState('')
  const [translateError, setTranslateError] = useState('')
  const [showPreview, setShowPreview]       = useState(false)
  const [tagInput, setTagInput]             = useState('')

  const bg     = dark ? '#0e1428' : '#F4F6FA'
  const card   = dark ? '#1e2d4f' : '#fff'
  const text   = dark ? '#FBF0D0' : '#1a2240'
  const sub    = dark ? '#7a8aaa' : '#6B7280'
  const border = dark ? 'rgba(212,168,67,0.1)' : '#e5e7eb'
  const inp    = { width: '100%', padding: '10px 14px', background: dark ? 'rgba(255,255,255,0.04)' : '#F9F8F5', border: `1px solid ${border}`, borderRadius: 9, color: text, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'DM Sans, sans-serif' }

  useEffect(() => {
    if (!isNew) loadPost()
  }, [id])

  const loadPost = async () => {
    const res = await fetch(`/api/admin/blog?limit=1&id=${id}`)
    if (res.ok) {
      const data = await res.json()
      // Fetch the full post by getting all and filtering
      const res2 = await fetch('/api/admin/blog?limit=200')
      if (res2.ok) {
        const data2 = await res2.json()
        const post = (data2.posts || []).find((p: any) => p.id === id)
        if (post) populateForm(post)
      }
    }
    setLoading(false)
  }

  const populateForm = (post: any) => {
    setCategory(post.category || 'guides')
    setSlug(post.slug || '')
    setTags((post.tags || []).join(', '))
    setReadingTime(post.reading_time || 5)
    setIsPublished(post.is_published || false)
    setCoverImage(post.cover_image || '')
    const updated: Record<LangKey, FormLang> = { en: emptyLang(), ar: emptyLang(), ru: emptyLang(), uk: emptyLang(), de: emptyLang(), it: emptyLang() }
    for (const l of ['en','ar','ru','uk','de','it'] as LangKey[]) {
      updated[l] = {
        title:            post[`title_${l}`]            || '',
        excerpt:          post[`excerpt_${l}`]          || '',
        content:          post[`content_${l}`]          || '',
        meta_title:       post[`meta_title_${l}`]       || '',
        meta_description: post[`meta_description_${l}`] || '',
      }
    }
    setLangs(updated)
  }

  const setLangField = (lang: LangKey, field: keyof FormLang, value: string) => {
    setLangs(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }))
    if (lang === 'en' && field === 'title' && !slug && isNew) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }

  const handleTranslate = async () => {
    if (!langs.en.title) { setTranslateError('Please fill in the English title first.'); return }
    setTranslating(true)
    setTranslateError('')
    try {
      const res = await fetch('/api/admin/blog/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_en:            langs.en.title,
          excerpt_en:          langs.en.excerpt,
          content_en:          langs.en.content,
          meta_title_en:       langs.en.meta_title,
          meta_description_en: langs.en.meta_description,
        }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Translation failed') }
      const { translations } = await res.json()
      setLangs(prev => {
        const next = { ...prev }
        for (const l of ['ar','ru','uk','de','it'] as LangKey[]) {
          next[l] = {
            title:            translations[`title_${l}`]            || prev[l].title,
            excerpt:          translations[`excerpt_${l}`]          || prev[l].excerpt,
            content:          translations[`content_${l}`]          || prev[l].content,
            meta_title:       translations[`meta_title_${l}`]       || prev[l].meta_title,
            meta_description: translations[`meta_description_${l}`] || prev[l].meta_description,
          }
        }
        return next
      })
    } catch (e: any) {
      setTranslateError(e.message)
    }
    setTranslating(false)
  }

  const handleUpload = async (file: File) => {
    if (!file) return
    setUploading(true)
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const ext  = file.name.split('.').pop()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('blog-images').upload(name, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('blog-images').getPublicUrl(name)
      setCoverImage(data.publicUrl)
    }
    setUploading(false)
  }

  const buildPayload = () => {
    const payload: Record<string, any> = {
      category, slug: slug || langs.en.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${Date.now()}`,
      reading_time: readingTime, is_published: isPublished,
      cover_image: coverImage || null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      author: 'DREDOTT Team',
    }
    for (const l of ['en','ar','ru','uk','de','it'] as LangKey[]) {
      payload[`title_${l}`]            = langs[l].title
      payload[`excerpt_${l}`]          = langs[l].excerpt
      payload[`content_${l}`]          = langs[l].content
      payload[`meta_title_${l}`]       = langs[l].meta_title || langs[l].title
      payload[`meta_description_${l}`] = langs[l].meta_description || langs[l].excerpt
    }
    return payload
  }

  const handleSave = async (publish?: boolean) => {
    setSaving(true)
    setError('')
    const payload = buildPayload()
    if (publish !== undefined) { payload.is_published = publish; setIsPublished(publish) }

    const method  = isNew ? 'POST' : 'PUT'
    const body    = isNew ? payload : { id, ...payload }
    const res     = await fetch('/api/admin/blog', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data    = await res.json()

    if (!res.ok) { setError(data.error || 'Save failed'); setSaving(false); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    if (isNew && data.post?.id) { router.replace(`/${locale}/admin/blog/${data.post.id}`) }
    setSaving(false)
  }

  const addTag = () => {
    if (!tagInput.trim()) return
    const existing = tags.split(',').map(t => t.trim()).filter(Boolean)
    if (!existing.includes(tagInput.trim())) {
      setTags([...existing, tagInput.trim()].join(', '))
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setTags(tags.split(',').map(t => t.trim()).filter(t => t && t !== tag).join(', '))
  }

  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
  const currentLang = LANGS.find(l => l.code === activeLang)!

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} color="#D4A843" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: 'DM Sans, sans-serif' }}>

      {/* Topbar */}
      <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => router.push(`/${locale}/admin/blog`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, color: sub, cursor: 'pointer', fontSize: 13 }}>
          <ArrowLeft size={13} /> Blog
        </button>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: text, fontWeight: 400, margin: 0, flex: 1 }}>
          {isNew ? 'New Post' : 'Edit Post'}
        </h1>
        {saved && <span style={{ fontSize: 12, color: '#4ade80', fontFamily: "'JetBrains Mono',monospace" }}>✓ Saved</span>}
        {error && <span style={{ fontSize: 12, color: '#f87171' }}>{error}</span>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setIsPublished(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: isPublished ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isPublished ? 'rgba(34,197,94,0.3)' : border}`, borderRadius: 8, color: isPublished ? '#4ade80' : sub, cursor: 'pointer', fontSize: 12 }}>
            {isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
            {isPublished ? 'Published' : 'Draft'}
          </button>
          <button onClick={() => handleSave()} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#D4A843', color: '#0e1428', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader2 size={13} style={{ animation: 'spin 0.6s linear infinite' }} /> : <Save size={13} />}
            Save
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

        {/* Main editor */}
        <div>
          {/* Lang tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: card, borderRadius: 10, padding: 4, border: `1px solid ${border}` }}>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => setActiveLang(l.code as LangKey)}
                style={{ flex: 1, padding: '7px 4px', background: activeLang === l.code ? '#2C3A6B' : 'transparent', color: activeLang === l.code ? '#D4A843' : sub, border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", transition: 'all 0.15s' }}>
                {l.label}
                {langs[l.code as LangKey].title && activeLang !== l.code && <span style={{ display: 'block', width: 4, height: 4, background: '#D4A843', borderRadius: '50%', margin: '2px auto 0' }} />}
              </button>
            ))}
          </div>

          {/* Translate button */}
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={handleTranslate} disabled={translating || !langs.en.title}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: translating ? 'rgba(212,168,67,0.15)' : 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.3)', borderRadius: 9, color: '#D4A843', cursor: translating ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, opacity: !langs.en.title ? 0.5 : 1 }}>
              {translating ? <Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> : <Sparkles size={14} />}
              {translating ? 'Translating all languages...' : 'Translate from English (AI)'}
            </button>
            {translateError && <span style={{ fontSize: 12, color: '#f87171' }}>{translateError}</span>}
          </div>

          {/* Lang-specific fields */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 20, direction: currentLang.rtl ? 'rtl' : 'ltr' }}>
            <p style={{ fontSize: 11, color: '#D4A843', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.15em', margin: '0 0 16px', textTransform: 'uppercase' }}>
              {currentLang.name} Content
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: sub, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title *</label>
                <input value={langs[activeLang].title} onChange={e => setLangField(activeLang, 'title', e.target.value)} placeholder="Article title..." style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: sub, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Excerpt</label>
                <textarea value={langs[activeLang].excerpt} onChange={e => setLangField(activeLang, 'excerpt', e.target.value)} placeholder="Short summary shown in article cards..." rows={3} style={{ ...inp, resize: 'vertical' as const }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: sub, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Content (Markdown)</label>
                <textarea value={langs[activeLang].content} onChange={e => setLangField(activeLang, 'content', e.target.value)} placeholder="# Article title&#10;&#10;Write your article in Markdown format..." rows={20} style={{ ...inp, resize: 'vertical' as const, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.6 }} />
              </div>
              <details style={{ borderTop: `1px solid ${border}`, paddingTop: 14 }}>
                <summary style={{ fontSize: 11, color: '#D4A843', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.12em', cursor: 'pointer', textTransform: 'uppercase' }}>SEO Fields</summary>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: sub, fontWeight: 600, display: 'block', marginBottom: 6 }}>Meta Title</label>
                    <input value={langs[activeLang].meta_title} onChange={e => setLangField(activeLang, 'meta_title', e.target.value)} placeholder="SEO title (defaults to article title)" style={inp} />
                    <p style={{ fontSize: 10, color: sub, margin: '4px 0 0' }}>{langs[activeLang].meta_title.length}/60 chars</p>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: sub, fontWeight: 600, display: 'block', marginBottom: 6 }}>Meta Description</label>
                    <textarea value={langs[activeLang].meta_description} onChange={e => setLangField(activeLang, 'meta_description', e.target.value)} placeholder="SEO description (defaults to excerpt)" rows={2} style={{ ...inp, resize: 'none' as const }} />
                    <p style={{ fontSize: 10, color: sub, margin: '4px 0 0' }}>{langs[activeLang].meta_description.length}/160 chars</p>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Cover Image */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16 }}>
            <p style={{ fontSize: 11, color: '#D4A843', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.12em', margin: '0 0 12px', textTransform: 'uppercase' }}>Cover Image</p>
            {coverImage ? (
              <div style={{ position: 'relative' }}>
                <img src={coverImage} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10 }} />
                <button onClick={() => setCoverImage('')}
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()}
                style={{ height: 120, border: `2px dashed ${border}`, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: sub, gap: 8 }}>
                {uploading ? <Loader2 size={20} style={{ animation: 'spin 0.6s linear infinite' }} /> : <><Upload size={20} /><span style={{ fontSize: 12 }}>Upload image</span></>}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <p style={{ fontSize: 10, color: sub, margin: '8px 0 0' }}>Stored in Supabase storage "blog-images" bucket</p>
          </div>

          {/* Settings */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16 }}>
            <p style={{ fontSize: 11, color: '#D4A843', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.12em', margin: '0 0 14px', textTransform: 'uppercase' }}>Settings</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: sub, fontWeight: 600, display: 'block', marginBottom: 6 }}>Slug</label>
                <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} style={inp} placeholder="auto-generated" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: sub, fontWeight: 600, display: 'block', marginBottom: 6 }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inp }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: sub, fontWeight: 600, display: 'block', marginBottom: 6 }}>Reading Time (min)</label>
                <input type="number" min={1} max={60} value={readingTime} onChange={e => setReadingTime(parseInt(e.target.value) || 5)} style={inp} />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16 }}>
            <p style={{ fontSize: 11, color: '#D4A843', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.12em', margin: '0 0 12px', textTransform: 'uppercase' }}>Tags</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()}
                placeholder="Add tag..." style={{ ...inp, flex: 1 }} />
              <button onClick={addTag} style={{ padding: '0 12px', background: '#D4A843', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#0e1428', fontWeight: 700, fontSize: 13 }}>+</button>
            </div>
            {tagList.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tagList.map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, background: dark ? 'rgba(212,168,67,0.1)' : '#f0ece4', color: text, fontSize: 11, padding: '4px 10px', borderRadius: 20, fontFamily: "'JetBrains Mono',monospace" }}>
                    #{t}
                    <button onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sub, padding: 0, display: 'flex', lineHeight: 1 }}><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SEO Preview */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16 }}>
            <p style={{ fontSize: 11, color: '#D4A843', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.12em', margin: '0 0 12px', textTransform: 'uppercase' }}>SEO Preview</p>
            <div style={{ background: '#F8F8F8', borderRadius: 8, padding: 12, border: '1px solid #ddd' }}>
              <p style={{ fontSize: 12, color: '#1a0dab', margin: '0 0 2px', fontFamily: 'Arial,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {langs.en.meta_title || langs.en.title || 'Article Title'}
              </p>
              <p style={{ fontSize: 11, color: '#006621', margin: '0 0 3px', fontFamily: 'Arial,sans-serif' }}>
                dredott.com/en/blog/{slug || 'article-slug'}
              </p>
              <p style={{ fontSize: 11, color: '#545454', margin: 0, fontFamily: 'Arial,sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {langs.en.meta_description || langs.en.excerpt || 'Article description...'}
              </p>
            </div>
          </div>

          {/* Publish */}
          <button onClick={() => handleSave(true)} disabled={saving || !langs.en.title}
            style={{ padding: '13px', background: '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 11, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (!langs.en.title || saving) ? 0.6 : 1 }}>
            <Globe size={15} /> Publish Now
          </button>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
