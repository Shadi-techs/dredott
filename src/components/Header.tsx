'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, LayoutDashboard, Bell, LogOut, User, Briefcase, RefreshCw } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DredottLogo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1 }}>
      <span style={{ color: '#FAF9F6' }}>DRE</span><span style={{ color: '#D4A843' }}>DOTT</span>
    </div>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '0.2em', color: '#D4A843', opacity: 0.7 }}>RED SEA · STAYS</div>
  </div>
)

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
]

const TAB_LABELS: Record<string, Record<string, string>> = {
  stays:    { en: 'Stays',    ar: 'إقامات', ru: 'Жильё',  uk: 'Житло',   de: 'Unterkünfte', it: 'Soggiorni' },
  cars:     { en: 'Cars',     ar: 'سيارات', ru: 'Авто',   uk: 'Авто',    de: 'Autos',       it: 'Auto'      },
  blog:     { en: 'Blog',     ar: 'مدونة',  ru: 'Блог',   uk: 'Блог',    de: 'Blog',        it: 'Blog'      },
  services: { en: 'Services', ar: 'خدمات',  ru: 'Услуги', uk: 'Послуги', de: 'Dienste',     it: 'Servizi'   },
  jobs:     { en: 'Jobs',     ar: 'وظائف',  ru: 'Работа', uk: 'Робота',  de: 'Jobs',        it: 'Lavoro'    },
}

const TX: Record<string, { signIn: string; signOut: string; listProperty: string; dashboard: string; myAccount: string; myProfile: string; myCv: string; switchToGuest: string; switchToProvider: string }> = {
  en: { signIn: 'Sign in', signOut: 'Sign out', listProperty: 'Join as Owner', dashboard: 'Dashboard', myAccount: 'My Account', myProfile: 'My Profile', myCv: 'My CV', switchToGuest: 'Browse as Guest', switchToProvider: '← Provider Mode' },
  ar: { signIn: 'دخول', signOut: 'خروج', listProperty: 'انضم كمالك', dashboard: 'لوحة التحكم', myAccount: 'حسابي', myProfile: 'ملفي', myCv: 'سيرتي الذاتية', switchToGuest: 'تصفح كضيف', switchToProvider: '← وضع مزود الخدمة' },
  ru: { signIn: 'Войти', signOut: 'Выйти', listProperty: 'Стать владельцем', dashboard: 'Панель', myAccount: 'Аккаунт', myProfile: 'Профиль', myCv: 'Моё CV', switchToGuest: 'Как гость', switchToProvider: '← Режим поставщика' },
  uk: { signIn: 'Увійти', signOut: 'Вийти', listProperty: 'Стати власником', dashboard: 'Панель', myAccount: 'Акаунт', myProfile: 'Профіль', myCv: 'Моє CV', switchToGuest: 'Як гість', switchToProvider: '← Режим постачальника' },
  de: { signIn: 'Anmelden', signOut: 'Abmelden', listProperty: 'Als Eigentümer beitreten', dashboard: 'Dashboard', myAccount: 'Konto', myProfile: 'Profil', myCv: 'Mein CV', switchToGuest: 'Als Gast', switchToProvider: '← Anbieter-Modus' },
  it: { signIn: 'Accedi', signOut: 'Esci', listProperty: 'Unisciti come proprietario', dashboard: 'Dashboard', myAccount: 'Account', myProfile: 'Profilo', myCv: 'Il mio CV', switchToGuest: 'Naviga come ospite', switchToProvider: '← Modalità fornitore' },
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
  const [switching,  setSwitching]  = useState(false)
  const [isMobile,   setIsMobile]   = useState(false)

  const pathname      = usePathname()
  const router        = useRouter()
  const currentLocale = pathname.split('/')[1] || 'en'
  const currentLang   = LANGUAGES.find(l => l.code === currentLocale) || LANGUAGES[0]
  const tx            = TX[currentLocale as keyof typeof TX] || TX.en
  const isAr          = currentLocale === 'ar'

  if (pathname.includes('/admin')) return null
  if (pathname.includes('/owner')) return null

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    const onResize = () => setIsMobile(window.innerWidth < 1024)
    onResize()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    loadUser()
    loadFlags()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const loadUser = async () => {
    const { data: { user: u } } = await supabase.auth.getUser()
    setUser(u)
    if (u) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('role, first_name, last_name, is_job_seeker, active_role')
        .eq('id', u.id)
        .single()
      setProfile(prof)
      setUserRole(prof?.active_role || prof?.role || 'guest')
      const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', u.id).eq('read', false)
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

  const handleRoleSwitch = async () => {
    if (!user || switching) return
    setSwitching(true)
    const newActiveRole = profile?.active_role === 'guest' ? null : 'guest'
    await supabase.from('profiles').update({ active_role: newActiveRole }).eq('id', user.id)
    await loadUser()
    setSwitching(false)
    setUserOpen(false)
    if (!newActiveRole) router.push(`/${currentLocale}/provider`)
  }

  const closeAll = () => { setLangOpen(false); setMobileOpen(false); setUserOpen(false) }

  const isOwner        = userRole === 'property_owner'
  const isProvider     = profile?.role === 'service_provider'
  const isProviderMode = isProvider && !profile?.active_role
  const isGuestMode    = isProvider && profile?.active_role === 'guest'
  const isSeeker       = profile?.is_job_seeker === true

  const visibleTabs = ALL_TABS.filter(tab => flags[tab.flag] === true)
  const initials    = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`
  const isActive    = (path: string) => pathname.includes(path)
  const navBg       = scrolled ? 'rgba(14,20,40,0.95)' : 'linear-gradient(to bottom, rgba(14,20,40,0.75), transparent)'

  return (
    <>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, transition: 'all 0.3s ease', background: navBg, backdropFilter: scrolled ? 'blur(16px)' : 'none', borderBottom: scrolled ? '1px solid rgba(212,168,67,0.15)' : 'none', padding: scrolled ? '10px 0' : '14px 0' }} dir={isAr ? 'rtl' : 'ltr'}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

            <Link href={`/${currentLocale}`} style={{ textDecoration: 'none', flexShrink: 0 }}><DredottLogo /></Link>

            <div style={{ display: isMobile ? 'none' : 'flex', gap: 24, flex: 1, justifyContent: 'center' }}>
              {visibleTabs.map(tab => (
                <Link key={tab.key} href={`/${currentLocale}${tab.path}`} style={{ fontSize: 13, color: isActive(tab.path) ? '#D4A843' : 'rgba(255,255,255,0.85)', textDecoration: 'none', transition: 'color 0.2s', whiteSpace: 'nowrap', fontWeight: isActive(tab.path) ? 500 : 400 }}>
                  {TAB_LABELS[tab.key]?.[currentLocale] || TAB_LABELS[tab.key]?.en}
                </Link>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

              {isGuestMode && (
                <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)', color: '#D4A843' }}>
                  {isAr ? 'وضع الضيف' : 'Guest Mode'}
                </span>
              )}

              <div style={{ position: 'relative' }}>
                <button onClick={() => { setLangOpen(!langOpen); setUserOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,168,67,0.3)', borderRadius: 8, padding: '6px 10px', color: '#D4A843', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', letterSpacing: '0.1em' }}>
                  <span>{currentLang.flag}</span><span>{currentLang.code.toUpperCase()}</span><ChevronDown size={10} />
                </button>
                {langOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', [isAr ? 'left' : 'right']: 0, background: '#1a2240', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 12, overflow: 'hidden', minWidth: 160, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 100 }}>
                    {LANGUAGES.map(lang => (
                      <button key={lang.code} onClick={() => switchLanguage(lang.code)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', background: currentLocale === lang.code ? 'rgba(212,168,67,0.1)' : 'transparent', color: currentLocale === lang.code ? '#D4A843' : 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', textAlign: isAr ? 'right' : 'left' as const }}>
                        <span>{lang.flag}</span><span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {user ? (
                <>
                  {isOwner && (
                    <Link href={`/${currentLocale}/owner`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.3)', color: '#D4A843', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      <LayoutDashboard size={13} /> {tx.dashboard}
                    </Link>
                  )}

                  <button onClick={() => router.push(`/${currentLocale}/notifications`)} style={{ position: 'relative', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '6px 9px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }}>
                    <Bell size={15} />
                    {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 15, height: 15, background: '#ef4444', color: '#fff', fontSize: 8, fontWeight: 700, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{unread > 9 ? '9+' : unread}</span>}
                  </button>

                  <div style={{ position: 'relative' }}>
                    <button onClick={() => { setUserOpen(o => !o); setLangOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 10px 4px 6px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>{initials || '?'}</div>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{profile?.first_name || user.email?.split('@')[0]}</span>
                      <ChevronDown size={10} color="rgba(255,255,255,0.4)" />
                    </button>

                    {userOpen && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 8px)', [isAr ? 'left' : 'right']: 0, background: '#1a2240', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden', minWidth: 200, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 100 }}>
                        <Link href={`/${currentLocale}/account`} onClick={() => setUserOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <User size={14} /> {tx.myAccount}
                        </Link>
                        {isOwner && (
                          <Link href={`/${currentLocale}/owner`} onClick={() => setUserOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#D4A843', fontSize: 13, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <LayoutDashboard size={14} /> {tx.dashboard}
                          </Link>
                        )}
                        {isProviderMode && (
                          <Link href={`/${currentLocale}/provider`} onClick={() => setUserOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#D4A843', fontSize: 13, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <User size={14} /> {tx.myProfile}
                          </Link>
                        )}
                        {isProvider && (
                          <button onClick={handleRoleSwitch} disabled={switching} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', width: '100%', border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: isAr ? 'right' : 'left' as const, background: isGuestMode ? 'rgba(212,168,67,0.08)' : 'transparent', color: isGuestMode ? '#D4A843' : 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                            <RefreshCw size={14} /> {isGuestMode ? tx.switchToProvider : tx.switchToGuest}
                          </button>
                        )}
                        {isSeeker && (
                          <Link href={`/${currentLocale}/profile`} onClick={() => setUserOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#D4A843', fontSize: 13, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <Briefcase size={14} /> {tx.myCv}
                          </Link>
                        )}
                        <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: 'rgba(248,113,113,0.8)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: isAr ? 'right' : 'left' as const }}>
                          <LogOut size={14} /> {tx.signOut}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link href={`/${currentLocale}/login`} style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}>{tx.signIn}</Link>
                  <Link href={`/${currentLocale}/pricing`} style={{ fontSize: 13, color: '#0e1428', background: '#D4A843', padding: '7px 16px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>{tx.listProperty}</Link>
                </div>
              )}

              <button onClick={() => setMobileOpen(o => !o)} style={{ display: isMobile ? 'flex' : 'none', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 8, padding: '8px 10px', color: '#D4A843', cursor: 'pointer', flexDirection: 'column', gap: 4 }}>
                <span style={{ display: 'block', width: 18, height: 2, background: 'currentColor' }} />
                <span style={{ display: 'block', width: 18, height: 2, background: 'currentColor' }} />
                <span style={{ display: 'block', width: 18, height: 2, background: 'currentColor' }} />
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(212,168,67,0.15)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {visibleTabs.map(tab => (
                <Link key={tab.key} href={`/${currentLocale}${tab.path}`} onClick={() => setMobileOpen(false)} style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14, textDecoration: 'none', color: isActive(tab.path) ? '#D4A843' : 'rgba(255,255,255,0.8)', background: isActive(tab.path) ? 'rgba(212,168,67,0.08)' : 'transparent' }}>
                  {TAB_LABELS[tab.key]?.[currentLocale] || TAB_LABELS[tab.key]?.en}
                </Link>
              ))}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
              {isOwner && <Link href={`/${currentLocale}/owner`} onClick={() => setMobileOpen(false)} style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14, textDecoration: 'none', color: '#D4A843', display: 'flex', alignItems: 'center', gap: 8 }}><LayoutDashboard size={15} /> {tx.dashboard}</Link>}
              {isProviderMode && <Link href={`/${currentLocale}/provider`} onClick={() => setMobileOpen(false)} style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14, textDecoration: 'none', color: '#D4A843', display: 'flex', alignItems: 'center', gap: 8 }}><User size={15} /> {tx.myProfile}</Link>}
              {isProvider && <button onClick={() => { setMobileOpen(false); handleRoleSwitch() }} style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14, color: isGuestMode ? '#D4A843' : 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: isAr ? 'right' : 'left' as const }}><RefreshCw size={15} /> {isGuestMode ? tx.switchToProvider : tx.switchToGuest}</button>}
              {isSeeker && <Link href={`/${currentLocale}/profile`} onClick={() => setMobileOpen(false)} style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14, textDecoration: 'none', color: '#D4A843', display: 'flex', alignItems: 'center', gap: 8 }}><Briefcase size={15} /> {tx.myCv}</Link>}
              {!user ? (
                <>
                  <Link href={`/${currentLocale}/login`} onClick={() => setMobileOpen(false)} style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14, textDecoration: 'none', color: 'rgba(255,255,255,0.8)' }}>{tx.signIn}</Link>
                  <Link href={`/${currentLocale}/pricing`} onClick={() => setMobileOpen(false)} style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14, textDecoration: 'none', color: '#D4A843', fontWeight: 600 }}>{tx.listProperty}</Link>
                </>
              ) : (
                <button onClick={() => { setMobileOpen(false); handleSignOut() }} style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14, color: 'rgba(248,113,113,0.8)', background: 'none', border: 'none', cursor: 'pointer', textAlign: isAr ? 'right' : 'left' as const, display: 'flex', alignItems: 'center', gap: 8 }}><LogOut size={15} /> {tx.signOut}</button>
              )}
            </div>
          )}
        </div>
      </nav>
      {(langOpen || mobileOpen || userOpen) && <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={closeAll} />}
    </>
  )
}