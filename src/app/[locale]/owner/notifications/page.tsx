'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Bell, CheckCircle, AlertCircle, Info, XCircle,
  RotateCcw, Trash2, ArrowRight, BellOff, Check
} from 'lucide-react'
import { toast } from '@/components/owner/Toast'
import { useOwnerTheme } from '@/components/owner/ThemeProvider'

// ── Translations ────────────────────────────────────────────────────────────
const NTX: Record<string, {
  title: string; subtitle: string; markAllRead: string
  all: string; unread: string; newBadge: string
  loading: string; noUnread: string; noNotifs: string
  reason: string; action: string; at: string
  resubmit: string; view: string; deleteTitle: string
  property: string; car: string; account: string
  markedRead: string; allMarkedRead: string; deleted: string
  errorLoad: string; errorRead: string; errorDelete: string
  types: Record<string, string>
}> = {
  en: {
    title: 'Notifications', subtitle: 'Stay updated on your listings',
    markAllRead: 'Mark all as read',
    all: 'All', unread: 'Unread', newBadge: 'new',
    loading: 'Loading notifications…', noUnread: 'No unread notifications',
    noNotifs: 'No notifications yet', reason: 'Reason',
    action: 'Action', at: 'at',
    resubmit: 'Resubmit', view: 'View', deleteTitle: 'Delete',
    property: '🏠 Property', car: '🚗 Car', account: '👤 Account',
    markedRead: 'Marked as read', allMarkedRead: 'All notifications marked as read',
    deleted: 'Notification deleted', errorLoad: 'Failed to load notifications',
    errorRead: 'Could not mark as read', errorDelete: 'Could not delete',
    types: {
      property_approved: '✅ Your property was approved',
      property_rejected: '❌ Your property was rejected',
      property_changes_requested: '🔄 Changes requested for your property',
      car_approved: '✅ Your car was approved',
      car_rejected: '❌ Your car was rejected',
      car_changes_requested: '🔄 Changes requested for your car',
      listing_resubmitted: '📤 Listing resubmitted for review',
      owner_approved: '✅ Your account was approved',
      owner_rejected: '❌ Your account was rejected',
      subscription_updated: 'ℹ️ Your subscription was updated',
    }
  },
  ar: {
    title: 'الإشعارات', subtitle: 'ابق على اطلاع بآخر تحديثات إعلاناتك',
    markAllRead: 'تعيين الكل كمقروء',
    all: 'الكل', unread: 'غير مقروء', newBadge: 'جديد',
    loading: 'جاري تحميل الإشعارات…', noUnread: 'لا توجد إشعارات غير مقروءة',
    noNotifs: 'لا توجد إشعارات بعد', reason: 'السبب',
    action: 'الإجراء', at: 'الساعة',
    resubmit: 'إعادة الإرسال', view: 'عرض', deleteTitle: 'حذف',
    property: '🏠 عقار', car: '🚗 سيارة', account: '👤 حساب',
    markedRead: 'تم التعيين كمقروء', allMarkedRead: 'تم تعيين جميع الإشعارات كمقروءة',
    deleted: 'تم حذف الإشعار', errorLoad: 'فشل تحميل الإشعارات',
    errorRead: 'تعذّر التعيين كمقروء', errorDelete: 'تعذّر الحذف',
    types: {
      property_approved: '✅ تم اعتماد عقارك',
      property_rejected: '❌ تم رفض عقارك',
      property_changes_requested: '🔄 طُلبت تعديلات على عقارك',
      car_approved: '✅ تم اعتماد سيارتك',
      car_rejected: '❌ تم رفض سيارتك',
      car_changes_requested: '🔄 طُلبت تعديلات على سيارتك',
      listing_resubmitted: '📤 أُعيد إرسال الإعلان للمراجعة',
      owner_approved: '✅ تم اعتماد حسابك',
      owner_rejected: '❌ تم رفض حسابك',
      subscription_updated: 'ℹ️ تم تحديث اشتراكك',
    }
  },
  ru: {
    title: 'Уведомления', subtitle: 'Следите за обновлениями ваших объявлений',
    markAllRead: 'Отметить всё как прочитанное',
    all: 'Все', unread: 'Непрочитанные', newBadge: 'новых',
    loading: 'Загрузка уведомлений…', noUnread: 'Нет непрочитанных уведомлений',
    noNotifs: 'Уведомлений пока нет', reason: 'Причина',
    action: 'Действие', at: 'в',
    resubmit: 'Переотправить', view: 'Открыть', deleteTitle: 'Удалить',
    property: '🏠 Объект', car: '🚗 Авто', account: '👤 Аккаунт',
    markedRead: 'Отмечено как прочитанное', allMarkedRead: 'Все уведомления отмечены как прочитанные',
    deleted: 'Уведомление удалено', errorLoad: 'Не удалось загрузить уведомления',
    errorRead: 'Не удалось отметить как прочитанное', errorDelete: 'Не удалось удалить',
    types: {
      property_approved: '✅ Ваш объект одобрен',
      property_rejected: '❌ Ваш объект отклонён',
      property_changes_requested: '🔄 Запрошены изменения для вашего объекта',
      car_approved: '✅ Ваш автомобиль одобрен',
      car_rejected: '❌ Ваш автомобиль отклонён',
      car_changes_requested: '🔄 Запрошены изменения для вашего автомобиля',
      listing_resubmitted: '📤 Объявление повторно отправлено на проверку',
      owner_approved: '✅ Ваш аккаунт одобрен',
      owner_rejected: '❌ Ваш аккаунт отклонён',
      subscription_updated: 'ℹ️ Ваша подписка обновлена',
    }
  },
  uk: {
    title: 'Сповіщення', subtitle: 'Стежте за оновленнями ваших оголошень',
    markAllRead: 'Позначити всі як прочитані',
    all: 'Всі', unread: 'Непрочитані', newBadge: 'нових',
    loading: 'Завантаження сповіщень…', noUnread: 'Немає непрочитаних сповіщень',
    noNotifs: 'Сповіщень поки немає', reason: 'Причина',
    action: 'Дія', at: 'о',
    resubmit: 'Надіслати повторно', view: 'Відкрити', deleteTitle: 'Видалити',
    property: '🏠 Об\'єкт', car: '🚗 Авто', account: '👤 Акаунт',
    markedRead: 'Позначено як прочитане', allMarkedRead: 'Всі сповіщення позначені як прочитані',
    deleted: 'Сповіщення видалено', errorLoad: 'Не вдалося завантажити сповіщення',
    errorRead: 'Не вдалося позначити як прочитане', errorDelete: 'Не вдалося видалити',
    types: {
      property_approved: '✅ Ваш об\'єкт схвалено',
      property_rejected: '❌ Ваш об\'єкт відхилено',
      property_changes_requested: '🔄 Запитано зміни для вашого об\'єкту',
      car_approved: '✅ Ваш автомобіль схвалено',
      car_rejected: '❌ Ваш автомобіль відхилено',
      car_changes_requested: '🔄 Запитано зміни для вашого автомобіля',
      listing_resubmitted: '📤 Оголошення повторно надіслано на перевірку',
      owner_approved: '✅ Ваш акаунт схвалено',
      owner_rejected: '❌ Ваш акаунт відхилено',
      subscription_updated: 'ℹ️ Вашу підписку оновлено',
    }
  },
  de: {
    title: 'Benachrichtigungen', subtitle: 'Bleiben Sie über Ihre Inserate informiert',
    markAllRead: 'Alle als gelesen markieren',
    all: 'Alle', unread: 'Ungelesen', newBadge: 'neu',
    loading: 'Benachrichtigungen werden geladen…', noUnread: 'Keine ungelesenen Benachrichtigungen',
    noNotifs: 'Noch keine Benachrichtigungen', reason: 'Grund',
    action: 'Aktion', at: 'um',
    resubmit: 'Erneut einreichen', view: 'Anzeigen', deleteTitle: 'Löschen',
    property: '🏠 Immobilie', car: '🚗 Auto', account: '👤 Konto',
    markedRead: 'Als gelesen markiert', allMarkedRead: 'Alle Benachrichtigungen als gelesen markiert',
    deleted: 'Benachrichtigung gelöscht', errorLoad: 'Benachrichtigungen konnten nicht geladen werden',
    errorRead: 'Konnte nicht als gelesen markiert werden', errorDelete: 'Konnte nicht gelöscht werden',
    types: {
      property_approved: '✅ Ihre Immobilie wurde genehmigt',
      property_rejected: '❌ Ihre Immobilie wurde abgelehnt',
      property_changes_requested: '🔄 Änderungen für Ihre Immobilie angefordert',
      car_approved: '✅ Ihr Auto wurde genehmigt',
      car_rejected: '❌ Ihr Auto wurde abgelehnt',
      car_changes_requested: '🔄 Änderungen für Ihr Auto angefordert',
      listing_resubmitted: '📤 Inserat erneut zur Überprüfung eingereicht',
      owner_approved: '✅ Ihr Konto wurde genehmigt',
      owner_rejected: '❌ Ihr Konto wurde abgelehnt',
      subscription_updated: 'ℹ️ Ihr Abonnement wurde aktualisiert',
    }
  },
  it: {
    title: 'Notifiche', subtitle: 'Rimani aggiornato sui tuoi annunci',
    markAllRead: 'Segna tutto come letto',
    all: 'Tutte', unread: 'Non lette', newBadge: 'nuove',
    loading: 'Caricamento notifiche…', noUnread: 'Nessuna notifica non letta',
    noNotifs: 'Nessuna notifica ancora', reason: 'Motivo',
    action: 'Azione', at: 'alle',
    resubmit: 'Reinvia', view: 'Visualizza', deleteTitle: 'Elimina',
    property: '🏠 Proprietà', car: '🚗 Auto', account: '👤 Account',
    markedRead: 'Segnato come letto', allMarkedRead: 'Tutte le notifiche segnate come lette',
    deleted: 'Notifica eliminata', errorLoad: 'Impossibile caricare le notifiche',
    errorRead: 'Impossibile segnare come letto', errorDelete: 'Impossibile eliminare',
    types: {
      property_approved: '✅ La tua proprietà è stata approvata',
      property_rejected: '❌ La tua proprietà è stata rifiutata',
      property_changes_requested: '🔄 Modifiche richieste per la tua proprietà',
      car_approved: '✅ La tua auto è stata approvata',
      car_rejected: '❌ La tua auto è stata rifiutata',
      car_changes_requested: '🔄 Modifiche richieste per la tua auto',
      listing_resubmitted: '📤 Annuncio reinviato per revisione',
      owner_approved: '✅ Il tuo account è stato approvato',
      owner_rejected: '❌ Il tuo account è stato rifiutato',
      subscription_updated: 'ℹ️ Il tuo abbonamento è stato aggiornato',
    }
  },
}

// ── Type colors ──────────────────────────────────────────────────────────────
const TYPE_STYLE: Record<string, { accent: string; icon: any }> = {
  property_approved:          { accent: '#22c55e', icon: CheckCircle },
  property_rejected:          { accent: '#ef4444', icon: XCircle },
  property_changes_requested: { accent: '#3b82f6', icon: AlertCircle },
  car_approved:               { accent: '#22c55e', icon: CheckCircle },
  car_rejected:               { accent: '#ef4444', icon: XCircle },
  car_changes_requested:      { accent: '#3b82f6', icon: AlertCircle },
  listing_resubmitted:        { accent: '#f59e0b', icon: RotateCcw },
  owner_approved:             { accent: '#22c55e', icon: CheckCircle },
  owner_rejected:             { accent: '#ef4444', icon: XCircle },
  subscription_updated:       { accent: '#6366f1', icon: Info },
}

interface Notification {
  id: string; user_id: string; type: string
  title: string; message: string; read: boolean
  metadata: any; created_at: string
  entity_type?: string; entity_id?: string
  action?: string; link?: string
}

// ── Component ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const router   = useRouter()
  const pathname = usePathname()
  const locale   = pathname.split('/')[1] || 'en'
  const isRTL    = locale === 'ar'
  const tx       = NTX[locale] || NTX.en
  const { t, d } = useOwnerTheme()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading,       setLoading]       = useState(true)
  const [filter,        setFilter]        = useState<'all' | 'unread'>('all')
  const [deletingId,    setDeletingId]    = useState<string | null>(null)

  useEffect(() => { fetchNotifications() }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res  = await fetch('/api/owner/notifications')
      const data = await res.json()
      setNotifications(data || [])
    } catch {
      toast.error(tx.errorLoad)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/owner/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })
      if (!res.ok) throw new Error()
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch {
      toast.error(tx.errorRead)
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/owner/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      })
      if (!res.ok) throw new Error()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success(tx.allMarkedRead)
    } catch {
      toast.error(tx.errorRead)
    }
  }

  const deleteNotification = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/owner/notifications/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success(tx.deleted)
    } catch {
      toast.error(tx.errorDelete)
    } finally {
      setDeletingId(null)
    }
  }

  const handleAction = (n: Notification) => {
    if (!n.read) markAsRead(n.id)
    if (n.metadata?.allowResubmission) {
      router.push(`/${locale}/owner/listings/${n.entity_id}/resubmit`)
    } else if (n.link) {
      router.push(n.link)
    }
  }

  const entityLabel = (type?: string) =>
    type === 'property' ? tx.property : type === 'car' ? tx.car : tx.account

  const filtered    = filter === 'unread' ? notifications.filter(n => !n.read) : notifications
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div style={{ minHeight: '100vh', background: t.bg, direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* ── Page Header ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: t.surface, borderBottom: `1px solid ${t.border}`, padding: '20px 28px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: `${t.accent}18`, border: `1px solid ${t.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} color={t.accent} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 26, color: t.text, margin: 0, lineHeight: 1.1 }}>
                {tx.title}
              </h1>
              <p style={{ fontSize: 12, color: t.textFaint, margin: '3px 0 0', fontFamily: 'var(--mono)', letterSpacing: '0.08em' }}>
                {tx.subtitle}
              </p>
            </div>
            {unreadCount > 0 && (
              <div style={{ padding: '3px 10px', borderRadius: 100, background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)' }}>
                {unreadCount} {tx.newBadge}
              </div>
            )}
          </div>

          {unreadCount > 0 && (
            <button onClick={markAllAsRead} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.accent, background: `${t.accent}10`, border: `1px solid ${t.accent}30`, borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' }}>
              <Check size={13} /> {tx.markAllRead}
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{ background: t.surface, borderBottom: `1px solid ${t.borderSoft}`, padding: '0 28px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', gap: 4 }}>
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: filter === f ? 600 : 400,
              color: filter === f ? t.accent : t.textMuted,
              borderBottom: filter === f ? `2px solid ${t.accent}` : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              {f === 'all' ? `${tx.all} (${notifications.length})` : `${tx.unread} (${unreadCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Notification List ── */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 28px 60px' }}>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: 16 }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${t.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 13, color: t.textFaint, fontFamily: 'var(--mono)' }}>{tx.loading}</p>
          </div>

        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: 14, background: t.surface, borderRadius: 16, border: `1px solid ${t.border}` }}>
            <BellOff size={48} color={t.textFaint} strokeWidth={1.2} />
            <p style={{ fontSize: 15, color: t.textMuted, fontFamily: 'var(--serif)' }}>
              {filter === 'unread' ? tx.noUnread : tx.noNotifs}
            </p>
          </div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(n => {
              const style    = TYPE_STYLE[n.type] || { accent: t.textMuted, icon: Info }
              const Icon     = style.icon
              const isUnread = !n.read
              const canResubmit = n.metadata?.allowResubmission
              const hasAction   = canResubmit || n.link
              const typeLabel   = tx.types[n.type]

              return (
                <div key={n.id}
                  onClick={() => isUnread && markAsRead(n.id)}
                  style={{
                    background: t.surface, borderRadius: 14, overflow: 'hidden', cursor: isUnread ? 'pointer' : 'default',
                    border: `1px solid ${isUnread ? style.accent + '40' : t.border}`,
                    borderLeft: isRTL ? `1px solid ${isUnread ? style.accent + '40' : t.border}` : undefined,
                    borderRight: isRTL ? `4px solid ${isUnread ? style.accent : t.border}` : undefined,
                    borderLeftWidth: isRTL ? undefined : undefined,
                    ...(isRTL ? {} : { borderLeft: `4px solid ${isUnread ? style.accent : t.borderSoft}` }),
                    transition: 'all 0.2s',
                    opacity: isUnread ? 1 : 0.85,
                  }}
                >
                  <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>

                    {/* Icon */}
                    <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${style.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                      <Icon size={18} color={style.accent} />
                    </div>

                    {/* Body */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Type label (from translations) */}
                      {typeLabel && (
                        <div style={{ fontSize: 11, color: style.accent, fontWeight: 700, fontFamily: 'var(--mono)', letterSpacing: '0.05em', marginBottom: 4 }}>
                          {typeLabel}
                        </div>
                      )}

                      {/* Title & message from DB */}
                      <div style={{ fontSize: 14, fontWeight: isUnread ? 600 : 400, color: t.text, lineHeight: 1.4 }}>
                        {n.title}
                      </div>
                      {n.message && (
                        <p style={{ fontSize: 13, color: t.textMuted, margin: '4px 0 0', lineHeight: 1.5 }}>
                          {n.message}
                        </p>
                      )}

                      {/* Metadata */}
                      {n.metadata && (
                        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {n.metadata.entityType && (
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: `${style.accent}12`, color: style.accent, fontFamily: 'var(--mono)' }}>
                              {entityLabel(n.metadata.entityType)}
                            </span>
                          )}
                          {n.metadata.reason && (
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: t.bg, color: t.textMuted, border: `1px solid ${t.borderSoft}` }}>
                              {tx.reason}: {n.metadata.reason}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <p style={{ fontSize: 11, color: t.textFaint, margin: '8px 0 0', fontFamily: 'var(--mono)' }}>
                        {new Date(n.created_at).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}
                        {' '}{tx.at}{' '}
                        {new Date(n.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {isUnread && (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: style.accent, flexShrink: 0 }} />
                      )}

                      {canResubmit && (
                        <button onClick={e => { e.stopPropagation(); handleAction(n) }}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          <RotateCcw size={12} /> {tx.resubmit}
                        </button>
                      )}

                      {hasAction && !canResubmit && (
                        <button onClick={e => { e.stopPropagation(); handleAction(n) }}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: t.text, color: t.surface, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          {tx.view} <ArrowRight size={12} />
                        </button>
                      )}

                      <button onClick={e => { e.stopPropagation(); deleteNotification(n.id) }}
                        disabled={deletingId === n.id}
                        title={tx.deleteTitle}
                        style={{ padding: '6px', color: t.textFaint, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = t.textFaint)}>
                        {deletingId === n.id
                          ? <div style={{ width: 14, height: 14, border: '2px solid #ef4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
