// src/lib/owner/theme.ts
// Owner Portal Theme System - EXACT COLORS from Dashboard

export const DENSITY = {
  compact: {
    pad: 16,
    gap: 12,
    cardPad: 12,
  },
  regular: {
    pad: 24,
    gap: 16,
    cardPad: 20,
  },
  spacious: {
    pad: 32,
    gap: 24,
    cardPad: 28,
  },
}

// ============================================
// OWNER PORTAL THEME - Light Mode with Navy Sidebar
// Colors extracted from dashboard screenshot
// ============================================

export const OWNER_LIGHT = {
  // Main Content (Light)
  bg: '#FAF9F6',              // Warm parchment background
  surface: '#FFFFFF',          // White cards
  surfaceAlt: '#F5F3EE',      // Slightly darker surface
  
  // Sidebar (Navy Solid - NOT gradient)
  sidebar: '#2C3A6B',          // Navy Blue sidebar (SOLID)
  sideText: '#C9CEDD',         // Light text in sidebar
  sideMuted: 'rgba(201, 206, 221, 0.6)',
  sideFaint: 'rgba(201, 206, 221, 0.4)',
  sideBorder: 'rgba(201, 206, 221, 0.15)',
  sideAccent: '#D4A843',       // Gold accent in sidebar
  sideAccentSoft: 'rgba(212, 168, 67, 0.15)',
  
  // Gold Accents
  accent: '#D4A843',           // Warm Gold (lighter)
  accentDark: '#B8860B',       // Darker Gold for buttons
  accentSoft: 'rgba(212, 168, 67, 0.12)',
  accentInk: '#FFFFFF',        // White text on gold buttons
  
  // Borders
  border: 'rgba(44, 58, 107, 0.12)',
  borderSoft: 'rgba(44, 58, 107, 0.06)',
  
  // Text Colors
  text: '#1e2d4f',            // Navy dark for text
  textMuted: '#7a8aaa',       // Muted text
  textFaint: '#a0a8b4',       // Very light text
  
  // Status Colors
  success: '#22c55e',         // Green
  danger: '#ef4444',          // Red
  warning: '#f59e0b',         // Orange
  info: '#2A9D8F',            // Teal
}

export type Palette = typeof OWNER_LIGHT
export type DensityLevel = keyof typeof DENSITY