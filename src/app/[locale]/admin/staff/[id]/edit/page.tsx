// ============================================
// Admin Staff Management - Add/Edit
// Path: src/app/[locale]/admin/staff/new/page.tsx
// Also use for: src/app/[locale]/admin/staff/[id]/page.tsx
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, Upload, X } from 'lucide-react'

export default function AdminStaffFormPage() {
  const router = useRouter()
  const params = useParams()
  const isEdit = !!params?.id
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'individual' | 'company'>('individual')
  
  // Form data
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [idCardUrl, setIdCardUrl] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyRegistration, setCompanyRegistration] = useState('')
  const [companyDocUrl, setCompanyDocUrl] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [active, setActive] = useState(true)

  useEffect(() => {
    if (isEdit) {
      fetchStaff()
    }
  }, [isEdit])

  const fetchStaff = async () => {
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (data) {
      setType(data.type)
      setName(data.name || '')
      setPhone(data.phone || '')
      setEmail(data.email || '')
      setSpecialty(data.specialty || '')
      setIdCardUrl(data.id_card_url || '')
      setCompanyName(data.company_name || '')
      setCompanyRegistration(data.company_registration || '')
      setCompanyDocUrl(data.company_registration_doc_url || '')
      setContactPerson(data.contact_person || '')
      setActive(data.active)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const staffData = {
      type,
      name,
      phone,
      email: email || null,
      specialty: specialty || null,
      id_card_url: type === 'individual' ? idCardUrl || null : null,
      company_name: type === 'company' ? companyName || null : null,
      company_registration: type === 'company' ? companyRegistration || null : null,
      company_registration_doc_url: type === 'company' ? companyDocUrl || null : null,
      contact_person: type === 'company' ? contactPerson || null : null,
      active,
    }

    if (isEdit) {
      await supabase
        .from('staff')
        .update(staffData)
        .eq('id', params.id)
    } else {
      await supabase
        .from('staff')
        .insert([staffData])
    }

    router.push('/en/admin/staff')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'id_card' | 'company_doc') => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `staff/${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      alert('Upload failed')
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    if (field === 'id_card') {
      setIdCardUrl(publicUrl)
    } else {
      setCompanyDocUrl(publicUrl)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Staff
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Staff' : 'Add Staff'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('individual')}
              className={`p-4 rounded-xl border-2 transition-all ${
                type === 'individual'
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-900">Individual</div>
              <div className="text-xs text-gray-600 mt-1">Single staff member</div>
            </button>
            <button
              type="button"
              onClick={() => setType('company')}
              className={`p-4 rounded-xl border-2 transition-all ${
                type === 'company'
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-900">Company</div>
              <div className="text-xs text-gray-600 mt-1">Contractor company</div>
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialty
            </label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select specialty</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
              <option value="security">Security</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">HVAC</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Individual Fields */}
        {type === 'individual' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Card Photo
            </label>
            {idCardUrl ? (
              <div className="relative inline-block">
                <img src={idCardUrl} alt="ID Card" className="w-48 h-32 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => setIdCardUrl('')}
                  className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 w-fit">
                <Upload className="w-4 h-4" />
                Upload ID Card
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'id_card')}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {/* Company Fields */}
        {type === 'company' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={companyRegistration}
                  onChange={(e) => setCompanyRegistration(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Documents
              </label>
              {companyDocUrl ? (
                <div className="flex items-center gap-2">
                  <a
                    href={companyDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:underline"
                  >
                    View Document
                  </a>
                  <button
                    type="button"
                    onClick={() => setCompanyDocUrl('')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 w-fit">
                  <Upload className="w-4 h-4" />
                  Upload Documents
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, 'company_doc')}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </>
        )}

        {/* Active Toggle */}
        <div className="mb-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl transition-colors"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Staff' : 'Add Staff'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}