// ============================================
// Admin Staff Management - List
// Path: src/app/[locale]/admin/staff/page.tsx
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Plus, Users, Building2, Phone, Mail, Edit2, Trash2 } from 'lucide-react'

interface Staff {
  id: string
  type: 'individual' | 'company'
  name: string
  phone: string
  email?: string
  specialty?: string
  company_name?: string
  contact_person?: string
  active: boolean
  created_at: string
}

export default function AdminStaffPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'individual' | 'company'>('all')

  useEffect(() => {
    fetchStaff()
  }, [filter])

  const fetchStaff = async () => {
    setLoading(true)
    
    let query = supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filter !== 'all') {
      query = query.eq('type', filter)
    }
    
    const { data } = await query
    
    if (data) {
      setStaff(data)
    }
    
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return
    
    await supabase.from('staff').delete().eq('id', id)
    fetchStaff()
  }

  const filteredStaff = staff.filter(s => {
    if (filter === 'all') return true
    return s.type === filter
  })

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage individual staff and contractor companies
          </p>
        </div>
        <button
          onClick={() => router.push(`/${locale}/admin/staff/new`)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All ({staff.length})
        </button>
        <button
          onClick={() => setFilter('individual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'individual'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          Individual ({staff.filter(s => s.type === 'individual').length})
        </button>
        <button
          onClick={() => setFilter('company')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'company'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Companies ({staff.filter(s => s.type === 'company').length})
        </button>
      </div>

      {/* Staff List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No staff yet</h3>
          <p className="text-sm text-gray-600 mb-6">
            Add your first staff member or contractor company
          </p>
          <button
            onClick={() => router.push(`/${locale}/admin/staff/new`)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl transition-colors"
          >
            Add Staff
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredStaff.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    member.type === 'individual' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'bg-purple-50 text-purple-600'
                  }`}>
                    {member.type === 'individual' ? (
                      <Users className="w-6 h-6" />
                    ) : (
                      <Building2 className="w-6 h-6" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {member.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        member.active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {member.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                        {member.type === 'individual' ? 'Individual' : 'Company'}
                      </span>
                    </div>

                    {member.type === 'company' && member.company_name && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Company:</strong> {member.company_name}
                      </p>
                    )}

                    {member.specialty && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Specialty:</strong> {member.specialty}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {member.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-4 h-4" />
                          {member.phone}
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          {member.email}
                        </div>
                      )}
                    </div>

                    {member.type === 'company' && member.contact_person && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Contact:</strong> {member.contact_person}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/${locale}/admin/staff/${member.id}`)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}