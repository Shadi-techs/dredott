'use client'
// src/components/owner/ThemeProvider.tsx
// Owner Portal Theme Provider - Single Light Theme

import { createContext, useContext, useEffect, ReactNode } from 'react'

// ============================================
// EXACT COLORS from Dashboard Screenshot
// ============================================

const OWNER_PALETTE = {
  name: 'Owner Portal',
  
  // Main background & surfaces
  bg: '#FAF9F6',              // Warm parchment background
  surface: '#FFFFFF',          // White cards
  surfaceAlt: '#F5F3EE',      // Slightly darker surface
  
  // Borders
  border: 'rgba(44, 58, 107, 0.12)',
  borderSoft: 'rgba(44, 58, 107, 0.06)',
  
  // Text colors
  text: '#1e2d4f',            // Navy text (primary)
  textMuted: '#7a8aaa',       // Muted text
  textFaint: '#a0a8b4',       // Faint text
  
  // Gold accent colors ✨
  accent: '#D4A843',          // Warm Gold (lighter)
  accentDark: '#B8860B',      // Darker Gold for buttons
  accentSoft: 'rgba(212, 168, 67, 0.12)',
  accentInk: '#FFFFFF',       // White text on gold
  
  // Sidebar (Navy SOLID - not gradient)
  sidebar: '#2C3A6B',         // Navy Blue (SOLID COLOR)
  sideText: '#C9CEDD',        // Light sidebar text
  sideMuted: 'rgba(201, 206, 221, 0.6)',
  sideFaint: 'rgba(201, 206, 221, 0.4)',
  sideBorder: 'rgba(201, 206, 221, 0.15)',
  sideAccent: '#D4A843',      // Gold in sidebar
  sideAccentSoft: 'rgba(212, 168, 67, 0.15)',
  
  // Status colors
  success: '#22c55e',         // Green
  danger: '#ef4444',          // Red
  warning: '#f59e0b',         // Orange
  info: '#2A9D8F',            // Teal
}

interface ThemeContextType {
  palette: typeof OWNER_PALETTE
}

const ThemeContext = createContext<ThemeContextType>({ 
  palette: OWNER_PALETTE 
})

export function useOwnerTheme() {
  return useContext(ThemeContext)
}

export function OwnerThemeProvider({ children }: { children: ReactNode }) {
  
  // Apply CSS variables on mount
  useEffect(() => {
    Object.entries(OWNER_PALETTE).forEach(([key, value]) => {
      if (key !== 'name') {
        document.documentElement.style.setProperty(`--owner-${key}`, value)
      }
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ palette: OWNER_PALETTE }}>
      {children}
    </ThemeContext.Provider>
  )
}
