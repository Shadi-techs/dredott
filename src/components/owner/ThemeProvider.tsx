'use client'
// src/components/owner/ThemeProvider.tsx

import { createContext, useContext, useEffect, ReactNode } from 'react'

const OWNER_PALETTE = {
  bg: '#FAF9F6',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F3EE',
  border: 'rgba(44, 58, 107, 0.12)',
  borderSoft: 'rgba(44, 58, 107, 0.06)',
  text: '#1e2d4f',
  textMuted: '#7a8aaa',
  textFaint: '#a0a8b4',
  accent: '#D4A843',
  accentDark: '#B8860B',
  accentSoft: 'rgba(212, 168, 67, 0.12)',
  accentInk: '#FFFFFF',
  sidebar: '#2C3A6B',
  sideText: '#C9CEDD',
  sideMuted: 'rgba(201, 206, 221, 0.6)',
  sideFaint: 'rgba(201, 206, 221, 0.4)',
  sideBorder: 'rgba(201, 206, 221, 0.15)',
  sideAccent: '#D4A843',
  sideAccentSoft: 'rgba(212, 168, 67, 0.15)',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#2A9D8F',
}

const DESIGN_TOKENS = {
  gap: 16,
  pad: 24,
  radius: 8,
  shadowSm: '0 1px 2px rgba(0,0,0,0.05)',
  shadowMd: '0 4px 6px rgba(0,0,0,0.1)',
}

interface ThemeContextType {
  t: typeof OWNER_PALETTE
  d: typeof DESIGN_TOKENS
}

const defaultValue: ThemeContextType = {
  t: OWNER_PALETTE,
  d: DESIGN_TOKENS,
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useOwnerTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  
  if (!context) {
    console.error('useOwnerTheme must be used within OwnerThemeProvider')
    return defaultValue
  }
  
  return context
}

export function OwnerThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    Object.entries(OWNER_PALETTE).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--owner-${key}`, value)
    })
  }, [])

  return (
    <ThemeContext.Provider value={defaultValue}>
      {children}
    </ThemeContext.Provider>
  )
}