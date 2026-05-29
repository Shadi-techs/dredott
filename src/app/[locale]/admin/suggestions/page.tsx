// ============================================
// Admin Suggestions Review
// Path: src/app/[locale]/admin/suggestions/page.tsx
// Approve/reject: compounds + car makes/models
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { CheckCircle, XCircle, Building2, Car, Loader2, Clock } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SuggestionsPage() {
  const [compounds, setCompounds] = useState<any[]>([])
  const [carSuggestions, setCarSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [tab, setTab] = useState<'compounds' | 'cars'>('compounds')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: comp }, { data: cars }] = await Promise.all([
      supabase.from('compound_suggestions').select('*, profiles(first_name, last_name, email)').eq('status', 'pending').order('created_at'),
      supabase.from('car_data_suggestions').select('*, profiles(first_name, last_name, email), car_makes(name)').eq('status', 'pending').order('created_at'),
    ])
    setCompounds(comp || [])
    setCarSuggestions(cars || [])
    setLoading(false)
  }

  const approveCompound = async (s: any) => {
    setProcessing(s.id)
    const { data: { user } } = await supabase.auth.getUser()

    // Add to compounds table
    await supabase.from('compounds').insert({
      name: s.name,
      area: s.area,
      additional_info: s.additional_info,
      is_active: true,
    })

    // Mark suggestion approved
    await supabase.from('compound_suggestions').update({
      status: 'approved',
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', s.id)

    setCompounds(prev => prev.filter(c => c.id !== s.id))
    setProcessing(null)
  }

  const rejectCompound = async (id: string, note: string) => {
    setProcessing(id)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('compound_suggestions').update({
      status: 'rejected',
      admin_note: note,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id)
    setCompounds(prev => prev.filter(c => c.id !== id))
    setProcessing(null)
  }

  const approveCarSuggestion = async (s: any) => {
    setProcessing(s.id)
    const { data: { user } } = await supabase.auth.getUser()

    if (s.type === 'make') {
      await supabase.from('car_makes').insert({ name: s.suggested_make, is_active: true })
    } else {
      await supabase.from('car_models').insert({
        make_id: s.make_id_ref,
        name: s.suggested_model,
        is_active: true,
      })
    }

    await supabase.from('car_data_suggestions').update({
      status: 'approved',
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', s.id)

    setCarSuggestions(prev => prev.filter(c => c.id !== s.id))
    setProcessing(null)
  }

  const rejectCarSuggestion = async (id: string) => {
    setProcessing(id)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('car_data_suggestions').update({
      status: 'rejected',
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id)
    setCarSuggestions(prev => prev.filter(c => c.id !== id))
    setProcessing(null)
  }

  const totalPending = compounds.length + carSuggestions.length

  return (
    <div className="min-h-screen bg-[#0e1428] p-6">
      <div className="mb-6">
        <h1 className="text-2xl italic text-white mb-1"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Suggestions Review
        </h1>
        <p className="text-[#7a8aaa] text-sm font-mono">
          {totalPending} pending suggestion{totalPending !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'compounds', label: `Compounds (${compounds.length})`, icon: Building2 },
          { id: 'cars',      label: `Cars (${carSuggestions.length})`, icon: Car },
        ].map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${
                tab === t.id
                  ? 'bg-[rgba(212,168,67,0.1)] text-[#D4A843] border border-[rgba(212,168,67,0.3)]'
                  : 'text-[#7a8aaa] border border-[rgba(255,255,255,0.06)] hover:text-white'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D4A843] animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">

          {/* Compounds */}
          {tab === 'compounds' && (
            compounds.length === 0 ? (
              <div className="text-center py-16 text-[#7a8aaa] font-mono text-sm">
                No pending compound suggestions
              </div>
            ) : compounds.map(s => (
              <div key={s.id} className="bg-[#1a2240] border border-[rgba(212,168,67,0.08)] rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{s.name}</p>
                    {s.area && <p className="text-[#7a8aaa] text-xs mt-0.5">Area: {s.area}</p>}
                    {s.additional_info && (
                      <p className="text-[#7a8aaa] text-xs mt-1 italic">"{s.additional_info}"</p>
                    )}
                    <p className="text-[#7a8aaa] text-xs mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      by {s.profiles?.first_name} {s.profiles?.last_name} · {s.profiles?.email}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => approveCompound(s)}
                      disabled={processing === s.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/20 transition-colors disabled:opacity-50"
                    >
                      {processing === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Approve
                    </button>
                    <button
                      onClick={() => rejectCompound(s.id, 'Not valid')}
                      disabled={processing === s.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Car suggestions */}
          {tab === 'cars' && (
            carSuggestions.length === 0 ? (
              <div className="text-center py-16 text-[#7a8aaa] font-mono text-sm">
                No pending car suggestions
              </div>
            ) : carSuggestions.map(s => (
              <div key={s.id} className="bg-[#1a2240] border border-[rgba(212,168,67,0.08)] rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                        s.type === 'make'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {s.type === 'make' ? 'New Make' : 'New Model'}
                      </span>
                    </div>
                    <p className="text-white font-medium text-sm">
                      {s.type === 'make' ? s.suggested_make : s.suggested_model}
                    </p>
                    {s.type === 'model' && s.car_makes && (
                      <p className="text-[#7a8aaa] text-xs mt-0.5">
                        For: {s.car_makes.name}
                      </p>
                    )}
                    <p className="text-[#7a8aaa] text-xs mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      by {s.profiles?.first_name} {s.profiles?.last_name}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => approveCarSuggestion(s)}
                      disabled={processing === s.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/20 transition-colors disabled:opacity-50"
                    >
                      {processing === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Approve
                    </button>
                    <button
                      onClick={() => rejectCarSuggestion(s.id)}
                      disabled={processing === s.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}