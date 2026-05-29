'use client'
// ============================================
// DredottSTAY — Social Proof Notifications
// Shows real registrations and bookings
// Only shows REAL data from Supabase
// ============================================

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  name: string
  action: string
  country?: string
  flag?: string
  color: string
}

const COUNTRY_FLAGS: Record<string, string> = {
  IT: '🇮🇹',
  RU: '🇷🇺',
  DE: '🇩🇪',
  UA: '🇺🇦',
  EG: '🇪🇬',
  FR: '🇫🇷',
  GB: '🇬🇧',
}

const AVATAR_COLORS = [
  '#2A9D8F', '#2C3A6B', '#B8860B', '#8B6914', '#0F6E56'
]

export default function SocialProofNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to real-time new profiles (registrations)
    const profilesChannel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload: any) => {
          const profile = payload.new
          if (!profile.first_name) return // Skip incomplete profiles

          const flag = profile.nationality ? COUNTRY_FLAGS[profile.nationality] : ''
          const notif: Notification = {
            id: profile.id,
            name: profile.first_name,
            action: `just registered${flag ? ` from ${profile.nationality} ${flag}` : ''}`,
            color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
          }
          showNotification(notif)
        }
      )
      .subscribe()

    // Subscribe to real-time confirmed bookings
    const bookingsChannel = supabase
      .channel('public:bookings')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings' },
        async (payload: any) => {
          const booking = payload.new
          // Only show when booking becomes confirmed + paid
          if (booking.status !== 'confirmed' || booking.payment_status !== 'paid') return

          // Get guest first name
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, nationality')
            .eq('id', booking.guest_id)
            .single()

          if (!profile?.first_name) return

          // Get property name
          const { data: property } = await supabase
            .from('properties')
            .select('name')
            .eq('id', booking.property_id)
            .single()

          const notif: Notification = {
            id: booking.id,
            name: profile.first_name,
            action: `booked${property ? ` ${property.name}` : ' a property'}`,
            color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
          }
          showNotification(notif)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profilesChannel)
      supabase.removeChannel(bookingsChannel)
    }
  }, [supabase])

  const showNotification = (notif: Notification) => {
    setNotifications((prev) => [...prev, notif])
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
    }, 5000)
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="bg-[#2C3A6B] border border-[#D4A843]/40 rounded-xl px-4 py-3 flex items-center gap-3 min-w-[220px] shadow-lg animate-slide-in"
          style={{ animation: 'slideIn 0.3s ease' }}
        >
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-[#FFF8DC] flex-shrink-0"
            style={{ backgroundColor: notif.color }}
          >
            {notif.name[0]}
          </div>
          {/* Text */}
          <div className="text-xs text-[#E8ECF8] flex-1 leading-tight">
            <span className="text-[#D4A843] font-medium">{notif.name}</span>{' '}
            {notif.action}
          </div>
          <div className="text-[10px] text-[#A0A8B4] whitespace-nowrap">just now</div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
