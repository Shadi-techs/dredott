// ============================================
// Owner Properties List
// Path: src/app/[locale]/owner/properties/page.tsx
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { Plus, Clock, CheckCircle, XCircle, MessageSquare, Eye, EyeOff } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending_review: { label: 'Under Review',  color: 'text-amber-600 bg-amber-50 border-amber-200',  icon: Clock },
  approved:       { label: 'Live',          color: 'text-green-600 bg-green-50 border-green-200',   icon: CheckCircle },
  rejected:       { label: 'Rejected',      color: 'text-red-600 bg-red-50 border-red-200',         icon: XCircle },
  needs_edit:     { label: 'Needs Edit',    color: 'text-blue-600 bg-blue-50 border-blue-200',      icon: MessageSquare },
}

export default function OwnerPropertiesPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const supabase = createClient()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProperties() }, [])

  const fetchProperties = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('properties')
      .select('id, name, area, type, photos, review_status, review_note, price_per_night, status, created_at, verification_status')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: false })

    setProperties(data || [])
    setLoading(false)
  }

  const toggleHide = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'unavailable' : 'available'
    await supabase.from('properties').update({ status: newStatus }).eq('id', id)
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#2C3A6B]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              My Properties
            </h1>
            <p className="text-sm text-gray-500 mt-1">{properties.length} propert{properties.length !== 1 ? 'ies' : 'y'}</p>
          </div>
          <button
            onClick={() => router.push(`/${locale}/owner/properties/new`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2C3A6B] text-white rounded-xl text-sm font-medium hover:bg-[#243058] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Property
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C3A6B]" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">No properties listed yet</p>
            <button
              onClick={() => router.push(`/${locale}/owner/properties/new`)}
              className="px-5 py-2.5 bg-[#2C3A6B] text-white rounded-xl text-sm font-medium"
            >
              Add your first property
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map(property => {
              const statusConf = STATUS_CONFIG[property.review_status] || STATUS_CONFIG.pending_review
              const StatusIcon = statusConf.icon
              const isApproved = property.review_status === 'approved'
              const isVerified = property.verification_status === 'verified'

              return (
                <div key={property.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="flex gap-4 p-4">
                    <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {property.photos?.[0]
                        ? <img src={property.photos[0]} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🏠</div>
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#2C3A6B] text-sm truncate">
                            {property.name}
                          </h3>
                          {isVerified && (
                            <div className="flex items-center gap-1 mt-1">
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">Verified by DREDOTT</span>
                            </div>
                          )}
                        </div>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium flex-shrink-0 ${statusConf.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConf.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-600">{property.area?.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-gray-600">·</span>
                        <span className="text-xs text-gray-600">{property.type}</span>
                        {property.price_per_night && (
                          <>
                            <span className="text-xs text-gray-600">·</span>
                            <span className="text-xs text-gray-600">EGP {property.price_per_night.toLocaleString()}/night</span>
                          </>
                        )}
                      </div>

                      {property.review_note && (
                        <p className="text-xs text-blue-600 mt-2 bg-blue-50 px-2 py-1 rounded-lg">
                          💬 {property.review_note}
                        </p>
                      )}
                    </div>
                  </div>

                  {isApproved && (
                    <div className="border-t border-gray-100 px-4 py-2.5">
                      <button
                        onClick={() => toggleHide(property.id, property.status)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#2C3A6B] transition-colors"
                      >
                        {property.status === 'available'
                          ? <><EyeOff className="w-3.5 h-3.5" /> Hide listing</>
                          : <><Eye className="w-3.5 h-3.5" /> Show listing</>
                        }
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}