'use client'
// ============================================
// Admin Feature Flags Page
// Path: src/app/[locale]/admin/settings/feature-flags/page.tsx
//
// ✅ بتستخدم platform_features (مش feature_flags القديم)
// ✅ Toggle عن طريق API route
// ✅ super_admin فقط
// ============================================

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Shield, AlertCircle, CheckCircle, Info,
  ToggleLeft, ToggleRight, RefreshCw
} from 'lucide-react'

interface PlatformFeature {
  id: string
  feature_key: string
  module: string
  enabled: boolean
  description: string
  description_ar: string
  updated_at: string
}

const MODULE_COLORS: Record<string, string> = {
  properties: '#60a5fa',
  cars:       '#2A9D8F',
  blog:       '#a78bfa',
  bookings:   '#4ade80',
  jobs:       '#f97316',
  general:    '#D4A843',
}

const MODULE_LABELS: Record<string, string> = {
  properties: 'Properties',
  cars:       'Cars',
  blog:       'Blog',
  bookings:   'Bookings',
  jobs:       'Jobs',
  general:    'General',
}

export default function AdminFeatureFlagsPage() {
  const supabase = createClient()

  const [features, setFeatures]     = useState<PlatformFeature[]>([])
  const [loading, setLoading]       = useState(true)
  const [toggling, setToggling]     = useState<string | null>(null)
  const [error, setError]           = useState('')
  const [successKey, setSuccessKey] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  // ── Check role from JWT ──
  useEffect(() => {
    async function checkRole() {
      const res = await fetch('/api/admin/verify')
      if (res.ok) {
        const data = await res.json()
        if (data.admin?.role === 'super_admin') {
          setIsSuperAdmin(true)
          fetchFeatures()
        } else {
          setError('Super Admin access required')
          setLoading(false)
        }
      } else {
        setError('Unauthorized')
        setLoading(false)
      }
    }
    checkRole()
  }, [])

  async function fetchFeatures() {
    setLoading(true)
    const { data, error } = await supabase
      .from('platform_features')
      .select('*')
      .order('module')
      .order('feature_key')

    if (data) setFeatures(data)
    else if (error) setError('Failed to load features')
    setLoading(false)
  }

  async function handleToggle(feature: PlatformFeature) {
    if (!isSuperAdmin || toggling) return
    setToggling(feature.feature_key)
    setError('')

    try {
      const res = await fetch('/api/admin/feature-flags/toggle', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ feature_key: feature.feature_key }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to toggle feature')
        return
      }

      // حدّث الـ state محلياً
      setFeatures(prev => prev.map(f =>
        f.feature_key === feature.feature_key
          ? { ...f, enabled: data.enabled, updated_at: new Date().toISOString() }
          : f
      ))

      // Flash success
      setSuccessKey(feature.feature_key)
      setTimeout(() => setSuccessKey(null), 2000)

    } catch (err) {
      setError('Failed to toggle feature')
    } finally {
      setToggling(null)
    }
  }

  // ── Group by module ──
  const grouped = features.reduce((acc, feature) => {
    if (!acc[feature.module]) acc[feature.module] = []
    acc[feature.module].push(feature)
    return acc
  }, {} as Record<string, PlatformFeature[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A843]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F2F7] p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#D4A843]" />
          </div>
          <div>
            <p className="text-xs text-[#D4A843] tracking-widest uppercase font-mono">Super Admin · Master Control</p>
            <h1 className="text-3xl font-bold text-[#1a2240] font-['Cormorant_Garamond']">
              Feature Flags
            </h1>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-[#f87171]/10 border border-[#f87171]/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#f87171] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#f87171]">{error}</p>
          </div>
        )}

        {/* Features grouped by module */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([module, moduleFeatures]) => {
            const color = MODULE_COLORS[module] || '#D4A843'

            return (
              <div key={module} className="bg-white rounded-lg border border-[#1a2240]/10 overflow-hidden">

                {/* Module header */}
                <div className="px-5 py-3 border-b border-[#1a2240]/10 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-semibold tracking-widest uppercase font-mono"
                    style={{ color }}>
                    {MODULE_LABELS[module] || module}
                  </span>
                  <span className="text-xs text-[#6B7280] ml-1">
                    ({moduleFeatures.filter(f => f.enabled).length}/{moduleFeatures.length} enabled)
                  </span>
                </div>

                {/* Features */}
                <div className="divide-y divide-white/5">
                  {moduleFeatures.map((feature) => {
                    const isToggling = toggling === feature.feature_key
                    const isSuccess  = successKey === feature.feature_key

                    return (
                      <div key={feature.feature_key}
                        className="px-5 py-4 flex items-center justify-between gap-4">

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium text-[#1a2240]">
                              {feature.description || feature.feature_key}
                            </span>
                            {isSuccess && (
                              <CheckCircle className="w-4 h-4 text-[#4ade80]" />
                            )}
                          </div>
                          {feature.description_ar && (
                            <p className="text-xs text-[#6B7280] text-right">{feature.description_ar}</p>
                          )}
                          <p className="text-xs text-[#6B7280] font-mono mt-1">{feature.feature_key}</p>
                          {feature.updated_at && (
                            <p className="text-xs text-[#6B7280]/50 mt-0.5">
                              Last updated: {new Date(feature.updated_at).toLocaleString()}
                            </p>
                          )}
                        </div>

                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(feature)}
                          disabled={!isSuperAdmin || !!toggling}
                          className={`relative w-16 h-8 rounded-full transition-all duration-300 flex-shrink-0 disabled:cursor-not-allowed ${
                            feature.enabled
                              ? 'bg-[#4ade80]/30 border border-[#4ade80]/50'
                              : 'bg-[#F0F2F7] border border-white/20'
                          }`}
                        >
                          {isToggling ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <RefreshCw className="w-4 h-4 text-[#D4A843] animate-spin" />
                            </div>
                          ) : (
                            <div className={`absolute top-1 w-6 h-6 rounded-full shadow transition-all duration-300 flex items-center justify-center ${
                              feature.enabled
                                ? 'left-9 bg-[#4ade80]'
                                : 'left-1 bg-[#7a8aaa]'
                            }`}>
                              {feature.enabled
                                ? <ToggleRight className="w-4 h-4 text-[#F0F2F7]" />
                                : <ToggleLeft className="w-4 h-4 text-[#F0F2F7]" />
                              }
                            </div>
                          )}
                        </button>

                        {/* Status label */}
                        <span className={`text-xs font-mono w-16 text-right flex-shrink-0 ${
                          feature.enabled ? 'text-[#4ade80]' : 'text-[#6B7280]'
                        }`}>
                          {feature.enabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Help */}
        <div className="mt-8 p-5 bg-white border border-[#D4A843]/20 rounded-lg">
          <h4 className="text-sm font-semibold text-[#D4A843] mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" /> How Feature Flags Work
          </h4>
          <ul className="text-sm text-[#6B7280] space-y-1.5">
            <li><span className="text-[#4ade80]">ENABLED</span> — الـ feature ظاهرة على الموقع وشغالة</li>
            <li><span className="text-[#f87171]">DISABLED</span> — الـ feature مخفية والـ routes بترجع 404</li>
            <li>البيانات في الـ DB مش بتتمسح — بس بتتخبى</li>
            <li>التغييرات فورية — مش محتاج save</li>
            <li>كل تغيير بيتسجل في الـ Activity Log</li>
          </ul>
        </div>
      </div>
    </div>
  )
}