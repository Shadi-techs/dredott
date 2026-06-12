'use client'
// ============================================================
// Service Provider Registration — v2
// 6 languages · Sub-services · Re-submission aware
// ============================================================

import { useState, useEffect, use } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, ChevronLeft, AlertCircle, Loader2, Star } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── i18n ─────────────────────────────────────────────────────────────────────
const TX: Record<string, any> = {
  en: {
    tag: 'Service Provider Registration',
    title: 'List Your Service on DREDOTT',
    sub: 'Reach guests and owners in Sharm El-Sheikh',
    steps: ['Category', 'Services', 'Business', 'Contact', 'Documents', 'Plan', 'Payment'],
    selectCategory: 'What type of service do you provide?',
    selectServices: 'Which specific services do you offer?',
    selectServicesHint: 'Select all that apply',
    businessName: 'Business Name (English)', businessNameAr: 'Business Name (Arabic)',
    description: 'Short Description', area: 'Area', address: 'Street / Building',
    phone: 'Phone Number *', whatsapp: 'WhatsApp (if different)',
    email: 'Email', website: 'Website URL', facebook: 'Facebook Page',
    plan: 'Choose Your Plan', planSub: 'Both include a public profile and customer ratings.',
    basic: 'Basic', premium: 'Premium', recommended: 'Recommended',
    perYear: '/yr',
    planFeatures: {
      basic: ['Public profile page', 'Customer ratings & reviews', 'WhatsApp contact button', 'Listed in directory'],
      premium: ['Everything in Basic', 'Featured badge ✓', 'Priority in search', 'Highlighted profile card'],
    },
    docsTitle: 'Document Verification',
    docsSub: 'Our team will contact you to verify documents within 48 hours.',
    docsNote: 'You can share documents via WhatsApp after submission — our team will reach out.',
    next: 'Next', back: 'Back', submit: 'Submit Application', submitting: 'Submitting…',
    successTitle: 'Application Submitted!',
    successBody: 'has been submitted for review. Our team will verify within 48 hours.',
    backHome: 'Back to Home',
    suggestLabel: "Don't see your service?",
    suggestPh: "Describe your service briefly — we'll consider adding it",
    suggestNote: '💡 Suggestions are reviewed and may be added as a new category',
    errCategory: 'Please select a category',
    errServices: 'Please select at least one service',
    errName: 'Business name is required',
    errPhone: 'Phone number is required',
    errSubmit: 'Something went wrong. Please try again.',
    ratingsTitle: 'Why ratings matter here',
    ratingsBody: 'DREDOTT users are active guests and property owners in Sharm. A verified rating here carries real weight.',
    hiddenNote: 'Your profile will only go live after admin approval.',
  },
  ar: {
    tag: 'تسجيل مزود خدمة',
    title: 'أضف خدمتك على DREDOTT',
    sub: 'تواصل مع الضيوف والملاك في شرم الشيخ',
    steps: ['الفئة', 'الخدمات', 'بيانات النشاط', 'التواصل', 'الوثائق', 'الباقة', 'الدفع'],
    selectCategory: 'ما نوع الخدمة التي تقدمها؟',
    selectServices: 'ما الخدمات التي تقدمها تحديداً؟',
    selectServicesHint: 'اختر كل ما ينطبق',
    businessName: 'اسم النشاط (إنجليزي)', businessNameAr: 'اسم النشاط (عربي)',
    description: 'وصف مختصر', area: 'المنطقة', address: 'الشارع / المبنى',
    phone: 'رقم الهاتف *', whatsapp: 'واتساب (إن اختلف)',
    email: 'البريد الإلكتروني', website: 'الموقع الإلكتروني', facebook: 'صفحة فيسبوك',
    plan: 'اختر باقتك', planSub: 'كلا الباقتين تشملان صفحة عامة وتقييمات العملاء.',
    basic: 'أساسية', premium: 'مميزة', recommended: 'الأكثر طلباً',
    perYear: '/سنة',
    planFeatures: {
      basic: ['صفحة ملف عام', 'تقييمات العملاء', 'زر التواصل عبر واتساب', 'ظهور في الدليل'],
      premium: ['كل مزايا الأساسية', 'شارة مميز ✓', 'أولوية في البحث', 'بطاقة ملف بارزة'],
    },
    docsTitle: 'التحقق من الوثائق',
    docsSub: 'سيتواصل معك فريقنا خلال 48 ساعة للتحقق من الوثائق.',
    docsNote: 'يمكنك إرسال الوثائق عبر واتساب بعد التسجيل — سيتواصل معك فريقنا.',
    next: 'التالي', back: 'رجوع', submit: 'إرسال الطلب', submitting: '…جارٍ الإرسال',
    successTitle: '!تم إرسال الطلب',
    successBody: 'تم تقديم الطلب للمراجعة. سيتم التحقق خلال 48 ساعة.',
    backHome: 'العودة للرئيسية',
    suggestLabel: 'خدمتك غير موجودة؟',
    suggestPh: 'صف خدمتك باختصار — سنراجع إضافتها',
    suggestNote: '💡 المقترحات تُراجع وقد تُضاف كفئة جديدة',
    errCategory: 'يرجى اختيار فئة',
    errServices: 'يرجى اختيار خدمة واحدة على الأقل',
    errName: 'اسم النشاط مطلوب',
    errPhone: 'رقم الهاتف مطلوب',
    errSubmit: 'حدث خطأ. يرجى المحاولة مجدداً.',
    ratingsTitle: 'لماذا التقييمات مهمة هنا',
    ratingsBody: 'مستخدمو DREDOTT هم ضيوف وملاك عقارات نشطون في شرم. التقييم الموثق هنا له ثقل حقيقي.',
    hiddenNote: 'سيظهر ملفك فقط بعد موافقة الإدارة.',
  },
  ru: {
    tag: 'Регистрация поставщика услуг',
    title: 'Добавьте услугу на DREDOTT',
    sub: 'Охватите гостей и владельцев в Шарм-эль-Шейхе',
    steps: ['Категория', 'Услуги', 'Компания', 'Контакты', 'Документы', 'Тариф', 'Оплата'],
    selectCategory: 'Какой тип услуг вы предоставляете?',
    selectServices: 'Какие конкретно услуги вы предлагаете?',
    selectServicesHint: 'Выберите все подходящие',
    businessName: 'Название (английский)', businessNameAr: 'Название (арабский)',
    description: 'Краткое описание', area: 'Район', address: 'Улица / здание',
    phone: 'Номер телефона *', whatsapp: 'WhatsApp (если другой)',
    email: 'Email', website: 'Сайт', facebook: 'Facebook',
    plan: 'Выберите тариф', planSub: 'Оба тарифа включают профиль и отзывы клиентов.',
    basic: 'Базовый', premium: 'Премиум', recommended: 'Рекомендуем',
    perYear: '/год',
    planFeatures: {
      basic: ['Публичный профиль', 'Отзывы клиентов', 'Кнопка WhatsApp', 'В каталоге'],
      premium: ['Всё из Базового', 'Значок Featured ✓', 'Приоритет в поиске', 'Выделенная карточка'],
    },
    docsTitle: 'Проверка документов',
    docsSub: 'Наша команда свяжется с вами в течение 48 часов.',
    docsNote: 'Вы можете отправить документы через WhatsApp после регистрации.',
    next: 'Далее', back: 'Назад', submit: 'Отправить заявку', submitting: 'Отправка…',
    successTitle: 'Заявка отправлена!',
    successBody: 'подана на рассмотрение. Проверка займёт до 48 часов.',
    backHome: 'На главную',
    suggestLabel: 'Не нашли свою услугу?',
    suggestPh: 'Опишите услугу кратко — мы рассмотрим добавление',
    suggestNote: '💡 Предложения рассматриваются и могут быть добавлены',
    errCategory: 'Выберите категорию', errServices: 'Выберите хотя бы одну услугу',
    errName: 'Название обязательно', errPhone: 'Телефон обязателен',
    errSubmit: 'Ошибка. Попробуйте ещё раз.',
    ratingsTitle: 'Почему отзывы важны',
    ratingsBody: 'Пользователи DREDOTT — активные гости и владельцы недвижимости в Шарме.',
    hiddenNote: 'Профиль будет виден после одобрения администратором.',
  },
  uk: {
    tag: 'Реєстрація постачальника послуг',
    title: 'Додайте послугу на DREDOTT',
    sub: 'Охопіть гостей та власників у Шарм-ель-Шейху',
    steps: ['Категорія', 'Послуги', 'Компанія', 'Контакти', 'Документи', 'Тариф', 'Оплата'],
    selectCategory: 'Який тип послуг ви надаєте?',
    selectServices: 'Які конкретно послуги ви пропонуєте?',
    selectServicesHint: 'Виберіть усі відповідні',
    businessName: 'Назва (англійська)', businessNameAr: 'Назва (арабська)',
    description: 'Короткий опис', area: 'Район', address: 'Вулиця / будівля',
    phone: 'Номер телефону *', whatsapp: 'WhatsApp (якщо інший)',
    email: 'Email', website: 'Сайт', facebook: 'Facebook',
    plan: 'Оберіть тариф', planSub: 'Обидва тарифи включають профіль та відгуки.',
    basic: 'Базовий', premium: 'Преміум', recommended: 'Рекомендуємо',
    perYear: '/рік',
    planFeatures: {
      basic: ['Публічний профіль', 'Відгуки клієнтів', 'Кнопка WhatsApp', 'В каталозі'],
      premium: ['Все з Базового', 'Значок Featured ✓', 'Пріоритет у пошуку', 'Виділена картка'],
    },
    docsTitle: 'Перевірка документів',
    docsSub: 'Наша команда зв\'яжеться з вами протягом 48 годин.',
    docsNote: 'Ви можете надіслати документи через WhatsApp після реєстрації.',
    next: 'Далі', back: 'Назад', submit: 'Надіслати заявку', submitting: 'Надсилання…',
    successTitle: 'Заявку надіслано!',
    successBody: 'подано на розгляд. Перевірка займе до 48 годин.',
    backHome: 'На головну',
    suggestLabel: 'Не знайшли свою послугу?',
    suggestPh: 'Опишіть послугу коротко — ми розглянемо додавання',
    suggestNote: '💡 Пропозиції розглядаються та можуть бути додані',
    errCategory: 'Оберіть категорію', errServices: 'Оберіть хоча б одну послугу',
    errName: 'Назва обов\'язкова', errPhone: 'Телефон обов\'язковий',
    errSubmit: 'Помилка. Спробуйте ще раз.',
    ratingsTitle: 'Чому відгуки важливі',
    ratingsBody: 'Користувачі DREDOTT — активні гості та власники нерухомості в Шармі.',
    hiddenNote: 'Профіль буде видно після схвалення адміністратором.',
  },
  de: {
    tag: 'Dienstleister-Registrierung',
    title: 'Ihren Service auf DREDOTT eintragen',
    sub: 'Erreichen Sie Gäste und Eigentümer in Sharm El-Sheikh',
    steps: ['Kategorie', 'Dienste', 'Firma', 'Kontakt', 'Dokumente', 'Tarif', 'Zahlung'],
    selectCategory: 'Welche Art von Dienstleistung bieten Sie an?',
    selectServices: 'Welche konkreten Leistungen bieten Sie an?',
    selectServicesHint: 'Alle Zutreffenden auswählen',
    businessName: 'Firmenname (Englisch)', businessNameAr: 'Firmenname (Arabisch)',
    description: 'Kurzbeschreibung', area: 'Gebiet', address: 'Straße / Gebäude',
    phone: 'Telefonnummer *', whatsapp: 'WhatsApp (falls abweichend)',
    email: 'E-Mail', website: 'Website', facebook: 'Facebook-Seite',
    plan: 'Tarif wählen', planSub: 'Beide Tarife umfassen ein Profil und Kundenbewertungen.',
    basic: 'Basis', premium: 'Premium', recommended: 'Empfohlen',
    perYear: '/Jahr',
    planFeatures: {
      basic: ['Öffentliches Profil', 'Kundenbewertungen', 'WhatsApp-Button', 'Im Verzeichnis'],
      premium: ['Alles aus Basis', 'Featured-Badge ✓', 'Suchpriorität', 'Hervorgehobene Karte'],
    },
    docsTitle: 'Dokumentenprüfung',
    docsSub: 'Unser Team meldet sich innerhalb von 48 Stunden.',
    docsNote: 'Sie können Dokumente nach der Registrierung per WhatsApp senden.',
    next: 'Weiter', back: 'Zurück', submit: 'Bewerbung einreichen', submitting: 'Wird gesendet…',
    successTitle: 'Bewerbung eingereicht!',
    successBody: 'wurde zur Prüfung eingereicht. Prüfung innerhalb von 48 Stunden.',
    backHome: 'Zur Startseite',
    suggestLabel: 'Dienst nicht gefunden?',
    suggestPh: 'Beschreiben Sie Ihren Dienst kurz — wir prüfen die Aufnahme',
    suggestNote: '💡 Vorschläge werden geprüft und ggf. hinzugefügt',
    errCategory: 'Bitte Kategorie wählen', errServices: 'Bitte mindestens einen Dienst wählen',
    errName: 'Firmenname erforderlich', errPhone: 'Telefon erforderlich',
    errSubmit: 'Fehler. Bitte erneut versuchen.',
    ratingsTitle: 'Warum Bewertungen wichtig sind',
    ratingsBody: 'DREDOTT-Nutzer sind aktive Gäste und Eigentümer in Sharm.',
    hiddenNote: 'Ihr Profil ist erst nach Admin-Genehmigung sichtbar.',
  },
  it: {
    tag: 'Registrazione Fornitore di Servizi',
    title: 'Aggiungi il tuo servizio su DREDOTT',
    sub: 'Raggiungi ospiti e proprietari a Sharm El-Sheikh',
    steps: ['Categoria', 'Servizi', 'Azienda', 'Contatti', 'Documenti', 'Piano', 'Pagamento'],
    selectCategory: 'Che tipo di servizio offri?',
    selectServices: 'Quali servizi specifici offri?',
    selectServicesHint: 'Seleziona tutto ciò che si applica',
    businessName: 'Nome attività (inglese)', businessNameAr: 'Nome attività (arabo)',
    description: 'Breve descrizione', area: 'Area', address: 'Via / Edificio',
    phone: 'Numero di telefono *', whatsapp: 'WhatsApp (se diverso)',
    email: 'Email', website: 'Sito web', facebook: 'Pagina Facebook',
    plan: 'Scegli il piano', planSub: 'Entrambi includono profilo pubblico e recensioni.',
    basic: 'Base', premium: 'Premium', recommended: 'Consigliato',
    perYear: '/anno',
    planFeatures: {
      basic: ['Profilo pubblico', 'Recensioni clienti', 'Pulsante WhatsApp', 'Nel directory'],
      premium: ['Tutto del Base', 'Badge Featured ✓', 'Priorità ricerca', 'Scheda in evidenza'],
    },
    docsTitle: 'Verifica documenti',
    docsSub: 'Il nostro team ti contatterà entro 48 ore.',
    docsNote: 'Puoi inviare i documenti via WhatsApp dopo la registrazione.',
    next: 'Avanti', back: 'Indietro', submit: 'Invia candidatura', submitting: 'Invio in corso…',
    successTitle: 'Candidatura inviata!',
    successBody: 'è stata inviata per revisione. Verifica entro 48 ore.',
    backHome: 'Torna alla home',
    suggestLabel: 'Non trovi il tuo servizio?',
    suggestPh: 'Descrivilo brevemente — valuteremo di aggiungerlo',
    suggestNote: '💡 I suggerimenti vengono valutati e potrebbero essere aggiunti',
    errCategory: 'Seleziona una categoria', errServices: 'Seleziona almeno un servizio',
    errName: 'Nome attività richiesto', errPhone: 'Telefono richiesto',
    errSubmit: 'Errore. Riprova.',
    ratingsTitle: 'Perché le recensioni contano',
    ratingsBody: 'Gli utenti DREDOTT sono ospiti e proprietari attivi a Sharm.',
    hiddenNote: 'Il tuo profilo sarà visibile solo dopo approvazione admin.',
  },
}

// ── Sub-services by category icon ────────────────────────────────────────────
const SUBTYPES: Record<string, { key: string; en: string; ar: string; ru: string; uk: string; de: string; it: string }[]> = {
  '🚗': [
    { key: 'airport_transfer',   en: 'Airport Transfer',          ar: 'توصيل من/للمطار',       ru: 'Трансфер из/в аэропорт', uk: 'Трансфер з/до аеропорту', de: 'Flughafentransfer', it: 'Transfer aeroporto' },
    { key: 'car_with_driver',    en: 'Car Rental with Driver',    ar: 'إيجار سيارة مع سائق',   ru: 'Авто с водителем',        uk: 'Авто з водієм',           de: 'Auto mit Fahrer',   it: 'Auto con autista' },
    { key: 'tuktuk_taxi',        en: 'Tuk-Tuk / Taxi',           ar: 'توك توك / تاكسي',        ru: 'Тук-тук / Такси',         uk: 'Тук-тук / Таксі',         de: 'Tuk-Tuk / Taxi',    it: 'Tuk-Tuk / Taxi' },
    { key: 'day_trips',          en: 'Day Trips',                 ar: 'رحلات يومية',            ru: 'Однодневные поездки',     uk: 'Одноденні поїздки',       de: 'Tagesausflüge',     it: 'Gite giornaliere' },
  ],
  '🏠': [
    { key: 'cleaning',           en: 'Apartment Cleaning',        ar: 'تنظيف الشقق',            ru: 'Уборка квартиры',         uk: 'Прибирання квартири',     de: 'Wohnungsreinigung', it: 'Pulizie appartamento' },
    { key: 'laundry',            en: 'Laundry Service',           ar: 'غسيل ملابس',             ru: 'Прачечная',               uk: 'Прання',                  de: 'Wäscheservice',     it: 'Lavanderia' },
    { key: 'maintenance',        en: 'Maintenance & Repair',      ar: 'صيانة وإصلاح',           ru: 'Ремонт и обслуживание',   uk: 'Ремонт та обслуговування',de: 'Wartung & Reparatur',it: 'Manutenzione e riparazioni' },
    { key: 'furniture_decor',    en: 'Furniture & Decor',         ar: 'أثاث وديكور',            ru: 'Мебель и декор',          uk: 'Меблі та декор',          de: 'Möbel & Dekor',     it: 'Arredamento e décor' },
  ],
  '🍽️': [
    { key: 'restaurant_delivery',en: 'Restaurant Delivery',       ar: 'مطاعم توصيل',            ru: 'Доставка из ресторанов',  uk: 'Доставка з ресторанів',   de: 'Restaurantlieferung',it: 'Consegna ristoranti' },
    { key: 'private_chef',       en: 'Private Chef',              ar: 'طباخ خاص',               ru: 'Личный повар',            uk: 'Приватний кухар',         de: 'Privatkoch',        it: 'Chef privato' },
    { key: 'supermarket',        en: 'Supermarket Delivery',      ar: 'سوبرماركت توصيل',        ru: 'Доставка из супермаркета',uk: 'Доставка з супермаркету', de: 'Supermarktlieferung',it: 'Consegna supermercato' },
    { key: 'catering',           en: 'Catering',                  ar: 'كيترينج',                ru: 'Кейтеринг',               uk: 'Кейтеринг',               de: 'Catering',          it: 'Catering' },
  ],
  '🏖️': [
    { key: 'diving_snorkeling',  en: 'Diving & Snorkeling',       ar: 'غوص وسنوركلينج',         ru: 'Дайвинг и снорклинг',     uk: 'Дайвінг та снорклінг',    de: 'Tauchen & Schnorcheln',it: 'Immersioni e snorkeling' },
    { key: 'boat_trips',         en: 'Boat Trips',                ar: 'رحلات بحرية',            ru: 'Морские прогулки',        uk: 'Морські прогулянки',      de: 'Bootsausflüge',     it: 'Gite in barca' },
    { key: 'quad_bikes',         en: 'Quad Bikes',                ar: 'quad bikes',             ru: 'Квадроциклы',             uk: 'Квадроцикли',             de: 'Quad-Bikes',        it: 'Quad bikes' },
    { key: 'water_sports',       en: 'Water Sports',              ar: 'رياضات مائية',           ru: 'Водные виды спорта',      uk: 'Водні види спорту',       de: 'Wassersport',       it: 'Sport acquatici' },
    { key: 'guided_tours',       en: 'Guided Tours',              ar: 'جولات سياحية',           ru: 'Экскурсии с гидом',       uk: 'Екскурсії з гідом',       de: 'Geführte Touren',   it: 'Tour guidati' },
  ],
  '💆': [
    { key: 'spa_massage',        en: 'Spa & Massage',             ar: 'سبا ومساج',              ru: 'Спа и массаж',            uk: 'Спа та масаж',            de: 'Spa & Massage',     it: 'Spa e massaggi' },
    { key: 'barbershop',         en: 'Barbershop / Salon',        ar: 'صالون حلاقة',            ru: 'Барбершоп / Салон',       uk: 'Барбершоп / Салон',       de: 'Barbershop / Salon',it: 'Barbiere / Salone' },
    { key: 'fitness',            en: 'Fitness & Personal Training',ar: 'فيتنس وتدريب شخصي',     ru: 'Фитнес и персональный тренер',uk: 'Фітнес та персональний тренер',de: 'Fitness & Personal Training',it: 'Fitness e personal training' },
  ],
  '📸': [
    { key: 'photography',        en: 'Photography',               ar: 'تصوير فوتوغرافي',        ru: 'Фотография',              uk: 'Фотографія',              de: 'Fotografie',        it: 'Fotografia' },
    { key: 'interior_design',    en: 'Interior Design',           ar: 'مصمم داخلي',             ru: 'Дизайн интерьера',        uk: 'Дизайн інтер\'єру',       de: 'Innenarchitektur',  it: 'Design interni' },
    { key: 'translation',        en: 'Translation',               ar: 'مترجم',                  ru: 'Переводы',                uk: 'Переклади',               de: 'Übersetzung',       it: 'Traduzione' },
  ],
  '🔧': [
    { key: 'security',           en: 'Security Guard',            ar: 'حراسة أمن',              ru: 'Охрана',                  uk: 'Охорона',                 de: 'Sicherheitsdienst', it: 'Guardia di sicurezza' },
    { key: 'babysitting',        en: 'Babysitting',               ar: 'رعاية أطفال',            ru: 'Присмотр за детьми',      uk: 'Догляд за дітьми',        de: 'Babysitting',       it: 'Babysitting' },
  ],
}

const AREAS = ['naama_bay','sharks_bay','hadaba','montazah','nabq','um_el_sid','el_salam','old_market']
const AREA_LABELS: Record<string, string> = {
  naama_bay: 'Naama Bay', sharks_bay: "Shark's Bay", hadaba: 'Hadaba',
  montazah: 'Montazah', nabq: 'Nabq', um_el_sid: 'Um El Sid',
  el_salam: 'El Salam', old_market: 'Old Market',
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ServiceProviderRegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const router     = useRouter()
  const tx         = TX[locale] || TX.en
  const isAr       = locale === 'ar'
  const isRTL      = isAr

  const [step, setStep]               = useState(0)
  const [categories, setCategories]   = useState<any[]>([])
  const [loading, setLoading]         = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [errors, setErrors]           = useState<Record<string, string>>({})
  const [savedProviderId, setSavedProviderId] = useState<string | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [suggestedService, setSuggestedService] = useState('')

  const [form, setForm] = useState({
    category_id: '', business_name: '', business_name_ar: '',
    description: '', phone: '', whatsapp: '', email: '',
    website_url: '', facebook_url: '', area: '', address: '',
    plan_type: 'basic' as 'basic' | 'premium',
  })

  useEffect(() => {
    supabase.from('service_provider_categories')
      .select('id, name_en, name_ar, icon')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setCategories(data || []))
  }, [])

  const set = (field: keyof typeof form, val: string) => {
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  const selectedCategory = categories.find(c => c.id === form.category_id)
  const availableSubtypes = selectedCategory ? (SUBTYPES[selectedCategory.icon] || []) : []

  const toggleService = (key: string) => {
    setSelectedServices(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
    if (errors.services) setErrors(p => ({ ...p, services: '' }))
  }

  const getSubLabel = (sub: any) => (sub as any)[locale] || sub.en

  const validate = (s: number) => {
    const errs: Record<string, string> = {}
    if (s === 0 && !form.category_id)            errs.category_id = tx.errCategory
    if (s === 1 && selectedServices.length === 0) errs.services    = tx.errServices
    if (s === 2 && !form.business_name.trim())   errs.business_name = tx.errName
    if (s === 3 && !form.phone.trim())            errs.phone        = tx.errPhone
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/${locale}/login?redirect=/${locale}/services/register&reason=service_provider`)
        return
      }

      const { data: provider, error } = await supabase.from('service_providers').insert({
        user_id:          user.id,
        category_id:      form.category_id,
        business_name:    form.business_name,
        business_name_ar: form.business_name_ar || null,
        description:      form.description || null,
        phone:            form.phone,
        whatsapp:         form.whatsapp || form.phone,
        email:            form.email || null,
        website_url:      form.website_url || null,
        facebook_url:     form.facebook_url || null,
        area:             form.area || null,
        address:          form.address || null,
        plan_type:           form.plan_type,
        services_offered:    selectedServices,
        suggested_service:   suggestedService.trim() || null,
        review_status:       'pending',
        payment_status:      'awaiting_payment',
        is_active:        false,
        submission_count: 1,
      }).select().single()

      if (error) throw error
      setSavedProviderId(provider.id)
      setStep(6)
    } catch {
      setErrors({ submit: tx.errSubmit })
    } finally {
      setLoading(false)
    }
  }

  const handlePayOnline = async () => {
    if (!savedProviderId) return
    setPaymentLoading(true)
    try {
      const selectedCategory = categories.find(c => c.id === form.category_id)
      const price = form.plan_type === 'premium' ? (selectedCategory?.price_premium || 1500) : (selectedCategory?.price_basic || 800)
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_provider_id: savedProviderId,
          amount: price,
          currency: 'egp',
          description: `Dredott Services — ${form.plan_type === 'premium' ? 'Premium' : 'Basic'} Plan`,
          success_url: `${window.location.origin}/${locale}/services/register/success?provider_id=${savedProviderId}`,
          cancel_url: `${window.location.origin}/${locale}/services/register?step=6`,
        }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
      else throw new Error('No URL')
    } catch {
      setErrors({ submit: tx.errSubmit })
    } finally {
      setPaymentLoading(false)
    }
  }

  // ── Styles ─────────────────────────────────────────────────────────────────
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 500, color: '#6b7280', marginBottom: 6, textAlign: isRTL ? 'right' : 'left' }
  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, fontSize: 14, color: '#2C3A6B', outline: 'none', background: '#f9fafb', boxSizing: 'border-box', direction: 'ltr' }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(42,157,143,0.1)', border: '2px solid #2A9D8F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Check size={32} color="#2A9D8F" />
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: '#2C3A6B', marginBottom: 12 }}>{tx.successTitle}</h1>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 8 }}>
          <strong>{form.business_name}</strong> {tx.successBody}
        </p>
        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 32 }}>{tx.hiddenNote}</p>
        <button onClick={() => router.push(`/${locale}`)} style={{ padding: '12px 28px', background: '#2C3A6B', color: '#D4A843', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          {tx.backHome}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }} dir={isRTL ? 'rtl' : 'ltr'}>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 16px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.28em', color: '#D4A843', textTransform: 'uppercase', marginBottom: 10 }}>
            — {tx.tag}
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 400, color: '#2C3A6B', margin: '0 0 8px' }}>
            {tx.title}
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>{tx.sub}</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 0 }}>
          {tx.steps.map((s: string, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < tx.steps.length - 1 ? 1 : 'none' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: step > i ? '#2C3A6B' : step === i ? '#D4A843' : '#e5e7eb', color: step > i ? '#D4A843' : step === i ? '#0e1428' : '#9ca3af', fontSize: 11, fontWeight: 700 }}>
                {step > i ? <Check size={13} /> : i + 1}
              </div>
              {i < tx.steps.length - 1 && <div style={{ flex: 1, height: 2, background: step > i ? '#2C3A6B' : '#e5e7eb', margin: '0 3px' }} />}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.07)', padding: '24px 20px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#2C3A6B', marginBottom: 18, textAlign: isRTL ? 'right' : 'left' }}>{tx.steps[step]}</h2>

          {/* ── STEP 0: Category ─────────────────────────────────── */}
          {step === 0 && (
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14, textAlign: isRTL ? 'right' : 'left' }}>{tx.selectCategory}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => { set('category_id', cat.id); setSelectedServices([]) }}
                    style={{ padding: '14px 12px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${form.category_id === cat.id ? '#2C3A6B' : 'rgba(0,0,0,0.08)'}`, background: form.category_id === cat.id ? '#2C3A6B' : '#fff', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                    <span style={{ fontSize: 22 }}>{cat.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: form.category_id === cat.id ? '#D4A843' : '#374151', lineHeight: 1.3 }}>
                      {isAr ? (cat.name_ar || cat.name_en) : cat.name_en}
                    </span>
                  </button>
                ))}
              </div>
              {errors.category_id && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{errors.category_id}</p>}
            </div>
          )}

          {/* ── STEP 1: Sub-services ─────────────────────────────── */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4, textAlign: isRTL ? 'right' : 'left' }}>{tx.selectServices}</p>
              <p style={{ fontSize: 11, color: '#D4A843', marginBottom: 14, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textAlign: isRTL ? 'right' : 'left' }}>{tx.selectServicesHint}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {availableSubtypes.map(sub => (
                  <label key={sub.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${selectedServices.includes(sub.key) ? '#2C3A6B' : 'rgba(0,0,0,0.08)'}`, background: selectedServices.includes(sub.key) ? 'rgba(44,58,107,0.05)' : '#fff', cursor: 'pointer' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${selectedServices.includes(sub.key) ? '#2C3A6B' : '#d1d5db'}`, background: selectedServices.includes(sub.key) ? '#2C3A6B' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {selectedServices.includes(sub.key) && <Check size={12} color="#D4A843" />}
                    </div>
                    <input type="checkbox" checked={selectedServices.includes(sub.key)} onChange={() => toggleService(sub.key)} style={{ display: 'none' }} />
                    <span style={{ fontSize: 14, color: selectedServices.includes(sub.key) ? '#2C3A6B' : '#374151', fontWeight: selectedServices.includes(sub.key) ? 600 : 400 }}>
                      {isAr ? sub.ar : getSubLabel(sub)}
                    </span>
                  </label>
                ))}
              </div>
              {errors.services && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{errors.services}</p>}

              {/* ── Suggest a new service ── */}
              <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(212,168,67,0.05)', border: '1.5px dashed rgba(212,168,67,0.3)', borderRadius: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#2C3A6B', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', marginBottom: 8 }}>
                  {tx.suggestLabel}
                </p>
                <textarea
                  value={suggestedService}
                  onChange={e => setSuggestedService(e.target.value)}
                  placeholder={tx.suggestPh}
                  rows={3}
                  maxLength={300}
                  style={{ ...inp, resize: 'none', fontSize: 13, background: '#fffef7' }}
                />
                <p style={{ fontSize: 11, color: '#D4A843', marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  {tx.suggestNote}
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: Business Info ────────────────────────────── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lbl}>{tx.businessName} *</label>
                <input value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="e.g. Red Sea Transfers" style={inp} />
                {errors.business_name && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.business_name}</p>}
              </div>
              <div>
                <label style={lbl}>{tx.businessNameAr}</label>
                <input value={form.business_name_ar} onChange={e => set('business_name_ar', e.target.value)} placeholder="اسم النشاط بالعربي" style={{ ...inp, direction: 'rtl', textAlign: 'right' }} />
              </div>
              <div>
                <label style={lbl}>{tx.description}</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} style={{ ...inp, resize: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div>
                  <label style={lbl}>{tx.area}</label>
                  <select value={form.area} onChange={e => set('area', e.target.value)} style={inp}>
                    <option value="">—</option>
                    {AREAS.map(a => <option key={a} value={a}>{AREA_LABELS[a]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>{tx.address}</label>
                  <input value={form.address} onChange={e => set('address', e.target.value)} style={inp} />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Contact ──────────────────────────────────── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lbl}>{tx.phone}</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+20 1XX XXX XXXX" style={inp} />
                {errors.phone && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.phone}</p>}
              </div>
              <div>
                <label style={lbl}>{tx.whatsapp}</label>
                <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+20 1XX XXX XXXX" style={inp} />
              </div>
              <div>
                <label style={lbl}>{tx.email}</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inp} />
              </div>
              <div>
                <label style={lbl}>{tx.website}</label>
                <input value={form.website_url} onChange={e => set('website_url', e.target.value)} placeholder="https://..." style={inp} />
              </div>
              <div>
                <label style={lbl}>{tx.facebook}</label>
                <input value={form.facebook_url} onChange={e => set('facebook_url', e.target.value)} placeholder="https://facebook.com/..." style={inp} />
              </div>
            </div>
          )}

          {/* ── STEP 4: Documents ───────────────────────────────── */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{tx.docsSub}</p>
              {[
                { label: isAr ? 'السجل التجاري' : 'Commercial Registration', req: true },
                { label: isAr ? 'الهوية الوطنية / جواز السفر' : 'National ID / Passport', req: true },
                { label: isAr ? 'الترخيص المهني (إن وجد)' : 'Professional License (if applicable)', req: false },
              ].map((doc, i) => (
                <div key={i} style={{ padding: 14, background: '#f9fafb', borderRadius: 12, border: '1px dashed rgba(0,0,0,0.1)' }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
                    {doc.label} {doc.req && <span style={{ color: '#ef4444' }}>*</span>}
                  </p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{tx.docsNote}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 5: Plan ─────────────────────────────────────── */}
          {step === 5 && (
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 18, textAlign: isRTL ? 'right' : 'left' }}>{tx.planSub}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 18 }}>
                {(['basic', 'premium'] as const).map(type => {
                  const isSelected = form.plan_type === type
                  const price      = type === 'basic' ? (selectedCategory?.price_basic || 800) : (selectedCategory?.price_premium || 1500)
                  const features   = tx.planFeatures[type]
                  const label      = tx[type]
                  return (
                    <div key={type} onClick={() => set('plan_type', type)}
                      style={{ padding: 18, borderRadius: 14, cursor: 'pointer', border: `2px solid ${isSelected ? '#2C3A6B' : 'rgba(0,0,0,0.08)'}`, background: isSelected ? '#2C3A6B' : '#fff', position: 'relative' }}>
                      {type === 'premium' && (
                        <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#D4A843', color: '#0e1428', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                          {tx.recommended}
                        </span>
                      )}
                      <p style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#D4A843' : '#2C3A6B', marginBottom: 4 }}>{label}</p>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: isSelected ? '#FBF0D0' : '#D4A843', marginBottom: 10 }}>
                        EGP {price.toLocaleString()}<span style={{ fontSize: 12, color: isSelected ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}>{tx.perYear}</span>
                      </p>
                      {features.map((f: string, i: number) => (
                        <p key={i} style={{ fontSize: 11, color: isSelected ? 'rgba(255,255,255,0.7)' : '#6b7280', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                          <Check size={10} color={isSelected ? '#D4A843' : '#2A9D8F'} /> {f}
                        </p>
                      ))}
                    </div>
                  )
                })}
              </div>

              <div style={{ padding: 14, background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, display: 'flex', gap: 10 }}>
                <Star size={18} color="#d97706" fill="#d97706" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 3 }}>{tx.ratingsTitle}</p>
                  <p style={{ fontSize: 12, color: '#b45309', lineHeight: 1.6 }}>{tx.ratingsBody}</p>
                </div>
              </div>

              {errors.submit && (
                <div style={{ marginTop: 12, padding: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: '#ef4444', display: 'flex', gap: 8 }}><AlertCircle size={15} /> {errors.submit}</p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 6: Payment ──────────────────────────────────── */}
          {step === 6 && savedProviderId && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={24} color="#4ade80" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#2C3A6B', marginBottom: 8 }}>
                {isAr ? 'تم حفظ طلبك!' : 'Application Saved!'}
              </h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>
                {isAr
                  ? 'لتفعيل ملفك وعرضه للعملاء، أكمل عملية الدفع.'
                  : 'To activate your profile and get visible to customers, complete payment.'}
              </p>

              {/* Plan summary */}
              {(() => {
                const selectedCat = categories.find(c => c.id === form.category_id)
                const price = form.plan_type === 'premium' ? (selectedCat?.price_premium || 1500) : (selectedCat?.price_basic || 800)
                return (
                  <div style={{ background: '#f9fafb', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, textAlign: isRTL ? 'right' : 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{isAr ? 'الباقة' : 'Plan'}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#2C3A6B', textTransform: 'capitalize' }}>{form.plan_type}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{isAr ? 'المبلغ (سنوي)' : 'Amount (annual)'}</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#D4A843' }}>EGP {price.toLocaleString()}</span>
                    </div>
                  </div>
                )
              })()}

              {/* Pay online button */}
              <button onClick={handlePayOnline} disabled={paymentLoading}
                style={{ width: '100%', padding: '13px 20px', background: paymentLoading ? '#9ca3af' : '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: paymentLoading ? 'not-allowed' : 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {paymentLoading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={16} />}
                {isAr ? 'ادفع الآن بالبطاقة' : 'Pay Now by Card'}
              </button>

              {/* Manual payment note */}
              <p style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.6 }}>
                {isAr
                  ? 'أو تواصل معنا عبر واتساب لترتيب الدفع النقدي أو التحويل البنكي.'
                  : 'Or contact us via WhatsApp to arrange cash or bank transfer payment.'}
              </p>
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-block', marginTop: 10, padding: '9px 18px', background: '#2A9D8F', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
                WhatsApp
              </a>
            </div>
          )}

          {/* Navigation */}
          {step < 6 && (
          <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: 13 }}>
                <ChevronLeft size={15} /> {tx.back}
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 5 ? (
              <button onClick={() => { if (validate(step)) setStep(s => s + 1) }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', background: '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {tx.next} <ChevronRight size={15} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', background: loading ? '#6b7280' : '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}>
                {loading ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> {tx.submitting}</> : <><Check size={15} /> {tx.submit}</>}
              </button>
            )}
          </div>
          )}
        </div>

      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
