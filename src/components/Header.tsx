'use client'
// ============================================
// Header Component — DREDOTT
// Path: src/components/Header.tsx
// ✅ Nav tabs تحت تحكم Feature Flags من الـ Admin
// ✅ 6 لغات كاملة للـ nav tabs
// ✅ Dashboard button للـ property_owner
// ✅ Notifications bell
// ✅ User dropdown menu
// ✅ RTL support
// ============================================

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Building2, LayoutDashboard, Bell, LogOut, User } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DredottLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
      <line x1="2" y1="18" x2="34" y2="18" stroke="rgba(212,168,67,0.35)" strokeWidth="0.8"/>
      <path d="M2 21 Q9 23 18 21 Q27 19 34 21" fill="none" stroke="rgba(212,168,67,0.15)" strokeWidth="0.7"/>
      <circle cx="18" cy="13" r="5" fill="#D4A843"/>
      <line x1="18" y1="18" x2="18" y2="18.5" stroke="#D4A843" strokeWidth="1.2"/>
    </svg>
    <div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: '#FBF0D0', letterSpacing: '0.05em', lineHeight: 1 }}>DREDOTT</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '0.2em', color: '#D4A843', opacity: 0.7, marginTop: 2 }}>RED SEA · STAYS</div>
    </div>
  </div>
)

const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
]

const TAB_LABELS: Record<string, Record<string, string>> = {
  stays:    { en: 'Stays',    ar: 'إقامات', ru: 'Жильё',   uk: 'Житло',   de: 'Unterkünfte', it: 'Soggiorni' },
  cars:     { en: 'Cars',     ar: 'سيارات', ru: 'Авто',    uk: 'Авто',    de: 'Autos',       it: 'Auto'      },
  blog:     { en: 'Blog',     ar: 'مدونة',  ru: 'Блог',    uk: 'Блог',    de: 'Blog',        it: 'Blog'      },
  services: { en: 'Services', ar: 'خدمات',  ru: 'Услуги',  uk: 'Послуги', de: 'Dienste',     it: 'Servizi'   },
  jobs:     { en: 'Jobs',     ar: 'وظائف',  ru: 'Работа',  uk: 'Робота',  de: 'Jobs',        it: 'Lavoro'    },
}

const TX: Record<string, { signIn: string; signOut: string; listProperty: string; dashboard: string; myAccount: string }> = {
  en: { signIn: 'Sign in', signOut: 'Sign out', listProperty: 'List Your Property', dashboard: 'Dashboard', myAccount: 'My Account' },
  ar: { signIn: 'دخول', signOut: 'خروج', listProperty: 'أضف وحدتك', dashboard: 'لوحة التحكم', myAccount: 'حسابي' },
  ru: { signIn: 'Войти', signOut: 'Выйти', listProperty: 'Разместить объект', dashboard: 'Панель', myAccount: 'Аккаунт' },
  uk: { signIn: 'Увійти', signOut: 'Вийти', listProperty: "Розмістити об'єкт", dashboard: 'Панель', myAccount: 'Акаунт' },
  de: { signIn: 'Anmelden', signOut: 'Abmelden', listProperty: 'Objekt inserieren', dashboard: 'Dashboard', myAccount: 'Konto' },
  it: { signIn: 'Accedi', signOut: 'Esci', listProperty: 'Inserisci proprietà', dashboard: 'Dashboard', myAccount: 'Account' },
}

const ALL_TABS = [
  { flag: 'nav_stays',    key: 'stays',    path: '/properties' },
  { flag: 'nav_cars',     key: 'cars',     path: '/cars'       },
  { flag: 'nav_blog',     key: 'blog',     path: '/blog'       },
  { flag: 'nav_services', key: 'services', path: '/services'   },
  { flag: 'nav_jobs',     key: 'jobs',     path: '/jobs'       },
]

export default function Header() {
  const [scrolled,   setScrolled]   = useState(false)
  const [langOpen,   setLangOpen]   = useState(false)
  const [userOpen,   setUserOpen]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user,       setUser]       = useState<any>(null)
  const [profile,    setProfile]    = useState<any>(null)
  const [userRole,   setUserRole]   = useState('')
  const [flags,      setFlags]      = useState<Record<string, boolean>>({})
  const [unread,     setUnread]     = useState(0)

  const pathname      = usePathname()
  const router        = useRouter()
  const currentLocale = pathname.split('/')[1] || 'en'
  const currentLang   = LANGUAGES.find(l => l.code === currentLocale) || LANGUAGES[0]
  const tx            = TX[currentLocale as keyof typeof TX] || TX.en
  const isAr          = currentLocale === 'ar'

  useEffect(() => {
    window.addEventListener('scroll', () => setScrolled(window.scrollY > 40), { passive: true })
    loadUser()
    loadFlags()
  }, [])

  const loadUser = async () => {
    const { data: { user: u } } = await supabase.auth.getUser()
    setUser(u)
    if (u) {
      const { data: prof } = await supabase.from('profiles').select('role, first_name, last_name').eq('id', u.id).single()
      setProfile(prof)
      setUserRole(prof?.role || 'guest')

      const { count } = await supabase.from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', u.id).eq('read', false)
      setUnread(count || 0)
    }
  }

  const loadFlags = async () => {
    const { data } = await supabase.from('feature_flags').select('key, enabled')
    if (data) {
      const map: Record<string, boolean> = {}
      data.forEach(f => { map[f.key] = f.enabled })
      setFlags(map)
    }
  }

  const switchLanguage = (code: string) => {
    const segs = pathname.split('/')
    segs[1] = code
    router.push(segs.join('/'))
    setLangOpen(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setProfile(null); setUserRole('')
    setUserOpen(false)
    router.push(`/${currentLocale}`)
  }

  const isOwner     = userRole === 'property_owner'
  const visibleTabs = ALL_TABS.filter(tab => flags[tab.flag] === true)
  const initials    = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`
  const isActive    = (path: string) => pathname.includes(path)

  const navBg = scrolled
    ? 'rgba(14,20,40,0.95)'
    : 'linear-gradient(to bottom, rgba(14,20,40,0.75), transparent)'

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.3s ease', background: navBg,
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(212,168,67,0.15)' : 'none',
        padding: scrolled ? '10px 0' : '14px 0',
      }} dir={isAr ? 'rtl' : 'ltr'}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>

            {/* Logo */}
            <Link href={`/${currentLocale}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <DredottLogo />
            </Link>

            {/* Desktop Nav */}
            <div style={{ display: 'flex', gap: 24, flex: 1, justifyContent: 'center' }} className="hidden lg:flex">
              {visibleTabs.map(tab => (
                <Link key={tab.key} href={`/${currentLocale}${tab.path}`} style={{
                  fontSize: 13,
                  color: isActive(tab.path) ? '#D4A843' : 'rgba(255,255,255,0.85)',
                  textDecoration: 'none', transition: 'color 0.2s', whiteSpace: 'nowrap',
                  fontWeight: isActive(tab.path) ? 500 : 400,
                }}>
                  {TAB_LABELS[tab.key]?.[currentLocale] || TAB_LABELS[tab.key]?.en}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

              {/* Language */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setLangOpen(!langOpen)} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,168,67,0.3)',
                  borderRadius: 8, padding: '6px 10px', color: '#D4A843', fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', letterSpacing: '0.1em',
                }}>
                  <span>{currentLang.flag}</span>
                  <span>{currentLang.code.toUpperCase()}</span>
                  <ChevronDown size={10} />
                </button>
                {langOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)',
                    [isAr ? 'left' : 'right']: 0,
                    background: '#1a2240', border: '1px solid rgba(212,168,67,0.2)',
                    borderRadius: 12, overflow: 'hidden', minWidth: 160,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 100,
                  }}>
                    {LANGUAGES.map(lang => (
                      <button key={lang.code} onClick={() => switchLanguage(lang.code)} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '10px 16px',
                        background: currentLocale === lang.code ? 'rgba(212,168,67,0.1)' : 'transparent',
                        color: currentLocale === lang.code ? '#D4A843' : 'rgba(255,255,255,0.7)',
                        fontSize: 13, cursor: 'pointer', border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        textAlign: 'left' as const,
                      }}>
                        <span>{lang.flag}</span><span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {user ? (
                <>
                  {/* Dashboard — owners only */}
                  {isOwner && (
                    <Link href={`/${currentLocale}/owner`} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 8,
                      background: 'rgba(212,168,67,0.12)',
                      border: '1px solid rgba(212,168,67,0.3)',
                      color: '#D4A843', fontSize: 12, fontWeight: 600,
                      textDecoration: 'none', whiteSpace: 'nowrap',
                    }} className="hidden lg:flex">
                      <LayoutDashboard size={13} />
                      {tx.dashboard}
                    </Link>
                  )}

                  {/* Notifications */}
                  <button onClick={() => router.push(`/${currentLocale}/notifications`)} style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8, padding: '6px 9px',
                    cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                    display: 'flex', alignItems: 'center',
                  }}>
                    <Bell size={15} />
                    {unread > 0 && (
                      <span style={{
                        position: 'absolute', top: -4, right: -4,
                        minWidth: 15, height: 15,
                        background: '#ef4444', color: '#fff',
                        fontSize: 8, fontWeight: 700, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
                      }}>{unread > 9 ? '9+' : unread}</span>
                    )}
                  </button>

                  {/* User dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setUserOpen(o => !o)} style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '4px 10px 4px 6px', borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#D4A843', fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                      }}>{initials || '?'}</div>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                        {profile?.first_name || user.email?.split('@')[0]}
                      </span>
                      <ChevronDown size={10} color="rgba(255,255,255,0.4)" />
                    </button>

                    {userOpen && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 8px)',
                        [isAr ? 'left' : 'right']: 0,
                        background: '#1a2240', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 12, overflow: 'hidden', minWidth: 180,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 100,
                      }}>
                        <Link href={`/${currentLocale}/account`} onClick={() => setUserOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <User size={14} /> {tx.myAccount}
                        </Link>
                        {isOwner && (
                          <Link href={`/${currentLocale}/owner`} onClick={() => setUserOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#D4A843', fontSize: 13, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <LayoutDashboard size={14} /> {tx.dashboard}
                          </Link>
                        )}
                        <button onClick={handleSignOut}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: 'rgba(248,113,113,0.8)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' as const }}>
                          <LogOut size={14} /> {tx.signOut}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Link href={`/${currentLocale}/login`} style={{
                    fontSize: 13, color: 'rgba(255,255,255,0.8)',
                    padding: '6px 14px', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8, textDecoration: 'none',
                  }}>{tx.signIn}</Link>
                  <Link href={`/${currentLocale}/pricing`} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, color: '#0e1428',
                    background: '#D4A843', padding: '7px 16px',
                    borderRadius: 8, fontWeight: 700, textDecoration: 'none',
                  }}>
                    <Building2 size={14} /> {tx.listProperty}
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMobileOpen(o => !o)} className="lg:hidden" style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,168,67,0.2)',
                borderRadius: 8, padding: '6px 10px', color: '#D4A843', cursor: 'pointer',
              }}>
                <div style={{ width: 18, height: 2, background: 'currentColor', marginBottom: 4 }} />
                <div style={{ width: 18, height: 2, background: 'currentColor', marginBottom: 4 }} />
                <div style={{ width: 18, height: 2, background: 'currentColor' }} />
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileOpen && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(212,168,67,0.15)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {visibleTabs.map(tab => (
                <Link key={tab.key} href={`/${currentLocale}${tab.path}`} onClick={() => setMobileOpen(false)} style={{
                  padding: '10px 12px', borderRadius: 8, fontSize: 14, textDecoration: 'none',
                  color: isActive(tab.path) ? '#D4A843' : 'rgba(255,255,255,0.8)',
                  background: isActive(tab.path) ? 'rgba(212,168,67,0.08)' : 'transparent',
                }}>
                  {TAB_LABELS[tab.key]?.[currentLocale] || TAB_LABELS[tab.key]?.en}
                </Link>
              ))}
              {isOwner && (
                <Link href={`/${currentLocale}/owner`} onClick={() => setMobileOpen(false)} style={{
                  padding: '10px 12px', borderRadius: 8, fontSize: 14, textDecoration: 'none',
                  color: '#D4A843', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <LayoutDashboard size={15} /> {tx.dashboard}
                </Link>
              )}
              {user && (
                <button onClick={() => { setMobileOpen(false); handleSignOut() }} style={{
                  padding: '10px 12px', borderRadius: 8, fontSize: 14,
                  color: 'rgba(248,113,113,0.8)', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <LogOut size={15} /> {tx.signOut}
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {(langOpen || mobileOpen || userOpen) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 49 }}
          onClick={() => { setLangOpen(false); setMobileOpen(false); setUserOpen(false) }} />
      )}
    </>
  )
}