'use client'

import { useEffect, useState, use } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Clock, Calendar, ArrowRight, Search } from 'lucide-react'

const LOCALES = ['en', 'ar', 'ru', 'uk', 'de', 'it'] as const
type Locale = typeof LOCALES[number]

const CATEGORIES = [
  { key: 'all',    label: { en: 'All', ar: 'الكل', ru: 'Все', uk: 'Усі', de: 'Alle', it: 'Tutti' } },
  { key: 'guides', label: { en: 'Guides', ar: 'أدلة', ru: 'Гиды', uk: 'Гіди', de: 'Reiseführer', it: 'Guide' } },
  { key: 'travel', label: { en: 'Travel', ar: 'سفر', ru: 'Путешествия', uk: 'Подорожі', de: 'Reisen', it: 'Viaggi' } },
  { key: 'cars',   label: { en: 'Cars', ar: 'سيارات', ru: 'Авто', uk: 'Авто', de: 'Autos', it: 'Auto' } },
  { key: 'tips',   label: { en: 'Tips', ar: 'نصائح', ru: 'Советы', uk: 'Поради', de: 'Tipps', it: 'Consigli' } },
]

const TX: Record<Locale, { title: string; sub: string; readMore: string; mins: string; noResults: string; searchPh: string }> = {
  en: { title: 'DREDOTT Journal', sub: 'Travel guides, tips & insider knowledge for Sharm El Sheikh', readMore: 'Read article', mins: 'min read', noResults: 'No articles found.', searchPh: 'Search articles...' },
  ar: { title: 'مجلة DREDOTT', sub: 'أدلة السفر والنصائح والمعرفة الداخلية لشرم الشيخ', readMore: 'اقرأ المقال', mins: 'دقيقة قراءة', noResults: 'لا توجد مقالات.', searchPh: 'ابحث في المقالات...' },
  ru: { title: 'Журнал DREDOTT', sub: 'Путеводители, советы и инсайдерские знания о Шарм-эль-Шейхе', readMore: 'Читать статью', mins: 'мин чтения', noResults: 'Статьи не найдены.', searchPh: 'Поиск статей...' },
  uk: { title: 'Журнал DREDOTT', sub: 'Путівники, поради та інсайдерські знання про Шарм-ель-Шейх', readMore: 'Читати статтю', mins: 'хв читання', noResults: 'Статті не знайдено.', searchPh: 'Пошук статей...' },
  de: { title: 'DREDOTT Journal', sub: 'Reiseführer, Tipps & Insiderwissen über Sharm El Sheikh', readMore: 'Artikel lesen', mins: 'Min. Lesezeit', noResults: 'Keine Artikel gefunden.', searchPh: 'Artikel suchen...' },
  it: { title: 'Rivista DREDOTT', sub: 'Guide di viaggio, consigli e conoscenze privilegiate su Sharm El Sheikh', readMore: 'Leggi articolo', mins: 'min di lettura', noResults: 'Nessun articolo trovato.', searchPh: 'Cerca articoli...' },
}

interface Post {
  id: string; slug: string; category: string; cover_image: string | null
  reading_time: number; published_at: string | null; tags: string[]
  title_en: string; title_ar: string; title_ru: string; title_uk: string; title_de: string; title_it: string
  excerpt_en: string; excerpt_ar: string; excerpt_ru: string; excerpt_uk: string; excerpt_de: string; excerpt_it: string
}

export default function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = use(params)
  const locale: Locale = LOCALES.includes(rawLocale as Locale) ? rawLocale as Locale : 'en'
  const isRTL = locale === 'ar'
  const tx = TX[locale]
  const router = useRouter()

  const [posts, setPosts]       = useState<Post[]>([])
  const [loading, setLoading]   = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch]     = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    sb.from('blog_posts')
      .select('id,slug,category,cover_image,reading_time,published_at,tags,title_en,title_ar,title_ru,title_uk,title_de,title_it,excerpt_en,excerpt_ar,excerpt_ru,excerpt_uk,excerpt_de,excerpt_it')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false) })
  }, [])

  const getTitle   = (p: Post) => (p as any)[`title_${locale}`]   || p.title_en   || ''
  const getExcerpt = (p: Post) => (p as any)[`excerpt_${locale}`] || p.excerpt_en || ''

  const filtered = posts.filter(p => {
    const matchCat = category === 'all' || p.category === category
    const q = search.toLowerCase()
    const matchSearch = !q || getTitle(p).toLowerCase().includes(q) || getExcerpt(p).toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  const formatDate = (d: string | null) => {
    if (!d) return ''
    const lmap: Record<Locale, string> = { en: 'en-GB', ar: 'ar-EG', ru: 'ru-RU', uk: 'uk-UA', de: 'de-DE', it: 'it-IT' }
    return new Date(d).toLocaleDateString(lmap[locale], { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const [featured, ...rest] = filtered

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a2540 0%, #2C3A6B 100%)', padding: isMobile ? '60px 20px 50px' : '80px 40px 70px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.3em', color: '#D4A843', fontFamily: "'JetBrains Mono', monospace", marginBottom: 16, textTransform: 'uppercase' }}>DREDOTT · JOURNAL</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? 36 : 52, color: '#FAF9F6', fontWeight: 300, margin: '0 0 16px', lineHeight: 1.2 }}>{tx.title}</h1>
        <p style={{ fontSize: isMobile ? 14 : 16, color: 'rgba(250,249,246,0.7)', maxWidth: 500, margin: '0 auto 32px' }}>{tx.sub}</p>
        <div style={{ maxWidth: 440, margin: '0 auto', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(250,249,246,0.4)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tx.searchPh}
            style={{ width: '100%', padding: isRTL ? '14px 44px 14px 16px' : '14px 16px 14px 44px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#FAF9F6', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e3d9', padding: '0 20px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', justifyContent: isMobile ? 'flex-start' : 'center' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setCategory(cat.key)} style={{ padding: '16px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${category === cat.key ? '#D4A843' : 'transparent'}`, color: category === cat.key ? '#2C3A6B' : '#888', fontWeight: category === cat.key ? 700 : 400, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              {cat.label[locale]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '32px 16px' : '48px 24px' }}>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 24 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', animation: 'pulse 1.5s ease-in-out infinite' }}>
                <div style={{ height: 200, background: '#e8e3d9' }} />
                <div style={{ padding: 20 }}>
                  <div style={{ height: 12, background: '#e8e3d9', borderRadius: 6, marginBottom: 10, width: '40%' }} />
                  <div style={{ height: 20, background: '#e8e3d9', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 14, background: '#e8e3d9', borderRadius: 6, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>
            <p style={{ fontSize: 16 }}>{tx.noResults}</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <div onClick={() => router.push(`/${locale}/blog/${featured.slug}`)}
                style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 40, cursor: 'pointer', display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', boxShadow: '0 4px 24px rgba(44,58,107,0.08)', transition: 'transform 0.2s,box-shadow 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 8px 32px rgba(44,58,107,0.14)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='0 4px 24px rgba(44,58,107,0.08)' }}
              >
                <div style={{ height: isMobile ? 220 : 380, background: featured.cover_image ? `url(${featured.cover_image}) center/cover` : 'linear-gradient(135deg,#2C3A6B 0%,#1a2540 100%)', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 16, [isRTL?'right':'left']: 16, background: '#D4A843', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace" }}>
                    {featured.category}
                  </span>
                </div>
                <div style={{ padding: isMobile ? '24px 20px' : '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: isMobile ? 24 : 32, color: '#2C3A6B', fontWeight: 600, margin: '0 0 16px', lineHeight: 1.3 }}>{getTitle(featured)}</h2>
                  <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, margin: '0 0 24px' }}>{getExcerpt(featured)}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#999', fontSize: 12, marginBottom: 24 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {featured.reading_time} {tx.mins}</span>
                    {featured.published_at && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {formatDate(featured.published_at)}</span>}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#D4A843', fontWeight: 600, fontSize: 14 }}>
                    {tx.readMore} <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 24 }}>
                {rest.map(post => (
                  <article key={post.id} onClick={() => router.push(`/${locale}/blog/${post.slug}`)}
                    style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 12px rgba(44,58,107,0.06)', transition: 'transform 0.2s,box-shadow 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(44,58,107,0.12)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='0 2px 12px rgba(44,58,107,0.06)' }}
                  >
                    <div style={{ height: 180, background: post.cover_image ? `url(${post.cover_image}) center/cover` : 'linear-gradient(135deg,#2C3A6B 0%,#1a2540 100%)', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: 12, [isRTL?'right':'left']: 12, background: '#D4A843', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace" }}>
                        {post.category}
                      </span>
                    </div>
                    <div style={{ padding: 20 }}>
                      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#2C3A6B', fontWeight: 600, margin: '0 0 10px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{getTitle(post)}</h3>
                      <p style={{ fontSize: 13, color: '#777', lineHeight: 1.6, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{getExcerpt(post)}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#aaa', fontSize: 11 }}><Clock size={11} /> {post.reading_time} {tx.mins}</span>
                        <span style={{ color: '#D4A843', fontSize: 12, fontWeight: 600 }}>{tx.readMore} →</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  )
}
