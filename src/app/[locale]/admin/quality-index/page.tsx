// ============================================
// Admin Property Quality Index
// Path: src/app/[locale]/admin/quality-index/page.tsx
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Star, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'

interface QualityIndex {
  id: string
  property_id: string
  furniture_condition: number
  cleanliness: number
  appliances_condition: number
  location_appeal: number
  overall_score: number
  suggested_price_per_night: number
  last_assessed: string
  admin_notes?: string
}

interface Property {
  id: string
  name: string
  price_per_night: number
}

export default function AdminQualityIndexPage() {
  const router = useRouter()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [qualityIndexes, setQualityIndexes] = useState<QualityIndex[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [showScoreModal, setShowScoreModal] = useState(false)
  
  // Score form
  const [furniture, setFurniture] = useState(3)
  const [cleanliness, setCleanliness] = useState(3)
  const [appliances, setAppliances] = useState(3)
  const [location, setLocation] = useState(3)
  const [suggestedPrice, setSuggestedPrice] = useState(0)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch properties
    const { data: propsData } = await supabase
      .from('properties')
      .select('id, name, price_per_night')
      .order('name')
    
    if (propsData) setProperties(propsData)
    
    // Fetch quality indexes
    const { data: indexData } = await supabase
      .from('property_quality_index')
      .select('*')
      .order('overall_score', { ascending: false })
    
    if (indexData) setQualityIndexes(indexData)
    
    setLoading(false)
  }

  const handleOpenScoreModal = (propertyId: string) => {
    setSelectedProperty(propertyId)
    
    // Check if this property already has a score
    const existing = qualityIndexes.find(q => q.property_id === propertyId)
    if (existing) {
      setFurniture(existing.furniture_condition)
      setCleanliness(existing.cleanliness)
      setAppliances(existing.appliances_condition)
      setLocation(existing.location_appeal)
      setSuggestedPrice(existing.suggested_price_per_night)
      setNotes(existing.admin_notes || '')
    } else {
      // Reset to defaults
      setFurniture(3)
      setCleanliness(3)
      setAppliances(3)
      setLocation(3)
      const property = properties.find(p => p.id === propertyId)
      setSuggestedPrice(property?.price_per_night || 0)
      setNotes('')
    }
    
    setShowScoreModal(true)
  }

  const handleSaveScore = async () => {
    if (!selectedProperty) return
    
    const { data: { session } } = await supabase.auth.getSession()
    
    const scoreData = {
      property_id: selectedProperty,
      furniture_condition: furniture,
      cleanliness: cleanliness,
      appliances_condition: appliances,
      location_appeal: location,
      suggested_price_per_night: suggestedPrice,
      admin_notes: notes || null,
      assessed_by: session?.user.id,
      last_assessed: new Date().toISOString(),
    }
    
    // Upsert (insert or update)
    await supabase
      .from('property_quality_index')
      .upsert(scoreData, { onConflict: 'property_id' })
    
    setShowScoreModal(false)
    setSelectedProperty(null)
    fetchData()
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600'
    if (score >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 4) return 'bg-green-50'
    if (score >= 3) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  const calculateOverall = () => {
    return ((furniture + cleanliness + appliances + location) / 4).toFixed(1)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Property Quality Index</h1>
        <p className="text-sm text-gray-600 mt-1">
          Assess property quality and recommend pricing
        </p>
      </div>

      {/* Properties without scores */}
      {properties.filter(p => !qualityIndexes.find(q => q.property_id === p.id)).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                Properties pending assessment
              </h3>
              <div className="flex flex-wrap gap-2">
                {properties
                  .filter(p => !qualityIndexes.find(q => q.property_id === p.id))
                  .map(prop => (
                    <button
                      key={prop.id}
                      onClick={() => handleOpenScoreModal(prop.id)}
                      className="px-3 py-1.5 bg-white border border-yellow-300 rounded-lg text-sm text-yellow-900 hover:bg-yellow-100 transition-colors"
                    >
                      {prop.name}
                    </button>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quality Index Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        </div>
      ) : qualityIndexes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No quality assessments yet</h3>
          <p className="text-sm text-gray-600">Start by assessing a property above</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Property
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                    Furniture
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                    Cleanliness
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                    Appliances
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                    Overall
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                    Suggested
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {qualityIndexes.map((index) => {
                  const property = properties.find(p => p.id === index.property_id)
                  const priceDiff = property ? ((index.suggested_price_per_night - property.price_per_night) / property.price_per_night * 100) : 0
                  
                  return (
                    <tr key={index.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{property?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">
                          Assessed {new Date(index.last_assessed).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-semibold ${getScoreBg(index.furniture_condition)} ${getScoreColor(index.furniture_condition)}`}>
                          {index.furniture_condition.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-semibold ${getScoreBg(index.cleanliness)} ${getScoreColor(index.cleanliness)}`}>
                          {index.cleanliness.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-semibold ${getScoreBg(index.appliances_condition)} ${getScoreColor(index.appliances_condition)}`}>
                          {index.appliances_condition.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-semibold ${getScoreBg(index.location_appeal)} ${getScoreColor(index.location_appeal)}`}>
                          {index.location_appeal.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className={`w-5 h-5 ${getScoreColor(index.overall_score)}`} fill="currentColor" />
                          <span className={`text-lg font-bold ${getScoreColor(index.overall_score)}`}>
                            {index.overall_score.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        ${property?.price_per_night || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          ${index.suggested_price_per_night}
                        </div>
                        {property && (
                          <div className={`text-xs ${priceDiff > 0 ? 'text-green-600' : priceDiff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(0)}%
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOpenScoreModal(index.property_id)}
                          className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Score Modal */}
      {showScoreModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Property Quality Assessment
            </h2>

            {/* Score Sliders */}
            <div className="space-y-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furniture Condition: {furniture.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={furniture}
                  onChange={(e) => setFurniture(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cleanliness: {cleanliness.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={cleanliness}
                  onChange={(e) => setCleanliness(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appliances Condition: {appliances.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={appliances}
                  onChange={(e) => setAppliances(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Appeal: {location.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={location}
                  onChange={(e) => setLocation(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Overall Score */}
            <div className="bg-teal-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Score:</span>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-teal-600" fill="currentColor" />
                  <span className="text-2xl font-bold text-teal-600">{calculateOverall()}</span>
                </div>
              </div>
            </div>

            {/* Suggested Price */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggested Price Per Night
              </label>
              <input
                type="number"
                value={suggestedPrice}
                onChange={(e) => setSuggestedPrice(parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Internal notes about this assessment..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveScore}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-xl transition-colors"
              >
                Save Assessment
              </button>
              <button
                onClick={() => {
                  setShowScoreModal(false)
                  setSelectedProperty(null)
                }}
                className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}