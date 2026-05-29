// ============================================
// Property Calendar Page
// Path: src/app/[locale]/owner/properties/[id]/calendar/page.tsx
// Manage blocked dates for property
// ============================================

'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Calendar from '@/components/Calendar'
import Link from 'next/link'

interface PropertyCalendarProps {
  params: Promise<{ locale: string; id: string }>
}

interface BlockedDate {
  start: string
  end: string
  reason?: string
}

export default function PropertyCalendarPage({ params }: PropertyCalendarProps) {
  const { locale, id } = use(params)
  const router = useRouter()
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [property, setProperty] = useState<any>(null)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchProperty()
  }, [id])

  const fetchProperty = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push(`/${locale}/login`)
        return
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('owner_user_id', session.user.id)
        .single()

      if (error || !data) {
        setError('Property not found or access denied')
        setLoading(false)
        return
      }

      setProperty(data)
      setBlockedDates(data.calendar_blocked_dates || [])
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          calendar_blocked_dates: blockedDates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save calendar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A9D8F]"></div>
      </div>
    )
  }

  if (error && !property) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-[#2C3A6B] mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href={`/${locale}/owner/properties`}
            className="inline-flex items-center gap-2 text-[#2A9D8F] hover:text-[#2C3A6B] font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${locale}/owner/properties`}
          className="inline-flex items-center gap-2 text-[#2A9D8F] hover:text-[#2C3A6B] font-medium mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Properties
        </Link>

        <div 
          className="text-sm tracking-[0.2em] text-[#B8860B] mb-2"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          — PROPERTY CALENDAR
        </div>
        <h1 
          className="text-4xl lg:text-5xl text-[#2C3A6B] mb-3"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {property?.name}
        </h1>
        <p className="text-gray-600">
          Block dates when your property is unavailable
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-green-600 text-sm">Calendar saved successfully!</div>
        </div>
      )}

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click dates to block them (range selection)</li>
          <li>• Blocked dates won't show in availability</li>
          <li>• Click blocked dates again to unblock them</li>
          <li>• Don't forget to click "Save Changes" when done</li>
        </ul>
      </div>

      {/* Calendar */}
      <div className="max-w-3xl">
        <Calendar
          blockedDates={blockedDates}
          onDatesChange={setBlockedDates}
          minDate={new Date()}
        />
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end max-w-3xl">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#2C3A6B] hover:bg-[#2A9D8F] text-[#D4A843] px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  )
}