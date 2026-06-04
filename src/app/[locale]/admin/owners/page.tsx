'use client'
// ============================================
// Admin Owners Page
// Path: src/app/[locale]/admin/owners/page.tsx
//
// ✅ قائمة كل الـ owners مع status التحقق
// ✅ Basic (WhatsApp) / Premium (Documents)
// ✅ Approve / Reject / Request Changes
// ✅ تعديل الـ limits
// ✅ عرض الـ documents
// ============================================

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Search, Filter, Shield, Phone, FileText,
  CheckCircle2, XCircle, MessageSquare,
  ChevronRight, X, ExternalLink, Crown,
  Building2, Car, Users, AlertCircle,
  Clock, Settings
} from 'lucide-react'

// ============================================
// TYPES
// ============================================

interface Owner {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  whatsapp: string
  is_premium: boolean
  subscription_type: string
  subscription_expires_at: string
  created_at: string
  // من owner_verification
  verification: {
    id: string
    status: string
    verification_type: string
    company_name: string
    submitted_at: string
    admin_notes: string
    rejection_reason: string
  } | null
  // من user_subscriptions
  subscription: {
    status: string
    total_slots: number
    used_slots: number
    expires_at: string
    is_premium: boolean
    admin_notes: string
  } | null
  // من phone_verifications
  phone_verified: boolean
  // stats
  properties_count: number
  cars_count: number
  // documents
  documents: {
    id: string
    document_type: string
    file_url: string
    file_name: string
  }[]
}

type FilterType = 'all' | 'basic' | 'premium' | 'pending' | 'approved' | 'rejected'

// ============================================
// STATUS CONFIG
// ============================================

const VERIFICATION_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:            { label: 'Pending',       color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  documents_uploaded: { label: 'Docs Ready',    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  under_review:       { label: 'Under Review',  color: '#D4A843', bg: 'rgba(212,168,67,0.1)' },
  changes_requested:  { label: 'Changes Needed',color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
  approved:           { label: 'Approved',      color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  rejected:           { label: 'Rejected',      color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  not_submitted:      { label: 'Not Submitted', color: '#7a8aaa', bg: 'rgba(122,138,170,0.1)' },
}

function StatusBadge({ status }: { status: string }) {
  const config = VERIFICATION_STATUS[status] || VERIFICATION_STATUS.not_submitted
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ color: config.color, background: config.bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
      {config.label}
    </span>
  )
}

// ============================================
// OWNER DRAWER
// ============================================

function OwnerDrawer({
  owner, onClose, onAction
}: {
  owner: Owner | null
  onClose: () => void
  onAction: (ownerId: string, verificationId: string, action: 'approve' | 'reject' | 'changes_requested', reason?: string) => Promise<void>
}) {
  const [action, setAction]       = useState<'approve' | 'reject' | 'changes_requested' | null>(null)
  const [reason, setReason]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!owner) return null

  const fullName  = `${owner.first_name || ''} ${owner.last_name || ''}`.trim()
  const isPremium = owner.is_premium
  const verif     = owner.verification
  const needsAction = verif && ['pending', 'documents_uploaded', 'under_review'].includes(verif.status)

  async function handleSubmit() {
    if (!action || !verif) return
    if ((action === 'reject' || action === 'changes_requested') && !reason.trim()) return

    setSubmitting(true)
    await onAction(owner.id, verif.id, action, reason)
    setAction(null)
    setReason('')
    setSubmitting(false)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#0e1428] border-l border-white/10 z-50 flex flex-col overflow-hidden">

        {/* Head */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#D4A843]/20 border border-[#D4A843]/40 flex items-center justify-center text-lg font-bold text-[#D4A843]">
                {fullName[0] || '?'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#FBF0D0] font-['Cormorant_Garamond']">
                  {fullName || 'Owner'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {isPremium
                    ? <span className="flex items-center gap-1 text-xs text-[#D4A843] font-mono">
                        <Crown className="w-3 h-3" /> Premium
                      </span>
                    : <span className="text-xs text-[#7a8aaa] font-mono">Basic</span>
                  }
                  {owner.phone_verified && (
                    <span className="flex items-center gap-1 text-xs text-[#4ade80]">
                      <Phone className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-[#7a8aaa] hover:text-[#FBF0D0]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Verification status */}
          {verif && <StatusBadge status={verif.status} />}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Contact */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono tracking-widest text-[#7a8aaa] uppercase">Contact</h3>
            {[
              { label: 'Phone',    value: owner.phone },
              { label: 'WhatsApp', value: owner.whatsapp },
              { label: 'Email',    value: owner.email },
              { label: 'Joined',   value: new Date(owner.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
            ].filter(i => i.value).map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-white/5">
                <span className="text-xs text-[#7a8aaa]">{label}</span>
                <span className="text-sm text-[#FBF0D0]">{value}</span>
              </div>
            ))}
          </div>

          {/* Subscription */}
          {owner.subscription && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono tracking-widest text-[#7a8aaa] uppercase">Subscription</h3>
              {[
                { label: 'Status',     value: owner.subscription.status },
                { label: 'Slots',      value: `${owner.subscription.used_slots} / ${owner.subscription.total_slots} used` },
                { label: 'Expires',    value: owner.subscription.expires_at ? new Date(owner.subscription.expires_at).toLocaleDateString('en-GB') : '—' },
                { label: 'Properties', value: owner.properties_count },
                { label: 'Cars',       value: owner.cars_count },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-[#7a8aaa]">{label}</span>
                  <span className="text-sm text-[#FBF0D0] font-mono">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Verification details — Premium only */}
          {isPremium && verif && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono tracking-widest text-[#7a8aaa] uppercase">
                Verification Details
              </h3>
              {[
                { label: 'Type',    value: verif.verification_type },
                { label: 'Company', value: verif.company_name },
                { label: 'Submitted', value: verif.submitted_at ? new Date(verif.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
              ].filter(i => i.value).map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-[#7a8aaa]">{label}</span>
                  <span className="text-sm text-[#FBF0D0]">{value}</span>
                </div>
              ))}

              {/* Documents */}
              {owner.documents.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-[#7a8aaa] uppercase tracking-wider mb-2">Documents</p>
                  <div className="space-y-2">
                    {owner.documents.map(doc => (
                      <a
                        key={doc.id}
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-[#ffffff] rounded-lg border border-white/10 hover:border-[#D4A843]/30 transition-colors group"
                      >
                        <FileText className="w-4 h-4 text-[#D4A843] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[#FBF0D0] truncate">{doc.file_name}</div>
                          <div className="text-xs text-[#7a8aaa] capitalize">{doc.document_type}</div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-[#7a8aaa] group-hover:text-[#D4A843] transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous admin notes */}
              {verif.admin_notes && (
                <div className="p-3 bg-[#ffffff] rounded-lg border border-white/10 mt-2">
                  <p className="text-xs text-[#7a8aaa] mb-1">Previous admin notes</p>
                  <p className="text-sm text-[#FBF0D0]">{verif.admin_notes}</p>
                </div>
              )}

              {/* Rejection reason */}
              {verif.rejection_reason && (
                <div className="p-3 bg-[#f87171]/10 rounded-lg border border-[#f87171]/30 mt-2">
                  <p className="text-xs text-[#f87171] mb-1">Rejection reason</p>
                  <p className="text-sm text-[#FBF0D0]">{verif.rejection_reason}</p>
                </div>
              )}
            </div>
          )}

          {/* Action form */}
          {needsAction && action && (
            <div className="bg-[#ffffff] rounded-lg border border-white/10 p-4">
              <p className="text-sm font-medium text-[#FBF0D0] mb-3">
                {action === 'approve'
                  ? '✅ Approve this owner'
                  : action === 'reject'
                    ? '❌ Reject this owner'
                    : '✏️ Request changes'
                }
              </p>
              {(action === 'reject' || action === 'changes_requested') && (
                <div className="mb-3">
                  <label className="block text-xs text-[#7a8aaa] mb-1.5">
                    Reason * (will be sent to owner)
                  </label>
                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder={action === 'reject'
                      ? 'Explain why the verification is rejected...'
                      : 'What changes are needed?'}
                    rows={3}
                    className="w-full bg-[#0e1428] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#FBF0D0] placeholder:text-[#7a8aaa] focus:outline-none focus:border-[#D4A843]/50 resize-none"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setAction(null)}
                  className="flex-1 py-2 border border-white/10 text-[#7a8aaa] hover:text-[#FBF0D0] rounded-lg text-sm transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || ((action === 'reject' || action === 'changes_requested') && !reason.trim())}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  style={{
                    background: action === 'approve'
                      ? 'rgba(74,222,128,0.15)' : action === 'reject'
                        ? 'rgba(248,113,113,0.15)' : 'rgba(251,146,60,0.15)',
                    color: action === 'approve' ? '#4ade80' : action === 'reject' ? '#f87171' : '#fb923c',
                    border: `1px solid ${action === 'approve' ? 'rgba(74,222,128,0.3)' : action === 'reject' ? 'rgba(248,113,113,0.3)' : 'rgba(251,146,60,0.3)'}`,
                  }}>
                  {submitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer — Actions */}
        {needsAction && !action && (
          <div className="p-4 border-t border-white/10 space-y-2">
            <p className="text-xs text-[#7a8aaa] mb-3 text-center">
              {isPremium ? 'Review documents and take action' : 'Verify WhatsApp ownership'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setAction('approve')}
                className="py-2.5 rounded-lg text-sm border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/10 transition-colors">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-0.5" />
                Approve
              </button>
              <button onClick={() => setAction('changes_requested')}
                className="py-2.5 rounded-lg text-sm border border-[#fb923c]/30 text-[#fb923c] hover:bg-[#fb923c]/10 transition-colors">
                <MessageSquare className="w-4 h-4 mx-auto mb-0.5" />
                Changes
              </button>
              <button onClick={() => setAction('reject')}
                className="py-2.5 rounded-lg text-sm border border-[#f87171]/30 text-[#f87171] hover:bg-[#f87171]/10 transition-colors">
                <XCircle className="w-4 h-4 mx-auto mb-0.5" />
                Reject
              </button>
            </div>
          </div>
        )}

        {!needsAction && (
          <div className="p-4 border-t border-white/10">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-white/10 text-[#7a8aaa] hover:text-[#FBF0D0] rounded-lg text-sm transition-colors">
              <Settings className="w-4 h-4" />
              Edit Limits
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

// ============================================
// OWNER CARD
// ============================================

function OwnerCard({ owner, onClick }: { owner: Owner; onClick: () => void }) {
  const fullName  = `${owner.first_name || ''} ${owner.last_name || ''}`.trim()
  const isPremium = owner.is_premium
  const verif     = owner.verification
  const verifStatus = verif?.status || 'not_submitted'
  const needsAction = verif && ['pending', 'documents_uploaded', 'under_review'].includes(verif.status)

  return (
    <div
      onClick={onClick}
      className="bg-[#0e1428] rounded-lg border transition-colors cursor-pointer hover:border-[#D4A843]/30 p-5"
      style={{ borderColor: needsAction ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.1)' }}>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              background: isPremium ? 'rgba(212,168,67,0.2)' : 'rgba(96,165,250,0.15)',
              color: isPremium ? '#D4A843' : '#60a5fa',
              border: `1px solid ${isPremium ? 'rgba(212,168,67,0.4)' : 'rgba(96,165,250,0.3)'}`,
            }}>
            {fullName[0] || '?'}
          </div>
          <div>
            <div className="text-sm font-medium text-[#FBF0D0]">{fullName || 'Owner'}</div>
            <div className="flex items-center gap-2 mt-0.5">
              {isPremium
                ? <span className="flex items-center gap-1 text-xs text-[#D4A843]">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                : <span className="text-xs text-[#7a8aaa]">Basic</span>
              }
              {owner.phone_verified && (
                <span className="flex items-center gap-1 text-xs text-[#4ade80]">
                  <Phone className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <StatusBadge status={verifStatus} />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-[#7a8aaa]">
          <Building2 className="w-3.5 h-3.5" />
          <span>{owner.properties_count} props</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-[#7a8aaa]">
          <Car className="w-3.5 h-3.5" />
          <span>{owner.cars_count} cars</span>
        </div>
        {owner.subscription && (
          <div className="flex items-center gap-1.5 text-sm text-[#7a8aaa]">
            <span className="font-mono">
              {owner.subscription.used_slots}/{owner.subscription.total_slots} slots
            </span>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="text-xs text-[#7a8aaa] truncate">
        {owner.phone || owner.whatsapp || owner.email || '—'}
      </div>

      {/* Joined */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <span className="text-xs text-[#7a8aaa]">
          Joined {new Date(owner.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </span>
        {needsAction && (
          <span className="flex items-center gap-1 text-xs text-[#fbbf24]">
            <Clock className="w-3 h-3" /> Needs review
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-[#7a8aaa]" />
      </div>
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function AdminOwnersPage() {
  const supabase = createClient()

  const [owners, setOwners]           = useState<Owner[]>([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)

  const [counts, setCounts] = useState({
    all: 0, basic: 0, premium: 0,
    pending: 0, approved: 0, rejected: 0,
  })

  useEffect(() => { fetchOwners() }, [filter])

  async function fetchOwners() {
    setLoading(true)
    try {
      // جيب الـ owners
      let query = supabase
        .from('profiles')
        .select(`
          id, first_name, last_name, phone, whatsapp,
          is_premium, subscription_type, subscription_expires_at,
          created_at,
          subscription:user_subscriptions!user_id (
            status, total_slots, used_slots,
            expires_at, is_premium, admin_notes
          ),
          verification:owner_verification!owner_id (
            id, status, verification_type, company_name,
            submitted_at, admin_notes, rejection_reason
          )
        `)
        .eq('role', 'owner')
        .order('created_at', { ascending: false })

      if (filter === 'basic')   query = query.eq('is_premium', false)
      if (filter === 'premium') query = query.eq('is_premium', true)

      const { data: ownersData } = await query

      if (!ownersData) { setOwners([]); setLoading(false); return }

      // جيب stats كل owner
      const ownerIds = ownersData.map(o => o.id)

      const [propsData, carsData, phoneVerifs, docs] = await Promise.all([
        supabase.from('properties').select('owner_user_id')
          .in('owner_user_id', ownerIds).eq('review_status', 'approved'),
        supabase.from('cars').select('owner_user_id')
          .in('owner_user_id', ownerIds).eq('review_status', 'approved'),
        supabase.from('phone_verifications').select('user_id, verified')
          .in('user_id', ownerIds).eq('verified', true),
        supabase.from('verification_documents').select(`
          id, document_type, file_url, file_name,
          verification:owner_verification!verification_id (owner_id)
        `),
      ])

      // حساب الـ counts
      const propCounts: Record<string, number> = {}
      propsData.data?.forEach(p => {
        propCounts[p.owner_user_id] = (propCounts[p.owner_user_id] || 0) + 1
      })

      const carCounts: Record<string, number> = {}
      carsData.data?.forEach(c => {
        carCounts[c.owner_user_id] = (carCounts[c.owner_user_id] || 0) + 1
      })

      const verifiedPhones = new Set(phoneVerifs.data?.map(p => p.user_id))

      // مبني الـ owners
      let built: Owner[] = ownersData.map(o => {
        const sub    = Array.isArray(o.subscription) ? o.subscription[0] : o.subscription
        const verif  = Array.isArray(o.verification) ? o.verification[0] : o.verification

        // الـ documents بتاعت الـ owner ده
        const ownerDocs = docs.data?.filter(d => {
          const v = Array.isArray(d.verification) ? d.verification[0] : d.verification
          return v?.owner_id === o.id
        }).map(d => ({
          id:            d.id,
          document_type: d.document_type,
          file_url:      d.file_url,
          file_name:     d.file_name,
        })) || []

        return {
          ...o,
          verification:     verif || null,
          subscription:     sub || null,
          phone_verified:   verifiedPhones.has(o.id),
          properties_count: propCounts[o.id] || 0,
          cars_count:       carCounts[o.id] || 0,
          documents:        ownerDocs,
          email:            '',
        }
      })

      // Filter by verification status
      if (filter === 'pending') {
        built = built.filter(o =>
          o.verification && ['pending', 'documents_uploaded', 'under_review'].includes(o.verification.status)
        )
      } else if (filter === 'approved') {
        built = built.filter(o => o.verification?.status === 'approved')
      } else if (filter === 'rejected') {
        built = built.filter(o => o.verification?.status === 'rejected')
      }

      setOwners(built)

      // Counts
      const all     = ownersData.length
      const premium = ownersData.filter(o => o.is_premium).length
      const pending = ownersData.filter(o => {
        const v = Array.isArray(o.verification) ? o.verification[0] : o.verification
        return v && ['pending', 'documents_uploaded', 'under_review'].includes(v.status)
      }).length
      const approved = ownersData.filter(o => {
        const v = Array.isArray(o.verification) ? o.verification[0] : o.verification
        return v?.status === 'approved'
      }).length
      const rejected = ownersData.filter(o => {
        const v = Array.isArray(o.verification) ? o.verification[0] : o.verification
        return v?.status === 'rejected'
      }).length

      setCounts({ all, basic: all - premium, premium, pending, approved, rejected })

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerificationAction(
    ownerId: string,
    verificationId: string,
    action: 'approve' | 'reject' | 'changes_requested',
    reason?: string
  ) {
    try {
      const newStatus = action === 'approve'
        ? 'approved' : action === 'reject'
          ? 'rejected' : 'changes_requested'

      // حدّث owner_verification
      await supabase.from('owner_verification').update({
        status:           newStatus,
        reviewed_at:      new Date().toISOString(),
        rejection_reason: action === 'reject' ? reason : null,
        rejection_reason_ar: null,
        admin_notes:      reason || null,
      }).eq('id', verificationId)

      // لو approved — حدّث profiles.is_premium لو premium
      if (action === 'approve') {
        const owner = owners.find(o => o.id === ownerId)
        if (owner?.verification?.verification_type === 'premium') {
          await supabase.from('profiles').update({
            is_premium: true,
          }).eq('id', ownerId)
        }
      }

      // سجّل في activity feed
      await fetch('/api/admin/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type:  `owner_verification_${action}`,
          target_type:  'owner_verification',
          target_id:    verificationId,
          description:  `Owner verification ${action}`,
          before_state: { status: owners.find(o => o.id === ownerId)?.verification?.status },
          after_state:  { status: newStatus },
        }),
      })

      fetchOwners()
    } catch (err) {
      console.error(err)
    }
  }

  const filteredOwners = owners.filter(o => {
    if (!searchQuery) return true
    const q    = searchQuery.toLowerCase()
    const name = `${o.first_name} ${o.last_name}`.toLowerCase()
    return name.includes(q) || o.phone?.includes(q) || o.whatsapp?.includes(q)
  })

  const FILTERS = [
    { id: 'all',      label: `All · ${counts.all}` },
    { id: 'pending',  label: `⚡ Pending · ${counts.pending}` },
    { id: 'basic',    label: `Basic · ${counts.basic}` },
    { id: 'premium',  label: `Premium · ${counts.premium}` },
    { id: 'approved', label: `Approved · ${counts.approved}` },
    { id: 'rejected', label: `Rejected · ${counts.rejected}` },
  ]

  return (
    <div className="min-h-screen bg-[#ffffff]">

      {/* Header */}
      <div className="border-b border-white/10 bg-[#0e1428] px-6 py-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-xs font-mono tracking-widest text-[#D4A843] uppercase mb-1">
              CRM · Owner Management
            </p>
            <h1 className="text-3xl font-bold text-[#FBF0D0] font-['Cormorant_Garamond'] italic">
              Owners
            </h1>
            <p className="text-sm text-[#7a8aaa] mt-1">
              {counts.basic} Basic · {counts.premium} Premium
              {counts.pending > 0 && (
                <span className="text-[#fbbf24]"> · {counts.pending} need verification</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">

        {/* Search + Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8aaa]" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0e1428] border border-white/10 rounded-lg text-sm text-[#FBF0D0] placeholder:text-[#7a8aaa] focus:outline-none focus:border-[#D4A843]/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f.id}
                onClick={() => setFilter(f.id as FilterType)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  filter === f.id
                    ? 'bg-[#D4A843] text-[#ffffff] font-semibold'
                    : 'bg-[#0e1428] border border-white/10 text-[#7a8aaa] hover:text-[#FBF0D0]'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4A843]" />
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-10 h-10 text-[#7a8aaa] mx-auto mb-3" />
            <p className="text-[#7a8aaa]">
              {searchQuery ? 'No owners match your search' : 'No owners yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOwners.map(owner => (
              <OwnerCard
                key={owner.id}
                owner={owner}
                onClick={() => setSelectedOwner(owner)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      <OwnerDrawer
        owner={selectedOwner}
        onClose={() => setSelectedOwner(null)}
        onAction={handleVerificationAction}
      />
    </div>
  )
}