// ============================================
// DREDOTT Master Plan — Complete Roadmap
// Path: src/app/[locale]/admin/master-plan/page.tsx
// Super Admin Only · Export to PDF
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Download, Lock } from 'lucide-react'

export default function MasterPlanPage() {
  const router = useRouter()
  const supabase = createClient()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/en/admin/login'); return }
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      if (prof?.role === 'super_admin') setAuthorized(true)
      setLoading(false)
    })
  }, [])

  if (loading) return <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 32, height: 32, border: '3px solid #D4A843', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>

  if (!authorized) return <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}><Lock size={40} color="#D4A843" /><p style={{ color: '#FBF0D0', fontFamily: "'Cormorant Garamond', serif", fontSize: 24 }}>Super Admin Only</p></div>

  return (
    <>
      <style>{`@media print{.no-print{display:none!important}body{background:#fff!important;color:#000!important}.print-page{background:#fff!important;padding:20px!important}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div className="print-page" style={{ minHeight: '100vh', background: '#ffffff', padding: 32, fontFamily: "'DM Sans', sans-serif" }}>

        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.3em', color: '#D4A843', textTransform: 'uppercase', marginBottom: 6 }}>— SUPER ADMIN · CONFIDENTIAL</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: '#FBF0D0', fontWeight: 400 }}>DREDOTT Master Plan</h1>
          </div>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#D4A843', color: '#ffffff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}><Download size={15} />PDF</button>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          <S title="01 · Brand & Domain">
            <R label="Name" value="DREDOTT" h />
            <R label="Domain" value="dredott.com" h />
            <R label="Tagline" value="Your dot on the Red Sea." />
            <R label="Colors" value="#ffffff Navy · #D4A843 Gold · #FAF9F6 Cream · #2A9D8F Teal" />
            <R label="Fonts" value="Cormorant Garamond · JetBrains Mono · DM Sans" />
            <R label="Target" value="Russian · Ukrainian · German · Italian · Egyptian" />
          </S>

          <S title="02 · Business Model">
            <R label="Model" value="Subscription SaaS — Zero commission" />
            <R label="Revenue 1" value="Owner subscriptions (Normal + Premium)" />
            <R label="Revenue 2" value="Display ads EGP 500/month (future)" />
            <R label="Revenue 3" value="Managed units 20% net (future)" />
            <R label="Revenue 4" value="Services marketplace (Phase 7)" />
            <R label="Revenue 5" value="Real estate sales commission (Phase 8)" />
          </S>

          <S title="03 · Subscription Packages">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr>{['Package','Posts','Normal/yr','Premium/yr','Launch'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid rgba(212,168,67,0.2)', color: '#D4A843', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
              <tbody>{[['Starter','1','EGP 1,200','EGP 3,000','EGP 600'],['Standard','3','EGP 2,000','EGP 4,500','—'],['Pro ⭐','7','EGP 3,000','EGP 6,500','—'],['Business','15','EGP 5,500','EGP 11,000','—']].map((row,i) => <tr key={i}>{row.map((c,j) => <td key={j} style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: j===0 ? '#FBF0D0':'rgba(255,255,255,0.7)', fontWeight: j===0?600:400 }}>{c}</td>)}</tr>)}</tbody>
            </table>
            <N>1 post = property OR car. All annual.</N>
          </S>

          <S title="04 · Development Phases">
            {[
              {p:'Phase 1-3',s:'done',t:'Foundation + Owner Portal',d:'Auth · Listings · Admin · Subscriptions · Blog · Premium · Notifications · Invoices · Photo compression · 6 languages'},
              {p:'Phase 4',s:'done',t:'Translation System',d:'Claude Haiku API · 6 languages per listing · ~$0.008/listing'},
              {p:'Phase 5',s:'done',t:'Payment Integration',d:'Stripe · Auto-invoice · Auto-unlock subscriptions'},
              {p:'Phase 6',s:'done',t:'Engineers Marketplace',d:'Engineers list · EGP 600/yr subscription'},
              {p:'Phase 7',s:'done',t:'Booking System ✅ COMPLETE',d:'Full booking flow · Stripe payments · Calendar blocking · Owner/Guest dashboards · Property Manager portal'},
              {p:'Phase 8',s:'next',t:'Services Directory',d:'Tours · Coaches · Cleaning · Transport · Restaurants · All subscription-based'},
              {p:'Phase 9',s:'planned',t:'Real Estate Sales',d:'Buy/sell properties · Commission from buyer · Feature flag controlled'},
              {p:'Phase 10',s:'planned',t:'Map Feature',d:'Property locations · Google Maps · Premium only · Lat/lng already collected'},
              {p:'Phase 11',s:'future',t:'Expand Cities',d:'Hurghada + North Coast · Same model · Auto city selector'},
            ].map((x,i) => <Ph key={i} {...x} />)}
          </S>

          <S title="05 · Phase 7 Details (Latest — May 2026)">
            <div style={{ padding: 16, background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, marginBottom: 16 }}>
              <h4 style={{ color: '#4ade80', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>✅ Complete Booking System</h4>
              <div style={{ fontSize: 12, color: '#7a8aaa', lineHeight: 1.8 }}>
                <p>• 11 files delivered (3 API routes + 2 components + 6 pages)</p>
                <p>• Stripe payment integration (v2026-04-22.dahlia)</p>
                <p>• Calendar blocking (JSONB in DB)</p>
                <p>• Email notifications (Resend)</p>
                <p>• User bookings dashboard</p>
                <p>• Owner bookings management</p>
                <p>• Property Manager registration flow (pending → approved)</p>
                <p>• Cancel + refund via Stripe</p>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#fbbf24', background: 'rgba(251,191,36,0.05)', padding: 12, borderRadius: 8, border: '1px solid rgba(251,191,36,0.2)' }}>
              <strong>Still Needed:</strong> Property Detail "Book Now" button · Admin PM approval page · PM Dashboard auth check
            </div>
          </S>

          <S title="06 · Key Decisions">
            <R label="No public reviews" value="Internal admin scores only — quality control" />
            <R label="Zero commission" value="Subscription model only — competitive advantage" />
            <R label="Price hidden" value="Register to see prices — lead generation" />
            <R label="Post-based pricing" value="1 post = property OR car — simple" />
            <R label="Admin via URL" value="/admin direct URL — not in nav" />
            <R label="Map later" value="Collect lat/lng now — show Phase 10" />
            <R label="Feature flags" value="DB-controlled tabs — no code changes" />
            <R label="6 languages" value="EN · AR · RU · UK · DE · IT" />
          </S>

          <S title="07 · Tech Stack">
            <R label="Framework" value="Next.js 16.2 · App Router · TypeScript · Tailwind v4" />
            <R label="Database" value="Supabase · PostgreSQL · RLS" />
            <R label="Auth" value="@supabase/ssr · createClient wrapper" />
            <R label="Payments" value="Stripe v22 (apiVersion: 2026-04-22.dahlia)" />
            <R label="i18n" value="next-intl · 6 locales · proxy.ts" />
            <R label="Email" value="Resend API" />
            <R label="AI" value="Claude Haiku — review/description/translation" />
            <R label="Storage" value="Supabase Storage · 4 buckets · browser compression" />
          </S>

          <S title="08 · Database Schema (Current)">
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#7a8aaa', lineHeight: 1.8 }}>
              <p>✅ properties (platform_managed, calendar_blocked_dates JSONB, price_hidden)</p>
              <p>✅ bookings (stripe_payment_intent_id, is_platform_managed, guest_phone)</p>
              <p>✅ profiles (role, subscription_type, property_ids array)</p>
              <p>✅ property_manager_profiles (status: pending_approval/approved/rejected)</p>
              <p>✅ cars (calendar_blocked_dates, internal_score)</p>
              <p>✅ flash_deals (property_id, expires_at, claimed_by)</p>
              <p>✅ feature_flags (key, enabled)</p>
            </div>
          </S>

          <S title="09 · Immediate Next Steps">
            {[
              {n:1,t:'Finish Phase 7',w:'Add Book Now button to Property Detail'},
              {n:2,t:'Admin PM Approval',w:'Create admin/property-managers page'},
              {n:3,t:'PM Dashboard Auth',w:'Check status=approved before showing dashboard'},
              {n:4,t:'About/Contact/Privacy',w:'Footer links still broken'},
              {n:5,t:'Phase 8: Services',w:'Tours, coaches, cleaning, transport marketplace'},
            ].map((x,i) => <Task key={i} {...x} />)}
          </S>

          <S title="10 · Marketing Strategy">
            <R label="Positioning" value="Only Sharm platform built by locals — zero commission" />
            <R label="Launch" value="First 50 owners at EGP 600 (50% off)" />
            <R label="SEO" value="6-language pages indexed — RU, DE, IT, EN, AR, UK" />
            <R label="Social" value="Instagram + TikTok — property tours, lifestyle" />
            <R label="Outreach" value="WhatsApp to owners — live in 48h" />
            <R label="Expansion" value="Sharm → Hurghada → North Coast → Egypt" />
          </S>

          <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(212,168,67,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#D4A843', fontStyle: 'italic' }}>DREDOTT</p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#7a8aaa', letterSpacing: '0.2em', textTransform: 'uppercase' }}>MASTER PLAN · MAY 2026</p>
          </div>
        </div>
      </div>
    </>
  )
}

function S({title,children}:any){return <div style={{marginBottom:36}}><div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16,paddingBottom:10,borderBottom:'1px solid rgba(212,168,67,0.15)'}}><span style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10,color:'#D4A843',letterSpacing:'0.2em',textTransform:'uppercase'}}>{title}</span></div><div>{children}</div></div>}
function R({label,value,h}:any){return <div style={{display:'flex',gap:20,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}><span style={{width:180,flexShrink:0,fontSize:12,color:'#7a8aaa',fontFamily:"'JetBrains Mono', monospace"}}>{label}</span><span style={{fontSize:13,color:h?'#D4A843':'rgba(255,255,255,0.8)',fontWeight:h?700:400}}>{value}</span></div>}
function N({children}:any){return <p style={{fontSize:11,color:'#7a8aaa',marginTop:10,fontStyle:'italic'}}>{children}</p>}
function Ph({p,s,t,d}:any){return <div style={{borderLeft:`3px solid ${s==='done'?'#4ade80':s==='next'?'#D4A843':s==='planned'?'#60a5fa':'#7a8aaa'}`,padding:'14px 20px',background:'rgba(255,255,255,0.03)',borderRadius:'0 10px 10px 0',marginBottom:10}}><div style={{display:'flex',alignItems:'center',gap:12,marginBottom:4}}><span style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10,color:'#7a8aaa',flexShrink:0}}>{p}</span><span style={{fontSize:14,fontWeight:600,color:'#FBF0D0'}}>{t}</span><span style={{fontSize:9,padding:'2px 8px',borderRadius:20,fontFamily:"'JetBrains Mono', monospace",letterSpacing:'0.1em',textTransform:'uppercase',background:s==='done'?'rgba(74,222,128,0.1)':s==='next'?'rgba(212,168,67,0.1)':s==='planned'?'rgba(96,165,250,0.1)':'rgba(122,138,170,0.1)',color:s==='done'?'#4ade80':s==='next'?'#D4A843':s==='planned'?'#60a5fa':'#7a8aaa',border:`1px solid ${s==='done'?'rgba(74,222,128,0.2)':s==='next'?'rgba(212,168,67,0.2)':s==='planned'?'rgba(96,165,250,0.2)':'rgba(122,138,170,0.2)'}`}}>{s}</span></div><p style={{fontSize:12,color:'#7a8aaa',lineHeight:1.6}}>{d}</p></div>}
function Task({n,t,w}:any){return <div style={{display:'flex',gap:14,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}><span style={{width:24,height:24,borderRadius:'50%',background:'rgba(212,168,67,0.1)',border:'1px solid rgba(212,168,67,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#D4A843',fontWeight:700,flexShrink:0}}>{n}</span><div><p style={{fontSize:13,color:'#FBF0D0',fontWeight:500}}>{t}</p><p style={{fontSize:11,color:'#7a8aaa',marginTop:2}}>{w}</p></div></div>}