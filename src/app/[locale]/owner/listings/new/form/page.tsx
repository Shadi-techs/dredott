// ============================================
// Listing Form — DREDOTT
// Path: src/app/[locale]/owner/listings/new/form/page.tsx
// ============================================

'use client'

import { use, useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Upload, X, AlertCircle, CheckCircle,
  MapPin, DollarSign, Home, Car, Calendar,
} from 'lucide-react'
import { CAR_BRANDS, BRAND_NAMES } from '@/lib/car-data'
import { toast } from '@/components/owner/Toast'

const supabase = createClient()

// ── Translations ───────────────────────────────────────────
const TX: Record<string, Record<string, string>> = {
  en: {
    addProperty: 'Add Property',
    addCar: 'Add Car Rental',
    subtitle: 'Fill in the details below. Your listing will be reviewed within 24-48 hours.',
    photos: 'Photos',
    photoMin: '* (Minimum 1)',
    photoOptional: '(optional)',
    uploading: 'Uploading...',
    clickUpload: 'Click to upload photos',
    basicInfo: 'Basic Information',
    title: 'Title',
    titlePropPlaceholder: 'e.g. Cozy Apartment in Naama Bay',
    titleCarPlaceholder: 'e.g. Toyota Corolla 2023',
    description: 'Description',
    descOptional: '(optional)',
    propertyDetails: 'Property Details',
    area: 'Area',
    selectArea: 'Select area',
    type: 'Type',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    maxGuests: 'Max Guests',
    sizeSqm: 'Size (sqm)',
    priceNight: 'Price per Night (EGP)',
    carDetails: 'Car Details',
    listingType: 'Listing Type',
    forRent: '🚗 For Rent',
    forSale: '🏷️ For Sale (coming soon)',
    brand: 'Brand',
    selectBrand: 'Select brand...',
    model: 'Model',
    selectModel: 'Select model...',
    otherModel: 'Other (specify below)',
    enterModel: 'Enter model name',
    year: 'Year',
    transmission: 'Transmission',
    automatic: 'Automatic',
    manual: 'Manual',
    fuelType: 'Fuel Type',
    petrol: 'Petrol',
    diesel: 'Diesel',
    electric: 'Electric',
    hybrid: 'Hybrid',
    seats: 'Seats',
    dailyRate: 'Daily Rate (EGP)',
    monthlyRate: 'Monthly Rate (EGP)',
    submit: 'Submit for Review',
    submitting: 'Submitting...',
    cancel: 'Cancel',
    reviewProcess: 'Review Process',
    reviewInfo: "Your listing will be reviewed by our team within 24-48 hours. You'll receive a notification once it's approved or if changes are needed.",
    namaaArea: 'Naama Bay',
    sharksArea: 'Sharks Bay',
    nabqArea: 'Nabq Bay',
    oldMarketArea: 'Old Market',
    hadabaArea: 'Hadaba',
    montazahArea: 'Montazah',
    rasUmSid: 'Ras Um Sid',
    apartment: 'Apartment',
    villa: 'Villa',
    studio: 'Studio',
    chalet: 'Chalet',
  },
  ar: {
    addProperty: 'إضافة عقار',
    addCar: 'إضافة سيارة',
    subtitle: 'أدخل التفاصيل أدناه. سيتم مراجعة إعلانك خلال 24-48 ساعة.',
    photos: 'الصور',
    photoMin: '* (الحد الأدنى صورة واحدة)',
    photoOptional: '(اختياري)',
    uploading: 'جاري الرفع...',
    clickUpload: 'اضغط لرفع الصور',
    basicInfo: 'المعلومات الأساسية',
    title: 'العنوان',
    titlePropPlaceholder: 'مثال: شقة مريحة في نعمة باي',
    titleCarPlaceholder: 'مثال: تويوتا كورولا 2023',
    description: 'الوصف',
    descOptional: '(اختياري)',
    propertyDetails: 'تفاصيل العقار',
    area: 'المنطقة',
    selectArea: 'اختر المنطقة',
    type: 'النوع',
    bedrooms: 'غرف النوم',
    bathrooms: 'دورات المياه',
    maxGuests: 'أقصى عدد للضيوف',
    sizeSqm: 'المساحة (متر مربع)',
    priceNight: 'السعر لليلة (جنيه)',
    carDetails: 'تفاصيل السيارة',
    listingType: 'نوع الإعلان',
    forRent: '🚗 للإيجار',
    forSale: '🏷️ للبيع (قريباً)',
    brand: 'الماركة',
    selectBrand: 'اختر الماركة...',
    model: 'الموديل',
    selectModel: 'اختر الموديل...',
    otherModel: 'أخرى (حدد أدناه)',
    enterModel: 'أدخل اسم الموديل',
    year: 'سنة الصنع',
    transmission: 'ناقل الحركة',
    automatic: 'أوتوماتيك',
    manual: 'عادي',
    fuelType: 'نوع الوقود',
    petrol: 'بنزين',
    diesel: 'ديزل',
    electric: 'كهربائي',
    hybrid: 'هجين',
    seats: 'عدد المقاعد',
    dailyRate: 'السعر اليومي (جنيه)',
    monthlyRate: 'السعر الشهري (جنيه)',
    submit: 'إرسال للمراجعة',
    submitting: 'جاري الإرسال...',
    cancel: 'إلغاء',
    reviewProcess: 'عملية المراجعة',
    reviewInfo: 'سيتم مراجعة إعلانك من قِبَل فريقنا خلال 24-48 ساعة. ستتلقى إشعاراً عند الموافقة أو إذا كانت هناك تعديلات مطلوبة.',
    namaaArea: 'نعمة باي',
    sharksArea: 'شاركس باي',
    nabqArea: 'نبق باي',
    oldMarketArea: 'السوق القديم',
    hadabaArea: 'الحدبة',
    montazahArea: 'المنتزه',
    rasUmSid: 'رأس أم سيد',
    apartment: 'شقة',
    villa: 'فيلا',
    studio: 'استوديو',
    chalet: 'شاليه',
  },
  ru: {
    addProperty: 'Добавить объект',
    addCar: 'Добавить авто',
    subtitle: 'Заполните форму. Объявление будет проверено в течение 24-48 часов.',
    photos: 'Фотографии',
    photoMin: '* (минимум 1)',
    photoOptional: '(необязательно)',
    uploading: 'Загрузка...',
    clickUpload: 'Нажмите для загрузки фото',
    basicInfo: 'Основная информация',
    title: 'Название',
    titlePropPlaceholder: 'напр. Уютная квартира в Naama Bay',
    titleCarPlaceholder: 'напр. Toyota Corolla 2023',
    description: 'Описание',
    descOptional: '(необязательно)',
    propertyDetails: 'Детали объекта',
    area: 'Район',
    selectArea: 'Выберите район',
    type: 'Тип',
    bedrooms: 'Спальни',
    bathrooms: 'Ванные',
    maxGuests: 'Макс. гостей',
    sizeSqm: 'Площадь (кв.м)',
    priceNight: 'Цена за ночь (EGP)',
    carDetails: 'Детали автомобиля',
    listingType: 'Тип объявления',
    forRent: '🚗 В аренду',
    forSale: '🏷️ На продажу (скоро)',
    brand: 'Марка',
    selectBrand: 'Выберите марку...',
    model: 'Модель',
    selectModel: 'Выберите модель...',
    otherModel: 'Другое (укажите)',
    enterModel: 'Введите название модели',
    year: 'Год',
    transmission: 'Коробка передач',
    automatic: 'Автомат',
    manual: 'Механика',
    fuelType: 'Тип топлива',
    petrol: 'Бензин',
    diesel: 'Дизель',
    electric: 'Электро',
    hybrid: 'Гибрид',
    seats: 'Мест',
    dailyRate: 'Суточная ставка (EGP)',
    monthlyRate: 'Месячная ставка (EGP)',
    submit: 'Отправить на проверку',
    submitting: 'Отправка...',
    cancel: 'Отмена',
    reviewProcess: 'Процесс проверки',
    reviewInfo: 'Ваше объявление будет проверено нашей командой в течение 24-48 часов.',
    namaaArea: 'Naama Bay', sharksArea: 'Sharks Bay', nabqArea: 'Nabq Bay',
    oldMarketArea: 'Old Market', hadabaArea: 'Hadaba', montazahArea: 'Montazah', rasUmSid: 'Ras Um Sid',
    apartment: 'Квартира', villa: 'Вилла', studio: 'Студия', chalet: 'Шале',
  },
}

function t(locale: string, key: string): string {
  return TX[locale]?.[key] ?? TX.en[key] ?? key
}

// ── Form component (needs Suspense for useSearchParams) ─────
function ListingFormInner({ locale }: { locale: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') as 'property' | 'car'
  const isAr = locale === 'ar'

  const [slotCheck, setSlotCheck] = useState<{
    loaded: boolean
    allowed: boolean
    used: number
    max: number
    remaining: number
    packageName: string | null
    reason: string | null
  }>({ loaded: false, allowed: true, used: 0, max: 0, remaining: 0, packageName: null, reason: null })

  const [fieldConfig, setFieldConfig] = useState<Record<string, { is_enabled: boolean; is_required: boolean }>>({})
  const [loading, setLoading] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [submitError, setSubmitError] = useState('')
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    photos: [],
    // Property
    area: '',
    property_type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    size_sqm: '',
    price_per_night: '',
    // Car
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    transmission: 'automatic',
    fuel_type: 'petrol',
    seats: 5,
    price_per_day: '',
    price_per_month: '',
    listing_type: 'rental',
  })

  // Check slot limit
  useEffect(() => {
    fetch('/api/owner/check-limit')
      .then(r => r.json())
      .then(data => {
        setSlotCheck({
          loaded: true,
          allowed: data.allowed ?? false,
          used: data.used ?? 0,
          max: data.max ?? 0,
          remaining: data.remaining ?? 0,
          packageName: data.package ?? null,
          reason: data.reason ?? null,
        })
      })
      .catch(() => setSlotCheck(s => ({ ...s, loaded: true, allowed: false, reason: 'error' })))
  }, [])

  // Load field config
  useEffect(() => {
    if (!type) return
    const section = type === 'car' ? 'cars' : 'properties'
    fetch(`/api/admin/field-config?section=${section}`)
      .then(r => r.json())
      .then(data => {
        const config: Record<string, any> = {}
        ;(data.fields || []).forEach((f: any) => {
          config[f.field_key] = { is_enabled: f.is_enabled, is_required: f.is_required }
        })
        setFieldConfig(config)
      })
      .catch(() => {})
  }, [type])

  // Auto-save draft
  useEffect(() => {
    if (formData.name) {
      localStorage.setItem('listing_draft_' + type, JSON.stringify({ formData, photos }))
    }
  }, [formData, photos, type])

  // Load draft
  useEffect(() => {
    const draft = localStorage.getItem('listing_draft_' + type)
    if (draft) {
      try {
        const { formData: saved, photos: savedPhotos } = JSON.parse(draft)
        setFormData(saved)
        setPhotos(savedPhotos || [])
      } catch {}
    }
  }, [type])

  // Redirect if type missing
  useEffect(() => {
    if (!type || (type !== 'property' && type !== 'car')) {
      router.push(`/${locale}/owner/listings/new`)
    }
  }, [type, locale, router])

  const isFieldEnabled = (key: string) => fieldConfig[key]?.is_enabled !== false
  const isFieldRequired = (key: string) => fieldConfig[key]?.is_required === true

  // ── Photo upload ────────────────────────────────────────
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingPhotos(true)
    try {
      const uploadedUrls: string[] = []
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()
        const path = `listings/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('car-photos').upload(path, file)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('car-photos').getPublicUrl(path)
        uploadedUrls.push(publicUrl)
      }
      const merged = [...photos, ...uploadedUrls]
      setPhotos(merged)
      setFormData((prev: any) => ({ ...prev, photos: merged }))
    } catch (err: any) {
      toast.error(err.message || 'Unknown error', 'Photo upload failed')
    } finally {
      setUploadingPhotos(false)
    }
  }

  const removePhoto = (index: number) => {
    const next = photos.filter((_, i) => i !== index)
    setPhotos(next)
    setFormData((prev: any) => ({ ...prev, photos: next }))
  }

  // ── Submit ──────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const slug = (formData.name || type)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 60)
        + '-' + Date.now()

      if (type === 'property') {
        const { error } = await supabase.from('properties').insert({
          owner_id: user.id,
          slug,
          name: formData.name,
          description: formData.description || null,
          photos: photos,
          area: formData.area,
          type: formData.property_type,
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          max_guests: Number(formData.max_guests),
          size_sqm: formData.size_sqm ? parseFloat(formData.size_sqm) : null,
          price_per_night: parseFloat(formData.price_per_night),
          status: 'coming_soon',
          review_status: 'pending_review',
        })
        if (error) throw error

      } else {
        const { error } = await supabase.from('cars').insert({
          owner_id: user.id,
          slug,
          name: formData.name || `${formData.brand} ${formData.model}`,
          description: formData.description || null,
          photos: photos,
          brand: formData.brand,
          model: formData.model,
          year: Number(formData.year),
          transmission: formData.transmission,
          fuel_type: formData.fuel_type,
          seats: Number(formData.seats),
          price_per_day: parseFloat(formData.price_per_day),
          price_per_month: formData.price_per_month ? parseFloat(formData.price_per_month) : null,
          listing_type: formData.listing_type,
          status: 'coming_soon',
          review_status: 'pending_review',
        })
        if (error) throw error
      }

      // Clear draft
      localStorage.removeItem('listing_draft_' + type)

      // Notify admin
      await supabase.from('admin_notifications').insert({
        type: 'new_listing',
        title: type === 'property' ? 'New Property Pending Review' : 'New Car Pending Review',
        body: formData.name || `${formData.brand} ${formData.model}`,
        link: '/admin/review',
        read: false,
      }).then(() => {})

      toast.success('Listing submitted — under review!')
      router.push(`/${locale}/owner/listings?filter=pending`)

    } catch (err: any) {
      console.error('Submit error:', err)
      const msg = err.message || 'Submission failed. Please try again.'
      setSubmitError(msg)
      toast.error(msg, 'Submit failed')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A843] focus:border-transparent text-sm'
  const labelCls = `block text-sm font-medium text-gray-700 mb-1 ${isAr ? 'text-right' : ''}`

  return (
    <div className="min-h-screen bg-[#FAF9F6]" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            {type === 'property'
              ? <Home className="w-8 h-8 text-[#2C3A6B]" />
              : <Car className="w-8 h-8 text-[#D4A843]" />
            }
            <h1 className="text-2xl font-bold text-[#2C3A6B]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {type === 'property' ? t(locale, 'addProperty') : t(locale, 'addCar')}
            </h1>
          </div>
          <p className="text-sm text-gray-500">{t(locale, 'subtitle')}</p>
        </div>

        {/* Slot limit gate */}
        {!slotCheck.loaded ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4A843]" />
          </div>
        ) : !slotCheck.allowed ? (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-[#2C3A6B] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {slotCheck.reason === 'no_subscription'
                ? (isAr ? 'لا يوجد اشتراك نشط' : 'No Active Subscription')
                : slotCheck.reason === 'expired'
                ? (isAr ? 'انتهى اشتراكك' : 'Subscription Expired')
                : (isAr ? 'استنفدت كل الـ slots' : 'All Slots Used')}
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              {slotCheck.reason === 'no_subscription'
                ? (isAr
                    ? 'اشتري باقة لتبدأ في نشر عقاراتك وسياراتك'
                    : 'Subscribe to a package to start publishing your listings')
                : slotCheck.reason === 'expired'
                ? (isAr ? 'جدد اشتراكك للمتابعة' : 'Renew your subscription to continue')
                : (isAr
                    ? `استخدمت ${slotCheck.used} من ${slotCheck.max} slots في باقة "${slotCheck.packageName}". رقّي باقتك لإضافة المزيد`
                    : `You've used ${slotCheck.used} of ${slotCheck.max} slots in your "${slotCheck.packageName}" plan. Upgrade to add more listings.`)}
            </p>
            <a
              href={`/${locale}/owner/packages`}
              className="inline-block mt-4 bg-[#D4A843] hover:bg-[#c49835] text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              {isAr ? 'عرض الباقات' : 'View Packages'}
            </a>
          </div>
        ) : (
          <>
            {/* Slot indicator */}
            <div className="mb-4 flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5">
              <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                {isAr ? 'الـ Slots المتاحة' : 'Available Slots'}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(slotCheck.max, 10) }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full ${i < slotCheck.used ? 'bg-[#D4A843]' : 'bg-gray-200'}`}
                    />
                  ))}
                  {slotCheck.max > 10 && <span className="text-xs text-gray-400 ml-1">+{slotCheck.max - 10}</span>}
                </div>
                <span className="text-xs font-semibold text-[#2C3A6B]">
                  {slotCheck.remaining} {isAr ? 'متاح' : 'left'} / {slotCheck.max}
                </span>
              </div>
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Photos */}
          {isFieldEnabled('photos') && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className={`block text-sm font-semibold text-[#2C3A6B] mb-3`}>
                {t(locale, 'photos')} {isFieldRequired('photos') ? t(locale, 'photoMin') : t(locale, 'photoOptional')}
              </label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {photos.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#D4A843] transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  {uploadingPhotos ? t(locale, 'uploading') : t(locale, 'clickUpload')}
                </span>
                <input type="file" multiple accept="image/*"
                  onChange={handlePhotoUpload} className="hidden" disabled={uploadingPhotos} />
              </label>
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className={`font-semibold text-[#2C3A6B] ${isAr ? 'text-right' : ''}`}>
              {t(locale, 'basicInfo')}
            </h3>
            <div>
              <label className={labelCls}>{t(locale, 'title')} *</label>
              <input type="text" required value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={type === 'property' ? t(locale, 'titlePropPlaceholder') : t(locale, 'titleCarPlaceholder')}
                className={inputCls} />
            </div>
            {isFieldEnabled('description') && (
              <div>
                <label className={labelCls}>
                  {t(locale, 'description')} {isFieldRequired('description') ? '*' : t(locale, 'descOptional')}
                </label>
                <textarea required={isFieldRequired('description')} value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4} placeholder="..."
                  className={inputCls + ' resize-none'} />
              </div>
            )}
          </div>

          {/* Property fields */}
          {type === 'property' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className={`font-semibold text-[#2C3A6B] ${isAr ? 'text-right' : ''}`}>
                {t(locale, 'propertyDetails')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>{t(locale, 'area')} *</label>
                  <select required value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className={inputCls}>
                    <option value="">{t(locale, 'selectArea')}</option>
                    <option value="naama_bay">{t(locale, 'namaaArea')}</option>
                    <option value="sharks_bay">{t(locale, 'sharksArea')}</option>
                    <option value="nabq">{t(locale, 'nabqArea')}</option>
                    <option value="old_market">{t(locale, 'oldMarketArea')}</option>
                    <option value="hadaba">{t(locale, 'hadabaArea')}</option>
                    <option value="montazah">{t(locale, 'montazahArea')}</option>
                    <option value="ras_um_sid">{t(locale, 'rasUmSid')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t(locale, 'type')} *</label>
                  <select required value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className={inputCls}>
                    <option value="apartment">{t(locale, 'apartment')}</option>
                    <option value="villa">{t(locale, 'villa')}</option>
                    <option value="studio">{t(locale, 'studio')}</option>
                    <option value="chalet">{t(locale, 'chalet')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t(locale, 'bedrooms')} *</label>
                  <input type="number" required min={0} value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t(locale, 'bathrooms')} *</label>
                  <input type="number" required min={1} value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t(locale, 'maxGuests')} *</label>
                  <input type="number" required min={1} value={formData.max_guests}
                    onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t(locale, 'sizeSqm')}</label>
                  <input type="number" value={formData.size_sqm}
                    onChange={(e) => setFormData({ ...formData, size_sqm: e.target.value })}
                    className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>{t(locale, 'priceNight')} *</label>
                <input type="number" required min={0} value={formData.price_per_night}
                  onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                  className={inputCls} />
              </div>
            </div>
          )}

          {/* Car fields */}
          {type === 'car' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className={`font-semibold text-[#2C3A6B] ${isAr ? 'text-right' : ''}`}>
                {t(locale, 'carDetails')}
              </h3>
              {/* Listing type */}
              <div>
                <label className={labelCls}>{t(locale, 'listingType')} *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="rental"
                      checked={formData.listing_type === 'rental'}
                      onChange={() => setFormData({ ...formData, listing_type: 'rental' })} />
                    <span className="text-sm">{t(locale, 'forRent')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer opacity-50">
                    <input type="radio" value="sale" disabled
                      checked={formData.listing_type === 'sale'}
                      onChange={() => setFormData({ ...formData, listing_type: 'sale' })} />
                    <span className="text-sm">{t(locale, 'forSale')}</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>{t(locale, 'brand')} *</label>
                  <select required value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
                    className={inputCls}>
                    <option value="">{t(locale, 'selectBrand')}</option>
                    {BRAND_NAMES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t(locale, 'model')} *</label>
                  {formData.brand && formData.brand !== 'Other' ? (
                    <select required value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className={inputCls}>
                      <option value="">{t(locale, 'selectModel')}</option>
                      {(CAR_BRANDS[formData.brand] || []).map((m: string) => <option key={m} value={m}>{m}</option>)}
                      <option value="Other">{t(locale, 'otherModel')}</option>
                    </select>
                  ) : (
                    <input type="text" required value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder={t(locale, 'enterModel')} className={inputCls} />
                  )}
                </div>
                <div>
                  <label className={labelCls}>{t(locale, 'year')} *</label>
                  <input type="number" required min={2000} max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t(locale, 'transmission')} *</label>
                  <select required value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className={inputCls}>
                    <option value="automatic">{t(locale, 'automatic')}</option>
                    <option value="manual">{t(locale, 'manual')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t(locale, 'fuelType')} *</label>
                  <select required value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className={inputCls}>
                    <option value="petrol">{t(locale, 'petrol')}</option>
                    <option value="diesel">{t(locale, 'diesel')}</option>
                    <option value="electric">{t(locale, 'electric')}</option>
                    <option value="hybrid">{t(locale, 'hybrid')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t(locale, 'seats')} *</label>
                  <input type="number" required min={2} max={9}
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                    className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>{t(locale, 'dailyRate')} *</label>
                  <input type="number" required min={0} value={formData.price_per_day}
                    onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t(locale, 'monthlyRate')}</label>
                  <input type="number" min={0} value={formData.price_per_month}
                    onChange={(e) => setFormData({ ...formData, price_per_month: e.target.value })}
                    className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button type="submit" disabled={loading || photos.length < 1}
              className="flex-1 bg-[#2C3A6B] hover:bg-[#243058] text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? t(locale, 'submitting') : t(locale, 'submit')}
            </button>
            <button type="button" onClick={() => router.back()}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">
              {t(locale, 'cancel')}
            </button>
          </div>

          {/* Review info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className={`font-semibold mb-1 ${isAr ? 'text-right' : ''}`}>{t(locale, 'reviewProcess')}</p>
                <p className={isAr ? 'text-right' : ''}>{t(locale, 'reviewInfo')}</p>
              </div>
            </div>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  )
}

// ── Page wrapper — extracts locale from path ────────────────
export default function ListingFormPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A843]" />
      </div>
    }>
      <ListingFormInner locale={locale} />
    </Suspense>
  )
}
