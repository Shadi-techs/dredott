'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function usePageFlag(featureKey: string, defaultEnabled = true) {
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    supabase
      .from('platform_features')
      .select('enabled')
      .eq('feature_key', featureKey)
      .maybeSingle()
      .then(({ data }) => {
        setEnabled(data != null ? data.enabled : defaultEnabled)
      })
  }, [featureKey])

  return { enabled, loading: enabled === null }
}
