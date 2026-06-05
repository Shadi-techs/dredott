// ============================================
// New Listing Type Selector — DREDOTT
// Path: src/app/[locale]/owner/listings/new/page.tsx
// Choose between property or car
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Home, Car, ArrowRight, AlertCircle, Package } from 'lucide-react'

const supabase = createClient()

export default function NewListingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedType = searchParams.get('type')
  
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/en/login')
      return
    }

    // Get subscription
    const { data: subs } = await supabase
      .rpc('get_user_active_subscription', { p_user_id: user.id })

    
    const sub = Array.isArray(subs) ? subs[0] : subs
    if (!sub || sub.remaining_slots === 0) {
      router.push('/en/owner/packages')
      return
    }

    setSubscription(sub)
    setLoading(false)

    // If type is preselected, redirect directly
    if (preselectedType === 'property' || preselectedType === 'car') {
      router.push(`/en/owner/listings/new/form?type=${preselectedType}`)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C3A6B]" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#2C3A6B] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            What would you like to list?
          </h1>
          <p className="text-gray-500">
            You have <strong>{subscription?.remaining_slots}</strong> available slot{subscription?.remaining_slots !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Property Card */}
          <button
            onClick={() => router.push('/en/owner/listings/new/form?type=property')}
            className="bg-white border-2 border-gray-200 hover:border-[#D4A843] rounded-2xl p-8 text-left transition-all hover:shadow-xl group"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
              <Home className="w-8 h-8 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#2C3A6B] mb-3">
              Property
            </h2>
            
            <p className="text-gray-600 mb-6">
              List your apartment, villa, studio, or any residential property for short-term rentals
            </p>

            <div className="flex items-center gap-2 text-[#2A9D8F] font-semibold group-hover:gap-3 transition-all">
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </div>

            {/* Features */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Daily & monthly rentals
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Photo gallery & amenities
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Calendar management
              </div>
            </div>
          </button>

          {/* Car Card */}
          <button
            onClick={() => router.push('/en/owner/listings/new/form?type=car')}
            className="bg-white border-2 border-gray-200 hover:border-[#D4A843] rounded-2xl p-8 text-left transition-all hover:shadow-xl group"
          >
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors">
              <Car className="w-8 h-8 text-purple-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#2C3A6B] mb-3">
              Car Rental
            </h2>
            
            <p className="text-gray-600 mb-6">
              List your car for daily or monthly rentals to tourists and residents in Sharm El Sheikh
            </p>

            <div className="flex items-center gap-2 text-[#2A9D8F] font-semibold group-hover:gap-3 transition-all">
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </div>

            {/* Features */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                Daily & monthly rates
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                Specs & features showcase
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                Availability calendar
              </div>
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Before you start</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Have high-quality photos ready (minimum 5 photos)</li>
                <li>• Prepare accurate descriptions and details</li>
                <li>• Your listing will be reviewed by our team before going live</li>
                <li>• Approval typically takes 24-48 hours</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        {subscription && (
          <div className="mt-6 bg-gradient-to-r from-[#2C3A6B] to-[#1a2240] rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-[#D4A843]" />
                <div>
                  <p className="font-semibold">{subscription.package_name_en}</p>
                  <p className="text-xs text-white/60">
                    {subscription.used_slots}/{subscription.total_slots} slots used
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#D4A843]">{subscription.remaining_slots}</p>
                <p className="text-xs text-white/60">available</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
