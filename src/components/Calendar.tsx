// ============================================
// Calendar Component - Block/Unblock Dates
// Path: src/components/Calendar.tsx
// Reusable for Properties & Cars
// ============================================

'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface BlockedDate {
  start: string
  end: string
  reason?: string
}

interface CalendarProps {
  blockedDates: BlockedDate[]
  onDatesChange: (dates: BlockedDate[]) => void
  minDate?: Date
}

export default function Calendar({ blockedDates, onDatesChange, minDate = new Date() }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectingRange, setSelectingRange] = useState(false)
  const [rangeStart, setRangeStart] = useState<Date | null>(null)
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null)
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [reason, setReason] = useState('')

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
    
    return blockedDates.some(blocked => {
      const start = new Date(blocked.start)
      const end = new Date(blocked.end)
      return date >= start && date <= end
    })
  }

  // Check if date is in current selection range
  const isDateInRange = (date: Date): boolean => {
    if (!rangeStart || !rangeEnd) return false
    return date >= rangeStart && date <= rangeEnd
  }

  // Handle date click
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    
    // Check if date is in the past
    if (clickedDate < minDate) return

    // If date is already blocked, unblock it
    if (isDateBlocked(clickedDate)) {
      const newBlockedDates = blockedDates.filter(blocked => {
        const start = new Date(blocked.start)
        const end = new Date(blocked.end)
        return !(clickedDate >= start && clickedDate <= end)
      })
      onDatesChange(newBlockedDates)
      return
    }

    // Start range selection
    if (!selectingRange) {
      setSelectingRange(true)
      setRangeStart(clickedDate)
      setRangeEnd(clickedDate)
    } else {
      // End range selection
      if (rangeStart && clickedDate >= rangeStart) {
        setRangeEnd(clickedDate)
        setShowReasonModal(true)
      } else {
        // Reset if clicked before start
        setRangeStart(clickedDate)
        setRangeEnd(clickedDate)
      }
    }
  }

  // Save blocked range
  const saveBlockedRange = () => {
    if (rangeStart && rangeEnd) {
      const newBlockedDate: BlockedDate = {
        start: rangeStart.toISOString().split('T')[0],
        end: rangeEnd.toISOString().split('T')[0],
        reason: reason || 'Unavailable'
      }

      onDatesChange([...blockedDates, newBlockedDate])
      
      // Reset
      setSelectingRange(false)
      setRangeStart(null)
      setRangeEnd(null)
      setShowReasonModal(false)
      setReason('')
    }
  }

  // Cancel range selection
  const cancelRangeSelection = () => {
    setSelectingRange(false)
    setRangeStart(null)
    setRangeEnd(null)
    setShowReasonModal(false)
    setReason('')
  }

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Format month/year
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <h3 
          className="text-xl font-semibold text-[#2C3A6B]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {monthYear}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        {selectingRange ? (
          <span>📅 Click the end date to complete your selection</span>
        ) : (
          <span>📅 Click to start selecting dates to block. Click blocked dates to unblock.</span>
        )}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          const isBlocked = isDateBlocked(date)
          const isInRange = isDateInRange(date)
          const isPast = date < minDate
          const isToday = date.toDateString() === new Date().toDateString()

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={isPast}
              className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                isPast
                  ? 'text-gray-300 cursor-not-allowed'
                  : isBlocked
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : isInRange
                  ? 'bg-blue-200 text-blue-900'
                  : isToday
                  ? 'bg-[#D4A843] text-white hover:bg-[#B8860B]'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-gray-600">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 rounded" />
          <span className="text-gray-600">Selecting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#D4A843] rounded" />
          <span className="text-gray-600">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded" />
          <span className="text-gray-600">Available</span>
        </div>
      </div>

      {/* Blocked Dates List */}
      {blockedDates.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-[#2C3A6B] mb-3">Blocked Periods:</h4>
          <div className="space-y-2">
            {blockedDates.map((blocked, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-800">
                    {new Date(blocked.start).toLocaleDateString()} - {new Date(blocked.end).toLocaleDateString()}
                  </div>
                  {blocked.reason && (
                    <div className="text-xs text-red-600 mt-1">{blocked.reason}</div>
                  )}
                </div>
                <button
                  onClick={() => {
                    const newBlockedDates = blockedDates.filter((_, i) => i !== index)
                    onDatesChange(newBlockedDates)
                  }}
                  className="p-1 hover:bg-red-200 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-[#2C3A6B] mb-4">
              Add Reason (Optional)
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are these dates unavailable?
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Fully booked, Maintenance, Personal use"
                className="w-full px-4 py-3 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelRangeSelection}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveBlockedRange}
                className="flex-1 px-4 py-3 bg-[#2C3A6B] hover:bg-[#2A9D8F] text-[#D4A843] rounded-lg font-semibold transition-colors"
              >
                Block Dates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}