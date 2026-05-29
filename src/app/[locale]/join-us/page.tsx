'use client'
// ============================================
// DredottSTAY — Join Us Page
// Property owner registration form
// ============================================

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, MessageCircle } from 'lucide-react'
 
import Footer from '@/components/layout/Footer'

const joinSchema = z.object({
  first_name: z.string().min(2, 'Required'),
  last_name: z.string().min(2, 'Required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(6, 'Required'),
  location: z.string().optional(),
  notes: z.string().optional(),
})

type JoinFormData = z.infer<typeof joinSchema>

const INTERESTS = [
  'Property management',
  'Short-term rental',
  'Long-term rental',
  'Selling my property',
  'Buying a property',
  'Marketing & listing',
  'Not sure yet',
]

const WHY_US = [
  { title: 'We know Sharm', desc: 'Local team, local knowledge — we handle everything on the ground.' },
  { title: 'International guests', desc: 'We bring guests from Italy, Russia, Germany, Ukraine and beyond.' },
  { title: 'Full transparency', desc: 'Inventory reports, booking data, and revenue — all visible to you.' },
  { title: 'Always reachable', desc: 'WhatsApp support for you and your guests — 7 days a week.' },
]

export default function JoinUsPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Property management'])
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<JoinFormData>({
    resolver: zodResolver(joinSchema),
  })

  const onSubmit = async (data: JoinFormData) => {
    // In real app: save to Supabase + notify via email
    await new Promise(r => setTimeout(r, 1000))
    setSubmitted(true)
  }

  const toggleInterest = (i: string) => {
    setSelectedInterests(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
        

      {/* Hero */}
      <div className="bg-[#2C3A6B] px-8 py-14 text-center relative overflow-hidden">
        <h1 className="text-3xl font-medium text-[#FBF0D0] mb-3 leading-snug">
          Own a property in Sharm?<br />
          Let it <em className="not-italic text-[#D4A843]">work for you.</em>
        </h1>
        <p className="text-[#A0A8B4] text-sm max-w-[460px] mx-auto mb-5 leading-relaxed">
          Whether you want us to manage your property, market it, or handle everything — we&apos;re here. Leave your details and we&apos;ll call you back.
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          {['Property management', 'Short-term rental', 'Long-term rental', 'Marketing & listing'].map(b => (
            <span key={b} className="text-xs px-3 py-1.5 rounded-full bg-[#D4A843]/15 text-[#D4A843] border border-[#D4A843]/30 font-medium">
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-6 px-6 py-8 max-w-5xl mx-auto w-full flex-wrap lg:flex-nowrap">
        {/* Form */}
        <div className="flex-1 min-w-0">
          {submitted ? (
            <div className="bg-[#E1F5EE] border border-[#2A9D8F]/30 rounded-xl p-8 text-center">
              <div className="w-12 h-12 bg-[#2A9D8F] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-medium text-[#0F6E56] mb-2">We received your details!</h3>
              <p className="text-sm text-[#2A9D8F]">
                We&apos;ll contact you on WhatsApp within a few hours to discuss how we can help.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="card">
              <div className="p-3 border-b border-[#D4A843]/20">
                <p className="text-sm font-medium text-[#2C3A6B]">Register your interest</p>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">FIRST NAME</label>
                    <input {...register('first_name')} placeholder="Ahmed" className="input-field" />
                    {errors.first_name && <p className="text-xs text-[#E24B4A] mt-1">{errors.first_name.message}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">LAST NAME</label>
                    <input {...register('last_name')} placeholder="Hassan" className="input-field" />
                    {errors.last_name && <p className="text-xs text-[#E24B4A] mt-1">{errors.last_name.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">EMAIL</label>
                  <input {...register('email')} type="email" placeholder="your@email.com" className="input-field" />
                  {errors.email && <p className="text-xs text-[#E24B4A] mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">WHATSAPP / PHONE</label>
                  <input {...register('phone')} type="tel" placeholder="+20 100 000 0000" className="input-field" />
                  {errors.phone && <p className="text-xs text-[#E24B4A] mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-2">I&apos;M INTERESTED IN</label>
                  <div className="grid grid-cols-2 gap-2">
                    {INTERESTS.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleInterest(i)}
                        className={`py-2 px-3 text-xs rounded-lg border transition-colors text-left ${
                          selectedInterests.includes(i)
                            ? 'bg-[#2C3A6B] text-[#D4A843] border-[#2C3A6B] font-medium'
                            : 'bg-white text-[#A0A8B4] border-[#D4A843]/40 hover:bg-[#FBF0D0]'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">PROPERTY LOCATION (OPTIONAL)</label>
                  <input {...register('location')} placeholder="e.g. Naama Bay, Sharks Bay..." className="input-field" />
                </div>

                <div>
                  <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">ANYTHING ELSE?</label>
                  <textarea {...register('notes')} rows={3} className="input-field resize-none"
                    placeholder="Tell us about your property or what you need..." />
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 disabled:opacity-60">
                  {isSubmitting ? 'Submitting...' : 'Submit — we\'ll call you back'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Why us sidebar */}
        <div className="w-full lg:w-[220px] flex-shrink-0 flex flex-col gap-4">
          <div className="card p-4">
            {WHY_US.map((w) => (
              <div key={w.title} className="flex gap-2.5 mb-3 last:mb-0">
                <div className="w-8 h-8 bg-[#FBF0D0] rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={14} className="text-[#8B6914]" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[#2C3A6B]">{w.title}</div>
                  <div className="text-xs text-[#A0A8B4] leading-relaxed mt-0.5">{w.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#FBF0D0] border border-[#D4A843]/30 rounded-xl p-4 text-center">
            <div className="text-xs font-medium text-[#2C3A6B] mb-1.5">Looking for more services?</div>
            <div className="text-xs text-[#A0A8B4] mb-3 leading-relaxed">
              Visit DredottReal Estate for brokerage, sales, and investment advice.
            </div>
            <button className="bg-[#2C3A6B] text-[#D4A843] text-xs font-medium px-3 py-2 rounded-lg">
              DredottReal Estate →
            </button>
          </div>

          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-teal flex items-center justify-center gap-2 py-3 text-sm"
          >
            <MessageCircle size={15} /> Chat on WhatsApp first
          </a>
        </div>
      </div>

      <Footer />
    </div>
  )
}
