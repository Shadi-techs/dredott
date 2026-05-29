// src/lib/review-scoring.ts
// نظام تقييم العقار – 70% minimum مع قائمة بالأخطاء / التحذيرات

export interface ScoringResult {
  score: number;           // 0-100
  isPass: boolean;         // true if score >= 70
  missing: string[];       // قائمة بالعناصر الناقصة (رسائل للمستخدم)
  details: {               // تفصيل لكل معيار
    criteria: string;
    points: number;
    maxPoints: number;
    passed: boolean;
    message?: string;
  }[];
}

export interface PropertyData {
  name: string;
  description: string;
  city: string;
  neighborhood?: string;
  price_per_night: number;
  photos: string[];
  amenities: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  // يمكن إضافة حقول أخرى حسب الحاجة
}

/**
 * حساب درجة اكتمال العقار بناءً على قواعد ثابتة
 * @param property بيانات العقار
 * @param locale اللغة لعرض الرسائل ('ar' أو 'en')
 * @returns ScoringResult
 */
export function calculatePropertyScore(property: PropertyData, locale: 'ar' | 'en' = 'en'): ScoringResult {
  const weights = [
    {
      criteria: 'photos',
      maxPoints: 20,
      check: (p: PropertyData) => p.photos?.length >= 5,
      getMessage: () => (locale === 'ar' ? 'ارفع 5 صور على الأقل' : 'Upload at least 5 photos'),
    },
    {
      criteria: 'description',
      maxPoints: 20,
      check: (p: PropertyData) => p.description?.length >= 300,
      getMessage: () => (locale === 'ar' ? 'الوصف يجب أن يزيد عن 300 حرف' : 'Description must be 300+ characters'),
    },
    {
      criteria: 'amenities',
      maxPoints: 15,
      check: (p: PropertyData) => p.amenities?.length >= 4,
      getMessage: () => (locale === 'ar' ? 'اختر 4 خدمات على الأقل' : 'Select at least 4 amenities'),
    },
    {
      criteria: 'price',
      maxPoints: 15,
      check: (p: PropertyData) => p.price_per_night > 0 && p.price_per_night < 100000,
      getMessage: () => (locale === 'ar' ? 'حدد سعر لليلة بقيمة معقولة' : 'Set a valid price per night'),
    },
    {
      criteria: 'location',
      maxPoints: 15,
      check: (p: PropertyData) => !!p.city && p.city.trim().length > 0,
      getMessage: () => (locale === 'ar' ? 'حدد المدينة' : 'Select a city'),
    },
    {
      criteria: 'title',
      maxPoints: 15,
      check: (p: PropertyData) => p.name?.length >= 20,
      getMessage: () => (locale === 'ar' ? 'عنوان العقار يجب أن يكون 20 حرفاً أو أكثر' : 'Property title must be at least 20 characters'),
    },
  ];

  let totalPoints = 0;
  const details: ScoringResult['details'] = [];
  const missing: string[] = [];

  for (const w of weights) {
    const passed = w.check(property);
    const points = passed ? w.maxPoints : 0;
    totalPoints += points;
    details.push({
      criteria: w.criteria,
      points,
      maxPoints: w.maxPoints,
      passed,
      message: !passed ? w.getMessage() : undefined,
    });
    if (!passed) missing.push(w.getMessage());
  }

  const score = totalPoints; // already out of 100
  const isPass = score >= 70;

  return {
    score,
    isPass,
    missing,
    details,
  };
}

/**
 * نسخة مبسطة تعيد فقط النسبة المئوية وقائمة الأخطاء (للاستخدام السريع)
 */
export function getPropertyScoreAndErrors(property: PropertyData, locale: 'ar' | 'en' = 'en') {
  const result = calculatePropertyScore(property, locale);
  return {
    score: result.score,
    isPass: result.isPass,
    errors: result.missing,
  };
}