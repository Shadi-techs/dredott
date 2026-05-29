'use client'
// ============================================
// DredottSTAY — Admin Guest CRM Client
// Full guest profile with booking history
// ============================================

import { useState } from 'react'
import { MessageCircle, FileText, Shield, Star, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const COUNTRY_FLAGS: Record<string, string> = {
  IT: '🇮🇹', RU: '🇷🇺', DE: '🇩🇪', UA: '🇺🇦', EG: '🇪🇬', GB: '🇬🇧',
}
const AVATAR_COLORS = ['#2A9D8F', '#2C3A6B', '#B8860B', '#8B6914']

interface AdminGuestClientProps {
  guest: any
  bookings: any[]
  reviews: any[]
  totalSpent: number
  isSuperAdmin: boolean
  whatsappNumber: string
}

export default function AdminGuestClient({
  guest, bookings, reviews, totalSpent, isSuperAdmin, whatsappNumber
}: AdminGuestClientProps) {
  const supabase = createClient()
  const [notes, setNotes] = useState(guest.internal_notes || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const avatarColor = AVATAR_COLORS[0]
  const flag = guest.nationality ? COUNTRY_FLAGS[guest.nationality] || '' : ''

  const saveNotes = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ internal_notes: notes }).eq('id', guest.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-5">
      {/* Back */}
      <Link href="/admin/guests" className="flex items-center gap-1.5 text-xs text-[#A0A8B4] hover:text-[#2C3A6B] mb-4 transition-colors">
        <ChevronLeft size={14} /> Back to guests
      </Link>

      {/* Guest header */}
      <div className="bg-white border border-[#D4A843]/30 rounded-xl p-5 mb-4">
        <div className="flex flex-wrap gap-4 items-start">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-medium text-[#FFF8DC] relative"
              style={{ backgroundColor: avatarColor }}>
              {guest.avatar_url
                ? <img src={guest.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                : (guest.first_name?.[0] || '?')}
              {flag && <span className="absolute bottom-0 right-0 text-lg">{flag}</span>}
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-[#2C3A6B]">{bookings.length}</div>
              <div className="text-[10px] text-[#A0A8B4]">stays</div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-[200px]">
            <h2 className="text-xl font-medium text-[#2C3A6B] mb-1">
              {guest.first_name} {guest.last_name}
            </h2>
            <div className="flex flex-wrap gap-3 text-xs text-[#A0A8B4] mb-3">
              {guest.email && <span>{guest.email}</span>}
              {guest.whatsapp && <span>{guest.whatsapp}</span>}
              {guest.city && <span>📍 {guest.city}</span>}
              <span>Member since {new Date(guest.created_at).toLocaleDateString()}</span>
            </div>
            {/* Tags */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-[10px] bg-[#E1F5EE] text-[#0F6E56] px-2 py-0.5 rounded-full">Guest</span>
              {bookings.length > 1 && <span className="text-[10px] bg-[#EEEDFE] text-[#3C3489] px-2 py-0.5 rounded-full">Returning</span>}
              {totalSpent > 500 && <span className="text-[10px] bg-[#FBF0D0] text-[#8B6914] px-2 py-0.5 rounded-full">VIP</span>}
            </div>
          </div>

          {/* Stats */}
          {isSuperAdmin && (
            <div className="text-right">
              <div className="text-2xl font-medium text-[#B8860B]">${totalSpent.toFixed(0)}</div>
              <div className="text-xs text-[#A0A8B4]">total spent</div>
            </div>
          )}

          {/* WhatsApp */}
          {guest.whatsapp && (
            <a
              href={`https://wa.me/${guest.whatsapp.replace(/\D/g, '')}?text=Hi ${guest.first_name}, this is Shady from DredottStay.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-teal flex items-center gap-1.5 text-sm self-start"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Personal details */}
          <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D4A843]/20">
              <span className="text-sm font-medium text-[#2C3A6B]">Personal details</span>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#A0A8B4]">Nationality</span>
                <span className="text-[#2C3A6B]">{guest.nationality || '—'} {flag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A0A8B4]">Language</span>
                <span className="text-[#2C3A6B] uppercase">{guest.language_preference || 'en'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A0A8B4]">Travel style</span>
                <span className="text-[#2C3A6B]">{guest.travel_style?.join(', ') || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A0A8B4]">Interests</span>
                <span className="text-[#2C3A6B] text-right max-w-[160px]">{guest.interests?.join(', ') || '—'}</span>
              </div>
              {isSuperAdmin && guest.date_of_birth && (
                <div className="flex justify-between">
                  <span className="text-[#A0A8B4]">Date of birth</span>
                  <span className="text-[#2C3A6B]">{guest.date_of_birth}</span>
                </div>
              )}
            </div>
          </div>

          {/* Passport — super admin only */}
          {isSuperAdmin && (
            <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#D4A843]/20 flex items-center gap-2">
                <Shield size={14} className="text-[#B8860B]" />
                <span className="text-sm font-medium text-[#2C3A6B]">Passport / ID</span>
              </div>
              <div className="p-4">
                {guest.passport_url ? (
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-[#B8860B]" />
                    <div>
                      <div className="text-sm font-medium text-[#2C3A6B]">Passport uploaded</div>
                      <div className="text-xs text-[#A0A8B4]">Nationality: {guest.nationality}</div>
                    </div>
                    <a href={guest.passport_url} target="_blank" rel="noopener noreferrer"
                      className="ml-auto btn-primary text-xs py-1.5 px-3">
                      View
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-[#A0A8B4]">No passport uploaded yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Birthday automation */}
          {guest.date_of_birth && (
            <div className="bg-[#2C3A6B] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎂</span>
                <div className="text-sm font-medium text-[#FBF0D0]">
                  Birthday — {new Date(guest.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div className="text-xs text-[#A0A8B4]">WhatsApp auto-message scheduled</div>
              <div className="text-xs text-[#D4A843] font-medium mt-1">✓ Active</div>
            </div>
          )}

          {/* Internal notes */}
          <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D4A843]/20">
              <span className="text-sm font-medium text-[#2C3A6B]">Internal notes</span>
            </div>
            <div className="p-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes visible only to admin team..."
                className="w-full h-24 text-xs text-[#2C3A6B] border border-[#D4A843]/40 rounded-lg p-2.5 resize-none outline-none focus:border-[#B8860B] transition-colors bg-[#FAF9F6]"
              />
              <button
                onClick={saveNotes}
                disabled={saving}
                className="mt-2 btn-primary text-xs py-1.5 w-full"
              >
                {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save notes'}
              </button>
            </div>
          </div>

          {/* Security record */}
          <div className="bg-[#FCEBEB] border border-[#E24B4A]/30 rounded-xl p-3">
            <p className="text-[10px] text-[#A32D2D] leading-relaxed">
              <strong>Security record:</strong> Even if deleted, minimal booking IDs are retained for legal purposes per GDPR. Personal data removed within 30 days.
            </p>
          </div>
        </div>

        {/* Right — booking history */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Booking history */}
          <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D4A843]/20">
              <span className="text-sm font-medium text-[#2C3A6B]">Booking history ({bookings.length})</span>
            </div>
            <div className="divide-y divide-[#D4A843]/10">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3 text-sm flex-wrap">
                  <div className="flex-1 min-w-[150px]">
                    <div className="font-medium text-[#2C3A6B]">{b.properties?.name || 'Unknown property'}</div>
                    <div className="text-xs text-[#A0A8B4] mt-0.5">
                      {b.check_in} → {b.check_out} · {b.nights} nights
                    </div>
                  </div>
                  {isSuperAdmin && (
                    <span className="text-[#B8860B] font-medium">${b.total_amount?.toFixed(0)}</span>
                  )}
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    b.status === 'completed' ? 'bg-[#E1F5EE] text-[#0F6E56]' :
                    b.status === 'confirmed' ? 'bg-[#E8ECF8] text-[#2C3A6B]' :
                    b.status === 'cancelled' ? 'bg-[#FCEBEB] text-[#A32D2D]' :
                    'bg-[#FBF0D0] text-[#8B6914]'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-[#A0A8B4]">No bookings yet</div>
              )}
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#D4A843]/20 flex items-center gap-2">
                <Star size={14} className="text-[#B8860B]" />
                <span className="text-sm font-medium text-[#2C3A6B]">Reviews written ({reviews.length})</span>
              </div>
              <div className="divide-y divide-[#D4A843]/10">
                {reviews.map((r) => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[#2C3A6B]">{r.properties?.name}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={10} className="fill-[#B8860B] text-[#B8860B]" />
                        ))}
                        <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                          r.status === 'approved' ? 'bg-[#E1F5EE] text-[#0F6E56]' :
                          r.status === 'pending' ? 'bg-[#FBF0D0] text-[#8B6914]' :
                          'bg-[#FCEBEB] text-[#A32D2D]'
                        }`}>{r.status}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#555]">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
