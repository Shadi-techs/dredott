'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function AdminPropertyDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params)
  const router = useRouter()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/properties/${id}`)
      .then(r => r.json())
      .then(d => { setProperty(d.property); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
  if (!property) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Property not found</div>

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Review
      </button>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>

        {/* Photos */}
        {property.photos?.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {property.photos.slice(0, 3).map((photo: string, i: number) => (
              <img key={i} src={photo} alt="" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
            ))}
          </div>
        )}

        <div style={{ padding: 24 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2240', margin: '0 0 4px' }}>{property.name}</h1>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>{property.type} · {property.area?.replace('_', ' ')}</p>
            </div>
            <span style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: property.review_status === 'pending_review' ? '#FEF3C7' : property.review_status === 'approved' ? '#D1FAE5' : '#FEE2E2', color: property.review_status === 'pending_review' ? '#92400E' : property.review_status === 'approved' ? '#065F46' : '#991B1B' }}>
              {property.review_status}
            </span>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: '#F4F6FA', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.1em', margin: '0 0 8px' }}>PROPERTY DETAILS</p>
              <p style={{ fontSize: 13, color: '#1a2240', margin: '0 0 6px' }}>🛏 {property.bedrooms} bedrooms · 🚿 {property.bathrooms} bathrooms</p>
              <p style={{ fontSize: 13, color: '#1a2240', margin: '0 0 6px' }}>👥 Max {property.max_guests} guests</p>
              {property.size_sqm && <p style={{ fontSize: 13, color: '#1a2240', margin: 0 }}>📐 {property.size_sqm} sqm</p>}
            </div>
            <div style={{ background: '#F4F6FA', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.1em', margin: '0 0 8px' }}>PRICING</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#D4A843', margin: '0 0 4px' }}>EGP {property.price_per_night}/night</p>
              {property.price_per_week && <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 4px' }}>EGP {property.price_per_week}/week</p>}
              {property.price_per_month && <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>EGP {property.price_per_month}/month</p>}
            </div>
          </div>

          {/* Owner */}
          {property.owner && (
            <div style={{ background: '#F4F6FA', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.1em', margin: '0 0 8px' }}>OWNER</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2240', margin: '0 0 4px' }}>{property.owner.first_name} {property.owner.last_name}</p>
              {property.owner.phone && <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 4px' }}>📞 {property.owner.phone}</p>}
              {property.owner.email && <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>✉️ {property.owner.email}</p>}
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.1em', margin: '0 0 8px' }}>DESCRIPTION</p>
              <p style={{ fontSize: 14, color: '#1a2240', lineHeight: 1.7, margin: 0 }}>{property.description}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            <button onClick={() => router.push(`/${locale}/admin/review`)} style={{ padding: '10px 20px', background: '#0e1428', color: '#D4A843', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Go to Review Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
