'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Calendar, ArrowLeft, ArrowRight, Share2 } from 'lucide-react'

const LOCALE_LABELS: Record<string, string> = { en: 'EN', ar: 'عر', ru: 'RU', uk: 'UK', de: 'DE', it: 'IT' }
const LOCALES = ['en', 'ar', 'ru', 'uk', 'de', 'it']

const TX: Record<string, any> = {
  en: { back: 'Back to Blog', share: 'Share', related: 'Related Articles', readMore: 'Read article', mins: 'min read', by: 'By', whatsapp: 'Share on WhatsApp', facebook: 'Share on Facebook', twitter: 'Share on X' },
  ar: { back: 'العودة إلى المدونة', share: 'مشاركة', related: 'مقالات ذات صلة', readMore: 'اقرأ المقال', mins: 'دقيقة قراءة', by: 'بقلم', whatsapp: 'واتساب', facebook: 'فيسبوك', twitter: 'تويتر X' },
  ru: { back: 'Назад к блогу', share: 'Поделиться', related: 'Похожие статьи', readMore: 'Читать', mins: 'мин', by: 'Автор', whatsapp: 'WhatsApp', facebook: 'Facebook', twitter: 'X' },
  uk: { back: 'Назад до блогу', share: 'Поділитись', related: 'Схожі статті', readMore: 'Читати', mins: 'хв', by: 'Автор', whatsapp: 'WhatsApp', facebook: 'Facebook', twitter: 'X' },
  de: { back: 'Zurück zum Blog', share: 'Teilen', related: 'Ähnliche Artikel', readMore: 'Artikel lesen', mins: 'Min.', by: 'Von', whatsapp: 'WhatsApp', facebook: 'Facebook', twitter: 'X' },
  it: { back: 'Torna al blog', share: 'Condividi', related: 'Articoli correlati', readMore: 'Leggi articolo', mins: 'min', by: 'Di', whatsapp: 'WhatsApp', facebook: 'Facebook', twitter: 'X' },
}

// Simple Markdown to HTML converter
function markdownToHtml(md: string): string {
  if (!md) return ''
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\| (.+) \|$/gm, (_, row) => `<tr>${row.split(' | ').map((c: string) => `<td>${c}</td>`).join('')}</tr>`)
    .replace(/(<tr>.*<\/tr>\n?)+/g, (t) => `<table>${t}</table>`)
    .replace(/^\|[-| ]+\|$/gm, '')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (l) => `<ul>${l}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|u|o|l|t|p])/gm, '')
    .replace(/<p><\/p>/g, '')
}

interface Props {
  post: any
  locale: string
  title: string
  content: string
  excerpt: string
  related: any[]
  slug: string
}

export default function BlogPostClient({ post, locale, title, content, excerpt, related, slug }: Props) {
  const router = useRouter()
  const isRTL = locale === 'ar'
  const tx = TX[locale] || TX.en
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://dredott.com/${locale}/blog/${slug}`
  const shareText = encodeURIComponent(`${title} — DREDOTT`)
  const shareUrl  = encodeURIComponent(pageUrl)

  const getRelatedTitle = (p: any) => p[`title_${locale}`] || p.title_en || ''

  const formatDate = (d: string | null) => {
    if (!d) return ''
    const lmap: Record<string, string> = { en: 'en-GB', ar: 'ar-EG', ru: 'ru-RU', uk: 'uk-UA', de: 'de-DE', it: 'it-IT' }
    return new Date(d).toLocaleDateString(lmap[locale] || 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const html = markdownToHtml(content)

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Cover */}
      <div style={{ height: isMobile ? 240 : 440, background: post.cover_image ? `url(${post.cover_image}) center/cover` : 'linear-gradient(135deg,#1a2540 0%,#2C3A6B 100%)', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto', width: '100%', padding: isMobile ? '0 16px 28px' : '0 24px 48px' }}>
          <span style={{ display: 'inline-block', background: '#D4A843', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace", marginBottom: 14 }}>
            {post.category}
          </span>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: isMobile ? 26 : 42, color: '#fff', fontWeight: 600, margin: '0 0 12px', lineHeight: 1.25 }}>{title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'rgba(255,255,255,0.75)', fontSize: 12, flexWrap: 'wrap' }}>
            <span>{tx.by} {post.author || 'DREDOTT Team'}</span>
            <span>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {post.reading_time} {tx.mins}</span>
            {post.published_at && <><span>·</span><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {formatDate(post.published_at)}</span></>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>

        {/* Back + locale switcher row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <button onClick={() => router.push(`/${locale}/blog`)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #e8e3d9', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: '#2C3A6B', fontSize: 13 }}>
            {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />} {tx.back}
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            {LOCALES.map(l => (
              <a key={l} href={`/${l}/blog/${slug}`}
                style={{ padding: '5px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", background: l === locale ? '#2C3A6B' : '#f0ece4', color: l === locale ? '#D4A843' : '#888', textDecoration: 'none', transition: 'all 0.15s' }}>
                {LOCALE_LABELS[l]}
              </a>
            ))}
          </div>
        </div>

        {/* Article body */}
        <article>
          <div style={{ fontSize: isMobile ? 16 : 17, lineHeight: 1.85, color: '#333', fontFamily: 'DM Sans, sans-serif' }}
            dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }}
          />
        </article>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {post.tags.map((tag: string) => (
              <span key={tag} style={{ background: '#f0ece4', color: '#2C3A6B', fontSize: 11, padding: '5px 12px', borderRadius: 20, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.05em' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Share */}
        <div style={{ marginTop: 48, padding: '28px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e8e3d9' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#2C3A6B', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Share2 size={14} /> {tx.share}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#25D366', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              <span>📱</span> {tx.whatsapp}
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#1877F2', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              <span>📘</span> {tx.facebook}
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#000', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              <span>𝕏</span> {tx.twitter}
            </a>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: '#2C3A6B', fontWeight: 400, margin: '0 0 24px' }}>{tx.related}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 20 }}>
              {related.map(r => (
                <a key={r.id} href={`/${locale}/blog/${r.slug}`}
                  style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', textDecoration: 'none', boxShadow: '0 2px 12px rgba(44,58,107,0.06)', display: 'block', transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform='none'}
                >
                  <div style={{ height: 140, background: r.cover_image ? `url(${r.cover_image}) center/cover` : 'linear-gradient(135deg,#2C3A6B,#1a2540)' }} />
                  <div style={{ padding: '14px 16px' }}>
                    <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: '#2C3A6B', fontWeight: 600, margin: '0 0 6px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {getRelatedTitle(r)}
                    </p>
                    <span style={{ fontSize: 11, color: '#D4A843', fontWeight: 600 }}>{tx.readMore} →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        article h1 { font-family: 'Cormorant Garamond', serif; font-size: 2em; color: #2C3A6B; margin: 1.5em 0 0.5em; font-weight: 600; }
        article h2 { font-family: 'Cormorant Garamond', serif; font-size: 1.6em; color: #2C3A6B; margin: 1.4em 0 0.5em; font-weight: 600; border-bottom: 1px solid #e8e3d9; padding-bottom: 8px; }
        article h3 { font-size: 1.15em; color: #2C3A6B; margin: 1.2em 0 0.4em; font-weight: 700; }
        article p  { margin: 0 0 1.2em; }
        article ul { padding-left: 1.4em; margin: 0 0 1.2em; }
        article li { margin-bottom: 0.4em; }
        article strong { color: #2C3A6B; }
        article table { width: 100%; border-collapse: collapse; margin: 1.2em 0; font-size: 14px; }
        article td, article th { border: 1px solid #e8e3d9; padding: 8px 12px; text-align: left; }
        article tr:nth-child(even) td { background: #f8f6f0; }
        article a { color: #D4A843; text-decoration: underline; }
        article code { background: #f0ece4; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-family: 'JetBrains Mono', monospace; }
      `}</style>
    </div>
  )
}
