// ============================================
// Booking Calendar Component — DREDOTT
// Path: src/components/BookingCalendar.tsx
// Date picker with blocked dates for bookings
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

interface BlockedDateRange {
  start: string
  end: string
  reason?: string
}

interface BookingCalendarProps {
  blockedDates: BlockedDateRange[]
  onDatesChange: (checkIn: Date | null, checkOut: Date | null) => void
  minNights?: number
  locale?: string
}

export default function BookingCalendar({ 
  blockedDates, 
  onDatesChange, 
  minNights = 1,
  locale = 'en'
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  const isRtl = locale === 'ar'

  useEffect(() => {
    onDatesChange(checkIn, checkOut)
  }, [checkIn, checkOut])

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)

  // Check if date is blocked
  const isDateBlocked = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0]
    
    return blockedDates.some(range => {
      const start = new Date(range.start)
      const end = new Date(range.end)
      return date >= start && date <= end
    })
  }

  // Check if date is in the past
  const isPast = (date: Date): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Check if date is in selected range
  const isInRange = (date: Date): boolean => {
    if (!checkIn) return false
    
    const compareDate = checkOut || hoveredDate
    if (!compareDate) return false
    
    return date > checkIn && date < compareDate
  }

  // Check if date is selectable
  const isSelectable = (date: Date): boolean => {
    return !isPast(date) && !isDateBlocked(date)
  }

  // Handle date click
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    
    if (!isSelectable(clickedDate)) return

    if (!checkIn) {
      // First click: set check-in
      setCheckIn(clickedDate)
      setCheckOut(null)
    } else if (!checkOut) {
      // Second click: set check-out
      if (clickedDate <= checkIn) {
        // Reset if clicked before check-in
        setCheckIn(clickedDate)
        setCheckOut(null)
      } else {
        // Check if any date in range is blocked
        const hasBlockedInRange = blockedDates.some(range => {
          const rangeStart = new Date(range.start)
          const rangeEnd = new Date(range.end)
          return (
            (rangeStart > checkIn && rangeStart < clickedDate) ||
            (rangeEnd > checkIn && rangeEnd < clickedDate)
          )
        })

        if (hasBlockedInRange) {
          // Reset if blocked dates in range
          setCheckIn(clickedDate)
          setCheckOut(null)
        } else {
          setCheckOut(clickedDate)
        }
      }
    } else {
      // Third click: reset
      setCheckIn(clickedDate)
      setCheckOut(null)
    }
  }

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Format month/year
  const monthYear = currentMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' })

  // Day headers
  const dayHeaders = isRtl
    ? ['السبت', 'الجمعة', 'الخميس', 'الأربعاء', 'الثلاثاء', 'الاثنين', 'الأحد']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-white rounded-xl border border-[var(--line)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-[var(--cream)] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[var(--navy)]" />
        </button>
        
        <h3 
          className="text-xl font-semibold text-[var(--navy)]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {monthYear}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-[var(--cream)] rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-[var(--navy)]" />
        </button>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        {!checkIn && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>{isRtl ? 'اختر تاريخ الوصول' : 'Select check-in date'}</span>
          </div>
        )}
        {checkIn && !checkOut && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>{isRtl ? 'اختر تاريخ المغادرة' : 'Select check-out date'}</span>
          </div>
        )}
        {checkIn && checkOut && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>
              {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} {isRtl ? 'ليالي' : 'nights'}
            </span>
          </div>
        )}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayHeaders.map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          const isBlocked = isDateBlocked(date)
          const isPastDate = isPast(date)
          const isCheckInDate = checkIn?.toDateString() === date.toDateString()
          const isCheckOutDate = checkOut?.toDateString() === date.toDateString()
          const isInSelectedRange = isInRange(date)
          const isToday = date.toDateString() === new Date().toDateString()

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
              disabled={!isSelectable(date)}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all relative
                ${isPastDate || isBlocked
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                  : isCheckInDate || isCheckOutDate
                  ? 'bg-[var(--navy)] text-[var(--gold)]'
                  : isInSelectedRange
                  ? 'bg-[var(--gold-soft)] text-[var(--navy)]'
                  : isToday
                  ? 'border-2 border-[var(--gold)] text-[var(--navy)]'
                  : 'hover:bg-[var(--cream)] text-gray-700'
                }
              `}
            >
              {day}
              {isBlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0.5 h-full bg-red-300 rotate-45"></div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--navy)] rounded"></div>
          <span className="text-gray-600">{isRtl ? 'محدد' : 'Selected'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--gold-soft)] rounded"></div>
          <span className="text-gray-600">{isRtl ? 'الفترة' : 'Range'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 rounded relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-0.5 h-full bg-red-300 rotate-45"></div>
            </div>
          </div>
          <span className="text-gray-600">{isRtl ? 'محجوز' : 'Blocked'}</span>
        </div>
      </div>
    </div>
  )
}