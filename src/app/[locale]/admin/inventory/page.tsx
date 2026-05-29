// ============================================
// Admin Inventory Reports - List
// Path: src/app/[locale]/admin/inventory/page.tsx
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Plus, FileText, Wrench, ClipboardCheck, Download, Eye, Trash2 } from 'lucide-react'

interface InventoryReport {
  id: string
  property_id: string
  type: 'item_log' | 'maintenance' | 'check_in_out'
  title: string
  report_data: any
  staff_id?: string
  pdf_url?: string
  admin_notes?: string
  owner_comment?: string
  created_at: string
}

interface Property {
  id: string
  name: string
}

interface Staff {
  id: string
  name: string
}

export default function AdminInventoryPage() {
  const router = useRouter()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [reports, setReports] = useState<InventoryReport[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'item_log' | 'maintenance' | 'check_in_out'>('all')
  const [filterProperty, setFilterProperty] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [filterType, filterProperty])

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch properties
    const { data: propsData } = await supabase
      .from('properties')
      .select('id, name')
      .order('name')
    
    if (propsData) setProperties(propsData)
    
    // Fetch staff
    const { data: staffData } = await supabase
      .from('staff')
      .select('id, name')
    
    if (staffData) setStaff(staffData)
    
    // Fetch reports
    let query = supabase
      .from('inventory_reports')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filterType !== 'all') {
      query = query.eq('type', filterType)
    }
    
    if (filterProperty !== 'all') {
      query = query.eq('property_id', filterProperty)
    }
    
    const { data: reportsData } = await query
    
    if (reportsData) setReports(reportsData)
    
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report?')) return
    
    await supabase.from('inventory_reports').delete().eq('id', id)
    fetchData()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'item_log':
        return <FileText className="w-5 h-5 text-blue-600" />
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-orange-600" />
      case 'check_in_out':
        return <ClipboardCheck className="w-5 h-5 text-green-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      item_log: 'bg-blue-50 text-blue-700',
      maintenance: 'bg-orange-50 text-orange-700',
      check_in_out: 'bg-green-50 text-green-700',
    }
    return badges[type as keyof typeof badges] || 'bg-gray-50 text-gray-700'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Reports</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage property inventory, maintenance logs, and check-in/out reports
          </p>
        </div>
        <button
          onClick={() => router.push('/en/admin/inventory/new')}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Type Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setFilterType('item_log')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'item_log'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Item Logs
          </button>
          <button
            onClick={() => setFilterType('maintenance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'maintenance'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Maintenance
          </button>
          <button
            onClick={() => setFilterType('check_in_out')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'check_in_out'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Check-in/out
          </button>
        </div>

        {/* Property Filter */}
        <select
          value={filterProperty}
          onChange={(e) => setFilterProperty(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Properties</option>
          {properties.map((prop) => (
            <option key={prop.id} value={prop.id}>{prop.name}</option>
          ))}
        </select>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports yet</h3>
          <p className="text-sm text-gray-600 mb-6">Create your first inventory report</p>
          <button
            onClick={() => router.push('/en/admin/inventory/new')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl transition-colors"
          >
            New Report
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => {
            const property = properties.find(p => p.id === report.property_id)
            const assignedStaff = report.staff_id ? staff.find(s => s.id === report.staff_id) : null
            
            return (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      report.type === 'item_log' ? 'bg-blue-50' :
                      report.type === 'maintenance' ? 'bg-orange-50' :
                      'bg-green-50'
                    }`}>
                      {getTypeIcon(report.type)}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getTypeBadge(report.type)}`}>
                          {report.type.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Property:</strong> {property?.name || 'Unknown'}</div>
                        {assignedStaff && (
                          <div><strong>Staff:</strong> {assignedStaff.name}</div>
                        )}
                        <div><strong>Created:</strong> {new Date(report.created_at).toLocaleDateString()}</div>
                      </div>

                      {report.admin_notes && (
                        <div className="mt-3 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                          <strong>Admin Notes:</strong> {report.admin_notes}
                        </div>
                      )}

                      {report.owner_comment && (
                        <div className="mt-2 text-sm text-blue-700 bg-blue-50 rounded-lg p-3">
                          <strong>Owner Comment:</strong> {report.owner_comment}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {report.pdf_url && (
                      <a
                        href={report.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => router.push(`/en/admin/inventory/${report.id}`)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}