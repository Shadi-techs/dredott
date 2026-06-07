// ============================================
// Sub-Admin Management Page - Super Admin Only
// Path: src/app/[locale]/admin/settings/admins/page.tsx
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  UserPlus, 
  Edit2, 
  Trash2, 
  Shield, 
  Eye, 
  AlertCircle,
  X,
  Check,
  Crown,
  UserCog
} from 'lucide-react'

interface AdminUser {
  id: string
  username: string
  role: 'super_admin' | 'admin' | 'viewer'
  can_edit_properties: boolean
  can_delete_properties: boolean
  can_approve_listings: boolean
  can_manage_bookings: boolean
  can_view_financials: boolean
  notification_permissions: string[]
  created_at: string
  user_id: string
}

interface NewAdmin {
  username: string
  password: string
  pin: string
  role: 'admin' | 'viewer'
  can_edit_properties: boolean
  can_delete_properties: boolean
  can_approve_listings: boolean
  can_manage_bookings: boolean
  can_view_financials: boolean
  notification_permissions: string[]
}

export default function AdminManagementPage({ params }: { params: { locale: string } }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [newAdmin, setNewAdmin] = useState<NewAdmin>({
    username: '',
    password: '',
    pin: '',
    role: 'admin',
    can_edit_properties: false,
    can_delete_properties: false,
    can_approve_listings: false,
    can_manage_bookings: false,
    can_view_financials: false
  })

  // Check if user is Super Admin
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push(`/${params.locale}/admin/login`)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, id')
        .eq('id', session.user.id)
        .single()

      if (!profile || profile.role !== 'super_admin') {
        router.push(`/${params.locale}/admin`)
        return
      }

      setCurrentUserId(profile.id)
      loadAdmins()
    }

    checkAuth()
  }, [supabase, router, params.locale])

  // Load all admin users
  const loadAdmins = async () => {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError('Failed to load admins')
      setLoading(false)
      return
    }

    setAdmins(data || [])
    setLoading(false)
  }

  // Add new admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate PIN (6 digits)
    if (!/^\d{6}$/.test(newAdmin.pin)) {
      setError('PIN must be exactly 6 digits')
      return
    }

    try {
      // Create profile first
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          email: `${newAdmin.username}@whitestork.admin`, // Fake email for admin
          role: newAdmin.role,
          first_name: newAdmin.username,
          last_name: 'Admin'
        })
        .select()
        .single()

      if (profileError) {
        setError('Failed to create admin profile')
        return
      }

      // Create admin user with hashed password and PIN
      const { error: adminError } = await supabase.rpc('create_admin_user', {
        p_user_id: newProfile.id,
        p_username: newAdmin.username,
        p_password: newAdmin.password,
        p_pin: newAdmin.pin,
        p_role: newAdmin.role,
        p_can_edit_properties: newAdmin.can_edit_properties,
        p_can_delete_properties: newAdmin.can_delete_properties,
        p_can_approve_listings: newAdmin.can_approve_listings,
        p_can_manage_bookings: newAdmin.can_manage_bookings,
        p_can_view_financials: newAdmin.can_view_financials,
        p_created_by: currentUserId
      })

      if (adminError) {
        setError('Failed to create admin user')
        return
      }

      setSuccess('Admin user created successfully!')
      setShowAddModal(false)
      loadAdmins()
      
      // Reset form
      setNewAdmin({
        username: '',
        password: '',
        pin: '',
        role: 'admin',
        can_edit_properties: false,
        can_delete_properties: false,
        can_approve_listings: false,
        can_manage_bookings: false,
        can_view_financials: false,
        notification_permissions: ['new_listing', 'moderation']
      })

    } catch (err) {
      console.error('Error creating admin:', err)
      setError('An error occurred')
    }
  }

  // Delete admin
  const handleDeleteAdmin = async (adminId: string, userId: string) => {
    if (!confirm('Are you sure you want to delete this admin user?')) return

    try {
      // Delete admin_users entry
      const { error: adminError } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId)

      if (adminError) {
        setError('Failed to delete admin')
        return
      }

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        setError('Failed to delete profile')
        return
      }

      setSuccess('Admin deleted successfully')
      loadAdmins()

    } catch (err) {
      console.error('Error deleting admin:', err)
      setError('An error occurred')
    }
  }

  // Update permissions
  const handleUpdatePermissions = async (adminId: string, permissions: Partial<AdminUser>) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update(permissions)
        .eq('id', adminId)

      if (error) {
        setError('Failed to update permissions')
        return
      }

      setSuccess('Permissions updated successfully')
      setShowEditModal(false)
      loadAdmins()

    } catch (err) {
      console.error('Error updating permissions:', err)
      setError('An error occurred')
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#D4A843]/20 text-[#D4A843] text-xs font-medium rounded">
            <Crown className="w-3 h-3" />
            Super Admin
          </span>
        )
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#fbbf24]/20 text-[#fbbf24] text-xs font-medium rounded">
            <UserCog className="w-3 h-3" />
            Admin
          </span>
        )
      case 'viewer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#60a5fa]/20 text-[#60a5fa] text-xs font-medium rounded">
            <Eye className="w-3 h-3" />
            Viewer
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Users
              </h1>
              <p className="text-gray-600">
                Manage administrator accounts and permissions
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Add Admin
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Admin List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{admin.username}</p>
                        {admin.role === 'super_admin' && (
                          <p className="text-xs text-gray-500">You</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(admin.role)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {admin.role === 'super_admin' ? (
                        <span className="text-xs text-gray-500">All permissions</span>
                      ) : admin.role === 'viewer' ? (
                        <span className="text-xs text-gray-500">Read-only</span>
                      ) : (
                        <>
                          {admin.can_edit_properties && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Edit</span>
                          )}
                          {admin.can_delete_properties && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Delete</span>
                          )}
                          {admin.can_approve_listings && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Approve</span>
                          )}
                          {admin.can_manage_bookings && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">Bookings</span>
                          )}
                          {admin.can_view_financials && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Financials</span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {admin.role !== 'super_admin' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedAdmin(admin)
                            setShowEditModal(true)
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit permissions"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id, admin.user_id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete admin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {admins.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No admin users found</p>
            </div>
          )}
        </div>

        {/* Add Admin Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add New Admin</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddAdmin} className="p-6 space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., john_admin"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Minimum 8 characters"
                  />
                </div>

                {/* PIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    6-Digit PIN *
                  </label>
                  <input
                    type="text"
                    value={newAdmin.pin}
                    onChange={(e) => setNewAdmin({ ...newAdmin, pin: e.target.value })}
                    required
                    pattern="\d{6}"
                    maxLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="123456"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={newAdmin.role}
                    onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as 'admin' | 'viewer' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="admin">Admin (with permissions)</option>
                    <option value="viewer">Viewer (read-only)</option>
                  </select>
                </div>

                {/* Permissions (only for admin role) */}
                {newAdmin.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Permissions
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={newAdmin.can_edit_properties}
                          onChange={(e) => setNewAdmin({ ...newAdmin, can_edit_properties: e.target.checked })}
                          className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">Can edit properties</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={newAdmin.can_delete_properties}
                          onChange={(e) => setNewAdmin({ ...newAdmin, can_delete_properties: e.target.checked })}
                          className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">Can delete properties</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={newAdmin.can_approve_listings}
                          onChange={(e) => setNewAdmin({ ...newAdmin, can_approve_listings: e.target.checked })}
                          className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">Can approve listings</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={newAdmin.can_manage_bookings}
                          onChange={(e) => setNewAdmin({ ...newAdmin, can_manage_bookings: e.target.checked })}
                          className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">Can manage bookings</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={newAdmin.can_view_financials}
                          onChange={(e) => setNewAdmin({ ...newAdmin, can_view_financials: e.target.checked })}
                          className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">Can view financials</span>
                      </label>
                    </div>
                  </div>
                )}
                {/* Notification Permissions */}
                {newAdmin.role === "admin" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Notification Access</label>
                    <div className="space-y-2">
                      {[{key:"new_listing",label:"New listings"},{key:"new_user",label:"New users"},{key:"payment",label:"Payments"},{key:"moderation",label:"Moderation"},{key:"system",label:"System"}].map(perm => (
                        <label key={perm.key} className="flex items-center gap-3">
                          <input type="checkbox" checked={(newAdmin.notification_permissions||[]).includes(perm.key)} onChange={(e)=>{const p=newAdmin.notification_permissions||[];setNewAdmin({...newAdmin,notification_permissions:e.target.checked?[...p,perm.key]:p.filter(x=>x!==perm.key)})}} className="w-4 h-4 rounded" />
                          <span className="text-sm text-gray-700">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Create Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Permissions Modal */}
        {showEditModal && selectedAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Permissions: {selectedAdmin.username}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {selectedAdmin.role === 'viewer' ? (
                  <p className="text-sm text-gray-600">
                    Viewers have read-only access and cannot be granted additional permissions.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={selectedAdmin.can_edit_properties}
                        onChange={(e) => {
                          handleUpdatePermissions(selectedAdmin.id, {
                            can_edit_properties: e.target.checked
                          })
                        }}
                        className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">Can edit properties</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={selectedAdmin.can_delete_properties}
                        onChange={(e) => {
                          handleUpdatePermissions(selectedAdmin.id, {
                            can_delete_properties: e.target.checked
                          })
                        }}
                        className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">Can delete properties</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={selectedAdmin.can_approve_listings}
                        onChange={(e) => {
                          handleUpdatePermissions(selectedAdmin.id, {
                            can_approve_listings: e.target.checked
                          })
                        }}
                        className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">Can approve listings</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={selectedAdmin.can_manage_bookings}
                        onChange={(e) => {
                          handleUpdatePermissions(selectedAdmin.id, {
                            can_manage_bookings: e.target.checked
                          })
                        }}
                        className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">Can manage bookings</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={selectedAdmin.can_view_financials}
                        onChange={(e) => {
                          handleUpdatePermissions(selectedAdmin.id, {
                            can_view_financials: e.target.checked
                          })
                        }}
                        className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">Can view financials</span>
                    </label>
                  </div>
                )}

                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-full mt-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}