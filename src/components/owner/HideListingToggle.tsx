// ============================================
// Hide Listing Toggle Component
// Path: src/components/owner/HideListingToggle.tsx
// Reusable for Properties & Cars
// ============================================

'use client'

import { useState } from 'react'
import { EyeOff, Eye, AlertCircle, Loader2 } from 'lucide-react'

interface HideListingToggleProps {
  isHidden: boolean
  onToggle: (hidden: boolean) => Promise<void>
  itemType: 'property' | 'car'
  itemName: string
}

export default function HideListingToggle({
  isHidden,
  onToggle,
  itemType,
  itemName
}: HideListingToggleProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingState, setPendingState] = useState<boolean | null>(null)

  const handleToggleClick = (newState: boolean) => {
    setPendingState(newState)
    setShowConfirmation(true)
  }

  const handleConfirm = async () => {
    if (pendingState === null) return

    setLoading(true)
    try {
      await onToggle(pendingState)
      setShowConfirmation(false)
      setPendingState(null)
    } catch (error) {
      console.error('Failed to toggle listing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    setPendingState(null)
  }

  return (
    <>
      {/* Toggle Card */}
      <div className={`bg-white rounded-lg border-2 p-6 transition-all ${
        isHidden ? 'border-yellow-400' : 'border-gray-200'
      }`}>
        <div className="flex items-start justify-between gap-4">
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {isHidden ? (
                <EyeOff className="w-5 h-5 text-yellow-600" />
              ) : (
                <Eye className="w-5 h-5 text-[#2A9D8F]" />
              )}
              <h3 className="text-lg font-semibold text-[#2C3A6B]">
                Listing Visibility
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              {isHidden ? (
                <>
                  <span className="font-semibold text-yellow-700">Currently Hidden:</span> Your {itemType} is not visible in search results.
                  Only you and admins can see it.
                </>
              ) : (
                <>
                  <span className="font-semibold text-green-700">Currently Visible:</span> Your {itemType} appears in public search results.
                </>
              )}
            </p>

            {/* Status Badge */}
            {isHidden && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full text-xs font-semibold text-yellow-800">
                <EyeOff className="w-3 h-3" />
                HIDDEN FROM PUBLIC
              </div>
            )}
          </div>

          {/* Toggle Switch */}
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => handleToggleClick(!isHidden)}
              disabled={loading}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 disabled:opacity-50 ${
                isHidden ? 'bg-yellow-500' : 'bg-[#2A9D8F]'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  isHidden ? 'translate-x-0' : 'translate-x-8'
                }`}
              />
            </button>
            
            <span className="text-xs font-medium text-gray-600">
              {isHidden ? 'Hidden' : 'Visible'}
            </span>
          </div>
        </div>

        {/* Warning for Hidden */}
        {isHidden && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-800">
              <strong>Note:</strong> Hidden listings don't appear in search results and won't receive inquiries.
              Unhide to start getting visibility again.
            </div>
          </div>
        )}

        {/* Use Cases */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">When to hide:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Fully booked for the season</li>
            <li>• Undergoing major renovations</li>
            <li>• Temporarily unavailable (personal use)</li>
            <li>• Updating photos/pricing</li>
          </ul>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                pendingState ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                {pendingState ? (
                  <EyeOff className="w-6 h-6 text-yellow-600" />
                ) : (
                  <Eye className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2C3A6B] mb-1">
                  {pendingState ? 'Hide Listing?' : 'Show Listing?'}
                </h3>
                <p className="text-sm text-gray-600">
                  {pendingState ? (
                    <>
                      Are you sure you want to hide <strong>{itemName}</strong>? 
                      It will be removed from public search results.
                    </>
                  ) : (
                    <>
                      Are you sure you want to show <strong>{itemName}</strong>? 
                      It will appear in public search results.
                    </>
                  )}
                </p>
              </div>
            </div>

            {pendingState && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <strong>Important:</strong> While hidden, you won't receive any inquiries or bookings.
                    You can unhide it anytime.
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  pendingState
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-[#2A9D8F] hover:bg-[#2C3A6B] text-white'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>Confirm</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}