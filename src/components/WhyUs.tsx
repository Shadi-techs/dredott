// ============================================
// DredottSTAY — Why Us Section
// ============================================

import { MapPin, MessageCircle, CheckCircle, Globe } from 'lucide-react'

const REASONS = [
  { icon: MapPin, title: 'Prime locations', desc: 'Sea views, beach access, and city vibes in every area of Sharm.' },
  { icon: MessageCircle, title: 'WhatsApp support', desc: 'Personal confirmation and 24/7 support — in your language.' },
  { icon: CheckCircle, title: 'Verified properties', desc: 'Every listing is inspected and managed by our team.' },
  { icon: Globe, title: '5 languages', desc: 'We speak English, Arabic, Italian, Russian and German.' },
]

export default function WhyUs() {
  return (
    <section className="bg-[#2C3A6B] px-6 py-9">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-medium text-[#FBF0D0] mb-1.5">
          Why stay with{' '}
          <span className="text-[#D4A843]">DREDOTT?</span>
        </h2>
        <p className="text-[#A0A8B4] text-sm mb-6">
          We make your Sharm experience seamless from day one.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {REASONS.map((r) => {
            const Icon = r.icon
            return (
              <div key={r.title} className="bg-white/[0.06] rounded-xl p-4 border border-[#D4A843]/20">
                <div className="w-8 h-8 rounded-lg bg-[#B8860B] flex items-center justify-center mb-3">
                  <Icon size={15} className="text-[#FFF8DC]" />
                </div>
                <div className="text-[#FBF0D0] text-sm font-medium mb-1.5">{r.title}</div>
                <div className="text-[#A0A8B4] text-xs leading-relaxed">{r.desc}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
