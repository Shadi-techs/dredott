import { notFound } from 'next/navigation'
 
import BookingClient from '@/components/booking/BookingClient'
import { createClient } from '@/lib/supabase/server'

interface BookingPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ property?: string }>
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { locale } = await params
  const { property: propertyId } = await searchParams

  if (!propertyId) notFound()

  const supabase = await createClient()
  const { data: property } = await supabase
    .from('properties')
    .select('id, name, slug, area, price_per_night, price_per_week, price_per_month, price_per_3months, price_per_6months, utilities_per_month, photos, max_guests')
    .eq('id', propertyId)
    .eq('status', 'available')
    .single()

  if (!property) notFound()

  return (
    <div className="min-h-screen flex flex-col">
        
      <BookingClient property={property} />
    </div>
  )
}
