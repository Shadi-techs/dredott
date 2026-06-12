'use client'
// ============================================
// Subscribe Page — Annual job contact access
// Redirects to /pricing with jobs context
// ============================================

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SubscribePage() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const router = useRouter()

  useEffect(() => {
    router.replace(`/${locale}/pricing?context=jobs`)
  }, [locale, router])

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={24} color="#D4A843" style={{ animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
