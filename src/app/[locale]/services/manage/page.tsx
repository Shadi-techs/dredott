'use client'
// ============================================================
// Provider Profile Management — post-approval editing
// Providers can edit their data; changes require re-approval
// ============================================================

import { useState, useEffect, use } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Check, Edit2, Clock, ShieldCheck, AlertCircle, Loader2, RefreshCw, ChevronRight, Eye } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TX: Record<string, any> = {
  en: {
    tag: 'My Service Profile',
    title: 'Manage Your Profile',
    loading: 'Loading your profile…',
    notFound: 'No service profile found.',
    register: 'Register as Service Provider',
    statusPending: 'Under Review',
    statusApproved: 'Live on Site',
    statusRejected: 'Rejected',
    pendingNote: 'Your profile is being reviewed. We\'ll notify you within 48 hours.',
    approvedNote: 'Your profile is visible to visitors on DREDOTT.',
    rejectedNote: 'Your application was rejected.',
    rejectReason: 'Reason:',
    resubNote: 'Any changes will put your profile back under review.',
    editProfile: 'Edit Profile',
    viewProfile: 'View Profile',
    saving: 'Saving…',
    save: 'Save Changes',
    cancel: 'Cancel',
    businessName: 'Business Name (EN)', businessNameAr: 'Business Name (AR)',
    description: 'Description', phone: 'Phone', whatsapp: 'WhatsApp',
    email: 'Email', website: 'Website', facebook: 'Facebook',
    area: 'Area', address: 'Address',
    submissionCount: 'Submission',
    successEdit: 'Changes submitted for review.',
    errSave: 'Failed to save. Please try again.',
  },
  ar: {
    tag: 'ملف الخدمة',
    title: 'إدارة ملفك',
    loading: 'جارٍ تحميل ملفك…',
    notFound: 'لا يوجد ملف خدمة.',
    register: 'تسجيل كمزود خدمة',
    statusPending: 'قيد المراجعة',
    statusApproved: 'مرئي على الموقع',
    statusRejected: 'مرفوض',
    pendingNote: 'ملفك قيد المراجعة. سنتواصل معك خلال 48 ساعة.',
    approvedNote: 'ملفك مرئي للزوار على DREDOTT.',
    rejectedNote: 'تم رفض طلبك.',
    rejectReason: 'السبب:',
    resubNote: 'أي تعديل سيعيد ملفك للمراجعة.',
    editProfile: 'تعديل الملف',
    viewProfile: 'عرض الملف',
    saving: '…جارٍ الحفظ',
    save: 'حفظ التغييرات',
    cancel: 'إلغاء',
    businessName: 'اسم النشاط (إنجليزي)', businessNameAr: 'اسم النشاط (عربي)',
    description: 'الوصف', phone: 'الهاتف', whatsapp: 'واتساب',
    email: 'البريد الإلكتروني', website: 'الموقع', facebook: 'فيسبوك',
    area: 'المنطقة', address: 'العنوان',
    submissionCount: 'تقديم',
    successEdit: 'تم إرسال التعديلات للمراجعة.',
    errSave: 'فشل الحفظ. يرجى المحاولة مجدداً.',
  },
  ru: { tag: 'Мой профиль', title: 'Управление профилем', loading: 'Загрузка…', notFound: 'Профиль не найден.', register: 'Зарегистрироваться', statusPending: 'На проверке', statusApproved: 'Активен', statusRejected: 'Отклонён', pendingNote: 'Профиль проверяется. Ответ в течение 48 часов.', approvedNote: 'Ваш профиль виден посетителям.', rejectedNote: 'Заявка отклонена.', rejectReason: 'Причина:', resubNote: 'Любые изменения отправят профиль на повторную проверку.', editProfile: 'Редактировать', viewProfile: 'Просмотр', saving: 'Сохранение…', save: 'Сохранить изменения', cancel: 'Отмена', businessName: 'Название (EN)', businessNameAr: 'Название (AR)', description: 'Описание', phone: 'Телефон', whatsapp: 'WhatsApp', email: 'Email', website: 'Сайт', facebook: 'Facebook', area: 'Район', address: 'Адрес', submissionCount: 'Заявка', successEdit: 'Изменения отправлены на проверку.', errSave: 'Ошибка сохранения.' },
  uk: { tag: 'Мій профіль', title: 'Управління профілем', loading: 'Завантаження…', notFound: 'Профіль не знайдено.', register: 'Зареєструватись', statusPending: 'На перевірці', statusApproved: 'Активний', statusRejected: 'Відхилено', pendingNote: 'Профіль перевіряється. Відповідь протягом 48 годин.', approvedNote: 'Ваш профіль видно відвідувачам.', rejectedNote: 'Заявку відхилено.', rejectReason: 'Причина:', resubNote: 'Будь-які зміни відправлять профіль на повторну перевірку.', editProfile: 'Редагувати', viewProfile: 'Переглянути', saving: 'Збереження…', save: 'Зберегти зміни', cancel: 'Скасувати', businessName: 'Назва (EN)', businessNameAr: 'Назва (AR)', description: 'Опис', phone: 'Телефон', whatsapp: 'WhatsApp', email: 'Email', website: 'Сайт', facebook: 'Facebook', area: 'Район', address: 'Адреса', submissionCount: 'Заявка', successEdit: 'Зміни надіслані на перевірку.', errSave: 'Помилка збереження.' },
  de: { tag: 'Mein Profil', title: 'Profilverwaltung', loading: 'Wird geladen…', notFound: 'Kein Profil gefunden.', register: 'Registrieren', statusPending: 'In Prüfung', statusApproved: 'Aktiv', statusRejected: 'Abgelehnt', pendingNote: 'Profil wird geprüft. Antwort innerhalb von 48 Stunden.', approvedNote: 'Ihr Profil ist für Besucher sichtbar.', rejectedNote: 'Bewerbung abgelehnt.', rejectReason: 'Grund:', resubNote: 'Änderungen senden das Profil erneut zur Prüfung.', editProfile: 'Bearbeiten', viewProfile: 'Profil ansehen', saving: 'Wird gespeichert…', save: 'Änderungen speichern', cancel: 'Abbrechen', businessName: 'Name (EN)', businessNameAr: 'Name (AR)', description: 'Beschreibung', phone: 'Telefon', whatsapp: 'WhatsApp', email: 'E-Mail', website: 'Website', facebook: 'Facebook', area: 'Gebiet', address: 'Adresse', submissionCount: 'Einreichung', successEdit: 'Änderungen zur Prüfung eingereicht.', errSave: 'Speicherfehler.' },
  it: { tag: 'Il mio profilo', title: 'Gestione profilo', loading: 'Caricamento…', notFound: 'Nessun profilo trovato.', register: 'Registrati', statusPending: 'In revisione', statusApproved: 'Attivo', statusRejected: 'Rifiutato', pendingNote: 'Il profilo è in revisione. Risposta entro 48 ore.', approvedNote: 'Il tuo profilo è visibile ai visitatori.', rejectedNote: 'Candidatura rifiutata.', rejectReason: 'Motivo:', resubNote: 'Qualsiasi modifica invierà il profilo a nuova revisione.', editProfile: 'Modifica profilo', viewProfile: 'Vedi profilo', saving: 'Salvataggio…', save: 'Salva modifiche', cancel: 'Annulla', businessName: 'Nome (EN)', businessNameAr: 'Nome (AR)', description: 'Descrizione', phone: 'Telefono', whatsapp: 'WhatsApp', email: 'Email', website: 'Sito web', facebook: 'Facebook', area: 'Area', address: 'Indirizzo', submissionCount: 'Invio', successEdit: 'Modifiche inviate per revisione.', errSave: 'Errore di salvataggio.' },
}

const AREAS: Record<string, string> = {
  naama_bay: 'Naama Bay', sharks_bay: "Shark's Bay", hadaba: 'Hadaba',
  montazah: 'Montazah', nabq: 'Nabq', um_el_sid: 'Um El Sid',
  el_salam: 'El Salam', old_market: 'Old Market',
}

export default function ProviderManagePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const router     = useRouter()
  const tx         = TX[locale] || TX.en
  const isAr       = locale === 'ar'

  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')

  const [form, setForm] = useState<any>({})

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/${locale}/login?redirect=/${locale}/services/manage`); return }

      const { data } = await supabase
        .from('service_providers')
        .select('*, service_provider_categories(name_en, name_ar, icon)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setProvider(data)
      if (data) setForm({
        business_name: data.business_name || '',
        business_name_ar: data.business_name_ar || '',
        description: data.description || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        email: data.email || '',
        website_url: data.website_url || '',
        facebook_url: data.facebook_url || '',
        area: data.area || '',
        address: data.address || '',
      })
      setLoading(false)
    }
    load()
  }, [locale])

  const setF = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const res = await fetch('/api/services/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider_id: provider.id, ...form }),
    })
    setSaving(false)
    if (!res.ok) { setError(tx.errSave); return }

    // Refresh
    setProvider((p: any) => ({ ...p, ...form, review_status: 'pending', submission_count: (p.submission_count || 1) + 1 }))
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 4000)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 13px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, fontSize: 14, color: '#2C3A6B', outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 5, fontWeight: 500 }

  // ── Status config ──────────────────────────────────────────
  const STATUS_CONFIG = {
    pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', icon: <Clock size={16} color="#f59e0b" />,      label: tx.statusPending,  note: tx.pendingNote },
    approved: { color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)',  icon: <ShieldCheck size={16} color="#4ade80" />, label: tx.statusApproved, note: tx.approvedNote },
    rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.08)',border: 'rgba(248,113,113,0.2)', icon: <AlertCircle size={16} color="#f87171" />, label: tx.statusRejected, note: tx.rejectedNote },
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={28} color="#D4A843" style={{ animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }} dir={isAr ? 'rtl' : 'ltr'}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 16px 80px' }}>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.28em', color: '#D4A843', textTransform: 'uppercase', marginBottom: 8, textAlign: isAr ? 'right' : 'left' }}>— {tx.tag}</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: '#2C3A6B', marginBottom: 24, textAlign: isAr ? 'right' : 'left', fontWeight: 400 }}>{tx.title}</h1>

        {/* Not found */}
        {!provider ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.07)', padding: 32, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>{tx.notFound}</p>
            <button onClick={() => router.push(`/${locale}/services/register`)} style={{ background: '#2C3A6B', color: '#D4A843', padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {tx.register} <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <>
            {/* Status card */}
            {(() => {
              const s = STATUS_CONFIG[provider.review_status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
              return (
                <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ marginTop: 2 }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: s.color }}>{s.label}</span>
                      {(provider.submission_count || 1) > 1 && (
                        <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', background: 'rgba(212,168,67,0.12)', color: '#D4A843', padding: '2px 7px', borderRadius: 20 }}>
                          {tx.submissionCount} #{provider.submission_count}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#6b7280' }}>{s.note}</p>
                    {provider.review_status === 'rejected' && provider.review_note && (
                      <p style={{ fontSize: 13, color: '#f87171', marginTop: 6 }}>
                        <strong>{tx.rejectReason}</strong> {provider.review_note}
                      </p>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Saved confirmation */}
            {saved && (
              <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={15} color="#4ade80" />
                <span style={{ fontSize: 13, color: '#4ade80' }}>{tx.successEdit}</span>
              </div>
            )}

            {/* Profile card */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.07)', padding: '20px', marginBottom: 16 }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: '#2C3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {provider.logo_url
                    ? <img src={provider.logo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: 14, objectFit: 'cover' }} />
                    : provider.service_provider_categories?.icon || '🏢'
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#2C3A6B', margin: 0 }}>{provider.business_name}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                    {isAr ? provider.service_provider_categories?.name_ar : provider.service_provider_categories?.name_en}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {provider.review_status === 'approved' && (
                    <button onClick={() => router.push(`/${locale}/services/${provider.id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(42,157,143,0.08)', border: '1px solid rgba(42,157,143,0.2)', borderRadius: 8, color: '#2A9D8F', cursor: 'pointer', fontSize: 12 }}>
                      <Eye size={13} /> {tx.viewProfile}
                    </button>
                  )}
                  {!editing && (
                    <button onClick={() => setEditing(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#2C3A6B', border: 'none', borderRadius: 8, color: '#D4A843', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      <Edit2 size={13} /> {tx.editProfile}
                    </button>
                  )}
                </div>
              </div>

              {/* Edit form */}
              {editing ? (
                <div>
                  <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <RefreshCw size={14} color="#f59e0b" />
                    <span style={{ fontSize: 12, color: '#d97706' }}>{tx.resubNote}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div><label style={lbl}>{tx.businessName}</label><input value={form.business_name} onChange={e => setF('business_name', e.target.value)} style={inp} /></div>
                      <div><label style={lbl}>{tx.businessNameAr}</label><input value={form.business_name_ar} onChange={e => setF('business_name_ar', e.target.value)} style={{ ...inp, direction: 'rtl', textAlign: 'right' }} /></div>
                    </div>
                    <div><label style={lbl}>{tx.description}</label><textarea value={form.description} onChange={e => setF('description', e.target.value)} rows={3} style={{ ...inp, resize: 'none' }} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div><label style={lbl}>{tx.phone}</label><input value={form.phone} onChange={e => setF('phone', e.target.value)} style={inp} /></div>
                      <div><label style={lbl}>{tx.whatsapp}</label><input value={form.whatsapp} onChange={e => setF('whatsapp', e.target.value)} style={inp} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div><label style={lbl}>{tx.email}</label><input type="email" value={form.email} onChange={e => setF('email', e.target.value)} style={inp} /></div>
                      <div><label style={lbl}>{tx.website}</label><input value={form.website_url} onChange={e => setF('website_url', e.target.value)} style={inp} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={lbl}>{tx.area}</label>
                        <select value={form.area} onChange={e => setF('area', e.target.value)} style={inp}>
                          <option value="">—</option>
                          {Object.entries(AREAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                      <div><label style={lbl}>{tx.address}</label><input value={form.address} onChange={e => setF('address', e.target.value)} style={inp} /></div>
                    </div>
                  </div>

                  {error && <p style={{ fontSize: 13, color: '#ef4444', marginTop: 12, display: 'flex', gap: 6, alignItems: 'center' }}><AlertCircle size={14} />{error}</p>}

                  <div style={{ display: 'flex', gap: 10, marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <button onClick={() => setEditing(false)} style={{ padding: '9px 18px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: 13 }}>
                      {tx.cancel}
                    </button>
                    <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '9px 18px', background: '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
                      {saving ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> {tx.saving}</> : <><Check size={14} /> {tx.save}</>}
                    </button>
                  </div>
                </div>
              ) : (
                // Read-only view
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    [tx.phone, provider.phone],
                    [tx.whatsapp, provider.whatsapp],
                    [tx.email, provider.email],
                    [tx.website, provider.website_url],
                    [tx.area, AREAS[provider.area] || provider.area],
                    [tx.address, provider.address],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>{k}</p>
                      <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{v}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
