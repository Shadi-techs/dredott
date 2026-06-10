'use client'
// src/components/owner/ThemeProvider.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

const SIDEBAR_COLORS = {
  sidebar: '#0e1428',
  sideText: '#C9CEDD',
  sideMuted: 'rgba(201, 206, 221, 0.6)',
  sideFaint: 'rgba(201, 206, 221, 0.4)',
  sideBorder: 'rgba(201, 206, 221, 0.15)',
  sideAccent: '#D4A843',
  sideAccentSoft: 'rgba(212, 168, 67, 0.15)',
}

const CONTENT_LIGHT = {
  bg: '#FAF9F6',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F3EE',
  border: 'rgba(44, 58, 107, 0.12)',
  borderSoft: 'rgba(44, 58, 107, 0.06)',
  text: '#1e2d4f',
  textMuted: '#7a8aaa',
  textFaint: '#a0a8b4',
}

const CONTENT_DARK = {
  bg: '#0e1428',
  surface: '#1a2240',
  surfaceAlt: '#1e2a4a',
  border: 'rgba(201, 206, 221, 0.12)',
  borderSoft: 'rgba(201, 206, 221, 0.06)',
  text: '#C9CEDD',
  textMuted: 'rgba(201, 206, 221, 0.6)',
  textFaint: 'rgba(201, 206, 221, 0.4)',
}

const SHARED_COLORS = {
  accent: '#D4A843',
  accentDark: '#B8860B',
  accentSoft: 'rgba(212, 168, 67, 0.12)',
  accentInk: '#FFFFFF',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#2A9D8F',
}

type Palette = typeof SIDEBAR_COLORS & typeof CONTENT_LIGHT & typeof SHARED_COLORS

function buildPalette(dark: boolean): Palette {
  return {
    ...SIDEBAR_COLORS,
    ...(dark ? CONTENT_DARK : CONTENT_LIGHT),
    ...SHARED_COLORS,
  }
}

const DESIGN_TOKENS = {
  gap: 16,
  pad: 24,
  radius: 8,
  shadowSm: '0 1px 2px rgba(0,0,0,0.05)',
  shadowMd: '0 4px 6px rgba(0,0,0,0.1)',
}

interface ThemeContextType {
  t: Palette
  d: typeof DESIGN_TOKENS
  darkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useOwnerTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    console.error('useOwnerTheme must be used within OwnerThemeProvider')
    return {
      t: buildPalette(false),
      d: DESIGN_TOKENS,
      darkMode: false,
      toggleDarkMode: () => {},
    }
  }
  return context
}

export function OwnerThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('owner_dark_mode')
    if (saved === 'true') setDarkMode(true)
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev
      localStorage.setItem('owner_dark_mode', String(next))
      return next
    })
  }

  const t = buildPalette(darkMode)

  useEffect(() => {
    Object.entries(t).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--owner-${key}`, value)
    })
  }, [darkMode])

  return (
    <ThemeContext.Provider value={{ t, d: DESIGN_TOKENS, darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
