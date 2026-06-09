'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, CheckCircle, AlertCircle, Info, XCircle,
  Clock, RotateCcw, Trash2, ArrowRight
} from 'lucide-react'
import { toast } from '@/components/owner/Toast'

const supabase_client = async () => {
  const { createClient } = await import('@/lib/supabase/client')
  return createClient()
}

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  read: boolean
  metadata: any
  created_at: string
  entity_type?: string
  entity_id?: string
  action?: string
  link?: string
}

const NOTIFICATION_CONFIG: Record<string, { 
  icon: any
  bgColor: string
  textColor: string
  borderColor: string
  actionLabel?: string
  actionColor?: string
}> = {
  property_approved: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  property_rejected: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  property_changes_requested: {
    icon: AlertCircle,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    actionLabel: 'Resubmit',
    actionColor: 'bg-blue-600 hover:bg-blue-700',
  },
  car_approved: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  car_rejected: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  car_changes_requested: {
    icon: AlertCircle,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    actionLabel: 'Resubmit',
    actionColor: 'bg-blue-600 hover:bg-blue-700',
  },
  listing_resubmitted: {
    icon: RotateCcw,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  owner_approved: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  owner_rejected: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  subscription_updated: {
    icon: Info,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/owner/notifications')
      const data = await response.json()
      setNotifications(data || [])
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error)
      toast.error(error?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch('/api/owner/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
      if (!res.ok) throw new Error('Request failed')
      setNotifications((prev) =>
        prev.map((n) => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error: any) {
      console.error('Failed to mark as read:', error)
      toast.error('Could not mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/owner/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      })
      if (!res.ok) throw new Error('Request failed')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (error: any) {
      console.error('Failed to mark all as read:', error)
      toast.error('Could not mark all as read')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    setDeletingId(notificationId)
    try {
      const res = await fetch(`/api/owner/notifications/${notificationId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error: any) {
      console.error('Failed to delete notification:', error)
      toast.error('Could not delete notification')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.read : true
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationConfig = (type: string) => {
    return NOTIFICATION_CONFIG[type] || {
      icon: Info,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
    }
  }

  const handleActionClick = (notification: Notification) => {
    // Mark as read when clicking action
    if (!notification.read) {
      markAsRead(notification.id)
    }

    // Navigate to resubmit page if needed
    if (notification.metadata?.allowResubmission) {
      router.push(`/en/owner/listings/${notification.entity_id}/resubmit`)
    } else if (notification.link) {
      router.push(notification.link)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 
                  className="text-2xl font-bold text-[#2C3A6B]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Notifications
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Stay updated on your listings
                </p>
              </div>
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-[#2C3A6B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'unread'
                  ? 'bg-[#2C3A6B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C3A6B]" />
            <p className="mt-4 text-gray-600 text-sm">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'No unread notifications'
                : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const config = getNotificationConfig(notification.type)
              const Icon = config.icon
              const isUnread = !notification.read
              const canResubmit = notification.metadata?.allowResubmission
              const hasAction = canResubmit || notification.link

              return (
                <div
                  key={notification.id}
                  className={`border-l-4 rounded-xl overflow-hidden transition-all ${
                    config.bgColor
                  } ${config.borderColor} ${
                    isUnread
                      ? 'border-l-blue-600 shadow-md'
                      : 'border-l-gray-300'
                  } cursor-pointer hover:shadow-md`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="p-4 flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className={`w-6 h-6 ${config.textColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <h3 className={`font-semibold ${config.textColor}`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm mt-1 ${config.textColor} opacity-90`}>
                        {notification.message}
                      </p>

                      {/* Metadata Display */}
                      {notification.metadata && (
                        <div className={`text-xs mt-2 ${config.textColor} opacity-75 space-y-1`}>
                          {notification.metadata.entityType && (
                            <p>
                              {notification.metadata.entityType === 'property'
                                ? '🏠 Property'
                                : notification.metadata.entityType === 'car'
                                ? '🚗 Car'
                                : '👤 Account'}
                            </p>
                          )}
                          {notification.metadata.reason && (
                            <p className="font-medium">Reason: {notification.metadata.reason}</p>
                          )}
                          {notification.metadata.action && (
                            <p>Action: {notification.metadata.action}</p>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <p className={`text-xs ${config.textColor} opacity-60 mt-2`}>
                        {new Date(notification.created_at).toLocaleDateString()}{' '}
                        at{' '}
                        {new Date(notification.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Main Action Button */}
                      {canResubmit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleActionClick(notification)
                          }}
                          className={`flex items-center gap-1.5 px-3 py-2 text-white text-xs font-semibold rounded-lg transition-colors ${config.actionColor}`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Resubmit
                        </button>
                      )}

                      {hasAction && !canResubmit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleActionClick(notification)
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#2C3A6B] hover:bg-[#243058] text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          View
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Unread Indicator */}
                      {isUnread && (
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0" />
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        disabled={deletingId === notification.id}
                        className="flex items-center gap-1 px-2 py-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete notification"
                      >
                        {deletingId === notification.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}