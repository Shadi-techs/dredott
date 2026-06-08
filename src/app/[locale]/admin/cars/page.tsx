'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Car, Search, Eye, CheckCircle, Clock, XCircle,
  Settings, ChevronRight, TrendingUp, Users,
  Moon, Sun, Filter, RefreshCw
} from 'lucide-react'

const TX = {
  en: {
    title: 'Cars Management',
    subtitle: 'Manage all car listings',
    total: 'Total Cars',
    approved: 'Approved',
    pending: 'Pending Review',
    rejected: 'Rejected',
    field_config: 'Field Configuration',
    field_config_sub: 'Active fields & payment methods',
    active_fields: 'Active Fields',
    required_fields: 'Required Fields',
    owner_fields: 'Owner Controls',
    view_more: 'View More',
    search: 'Search by brand, model, owner...',
    all: 'All',
    status: 'Status',
    owner: 'Owner',
    no_cars: 'No cars found',
    view: 'View',
    recent: 'Recent Submissions',
    top: 'Top Rated',
    payment: 'Payment Methods Enabled',
  },
  ar: {
    title: 'إدارة السيارات',
    subtitle: 'إدارة كل إعلانات السيارات',
    total: 'إجمالي السيارات',
    approved: 'معتمدة',
    pending: 'قيد المراجعة',
    rejected: 'مرفوضة',
    field_config: 'إعدادات الحقول',
    field_config_sub: 'الحقول النشطة وطرق الدفع',
    active_fields: 'حقول مفعّلة',
    required_fields: 'حقول إلزامية',
    owner_fields: 'تحكم المالك',
    view_more: 'عرض المزيد',
    search: 'البحث بالماركة أو الموديل...',
    all: 'الكل',
    status: 'الحالة',
    owner: 'المالك',
    no_cars: 'لا توجد سيارات',
    view: 'عرض',
    recent: 'أحدث الإضافات',
    top: 'الأعلى تقييماً',
    payment: 'طرق الدفع المفعّلة',
  }
}

export default function AdminCarsPage() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const tx = TX[locale as keyof typeof TX] || TX.en
  const isAr = locale === 'ar'
  const router = useRouter()

  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 })
  const [cars, setCars] = useState<any[]>([])
  const [fieldConfig, setFieldConfig] = useState({ active: 0, required: 0, ownerToggle: 0, payments: [] as string[] })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [dark, setDark] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const c = {
    bg: dark ? '#080d1a' : '#F4F6FA',
    card: dark ? '#0e1428' : '#fff',
    card2: dark ? '#1a2240' : '#F8F9FB',
    border: dark ? 'rgba(212,168,67,0.12)' : '#e5e7eb',
    text: dark ? '#FBF0D0' : '#1a2240',
    sub: dark ? '#6B7280' : '#9CA3AF',
    gold: '#D4A843',
    navy: '#2C3A6B',
  }

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => { fetchAll() }, [filter])

  const fetchAll = async () => {
    setLoading(true)
    try {
      // Stats
      const [total, approved, pending, rejected] = await Promise.all([
        fetch('/api/admin/cars/stats?type=total').then(r => r.json()),
        fetch('/api/admin/cars/stats?type=approved').then(r => r.json()),
        fetch('/api/admin/cars/stats?type=pending').then(r => r.json()),
        fetch('/api/admin/cars/stats?type=rejected').then(r => r.json()),
      ])
      setStats({
        total: total.count || 0,
        approved: approved.count || 0,
        pending: pending.count || 0,
        rejected: rejected.count || 0,
      })

      // Cars list
      const carsRes = await fetch(`/api/admin/cars/list?status=${filter}`)
      if (carsRes.ok) {
        const data = await carsRes.json()
        setCars(data.cars || [])
      }

      // Field config summary
      const fcRes = await fetch('/api/admin/field-config?section=cars')
      if (fcRes.ok) {
        const data = await fcRes.json()
        const fields = data.fields || []
        setFieldConfig({
          active: fields.filter((f: any) => f.is_enabled).length,
          required: fields.filter((f: any) => f.is_required).length,
          ownerToggle: fields.filter((f: any) => f.owner_can_toggle).length,
          payments: fields.filter((f: any) => f.field_key.startsWith('payment') && f.is_enabled).map((f: any) => f.label_en),
        })
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const filteredCars = cars.filter(c =>
    c.brand?.toLowerCase().includes(search.toLowerCase()) ||
    c.model?.toLowerCase().includes(search.toLowerCase()) ||
    c.owner?.first_name?.toLowerCase().includes(search.toLowerCase())
  )

  const StatWidget = ({ label, value, icon, color }: any) => (
    <div style={{ background: c.card, borderRadius: 14, border: `1px solid ${c.border}`, padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 28, fontWeight: 700, color: c.text, margin: '0 0 2px', fontFamily: "'Cormorant Garamond', serif" }}>{value}</p>
        <p style={{ fontSize: 12, color: c.sub, margin: 0 }}>{label}</p>
      </div>
    </div>
  )

  const statusBadge = (status: string) => {
    const map: Record<string, any> = {
      approved: { bg: '#D1FAE5', color: '#065F46', label: isAr ? 'معتمد' : 'Approved' },
      pending_review: { bg: '#FEF3C7', color: '#92400E', label: isAr ? 'قيد المراجعة' : 'Pending' },
      rejected: { bg: '#FEE2E2', color: '#991B1B', label: isAr ? 'مرفوض' : 'Rejected' },
    }
    const s = map[status] || { bg: '#F3F4F6', color: '#6B7280', label: status }
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
  }

  return (
    <div style={{ minHeight: '100vh', background: c.bg, direction: isAr ? 'rtl' : 'ltr', transition: 'all 0.2s' }}>
      
      {/* Page Header */}
      <div style={{ background: c.card, borderBottom: `1px solid ${c.border}`, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', color: c.sub, fontFamily: 'monospace', margin: '0 0 4px' }}>ADMIN · {isAr ? 'السيارات' : 'CARS'}</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: c.text, margin: 0 }}>{tx.title}</h1>
          <p style={{ fontSize: 13, color: c.sub, margin: '4px 0 0' }}>{tx.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDark(!dark)} style={{ padding: '8px 12px', background: c.card2, border: `1px solid ${c.border}`, borderRadius: 8, cursor: 'pointer', color: c.text, display: 'flex', alignItems: 'center' }}>
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={fetchAll} style={{ padding: '8px 12px', background: c.card2, border: `1px solid ${c.border}`, borderRadius: 8, cursor: 'pointer', color: c.text, display: 'flex', alignItems: 'center' }}>
            <RefreshCw size={15} />
          </button>
          <button onClick={() => router.push(`/${locale}/admin/review`)} style={{ padding: '8px 16px', background: c.gold, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0e1428', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} /> {stats.pending > 0 ? `${stats.pending} ${tx.pending}` : tx.pending}
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatWidget label={tx.total} value={stats.total} icon="🚗" color="#2C3A6B" />
          <StatWidget label={tx.approved} value={stats.approved} icon="✅" color="#2A9D8F" />
          <StatWidget label={tx.pending} value={stats.pending} icon="⏳" color="#D4A843" />
          <StatWidget label={tx.rejected} value={stats.rejected} icon="❌" color="#ef4444" />
        </div>

        {/* Second Row — Field Config Widget + Payment */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 24 }}>
          
          {/* Field Config Widget */}
          <div style={{ background: c.card, borderRadius: 14, border: `1px solid ${c.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FBF0D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Settings size={16} color={c.gold} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>{tx.field_config}</p>
                  <p style={{ fontSize: 11, color: c.sub, margin: 0 }}>{tx.field_config_sub}</p>
                </div>
              </div>
              <button onClick={() => router.push(`/${locale}/admin/field-config?section=cars`)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: c.card2, border: `1px solid ${c.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, color: c.gold, fontWeight: 600 }}>
                {tx.view_more} <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { label: tx.active_fields, value: fieldConfig.active, color: c.gold },
                { label: tx.required_fields, value: fieldConfig.required, color: '#ef4444' },
                { label: tx.owner_fields, value: fieldConfig.ownerToggle, color: '#2A9D8F' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '12px', background: c.card2, borderRadius: 10 }}>
                  <p style={{ fontSize: 28, fontWeight: 700, color: item.color, margin: '0 0 4px', fontFamily: "'Cormorant Garamond', serif" }}>{item.value}</p>
                  <p style={{ fontSize: 11, color: c.sub, margin: 0 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods Widget */}
          <div style={{ background: c.card, borderRadius: 14, border: `1px solid ${c.border}`, padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💳</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>{tx.payment}</p>
            </div>
            {fieldConfig.payments.length === 0 ? (
              <p style={{ fontSize: 13, color: c.sub }}>{isAr ? 'لا توجد طرق دفع مفعّلة' : 'No payment methods enabled'}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {fieldConfig.payments.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: c.card2, borderRadius: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2A9D8F' }} />
                    <span style={{ fontSize: 13, color: c.text }}>{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cars List */}
        <div style={{ background: c.card, borderRadius: 14, border: `1px solid ${c.border}`, overflow: 'hidden' }}>
          
          {/* List Header */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: c.sub }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tx.search}
                style={{ width: '100%', padding: '8px 12px 8px 36px', background: c.card2, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 13, color: c.text, outline: 'none', boxSizing: 'border-box' as const }} />
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['all', 'approved', 'pending_review', 'rejected'].map(s => (
                <button key={s} onClick={() => setFilter(s)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: filter === s ? 600 : 400, background: filter === s ? c.gold : c.card2, color: filter === s ? '#0e1428' : c.sub }}>
                  {s === 'all' ? tx.all : s === 'pending_review' ? tx.pending : s === 'approved' ? tx.approved : tx.rejected}
                </button>
              ))}
            </div>
          </div>

          {/* Cars Table/Cards */}
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: c.sub }}>Loading...</div>
          ) : filteredCars.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🚗</p>
              <p style={{ color: c.sub, fontSize: 14 }}>{tx.no_cars}</p>
            </div>
          ) : isMobile ? (
            // Mobile Cards
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredCars.map(car => (
                <div key={car.id} style={{ background: c.card2, borderRadius: 12, border: `1px solid ${c.border}`, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: c.text, margin: '0 0 2px' }}>{car.brand} {car.model} {car.year}</p>
                      <p style={{ fontSize: 12, color: c.sub, margin: 0 }}>{car.owner?.first_name} {car.owner?.last_name}</p>
                    </div>
                    {statusBadge(car.review_status)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: c.gold, fontWeight: 600 }}>EGP {car.price_per_day}/day</span>
                    <button onClick={() => router.push(`/${locale}/admin/cars/${car.id}`)} style={{ padding: '6px 12px', background: c.navy, color: c.gold, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>{tx.view}</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop Table
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: c.card2 }}>
                  {['Car', 'Owner', 'Price', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: isAr ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: c.sub, fontFamily: 'monospace', letterSpacing: '0.1em' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCars.map(car => (
                  <tr key={car.id} style={{ borderTop: `1px solid ${c.border}` }} onMouseEnter={e => e.currentTarget.style.background = c.card2} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {car.photos?.[0] ? <img src={car.photos[0]} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} /> : <div style={{ width: 40, height: 40, borderRadius: 8, background: c.card2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚗</div>}
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: c.text, margin: '0 0 2px' }}>{car.brand} {car.model}</p>
                          <p style={{ fontSize: 11, color: c.sub, margin: 0, fontFamily: 'monospace' }}>{car.year} · {car.transmission}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: c.text }}>{car.owner?.first_name} {car.owner?.last_name || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: c.gold }}>EGP {car.price_per_day?.toLocaleString()}</span>
                      <span style={{ fontSize: 11, color: c.sub }}>/day</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{statusBadge(car.review_status)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => router.push(`/${locale}/admin/cars/${car.id}`)} style={{ padding: '6px 14px', background: 'none', border: `1px solid ${c.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, color: c.gold, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={13} /> {tx.view}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
