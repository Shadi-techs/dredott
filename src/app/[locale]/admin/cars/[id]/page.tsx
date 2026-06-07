'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Car, User, MapPin, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react'

export default function AdminCarDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params)
  const router = useRouter()
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/cars/${id}`)
      .then(r => r.json())
      .then(d => { setCar(d.car); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
  if (!car) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Car not found</div>

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Review
      </button>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        
        {/* Photos */}
        {car.photos?.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, maxHeight: 300, overflow: 'hidden' }}>
            {car.photos.slice(0, 3).map((photo: string, i: number) => (
              <img key={i} src={photo} alt="" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
            ))}
          </div>
        )}

        <div style={{ padding: 24 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2240', margin: '0 0 4px' }}>{car.name}</h1>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>{car.brand} {car.model} · {car.year}</p>
            </div>
            <span style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: car.review_status === 'pending_review' ? '#FEF3C7' : car.review_status === 'approved' ? '#D1FAE5' : '#FEE2E2', color: car.review_status === 'pending_review' ? '#92400E' : car.review_status === 'approved' ? '#065F46' : '#991B1B' }}>
              {car.review_status}
            </span>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: '#F4F6FA', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.1em', margin: '0 0 8px' }}>CAR DETAILS</p>
              <p style={{ fontSize: 13, color: '#1a2240', margin: '0 0 6px' }}>🚗 {car.brand} {car.model} {car.year}</p>
              <p style={{ fontSize: 13, color: '#1a2240', margin: '0 0 6px' }}>⚙️ {car.transmission} · {car.fuel_type}</p>
              <p style={{ fontSize: 13, color: '#1a2240', margin: 0 }}>💺 {car.seats} seats</p>
            </div>
            <div style={{ background: '#F4F6FA', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.1em', margin: '0 0 8px' }}>PRICING</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#D4A843', margin: '0 0 4px' }}>EGP {car.price_per_day}/day</p>
              {car.price_per_month && <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>EGP {car.price_per_month}/month</p>}
            </div>
          </div>

          {/* Owner */}
          {car.owner && (
            <div style={{ background: '#F4F6FA', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.1em', margin: '0 0 8px' }}>OWNER</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2240', margin: '0 0 4px' }}>{car.owner.first_name} {car.owner.last_name}</p>
              {car.owner.phone && <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>📞 {car.owner.phone}</p>}
            </div>
          )}

          {/* Description */}
          {car.description && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.1em', margin: '0 0 8px' }}>DESCRIPTION</p>
              <p style={{ fontSize: 14, color: '#1a2240', lineHeight: 1.7, margin: 0 }}>{car.description}</p>
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
