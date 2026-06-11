// src/app/[locale]/stays/claim/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { calculatePropertyScore } from '@/lib/review-scoring';

export default function ClaimPropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const subscriptionId = searchParams.get('subscription_id');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    neighborhood: '',
    price_per_night: '',
    bedrooms: 1,
    bathrooms: 1,
    area: '',
    photos: [] as string[],
    amenities: [] as string[],
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // التحقق من صحة الاشتراك وجلب بياناته
  useEffect(() => {
    const checkSubscription = async () => {
      if (!subscriptionId) {
        router.push(`/${locale}/pricing`);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login?redirect=/${locale}/stays/claim?subscription_id=${subscriptionId}`);
        return;
      }

      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .eq('user_id', user.id)
        .single();

      if (subError || !sub || sub.status !== 'pending_claim') {
        setError('Invalid or expired subscription. Please purchase a new plan.');
        setTimeout(() => router.push(`/${locale}/pricing`), 2000);
      } else {
        setSubscription(sub);
      }
      setLoading(false);
    };

    checkSubscription();
  }, [subscriptionId, router, locale, supabase]);

  // التحقق من صحة البيانات قبل الإرسال (نظام الـ 70%)
  const validateForm = () => {
    const propertyForScore = {
      name: formData.name,
      description: formData.description,
      city: formData.city,
      price_per_night: parseFloat(formData.price_per_night) || 0,
      photos: formData.photos,
      amenities: formData.amenities,
    };
    const scoreResult = calculatePropertyScore(propertyForScore, locale as 'ar' | 'en');
    if (!scoreResult.isPass) {
      setScoreError(
        locale === 'ar'
          ? `العقار لا يستوفي الحد الأدنى (${scoreResult.score}%). المطلوب: ${scoreResult.missing.join(', ')}`
          : `Property does not meet minimum score (${scoreResult.score}%). Missing: ${scoreResult.missing.join(', ')}`
      );
      return false;
    }
    setScoreError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setScoreError(null);

    // 1. التحقق من scoring
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // إدراج العقار
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          name: formData.name,
          description: formData.description,
          city: formData.city,
          neighborhood: formData.neighborhood || null,
          price_per_night: parseInt(formData.price_per_night),
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          area: parseInt(formData.area) || null,
          photos: formData.photos,
          amenities: formData.amenities,
          owner_user_id: user.id,
          status: 'pending_review',
          subscription_id: subscription.id, // تأكد من وجود هذا العمود في جدول properties
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      // تحديث حالة الاشتراك إلى active
      await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('id', subscription.id);

      // إرسال إشعار للمالك
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'property_submitted',
        title: locale === 'ar' ? 'تم إرسال العقار للمراجعة' : 'Property submitted for review',
        message: locale === 'ar'
          ? 'سيتم مراجعة عقارك من قبل الإدارة قريباً'
          : 'Your property will be reviewed by the admin shortly.',
      });

      router.push(`/${locale}/owner/dashboard?message=property_pending`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit property');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-navy">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  const isRtl = locale === 'ar';

  return (
    <div className="min-h-screen bg-cream py-12" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-3xl px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-navy text-center mb-2">
            {isRtl ? 'أضف عقارك' : 'List Your Property'}
          </h1>
          <p className="text-gray-500 text-center mb-8">
            {isRtl
              ? 'أكمل اشتراكك بإضافة عقارك الأول'
              : 'Complete your subscription by adding your first property'}
          </p>

          {/* عرض أخطاء الـ score */}
          {scoreError && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
              {scoreError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اسم العقار */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                {isRtl ? 'اسم العقار *' : 'Property Name *'}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                placeholder={isRtl ? 'مثال: فيلا على البحر' : 'e.g., Beachfront Villa'}
              />
            </div>

            {/* الوصف */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                {isRtl ? 'الوصف *' : 'Description *'}
              </label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                placeholder={isRtl
                  ? 'وصف مفصل (300 حرف على الأقل)'
                  : 'Detailed description (minimum 300 characters)'}
              />
            </div>

            {/* المدينة والحي */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  {isRtl ? 'المدينة *' : 'City *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder={isRtl ? 'مثال: شرم الشيخ' : 'e.g., Sharm El Sheikh'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  {isRtl ? 'الحي' : 'Neighborhood'}
                </label>
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder={isRtl ? 'مثال: نعمة باي' : 'e.g., Naama Bay'}
                />
              </div>
            </div>

            {/* السعر والغرف والحمامات والمساحة */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  {isRtl ? 'السعر لليلة (ج.م) *' : 'Price / night (EGP) *'}
                </label>
                <input
                  type="number"
                  required
                  value={formData.price_per_night}
                  onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="1200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  {isRtl ? 'غرف نوم' : 'Bedrooms'}
                </label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  {isRtl ? 'حمامات' : 'Bathrooms'}
                </label>
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  {isRtl ? 'المساحة (م²)' : 'Area (sqm)'}
                </label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="120"
                />
              </div>
            </div>

            {/* الخدمات (Amenities) */}
            <div>
              <label className="block text-sm font-medium text-navy mb-2">
                {isRtl ? 'الخدمات' : 'Amenities'}
              </label>
              <div className="flex flex-wrap gap-3">
                {['WiFi', 'AC', 'Parking', 'Pool', 'Kitchen', 'TV', 'Sea View', 'Elevator'].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
                        } else {
                          setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity) });
                        }
                      }}
                      className="rounded text-gold focus:ring-gold"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* صور (روابط) */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                {isRtl ? 'روابط الصور (مفصولة بفواصل)' : 'Photo URLs (comma separated)'}
              </label>
              <input
                type="text"
                placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                onChange={(e) => setFormData({ ...formData, photos: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-400 mt-1">
                {isRtl ? 'يُفضل 5 صور على الأقل' : 'At least 5 photos recommended'}
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold hover:bg-gold/90 text-navy font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {submitting
                ? (isRtl ? 'جاري الإرسال...' : 'Submitting...')
                : (isRtl ? 'إرسال العقار' : 'Submit Property')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}