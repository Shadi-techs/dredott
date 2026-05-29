// ============================================
// Packages Page — DREDOTT
// Path: src/app/[locale]/owner/packages/page.tsx
// Browse and purchase listing packages
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Check, Crown, Zap, Shield, TrendingUp, 
  Package, AlertCircle, ArrowRight 
} from 'lucide-react'

const supabase = createClient()

export default function PackagesPage() {
  const router = useRouter()
  
  const [packages, setPackages] = useState<any[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/en/login')
      return
    }

    // Get packages
    const { data: pkgs } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    
    setPackages(pkgs || [])

    // Get current subscription
    const { data: sub } = await supabase
      .rpc('get_user_active_subscription', { p_user_id: user.id })
      .single()
    
    setCurrentSubscription(sub)
    setLoading(false)
  }

  const handleSelectPackage = async (packageId: string) => {
    // TODO: Integrate Stripe checkout
    alert('Stripe integration coming soon! Package ID: ' + packageId)
    // router.push(`/en/checkout?package=${packageId}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C3A6B]" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 px-4 py-2 rounded-full mb-4">
            <Package className="w-4 h-4 text-[#D4A843]" />
            <span className="text-sm font-semibold text-[#2C3A6B]">Choose Your Package</span>
          </div>
          
          <h1 className="text-4xl font-bold text-[#2C3A6B] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Start Listing on DREDOTT
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select a package based on how many properties and cars you want to list. 
            All packages include admin review and secure hosting.
          </p>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-300 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900">Active Package</h3>
                <p className="text-sm text-green-700">
                  {currentSubscription.package_name_en} — {currentSubscription.used_slots}/{currentSubscription.total_slots} slots used
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">Expires</p>
                <p className="font-semibold text-green-900">
                  {new Date(currentSubscription.expires_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, index) => {
            const isPopular = index === 2 // Pro package
            const features = pkg.features || {}
            
            return (
              <PackageCard
                key={pkg.id}
                name={pkg.name_en}
                nameAr={pkg.name_ar}
                slots={pkg.slots_count}
                price={pkg.price}
                duration={pkg.duration_days}
                features={features}
                isPopular={isPopular}
                onSelect={() => handleSelectPackage(pkg.id)}
              />
            )
          })}
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-[#2C3A6B] text-center mb-8">
            Feature Comparison
          </h2>
          
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3A6B]">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Starter</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Basic</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 bg-[#D4A843]/5">Pro</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Unlimited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <FeatureRow 
                  feature="Listing Slots"
                  values={['1', '3', '10', 'Unlimited']}
                />
                <FeatureRow 
                  feature="Verified Badge"
                  values={[false, true, true, true]}
                />
                <FeatureRow 
                  feature="Priority in Search"
                  values={[false, false, true, true]}
                />
                <FeatureRow 
                  feature="Visitor Analytics"
                  values={[false, false, true, true]}
                />
                <FeatureRow 
                  feature="Premium Support"
                  values={[false, false, false, true]}
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <FAQ 
              q="Can I mix properties and cars in one package?"
              a="Yes! Each slot can be used for either a property or a car. You decide."
            />
            <FAQ 
              q="What happens when my subscription expires?"
              a="Your listings will remain visible for 7 days grace period. After that, they'll be paused until you renew."
            />
            <FAQ 
              q="Can I upgrade my package later?"
              a="Absolutely! You can upgrade anytime and keep your existing listings."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Components
function PackageCard({ name, nameAr, slots, price, duration, features, isPopular, onSelect }: any) {
  return (
    <div className={`bg-white rounded-2xl border-2 transition-all hover:shadow-xl relative ${
      isPopular ? 'border-[#D4A843] shadow-lg' : 'border-gray-200'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4A843] text-white px-4 py-1 rounded-full text-xs font-bold">
          MOST POPULAR
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[#2C3A6B] mb-1">{name}</h3>
          <p className="text-sm text-gray-500">{nameAr}</p>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-[#2C3A6B]">{price}</span>
            <span className="text-gray-500">EGP</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            per {duration === 30 ? 'month' : duration ? `${duration} days` : 'lifetime'}
          </p>
        </div>

        {/* Slots */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#2C3A6B] mb-1">
              {slots === 999 ? '∞' : slots}
            </p>
            <p className="text-sm text-gray-600">Listing Slots</p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {features.verified_badge && (
            <Feature icon={Shield} text="Verified Badge" />
          )}
          {features.priority_search && (
            <Feature icon={TrendingUp} text="Priority Search" />
          )}
          {features.analytics && (
            <Feature icon={Zap} text="Analytics" />
          )}
          {features.premium_support && (
            <Feature icon={Crown} text="Premium Support" />
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onSelect}
          className={`w-full py-3 rounded-xl font-semibold transition-colors ${
            isPopular
              ? 'bg-[#D4A843] hover:bg-[#c49835] text-[#0e1428]'
              : 'bg-[#2C3A6B] hover:bg-[#243058] text-white'
          }`}
        >
          Select Package
        </button>
      </div>
    </div>
  )
}

function Feature({ icon: Icon, text }: any) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-[#2A9D8F]" />
      <span className="text-sm text-gray-700">{text}</span>
    </div>
  )
}

function FeatureRow({ feature, values }: any) {
  return (
    <tr>
      <td className="px-6 py-4 text-sm font-medium text-[#2C3A6B]">{feature}</td>
      {values.map((val: any, i: number) => (
        <td key={i} className={`px-6 py-4 text-center ${i === 2 ? 'bg-[#D4A843]/5' : ''}`}>
          {typeof val === 'boolean' ? (
            val ? (
              <Check className="w-5 h-5 text-green-600 mx-auto" />
            ) : (
              <span className="text-gray-300">—</span>
            )
          ) : (
            <span className="text-sm font-medium text-gray-700">{val}</span>
          )}
        </td>
      ))}
    </tr>
  )
}

function FAQ({ q, a }: any) {
  return (
    <div>
      <p className="font-semibold text-blue-900 mb-1">{q}</p>
      <p className="text-sm text-blue-700">{a}</p>
    </div>
  )
}
