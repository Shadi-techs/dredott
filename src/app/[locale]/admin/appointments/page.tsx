// ============================================
// Admin Appointments Management
// Path: src/app/[locale]/admin/appointments/page.tsx
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Appointment {
  id: string
  property_id: string
  staff_id?: string
  type: string
  title: string
  description?: string
  scheduled_at: string
  duration_minutes: number
  owner_present: boolean
  owner_confirmed?: boolean
  status: 'scheduled' | 'confirmed_owner' | 'declined_owner' | 'completed' | 'cancelled'
  admin_notes?: string
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

export default function AdminAppointmentsPage() {
  const router = useRouter()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'confirmed_owner' | 'completed'>('all')

  useEffect(() => {
    fetchData()
  }, [filterStatus])

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch properties
    const { data: propsData } = await supabase
      .from('properties')
      .select('id, name')
    
    if (propsData) setProperties(propsData)
    
    // Fetch staff
    const { data: staffData } = await supabase
      .from('staff')
      .select('id, name')
    
    if (staffData) setStaff(staffData)
    
    // Fetch appointments
    let query = supabase
      .from('appointments')
      .select('*')
      .order('scheduled_at', { ascending: true })
    
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus)
    }
    
    const { data: appointmentsData } = await query
    
    if (appointmentsData) setAppointments(appointmentsData)
    
    setLoading(false)
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await supabase
      .from('appointments')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', id)
    
    fetchData()
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: 'bg-blue-50 text-blue-700',
      confirmed_owner: 'bg-green-50 text-green-700',
      declined_owner: 'bg-red-50 text-red-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-gray-100 text-gray-500',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-50 text-gray-700'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'confirmed_owner':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'declined_owner':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-gray-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const isUpcoming = (scheduledAt: string) => {
    return new Date(scheduledAt) > new Date()
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-600 mt-1">
            Schedule and manage property inspections and maintenance
          </p>
        </div>
        <button
          onClick={() => router.push('/en/admin/appointments/new')}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus('scheduled')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'scheduled'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => setFilterStatus('confirmed_owner')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'confirmed_owner'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Confirmed
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'completed'
              ? 'bg-gray-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Appointments Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments</h3>
          <p className="text-sm text-gray-600 mb-6">Schedule your first property appointment</p>
          <button
            onClick={() => router.push('/en/admin/appointments/new')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl transition-colors"
          >
            New Appointment
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => {
            const property = properties.find(p => p.id === appointment.property_id)
            const assignedStaff = appointment.staff_id ? staff.find(s => s.id === appointment.staff_id) : null
            const upcoming = isUpcoming(appointment.scheduled_at)
            
            return (
              <div
                key={appointment.id}
                className={`bg-white rounded-xl border p-6 hover:shadow-sm transition-shadow ${
                  upcoming ? 'border-teal-200 bg-teal-50/30' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-teal-700" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.title}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${getStatusBadge(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          {appointment.status.replace('_', ' ')}
                        </span>
                        {upcoming && (
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-teal-100 text-teal-700">
                            Upcoming
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 mb-3">
                        <div><strong>Property:</strong> {property?.name || 'Unknown'}</div>
                        <div><strong>Type:</strong> {appointment.type}</div>
                        <div><strong>Date:</strong> {new Date(appointment.scheduled_at).toLocaleDateString()}</div>
                        <div><strong>Time:</strong> {new Date(appointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div><strong>Duration:</strong> {appointment.duration_minutes} min</div>
                        {assignedStaff && (
                          <div><strong>Staff:</strong> {assignedStaff.name}</div>
                        )}
                      </div>

                      {appointment.description && (
                        <p className="text-sm text-gray-700 mb-3">{appointment.description}</p>
                      )}

                      {appointment.owner_present && (
                        <div className="flex items-center gap-2 text-sm mb-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            appointment.owner_confirmed === true
                              ? 'bg-green-50 text-green-700'
                              : appointment.owner_confirmed === false
                              ? 'bg-red-50 text-red-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            Owner attendance: {
                              appointment.owner_confirmed === true ? 'Confirmed' :
                              appointment.owner_confirmed === false ? 'Declined' :
                              'Pending'
                            }
                          </span>
                        </div>
                      )}

                      {appointment.admin_notes && (
                        <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                          <strong>Notes:</strong> {appointment.admin_notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}