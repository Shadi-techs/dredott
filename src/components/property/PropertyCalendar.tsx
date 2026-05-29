'use client'
// ============================================
// DredottSTAY — Property Calendar
// Shows availability with 4 color states:
// Available / Manually blocked / Short booking / Long booking
// ============================================

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PropertyCalendarProps {
  propertyId: string
  blockedDates: string[] // format: 'YYYY-MM-DD'
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export default function PropertyCalendar({ propertyId, blockedDates }: PropertyCalendarProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedStart, setSelectedStart] = useState<string | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null)

  const blockedSet = new Set(blockedDates)

  // Get days in month
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const formatDate = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const isBlocked = (dateStr: string) => blockedSet.has(dateStr)
  const isPast = (d: number) => {
    const date = new Date(year, month, d)
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
  }

  const isInRange = (dateStr: string) => {
    if (!selectedStart || !selectedEnd) return false
    return dateStr > selectedStart && dateStr < selectedEnd
  }

  const handleDayClick = (d: number) => {
    const dateStr = formatDate(year, month, d)
    if (isBlocked(dateStr) || isPast(d)) return

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(dateStr)
      setSelectedEnd(null)
    } else {
      if (dateStr > selectedStart) setSelectedEnd(dateStr)
      else { setSelectedStart(dateStr); setSelectedEnd(null) }
    }
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div>
      <span className="section-label mb-4 block">AVAILABILITY</span>

      <div className="bg-white border border-[#D4A843]/30 rounded-xl p-4 max-w-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-[#2C3A6B]">
            {MONTHS[month]} {year}
          </span>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="w-6 h-6 border border-[#D4A843]/40 rounded-md flex items-center justify-center hover:bg-[#FBF0D0] transition-colors"
            >
              <ChevronLeft size={13} className="text-[#2C3A6B]" />
            </button>
            <button
              onClick={nextMonth}
              className="w-6 h-6 border border-[#D4A843]/40 rounded-md flex items-center justify-center hover:bg-[#FBF0D0] transition-colors"
            >
              <ChevronRight size={13} className="text-[#2C3A6B]" />
            </button>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] text-[#A0A8B4] font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1
            const dateStr = formatDate(year, month, d)
            const blocked = isBlocked(dateStr)
            const past = isPast(d)
            const isStart = dateStr === selectedStart
            const isEnd = dateStr === selectedEnd
            const inRange = isInRange(dateStr)

            let className = 'w-full aspect-square flex items-center justify-center text-[11px] rounded-md transition-colors '

            if (past) {
              className += 'text-[#D3D1C7] cursor-not-allowed'
            } else if (blocked) {
              className += 'bg-[#FCEBEB] text-[#A32D2D] cursor-not-allowed line-through'
            } else if (isStart || isEnd) {
              className += 'bg-[#2C3A6B] text-[#D4A843] font-medium cursor-pointer'
            } else if (inRange) {
              className += 'bg-[#FBF0D0] text-[#8B6914] cursor-pointer'
            } else {
              className += 'text-[#2C3A6B] hover:bg-[#FBF0D0] cursor-pointer'
            }

            return (
              <div
                key={d}
                className={className}
                onClick={() => !past && !blocked && handleDayClick(d)}
              >
                {d}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-3 flex-wrap">
          {[
            { color: '#FCEBEB', label: 'Booked' },
            { color: '#2C3A6B', label: 'Selected', textColor: '#D4A843' },
            { color: '#FBF0D0', label: 'Your stay' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm border border-[#D4A843]/20"
                style={{ background: l.color }}
              />
              <span className="text-[10px] text-[#A0A8B4]">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Selected range info */}
        {selectedStart && (
          <div className="mt-3 pt-3 border-t border-[#D4A843]/20 text-xs text-[#2C3A6B]">
            {selectedEnd
              ? `${selectedStart} → ${selectedEnd}`
              : `Check-in: ${selectedStart} — Select check-out`}
          </div>
        )}
      </div>
    </div>
  )
}
