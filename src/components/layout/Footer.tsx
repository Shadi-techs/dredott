'use client'
// ============================================
// DredottSTAY — Footer Component
// ============================================

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { Locale } from '@/i18n'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Footer() {
  const locale = useLocale() as Locale
  const year = new Date().getFullYear()
  const [jobsEnabled, setJobsEnabled] = useState(false)

  useEffect(() => {
    supabase
      .from('platform_features')
      .select('enabled')
      .eq('feature_key', 'jobs_page_enabled')
      .maybeSingle()
      .then(({ data }) => setJobsEnabled(data?.enabled ?? false))
  }, [])

  return (
    <footer className="bg-[#1a2440] border-t-2 border-[#B8860B]">
      <div className="px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 flex-wrap">
        {/* Logo + address */}
        <div>
          <div className="text-[#D4A843] text-sm font-medium mb-1">
            DredottStay · Sharm El Sheikh
          </div>
          <div className="flex items-start gap-1 text-[#A0A8B4] text-xs leading-relaxed">
            <MapPin size={11} className="mt-0.5 flex-shrink-0 text-[#D4A843]" />
            <span>Naama Bay, Sharm El Sheikh, South Sinai, Egypt</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-4 flex-wrap">
          <Link href={`/${locale}/properties`} className="text-[#A0A8B4] text-xs hover:text-[#D4A843] transition-colors">
            Properties
          </Link>
          <Link href={`/${locale}/cars`} className="text-[#A0A8B4] text-xs hover:text-[#D4A843] transition-colors">
            Cars
          </Link>
          <Link href={`/${locale}/about`} className="text-[#A0A8B4] text-xs hover:text-[#D4A843] transition-colors">
            About
          </Link>
          <Link href={`/${locale}/contact`} className="text-[#A0A8B4] text-xs hover:text-[#D4A843] transition-colors">
            Contact
          </Link>
          {jobsEnabled && (
            <Link href={`/${locale}/jobs`} className="text-[#A0A8B4] text-xs hover:text-[#D4A843] transition-colors">
              Jobs
            </Link>
          )}
          <Link href={`/${locale}/privacy`} className="text-[#A0A8B4] text-xs hover:text-[#D4A843] transition-colors underline">
            Privacy
          </Link>
        </div>

        {/* WhatsApp button */}
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#2A9D8F] text-white text-xs font-medium px-3.5 py-2 rounded-lg hover:bg-[#228a7d] transition-colors"
        >
          WhatsApp Us
        </a>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#D4A843]/10 py-2.5 px-6 text-center text-[10px] text-[#A0A8B4]/50">
        © {year} Dredott. All rights reserved.
        {' · '}
        Dredott Real Estate
      </div>
    </footer>
  )
}
