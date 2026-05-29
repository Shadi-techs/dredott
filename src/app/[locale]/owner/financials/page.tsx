// ============================================
// Owner Portal - Financial Summary
// Path: src/app/[locale]/owner/financials/page.tsx
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { DollarSign, TrendingUp, Calendar, Download, FileText } from 'lucide-react'

interface Financial {
  id: string
  property_id: string
  period_start: string
  period_end: string
  gross_revenue: number
  commission_rate: number
  commission_amount: number
  services_deducted: number
  net_amount: number
  bookings_count: number
  occupancy_rate: number
  payment_status: 'pending' | 'paid' | 'overdue'
  paid_at?: string
}

interface Property {
  id: string
  name: string
}

export default function OwnerFinancialsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [financials, setFinancials] = useState<Financial[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [selectedProperty])

  const fetchData = async () => {
    setLoading(true)
    
    // Get user's properties
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    
    const { data: propertiesData } = await supabase
      .from('properties')
      .select('id, name')
      .eq('owner_id', session.user.id)
    
    if (propertiesData) {
      setProperties(propertiesData)
    }
    
    // Get financials
    let query = supabase
      .from('owner_financials')
      .select('*')
      .order('period_start', { ascending: false })
    
    if (selectedProperty !== 'all') {
      query = query.eq('property_id', selectedProperty)
    } else if (propertiesData && propertiesData.length > 0) {
      query = query.in('property_id', propertiesData.map(p => p.id))
    }
    
    const { data: financialsData } = await query
    
    if (financialsData) {
      setFinancials(financialsData)
    }
    
    setLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
  }

  const totalNet = financials.reduce((sum, f) => sum + f.net_amount, 0)
  const totalGross = financials.reduce((sum, f) => sum + f.gross_revenue, 0)
  const avgOccupancy = financials.length > 0
    ? financials.reduce((sum, f) => sum + f.occupancy_rate, 0) / financials.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Financial Summary</h1>
          <p className="text-sm text-gray-600 mt-1">
            View your property earnings and commission breakdown
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Property Filter */}
        <div className="mb-6">
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm text-gray-600">Total Net Earnings</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalNet)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm text-gray-600">Gross Revenue</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalGross)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-sm text-gray-600">Avg Occupancy</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {avgOccupancy.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Financial Records Table */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          </div>
        ) : financials.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No financial records yet
            </h3>
            <p className="text-sm text-gray-600">
              Financial summaries will appear here once bookings are completed
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Property
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                      Gross
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                      Services
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                      Net Amount
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {financials.map((record) => {
                    const property = properties.find(p => p.id === record.property_id)
                    
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(record.period_start)} - {formatDate(record.period_end)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {record.bookings_count} bookings • {record.occupancy_rate.toFixed(0)}% occupied
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {property?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatCurrency(record.gross_revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                          -{formatCurrency(record.commission_amount)}
                          <div className="text-xs text-gray-500">
                            ({record.commission_rate}%)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-600">
                          -{formatCurrency(record.services_deducted)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                          {formatCurrency(record.net_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${
                            record.payment_status === 'paid'
                              ? 'bg-green-50 text-green-700'
                              : record.payment_status === 'overdue'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {record.payment_status.charAt(0).toUpperCase() + record.payment_status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button className="text-teal-600 hover:text-teal-700">
                            <Download className="w-4 h-4" />
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

        {/* Commission Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Understanding Your Earnings
              </h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Gross Revenue:</strong> Total booking value before deductions<br />
                <strong>Commission:</strong> Dredottplatform fee (percentage varies by property)<br />
                <strong>Services:</strong> Cleaning, maintenance, and other property services<br />
                <strong>Net Amount:</strong> Your final earnings after all deductions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}