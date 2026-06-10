// src/lib/owner/strings.ts
// i18n strings for the Owner Portal — 6 languages (COMPLETE MERGED)

export type Locale = 'en' | 'ar' | 'ru' | 'uk' | 'de' | 'it'

export interface T {
  // Navigation & General
  portal: string; dashboard: string; listings: string
  packages: string; settings: string; signOut: string
  addListing: string; noSub: string; browsePkg: string
  used: string; left: string; pending: string
  bookings: string; flashDeals: string; analytics: string
  financials: string; calendar: string; icalSync: string
  smartPrice: string; whatsapp: string; expenses: string
  guestHistory: string; reports: string; premium: string
  viewSite: string; account: string; general: string
  growth: string; goodMorning: string; goodAfternoon: string
  goodEvening: string; today: string; thisMonth: string
  revenue: string; occupancy: string; adr: string
  views: string; bookingsLbl: string; vsLast: string
  upcoming: string; checkIns: string; checkOuts: string
  quickActions: string; newDeal: string; message: string
  blockDates: string; sync: string; activity: string
  pendingItems: string; listingPerf: string
  pricingTip: string; search: string
  allListings: string; properties: string; cars: string
  status: string; live: string; draft: string; paused: string
  next7: string; month: string; week: string; day: string
  viewAll: string; applyTip: string; dismiss: string
  
  // Team Management
  team: string; teamManagement: string; inviteMember: string
  teamMembers: string; noTeamMembers: string; inviteTeamMember: string
  enterEmail: string; selectRole: string; owner: string
  coHost: string; operations: string; accountant: string
  custom: string; permissions: string; sendInvite: string
  cancel: string; inviteSent: string; invitationSent: string
  active: string; lastActive: string; remove: string
  editPermissions: string; viewFinancials: string; viewAnalytics: string
  manageListings: string; manageBookings: string; manageCalendar: string
  managePricing: string; manageFlashDeals: string; viewGuestContact: string
  manageTeam: string; manageSettings: string; teamSub: string
  member: string; role: string; pendingInvite: string; resendInvite: string
  
  // Analytics
  conversion: string; avgSession: string; repeatGuests: string
  responseTime: string; topListings: string; revenueByMonth: string
  bookingsBySource: string; guestDemographics: string
  
  // API Keys
  apiKeys: string; generateKey: string; keyName: string
  environment: string; production: string; development: string
  created: string; lastUsed: string; revoke: string
  copy: string; apiDocumentation: string
  
  // Common
  save: string; export: string; total: string
  category: string; totalGuests: string; avgSpend: string
  generate: string; download: string; profit: string
  quarterly: string; annual: string; platform: string
  import: string; syncNow: string
  
  // ========================================
  // EXPENSES PAGE
  // ========================================
  addExpense: string
  expenseName: string
  amount: string
  date: string
  receipt: string
  uploadReceipt: string
  totalExpenses: string
  thisMonthExpenses: string
  categoryBreakdown: string
  recentExpenses: string
  maintenance: string
  utilities: string
  cleaning: string
  supplies: string
  marketing: string
  other: string
  noExpenses: string
  expenseAdded: string
  notes: string
  
  // ========================================
  // REPORTS PAGE
  // ========================================
  generateReport: string
  reportType: string
  dateRange: string
  startDate: string
  endDate: string
  downloadPdf: string
  emailReport: string
  financialSummary: string
  bookingSummary: string
  taxReport: string
  customReport: string
  noReports: string
  reportGenerated: string
  selectReportType: string
  totalBookings: string
  netProfit: string
  
  // ========================================
  // ICAL SYNC PAGE
  // ========================================
  syncCalendar: string
  importCalendar: string
  exportCalendar: string
  calendarUrl: string
  copyUrl: string
  pasteUrl: string
  lastSynced: string
  autoSync: string
  syncEvery: string
  hours: string
  airbnbSync: string
  bookingSync: string
  vrboSync: string
  noSyncs: string
  syncCompleted: string
  bothWays: string
  importOnly: string
  exportOnly: string
  
  // ========================================
  // SMART PRICING PAGE
  // ========================================
  suggestedPrice: string
  currentPrice: string
  applyPrice: string
  priceHistory: string
  demandForecast: string
  competitorPricing: string
  seasonalTrends: string
  weekendPricing: string
  lastMinuteDiscount: string
  earlyBirdDiscount: string
  minimumStay: string
  noPricingSuggestions: string
  priceUpdated: string
  confidence: string
  low: string
  medium: string
  high: string
  
  // ========================================
  // WHATSAPP PAGE
  // ========================================
  whatsappTemplates: string
  createTemplate: string
  templateName: string
  templateMessage: string
  useTemplate: string
  bookingConfirmation: string
  checkInReminder: string
  checkOutReminder: string
  reviewRequest: string
  specialOffer: string
  noTemplates: string
  templateCreated: string
  sendMessage: string
  selectGuest: string
  variables: string
  preview: string
  edit: string

  // Dashboard inline strings (previously isAr ternaries)
  awaitingReview: string
  pendingAdminReview: string
  noArrivals: string
  noActivity: string
  noSuggestions: string
  viewAllSuggestions: string
  renewsOn: string
  lifetimePlan: string
  totalSlotsLbl: string
  upgradeBtn: string
  choosePkgSub: string
  priceCol: string
  viewsCol: string
  bookingsCol: string
  bookedActivity: string
  requestActivity: string
  highDemandReason: string
  lowConversionReason: string
  ownerRole: string
  appearance: string
  darkModeLabel: string
  chooseLang: string
  notifications: string
}

export const STRINGS: Record<Locale, T> = {
  // ========================================
  // ENGLISH
  // ========================================
  en: {
    // Navigation & General
    portal: 'Owner Portal', dashboard: 'Dashboard', listings: 'Listings',
    packages: 'Packages', settings: 'Settings', signOut: 'Sign out',
    addListing: 'Add listing', noSub: 'No active plan', browsePkg: 'Browse plans',
    used: 'used', left: 'left', pending: 'Pending review',
    bookings: 'Bookings', flashDeals: 'Flash deals', analytics: 'Analytics',
    financials: 'Financials', calendar: 'Calendar', icalSync: 'iCal sync',
    smartPrice: 'Smart pricing', whatsapp: 'WhatsApp', expenses: 'Expenses',
    guestHistory: 'Guests', reports: 'Reports', premium: 'Premium',
    viewSite: 'View site', account: 'Account', general: 'General',
    growth: 'Growth tools', goodMorning: 'Good morning', goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening', today: 'Today', thisMonth: 'This month',
    revenue: 'Revenue', occupancy: 'Occupancy', adr: 'Avg. nightly rate',
    views: 'Listing views', bookingsLbl: 'Bookings', vsLast: 'vs. last month',
    upcoming: 'Upcoming', checkIns: 'Check-ins', checkOuts: 'Check-outs',
    quickActions: 'Quick actions', newDeal: 'Create flash deal', message: 'Message guest',
    blockDates: 'Block dates', sync: 'Sync calendars', activity: 'Recent activity',
    pendingItems: 'Awaiting your review', listingPerf: 'Listing performance',
    pricingTip: 'Smart-pricing suggestions', search: 'Search listings, bookings, guests',
    allListings: 'All listings', properties: 'Properties', cars: 'Cars',
    status: 'Status', live: 'Live', draft: 'Draft', paused: 'Paused',
    next7: 'Next 7 days', month: 'Month', week: 'Week', day: 'Day',
    viewAll: 'View all', applyTip: 'Apply suggestion', dismiss: 'Dismiss',
    
    // Team Management
    team: 'Team', teamManagement: 'Team Management', inviteMember: 'Invite member',
    teamMembers: 'Team members', noTeamMembers: 'No team members yet', inviteTeamMember: 'Invite team member',
    enterEmail: 'Enter email address', selectRole: 'Select role', owner: 'Owner',
    coHost: 'Co-host', operations: 'Operations', accountant: 'Accountant',
    custom: 'Custom', permissions: 'Permissions', sendInvite: 'Send invite',
    cancel: 'Cancel', inviteSent: 'Invite sent', invitationSent: 'Invitation sent successfully',
    active: 'Active', lastActive: 'Last active', remove: 'Remove',
    editPermissions: 'Edit permissions', viewFinancials: 'View financials', viewAnalytics: 'View analytics',
    manageListings: 'Manage listings', manageBookings: 'Manage bookings', manageCalendar: 'Manage calendar',
    managePricing: 'Manage pricing', manageFlashDeals: 'Manage flash deals', viewGuestContact: 'View guest contact',
    manageTeam: 'Manage team', manageSettings: 'Manage settings', teamSub: 'Invite and manage your team members',
    member: 'Member', role: 'Role', pendingInvite: 'Pending invite', resendInvite: 'Resend',
    
    // Analytics
    conversion: 'Conversion', avgSession: 'Avg session', repeatGuests: 'Repeat guests',
    responseTime: 'Response time', topListings: 'Top listings', revenueByMonth: 'Revenue by month',
    bookingsBySource: 'Bookings by source', guestDemographics: 'Guest demographics',
    
    // API Keys
    apiKeys: 'API Keys', generateKey: 'Generate key', keyName: 'Key name',
    environment: 'Environment', production: 'Production', development: 'Development',
    created: 'Created', lastUsed: 'Last used', revoke: 'Revoke',
    copy: 'Copy', apiDocumentation: 'API Documentation',
    
    // Common
    save: 'Save', export: 'Export', total: 'Total',
    category: 'Category', totalGuests: 'Total guests', avgSpend: 'Avg. spend',
    generate: 'Generate', download: 'Download', profit: 'Profit',
    quarterly: 'Quarterly', annual: 'Annual', platform: 'Platform',
    import: 'Import', syncNow: 'Sync now',
    
    // Expenses
    addExpense: 'Add Expense', expenseName: 'Expense name', amount: 'Amount',
    date: 'Date', receipt: 'Receipt', uploadReceipt: 'Upload receipt',
    totalExpenses: 'Total expenses', thisMonthExpenses: 'This month', categoryBreakdown: 'By category',
    recentExpenses: 'Recent expenses', maintenance: 'Maintenance', utilities: 'Utilities',
    cleaning: 'Cleaning', supplies: 'Supplies', marketing: 'Marketing',
    other: 'Other', noExpenses: 'No expenses yet', expenseAdded: 'Expense added',
    notes: 'Notes',
    
    // Reports
    generateReport: 'Generate report', reportType: 'Report type', dateRange: 'Date range',
    startDate: 'Start date', endDate: 'End date', downloadPdf: 'Download PDF',
    emailReport: 'Email report', financialSummary: 'Financial summary', bookingSummary: 'Booking summary',
    taxReport: 'Tax report', customReport: 'Custom report', noReports: 'No reports generated',
    reportGenerated: 'Report generated', selectReportType: 'Select report type', totalBookings: 'Total bookings',
    netProfit: 'Net profit',
    
    // iCal Sync
    syncCalendar: 'Sync calendar', importCalendar: 'Import calendar', exportCalendar: 'Export calendar',
    calendarUrl: 'Calendar URL', copyUrl: 'Copy URL', pasteUrl: 'Paste URL',
    lastSynced: 'Last synced', autoSync: 'Auto-sync', syncEvery: 'Sync every',
    hours: 'hours', airbnbSync: 'Airbnb calendar', bookingSync: 'Booking.com calendar',
    vrboSync: 'VRBO calendar', noSyncs: 'No calendars synced', syncCompleted: 'Sync completed',
    bothWays: 'Both ways', importOnly: 'Import only', exportOnly: 'Export only',
    
    // Smart Pricing
    suggestedPrice: 'Suggested price', currentPrice: 'Current price', applyPrice: 'Apply price',
    priceHistory: 'Price history', demandForecast: 'Demand forecast', competitorPricing: 'Competitor pricing',
    seasonalTrends: 'Seasonal trends', weekendPricing: 'Weekend pricing', lastMinuteDiscount: 'Last-minute discount',
    earlyBirdDiscount: 'Early bird discount', minimumStay: 'Minimum stay', noPricingSuggestions: 'No pricing suggestions',
    priceUpdated: 'Price updated', confidence: 'Confidence', low: 'Low',
    medium: 'Medium', high: 'High',
    
    // WhatsApp
    whatsappTemplates: 'WhatsApp templates', createTemplate: 'Create template', templateName: 'Template name',
    templateMessage: 'Message', useTemplate: 'Use template', bookingConfirmation: 'Booking confirmation',
    checkInReminder: 'Check-in reminder', checkOutReminder: 'Check-out reminder', reviewRequest: 'Review request',
    specialOffer: 'Special offer', noTemplates: 'No templates yet', templateCreated: 'Template created',
    sendMessage: 'Send message', selectGuest: 'Select guest', variables: 'Variables',
    preview: 'Preview', edit: 'Edit',

    // Dashboard inline strings
    awaitingReview: 'awaiting review',
    pendingAdminReview: 'Pending admin review',
    noArrivals: 'No arrivals this week',
    noActivity: 'No activity yet',
    noSuggestions: 'No suggestions yet — add listings first',
    viewAllSuggestions: 'View all suggestions →',
    renewsOn: 'Renews',
    lifetimePlan: 'Lifetime plan',
    totalSlotsLbl: 'Total slots',
    upgradeBtn: 'Upgrade',
    choosePkgSub: 'Choose a package to start listing your properties and cars',
    priceCol: 'Price',
    viewsCol: 'Views',
    bookingsCol: 'Bookings',
    bookedActivity: '{gName} booked "{lName}"',
    requestActivity: 'New booking request from {gName}',
    highDemandReason: 'High demand — opportunity to increase',
    lowConversionReason: 'Low conversion — reduce to improve bookings',
    ownerRole: 'Property Owner',
    appearance: 'Appearance',
    darkModeLabel: 'Dark Mode',
    chooseLang: 'Language',
    notifications: 'Notifications',
  },

  // ========================================
  // ARABIC (Modern Standard - فصحى مبسطة)
  // ========================================
  ar: {
    // Navigation & General
    portal: 'بوابة المالك', dashboard: 'لوحة التحكم', listings: 'الإعلانات',
    packages: 'الباقات', settings: 'الإعدادات', signOut: 'تسجيل الخروج',
    addListing: 'إضافة إعلان', noSub: 'لا توجد باقة نشطة', browsePkg: 'تصفح الباقات',
    used: 'مستخدم', left: 'متبقي', pending: 'قيد المراجعة',
    bookings: 'الحجوزات', flashDeals: 'العروض السريعة', analytics: 'التحليلات',
    financials: 'الماليات', calendar: 'التقويم', icalSync: 'مزامنة iCal',
    smartPrice: 'التسعير الذكي', whatsapp: 'واتساب', expenses: 'المصاريف',
    guestHistory: 'الضيوف', reports: 'التقارير', premium: 'مميز',
    viewSite: 'زيارة الموقع', account: 'الحساب', general: 'عام',
    growth: 'أدوات النمو', goodMorning: 'صباح الخير', goodAfternoon: 'مساء الخير',
    goodEvening: 'مساء الخير', today: 'اليوم', thisMonth: 'هذا الشهر',
    revenue: 'الإيرادات', occupancy: 'الإشغال', adr: 'متوسط سعر الليلة',
    views: 'المشاهدات', bookingsLbl: 'الحجوزات', vsLast: 'مقارنة بالشهر الماضي',
    upcoming: 'القادمة', checkIns: 'الوصول', checkOuts: 'المغادرة',
    quickActions: 'إجراءات سريعة', newDeal: 'إنشاء عرض', message: 'مراسلة الضيف',
    blockDates: 'حجب التواريخ', sync: 'مزامنة التقويمات', activity: 'النشاط الأخير',
    pendingItems: 'في انتظار مراجعتك', listingPerf: 'أداء الإعلان',
    pricingTip: 'اقتراحات التسعير', search: 'ابحث في الإعلانات والحجوزات',
    allListings: 'جميع الإعلانات', properties: 'العقارات', cars: 'السيارات',
    status: 'الحالة', live: 'نشط', draft: 'مسودة', paused: 'متوقف',
    next7: 'الأيام السبعة القادمة', month: 'شهر', week: 'أسبوع', day: 'يوم',
    viewAll: 'عرض الكل', applyTip: 'تطبيق الاقتراح', dismiss: 'تجاهل',
    
    // Team Management
    team: 'الفريق', teamManagement: 'إدارة الفريق', inviteMember: 'دعوة عضو',
    teamMembers: 'أعضاء الفريق', noTeamMembers: 'لا يوجد أعضاء بعد', inviteTeamMember: 'دعوة عضو فريق',
    enterEmail: 'أدخل البريد الإلكتروني', selectRole: 'اختر الدور', owner: 'المالك',
    coHost: 'مضيف مشارك', operations: 'العمليات', accountant: 'محاسب',
    custom: 'مخصص', permissions: 'الصلاحيات', sendInvite: 'إرسال الدعوة',
    cancel: 'إلغاء', inviteSent: 'تم إرسال الدعوة', invitationSent: 'تم إرسال الدعوة بنجاح',
    active: 'نشط', lastActive: 'آخر نشاط', remove: 'إزالة',
    editPermissions: 'تعديل الصلاحيات', viewFinancials: 'عرض الماليات', viewAnalytics: 'عرض التحليلات',
    manageListings: 'إدارة الإعلانات', manageBookings: 'إدارة الحجوزات', manageCalendar: 'إدارة التقويم',
    managePricing: 'إدارة التسعير', manageFlashDeals: 'إدارة العروض', viewGuestContact: 'عرض بيانات الضيوف',
    manageTeam: 'إدارة الفريق', manageSettings: 'إدارة الإعدادات', teamSub: 'دعوة وإدارة أعضاء فريقك',
    member: 'عضو', role: 'الدور', pendingInvite: 'دعوة معلقة', resendInvite: 'إعادة الإرسال',
    
    // Analytics
    conversion: 'معدل التحويل', avgSession: 'متوسط الجلسة', repeatGuests: 'الضيوف المتكررون',
    responseTime: 'وقت الاستجابة', topListings: 'أفضل الإعلانات', revenueByMonth: 'الإيرادات الشهرية',
    bookingsBySource: 'الحجوزات حسب المصدر', guestDemographics: 'التوزيع الديموغرافي',
    
    // API Keys
    apiKeys: 'مفاتيح API', generateKey: 'إنشاء مفتاح', keyName: 'اسم المفتاح',
    environment: 'البيئة', production: 'الإنتاج', development: 'التطوير',
    created: 'تاريخ الإنشاء', lastUsed: 'آخر استخدام', revoke: 'إلغاء',
    copy: 'نسخ', apiDocumentation: 'وثائق API',
    
    // Common
    save: 'حفظ', export: 'تصدير', total: 'الإجمالي',
    category: 'الفئة', totalGuests: 'إجمالي الضيوف', avgSpend: 'متوسط الإنفاق',
    generate: 'إنشاء', download: 'تحميل', profit: 'الربح',
    quarterly: 'ربع سنوي', annual: 'سنوي', platform: 'المنصة',
    import: 'استيراد', syncNow: 'مزامنة الآن',
    
    // Expenses
    addExpense: 'إضافة مصروف', expenseName: 'اسم المصروف', amount: 'المبلغ',
    date: 'التاريخ', receipt: 'الإيصال', uploadReceipt: 'رفع الإيصال',
    totalExpenses: 'إجمالي المصاريف', thisMonthExpenses: 'هذا الشهر', categoryBreakdown: 'حسب الفئة',
    recentExpenses: 'المصاريف الأخيرة', maintenance: 'الصيانة', utilities: 'الخدمات',
    cleaning: 'النظافة', supplies: 'المستلزمات', marketing: 'التسويق',
    other: 'أخرى', noExpenses: 'لا توجد مصاريف بعد', expenseAdded: 'تمت إضافة المصروف',
    notes: 'ملاحظات',
    
    // Reports
    generateReport: 'إنشاء تقرير', reportType: 'نوع التقرير', dateRange: 'الفترة الزمنية',
    startDate: 'تاريخ البداية', endDate: 'تاريخ النهاية', downloadPdf: 'تحميل PDF',
    emailReport: 'إرسال التقرير', financialSummary: 'ملخص مالي', bookingSummary: 'ملخص الحجوزات',
    taxReport: 'تقرير ضريبي', customReport: 'تقرير مخصص', noReports: 'لا توجد تقارير',
    reportGenerated: 'تم إنشاء التقرير', selectReportType: 'اختر نوع التقرير', totalBookings: 'إجمالي الحجوزات',
    netProfit: 'صافي الربح',
    
    // iCal Sync
    syncCalendar: 'مزامنة التقويم', importCalendar: 'استيراد التقويم', exportCalendar: 'تصدير التقويم',
    calendarUrl: 'رابط التقويم', copyUrl: 'نسخ الرابط', pasteUrl: 'لصق الرابط',
    lastSynced: 'آخر مزامنة', autoSync: 'مزامنة تلقائية', syncEvery: 'مزامنة كل',
    hours: 'ساعات', airbnbSync: 'تقويم Airbnb', bookingSync: 'تقويم Booking.com',
    vrboSync: 'تقويم VRBO', noSyncs: 'لا توجد تقاويم متزامنة', syncCompleted: 'اكتملت المزامنة',
    bothWays: 'الاتجاهين', importOnly: 'استيراد فقط', exportOnly: 'تصدير فقط',
    
    // Smart Pricing
    suggestedPrice: 'السعر المقترح', currentPrice: 'السعر الحالي', applyPrice: 'تطبيق السعر',
    priceHistory: 'تاريخ الأسعار', demandForecast: 'توقعات الطلب', competitorPricing: 'أسعار المنافسين',
    seasonalTrends: 'الاتجاهات الموسمية', weekendPricing: 'أسعار نهاية الأسبوع', lastMinuteDiscount: 'خصم اللحظة الأخيرة',
    earlyBirdDiscount: 'خصم الحجز المبكر', minimumStay: 'الحد الأدنى للإقامة', noPricingSuggestions: 'لا توجد اقتراحات أسعار',
    priceUpdated: 'تم تحديث السعر', confidence: 'الثقة', low: 'منخفض',
    medium: 'متوسط', high: 'عالي',
    
    // WhatsApp
    whatsappTemplates: 'قوالب واتساب', createTemplate: 'إنشاء قالب', templateName: 'اسم القالب',
    templateMessage: 'الرسالة', useTemplate: 'استخدام القالب', bookingConfirmation: 'تأكيد الحجز',
    checkInReminder: 'تذكير تسجيل الوصول', checkOutReminder: 'تذكير تسجيل المغادرة', reviewRequest: 'طلب تقييم',
    specialOffer: 'عرض خاص', noTemplates: 'لا توجد قوالب بعد', templateCreated: 'تم إنشاء القالب',
    sendMessage: 'إرسال رسالة', selectGuest: 'اختر ضيف', variables: 'المتغيرات',
    preview: 'معاينة', edit: 'تعديل',

    // Dashboard inline strings
    awaitingReview: 'قيد المراجعة',
    pendingAdminReview: 'قيد المراجعة من الإدارة',
    noArrivals: 'لا وصول قادم هذا الأسبوع',
    noActivity: 'لا يوجد نشاط بعد',
    noSuggestions: 'لا اقتراحات بعد — أضف عقاراتك أولاً',
    viewAllSuggestions: 'عرض كل الاقتراحات ←',
    renewsOn: 'ينتهي',
    lifetimePlan: 'اشتراك دائم',
    totalSlotsLbl: 'إجمالي الـ slots',
    upgradeBtn: 'رقّي الباقة',
    choosePkgSub: 'اختر باقة لبدء نشر عقاراتك وسياراتك',
    priceCol: 'السعر',
    viewsCol: 'المشاهدات',
    bookingsCol: 'الحجوزات',
    bookedActivity: '{gName} حجز "{lName}"',
    requestActivity: 'طلب حجز جديد من {gName}',
    highDemandReason: 'طلب مرتفع — فرصة لرفع السعر',
    lowConversionReason: 'معدل تحويل منخفض — خفّض السعر لتحسين الحجوزات',
    ownerRole: 'مالك عقار',
    appearance: 'المظهر',
    darkModeLabel: 'الوضع الداكن',
    chooseLang: 'اللغة',
    notifications: 'الإشعارات',
  },

  // ========================================
  // RUSSIAN (Русский)
  // ========================================
  ru: {
    // Navigation & General
    portal: 'Портал владельца', dashboard: 'Панель', listings: 'Объявления',
    packages: 'Пакеты', settings: 'Настройки', signOut: 'Выйти',
    addListing: 'Добавить', noSub: 'Нет плана', browsePkg: 'Выбрать план',
    used: 'использовано', left: 'осталось', pending: 'На проверке',
    bookings: 'Бронирования', flashDeals: 'Скидки', analytics: 'Аналитика',
    financials: 'Финансы', calendar: 'Календарь', icalSync: 'iCal',
    smartPrice: 'Цены', whatsapp: 'WhatsApp', expenses: 'Расходы',
    guestHistory: 'Гости', reports: 'Отчёты', premium: 'Premium',
    viewSite: 'Сайт', account: 'Аккаунт', general: 'Общее',
    growth: 'Рост', goodMorning: 'Доброе утро', goodAfternoon: 'Добрый день',
    goodEvening: 'Добрый вечер', today: 'Сегодня', thisMonth: 'Этот месяц',
    revenue: 'Доход', occupancy: 'Занятость', adr: 'Средняя цена',
    views: 'Просмотры', bookingsLbl: 'Бронирования', vsLast: 'vs. прошлый месяц',
    upcoming: 'Предстоящие', checkIns: 'Заезды', checkOuts: 'Выезды',
    quickActions: 'Действия', newDeal: 'Создать скидку', message: 'Сообщение',
    blockDates: 'Блокировать даты', sync: 'Синхронизация', activity: 'Активность',
    pendingItems: 'На проверке', listingPerf: 'Производительность',
    pricingTip: 'Подсказки по цене', search: 'Поиск',
    allListings: 'Все объявления', properties: 'Недвижимость', cars: 'Машины',
    status: 'Статус', live: 'Активно', draft: 'Черновик', paused: 'Приостановлено',
    next7: 'Следующие 7 дней', month: 'Месяц', week: 'Неделя', day: 'День',
    viewAll: 'Все', applyTip: 'Применить', dismiss: 'Отклонить',
    
    // Team Management
    team: 'Команда', teamManagement: 'Управление командой', inviteMember: 'Пригласить',
    teamMembers: 'Члены команды', noTeamMembers: 'Нет участников', inviteTeamMember: 'Пригласить участника',
    enterEmail: 'Email', selectRole: 'Роль', owner: 'Владелец',
    coHost: 'Со-хост', operations: 'Операции', accountant: 'Бухгалтер',
    custom: 'Своя роль', permissions: 'Права', sendInvite: 'Отправить',
    cancel: 'Отмена', inviteSent: 'Приглашение отправлено', invitationSent: 'Приглашение отправлено',
    active: 'Активен', lastActive: 'Последняя активность', remove: 'Удалить',
    editPermissions: 'Изменить права', viewFinancials: 'Финансы', viewAnalytics: 'Аналитика',
    manageListings: 'Управление объявлениями', manageBookings: 'Управление бронированиями', manageCalendar: 'Календарь',
    managePricing: 'Цены', manageFlashDeals: 'Скидки', viewGuestContact: 'Контакты гостей',
    manageTeam: 'Команда', manageSettings: 'Настройки', teamSub: 'Управление участниками',
    member: 'Участник', role: 'Роль', pendingInvite: 'Ожидает', resendInvite: 'Повторить',
    
    // Analytics
    conversion: 'Конверсия', avgSession: 'Средняя сессия', repeatGuests: 'Повторные гости',
    responseTime: 'Время ответа', topListings: 'Топ объявлений', revenueByMonth: 'Доход по месяцам',
    bookingsBySource: 'Источники бронирований', guestDemographics: 'Демография гостей',
    
    // API Keys
    apiKeys: 'API ключи', generateKey: 'Создать ключ', keyName: 'Название',
    environment: 'Среда', production: 'Продакшн', development: 'Разработка',
    created: 'Создан', lastUsed: 'Использован', revoke: 'Отозвать',
    copy: 'Копировать', apiDocumentation: 'Документация API',
    
    // Common
    save: 'Сохранить', export: 'Экспорт', total: 'Всего',
    category: 'Категория', totalGuests: 'Всего гостей', avgSpend: 'Средний чек',
    generate: 'Создать', download: 'Скачать', profit: 'Прибыль',
    quarterly: 'Квартальный', annual: 'Годовой', platform: 'Платформа',
    import: 'Импорт', syncNow: 'Синхронизировать',
    
    // Expenses
    addExpense: 'Добавить расход', expenseName: 'Название', amount: 'Сумма',
    date: 'Дата', receipt: 'Чек', uploadReceipt: 'Загрузить чек',
    totalExpenses: 'Всего расходов', thisMonthExpenses: 'За этот месяц', categoryBreakdown: 'По категориям',
    recentExpenses: 'Недавние расходы', maintenance: 'Обслуживание', utilities: 'Коммунальные',
    cleaning: 'Уборка', supplies: 'Расходники', marketing: 'Маркетинг',
    other: 'Другое', noExpenses: 'Нет расходов', expenseAdded: 'Расход добавлен',
    notes: 'Заметки',
    
    // Reports
    generateReport: 'Создать отчёт', reportType: 'Тип отчёта', dateRange: 'Период',
    startDate: 'Начало', endDate: 'Конец', downloadPdf: 'Скачать PDF',
    emailReport: 'Отправить отчёт', financialSummary: 'Финансовый отчёт', bookingSummary: 'Отчёт по бронированиям',
    taxReport: 'Налоговый отчёт', customReport: 'Свой отчёт', noReports: 'Нет отчётов',
    reportGenerated: 'Отчёт создан', selectReportType: 'Выберите тип', totalBookings: 'Всего бронирований',
    netProfit: 'Чистая прибыль',
    
    // iCal Sync
    syncCalendar: 'Синхронизация', importCalendar: 'Импорт', exportCalendar: 'Экспорт',
    calendarUrl: 'URL календаря', copyUrl: 'Копировать', pasteUrl: 'Вставить URL',
    lastSynced: 'Последняя синхронизация', autoSync: 'Авто-синхронизация', syncEvery: 'Каждые',
    hours: 'часов', airbnbSync: 'Airbnb', bookingSync: 'Booking.com',
    vrboSync: 'VRBO', noSyncs: 'Нет календарей', syncCompleted: 'Синхронизировано',
    bothWays: 'Двусторонняя', importOnly: 'Только импорт', exportOnly: 'Только экспорт',
    
    // Smart Pricing
    suggestedPrice: 'Рекомендуемая цена', currentPrice: 'Текущая цена', applyPrice: 'Применить',
    priceHistory: 'История цен', demandForecast: 'Прогноз спроса', competitorPricing: 'Цены конкурентов',
    seasonalTrends: 'Сезонные тренды', weekendPricing: 'Выходные', lastMinuteDiscount: 'Скидка последней минуты',
    earlyBirdDiscount: 'Ранее бронирование', minimumStay: 'Мин. срок', noPricingSuggestions: 'Нет рекомендаций',
    priceUpdated: 'Цена обновлена', confidence: 'Уверенность', low: 'Низкая',
    medium: 'Средняя', high: 'Высокая',
    
    // WhatsApp
    whatsappTemplates: 'Шаблоны WhatsApp', createTemplate: 'Создать шаблон', templateName: 'Название',
    templateMessage: 'Сообщение', useTemplate: 'Использовать', bookingConfirmation: 'Подтверждение',
    checkInReminder: 'Напоминание о заезде', checkOutReminder: 'Напоминание о выезде', reviewRequest: 'Запрос отзыва',
    specialOffer: 'Спецпредложение', noTemplates: 'Нет шаблонов', templateCreated: 'Шаблон создан',
    sendMessage: 'Отправить', selectGuest: 'Выбрать гостя', variables: 'Переменные',
    preview: 'Превью', edit: 'Изменить',

    // Dashboard inline strings
    awaitingReview: 'ожидает проверки',
    pendingAdminReview: 'На проверке у администратора',
    noArrivals: 'Заездов на этой неделе нет',
    noActivity: 'Активности пока нет',
    noSuggestions: 'Нет предложений — сначала добавьте объявления',
    viewAllSuggestions: 'Все предложения →',
    renewsOn: 'Продлевается',
    lifetimePlan: 'Постоянный план',
    totalSlotsLbl: 'Всего слотов',
    upgradeBtn: 'Улучшить',
    choosePkgSub: 'Выберите пакет, чтобы начать размещение',
    priceCol: 'Цена',
    viewsCol: 'Просмотры',
    bookingsCol: 'Бронирования',
    bookedActivity: '{gName} забронировал "{lName}"',
    requestActivity: 'Новый запрос на бронирование от {gName}',
    highDemandReason: 'Высокий спрос — возможность повысить цену',
    lowConversionReason: 'Низкая конверсия — снизьте цену для улучшения бронирований',
    ownerRole: 'Владелец недвижимости',
    appearance: 'Внешний вид',
    darkModeLabel: 'Тёмный режим',
    chooseLang: 'Язык',
    notifications: 'Уведомления',
  },

  // ========================================
  // UKRAINIAN (Українська)
  // ========================================
  uk: {
    // Navigation & General
    portal: 'Портал власника', dashboard: 'Панель', listings: 'Оголошення',
    packages: 'Пакети', settings: 'Налаштування', signOut: 'Вийти',
    addListing: 'Додати', noSub: 'Немає плану', browsePkg: 'Вибрати план',
    used: 'використано', left: 'залишилось', pending: 'На перевірці',
    bookings: 'Бронювання', flashDeals: 'Знижки', analytics: 'Аналітика',
    financials: 'Фінанси', calendar: 'Календар', icalSync: 'iCal',
    smartPrice: 'Ціни', whatsapp: 'WhatsApp', expenses: 'Витрати',
    guestHistory: 'Гості', reports: 'Звіти', premium: 'Premium',
    viewSite: 'Сайт', account: 'Акаунт', general: 'Загальне',
    growth: 'Зростання', goodMorning: 'Доброго ранку', goodAfternoon: 'Добрий день',
    goodEvening: 'Добрий вечір', today: 'Сьогодні', thisMonth: 'Цей місяць',
    revenue: 'Дохід', occupancy: 'Зайнятість', adr: 'Середня ціна',
    views: 'Перегляди', bookingsLbl: 'Бронювання', vsLast: 'vs. минулий місяць',
    upcoming: 'Майбутні', checkIns: 'Заїзди', checkOuts: 'Виїзди',
    quickActions: 'Дії', newDeal: 'Створити знижку', message: 'Повідомлення',
    blockDates: 'Заблокувати дати', sync: 'Синхронізація', activity: 'Активність',
    pendingItems: 'На перевірці', listingPerf: 'Продуктивність',
    pricingTip: 'Підказки по ціні', search: 'Пошук',
    allListings: 'Всі оголошення', properties: 'Нерухомість', cars: 'Машини',
    status: 'Статус', live: 'Активно', draft: 'Чернетка', paused: 'Призупинено',
    next7: 'Наступні 7 днів', month: 'Місяць', week: 'Тиждень', day: 'День',
    viewAll: 'Всі', applyTip: 'Застосувати', dismiss: 'Відхилити',
    
    // Team Management
    team: 'Команда', teamManagement: 'Управління командою', inviteMember: 'Запросити',
    teamMembers: 'Члени команди', noTeamMembers: 'Немає учасників', inviteTeamMember: 'Запросити учасника',
    enterEmail: 'Email', selectRole: 'Роль', owner: 'Власник',
    coHost: 'Співгосподар', operations: 'Операції', accountant: 'Бухгалтер',
    custom: 'Своя роль', permissions: 'Права', sendInvite: 'Надіслати',
    cancel: 'Скасувати', inviteSent: 'Запрошення надіслано', invitationSent: 'Запрошення надіслано',
    active: 'Активний', lastActive: 'Остання активність', remove: 'Видалити',
    editPermissions: 'Змінити права', viewFinancials: 'Фінанси', viewAnalytics: 'Аналітика',
    manageListings: 'Управління оголошеннями', manageBookings: 'Управління бронюваннями', manageCalendar: 'Календар',
    managePricing: 'Ціни', manageFlashDeals: 'Знижки', viewGuestContact: 'Контакти гостей',
    manageTeam: 'Команда', manageSettings: 'Налаштування', teamSub: 'Управління учасниками',
    member: 'Учасник', role: 'Роль', pendingInvite: 'Очікує', resendInvite: 'Повторити',
    
    // Analytics
    conversion: 'Конверсія', avgSession: 'Середня сесія', repeatGuests: 'Повторні гості',
    responseTime: 'Час відповіді', topListings: 'Топ оголошень', revenueByMonth: 'Дохід по місяцях',
    bookingsBySource: 'Джерела бронювань', guestDemographics: 'Демографія гостей',
    
    // API Keys
    apiKeys: 'API ключі', generateKey: 'Створити ключ', keyName: 'Назва',
    environment: 'Середовище', production: 'Продакшн', development: 'Розробка',
    created: 'Створено', lastUsed: 'Використано', revoke: 'Відкликати',
    copy: 'Копіювати', apiDocumentation: 'Документація API',
    
    // Common
    save: 'Зберегти', export: 'Експорт', total: 'Всього',
    category: 'Категорія', totalGuests: 'Всього гостей', avgSpend: 'Середній чек',
    generate: 'Створити', download: 'Завантажити', profit: 'Прибуток',
    quarterly: 'Квартальний', annual: 'Річний', platform: 'Платформа',
    import: 'Імпорт', syncNow: 'Синхронізувати',
    
    // Expenses
    addExpense: 'Додати витрату', expenseName: 'Назва', amount: 'Сума',
    date: 'Дата', receipt: 'Чек', uploadReceipt: 'Завантажити чек',
    totalExpenses: 'Всього витрат', thisMonthExpenses: 'За цей місяць', categoryBreakdown: 'За категоріями',
    recentExpenses: 'Нещодавні витрати', maintenance: 'Обслуговування', utilities: 'Комунальні',
    cleaning: 'Прибирання', supplies: 'Витратники', marketing: 'Маркетинг',
    other: 'Інше', noExpenses: 'Немає витрат', expenseAdded: 'Витрату додано',
    notes: 'Нотатки',
    
    // Reports
    generateReport: 'Створити звіт', reportType: 'Тип звіту', dateRange: 'Період',
    startDate: 'Початок', endDate: 'Кінець', downloadPdf: 'Завантажити PDF',
    emailReport: 'Надіслати звіт', financialSummary: 'Фінансовий звіт', bookingSummary: 'Звіт по бронюванням',
    taxReport: 'Податковий звіт', customReport: 'Свій звіт', noReports: 'Немає звітів',
    reportGenerated: 'Звіт створено', selectReportType: 'Виберіть тип', totalBookings: 'Всього бронювань',
    netProfit: 'Чистий прибуток',
    
    // iCal Sync
    syncCalendar: 'Синхронізація', importCalendar: 'Імпорт', exportCalendar: 'Експорт',
    calendarUrl: 'URL календаря', copyUrl: 'Копіювати', pasteUrl: 'Вставити URL',
    lastSynced: 'Остання синхронізація', autoSync: 'Авто-синхронізація', syncEvery: 'Кожні',
    hours: 'годин', airbnbSync: 'Airbnb', bookingSync: 'Booking.com',
    vrboSync: 'VRBO', noSyncs: 'Немає календарів', syncCompleted: 'Синхронізовано',
    bothWays: 'Двостороння', importOnly: 'Тільки імпорт', exportOnly: 'Тільки експорт',
    
    // Smart Pricing
    suggestedPrice: 'Рекомендована ціна', currentPrice: 'Поточна ціна', applyPrice: 'Застосувати',
    priceHistory: 'Історія цін', demandForecast: 'Прогноз попиту', competitorPricing: 'Ціни конкурентів',
    seasonalTrends: 'Сезонні тренди', weekendPricing: 'Вихідні', lastMinuteDiscount: 'Знижка останньої хвилини',
    earlyBirdDiscount: 'Раннє бронювання', minimumStay: 'Мін. термін', noPricingSuggestions: 'Немає рекомендацій',
    priceUpdated: 'Ціну оновлено', confidence: 'Впевненість', low: 'Низька',
    medium: 'Середня', high: 'Висока',
    
    // WhatsApp
    whatsappTemplates: 'Шаблони WhatsApp', createTemplate: 'Створити шаблон', templateName: 'Назва',
    templateMessage: 'Повідомлення', useTemplate: 'Використати', bookingConfirmation: 'Підтвердження',
    checkInReminder: 'Нагадування про заїзд', checkOutReminder: 'Нагадування про виїзд', reviewRequest: 'Запит відгуку',
    specialOffer: 'Спецпропозиція', noTemplates: 'Немає шаблонів', templateCreated: 'Шаблон створено',
    sendMessage: 'Надіслати', selectGuest: 'Вибрати гостя', variables: 'Змінні',
    preview: 'Попередній перегляд', edit: 'Змінити',

    // Dashboard inline strings
    awaitingReview: 'очікує перевірки',
    pendingAdminReview: 'На перевірці у адміністратора',
    noArrivals: 'Заїздів цього тижня немає',
    noActivity: 'Активності поки немає',
    noSuggestions: 'Немає пропозицій — спочатку додайте оголошення',
    viewAllSuggestions: 'Всі пропозиції →',
    renewsOn: 'Продовжується',
    lifetimePlan: 'Постійний план',
    totalSlotsLbl: 'Всього слотів',
    upgradeBtn: 'Покращити',
    choosePkgSub: 'Виберіть пакет, щоб почати розміщення',
    priceCol: 'Ціна',
    viewsCol: 'Перегляди',
    bookingsCol: 'Бронювання',
    bookedActivity: '{gName} забронював "{lName}"',
    requestActivity: 'Новий запит на бронювання від {gName}',
    highDemandReason: 'Високий попит — можливість підвищити ціну',
    lowConversionReason: 'Низька конверсія — знизьте ціну для покращення бронювань',
    ownerRole: 'Власник нерухомості',
    appearance: 'Зовнішній вигляд',
    darkModeLabel: 'Темний режим',
    chooseLang: 'Мова',
    notifications: 'Сповіщення',
  },

  // ========================================
  // GERMAN (Deutsch)
  // ========================================
  de: {
    // Navigation & General
    portal: 'Eigentümer-Portal', dashboard: 'Dashboard', listings: 'Inserate',
    packages: 'Pakete', settings: 'Einstellungen', signOut: 'Abmelden',
    addListing: 'Inserat hinzufügen', noSub: 'Kein Plan aktiv', browsePkg: 'Pläne durchsuchen',
    used: 'verwendet', left: 'übrig', pending: 'Ausstehend',
    bookings: 'Buchungen', flashDeals: 'Blitz-Angebote', analytics: 'Analytik',
    financials: 'Finanzen', calendar: 'Kalender', icalSync: 'iCal',
    smartPrice: 'Preise', whatsapp: 'WhatsApp', expenses: 'Ausgaben',
    guestHistory: 'Gäste', reports: 'Berichte', premium: 'Premium',
    viewSite: 'Website', account: 'Konto', general: 'Allgemein',
    growth: 'Wachstum', goodMorning: 'Guten Morgen', goodAfternoon: 'Guten Tag',
    goodEvening: 'Guten Abend', today: 'Heute', thisMonth: 'Dieser Monat',
    revenue: 'Umsatz', occupancy: 'Auslastung', adr: 'Durchschn. Preis',
    views: 'Ansichten', bookingsLbl: 'Buchungen', vsLast: 'vs. letzter Monat',
    upcoming: 'Bevorstehend', checkIns: 'Check-ins', checkOuts: 'Check-outs',
    quickActions: 'Schnellaktionen', newDeal: 'Angebot erstellen', message: 'Nachricht',
    blockDates: 'Daten blockieren', sync: 'Synchronisieren', activity: 'Aktivität',
    pendingItems: 'Wartet auf Überprüfung', listingPerf: 'Leistung',
    pricingTip: 'Preisvorschläge', search: 'Suchen',
    allListings: 'Alle Inserate', properties: 'Immobilien', cars: 'Autos',
    status: 'Status', live: 'Live', draft: 'Entwurf', paused: 'Pausiert',
    next7: 'Nächste 7 Tage', month: 'Monat', week: 'Woche', day: 'Tag',
    viewAll: 'Alle anzeigen', applyTip: 'Anwenden', dismiss: 'Ablehnen',
    
    // Team Management
    team: 'Team', teamManagement: 'Team-Verwaltung', inviteMember: 'Einladen',
    teamMembers: 'Team-Mitglieder', noTeamMembers: 'Keine Mitglieder', inviteTeamMember: 'Mitglied einladen',
    enterEmail: 'E-Mail', selectRole: 'Rolle', owner: 'Eigentümer',
    coHost: 'Co-Gastgeber', operations: 'Betrieb', accountant: 'Buchhalter',
    custom: 'Benutzerdefiniert', permissions: 'Berechtigungen', sendInvite: 'Senden',
    cancel: 'Abbrechen', inviteSent: 'Einladung gesendet', invitationSent: 'Einladung gesendet',
    active: 'Aktiv', lastActive: 'Zuletzt aktiv', remove: 'Entfernen',
    editPermissions: 'Berechtigungen bearbeiten', viewFinancials: 'Finanzen', viewAnalytics: 'Analytik',
    manageListings: 'Inserate verwalten', manageBookings: 'Buchungen verwalten', manageCalendar: 'Kalender',
    managePricing: 'Preise', manageFlashDeals: 'Angebote', viewGuestContact: 'Gastkontakte',
    manageTeam: 'Team', manageSettings: 'Einstellungen', teamSub: 'Mitglieder verwalten',
    member: 'Mitglied', role: 'Rolle', pendingInvite: 'Ausstehend', resendInvite: 'Wiederholen',
    
    // Analytics
    conversion: 'Conversion', avgSession: 'Durchschn. Sitzung', repeatGuests: 'Stammgäste',
    responseTime: 'Antwortzeit', topListings: 'Top-Inserate', revenueByMonth: 'Umsatz pro Monat',
    bookingsBySource: 'Buchungsquellen', guestDemographics: 'Gäste-Demografie',
    
    // API Keys
    apiKeys: 'API-Schlüssel', generateKey: 'Schlüssel erstellen', keyName: 'Name',
    environment: 'Umgebung', production: 'Produktion', development: 'Entwicklung',
    created: 'Erstellt', lastUsed: 'Zuletzt verwendet', revoke: 'Widerrufen',
    copy: 'Kopieren', apiDocumentation: 'API-Dokumentation',
    
    // Common
    save: 'Speichern', export: 'Exportieren', total: 'Gesamt',
    category: 'Kategorie', totalGuests: 'Gesamt Gäste', avgSpend: 'Durchschn. Ausgaben',
    generate: 'Erstellen', download: 'Herunterladen', profit: 'Gewinn',
    quarterly: 'Vierteljährlich', annual: 'Jährlich', platform: 'Plattform',
    import: 'Importieren', syncNow: 'Jetzt synchronisieren',
    
    // Expenses
    addExpense: 'Ausgabe hinzufügen', expenseName: 'Name', amount: 'Betrag',
    date: 'Datum', receipt: 'Beleg', uploadReceipt: 'Beleg hochladen',
    totalExpenses: 'Gesamtausgaben', thisMonthExpenses: 'Dieser Monat', categoryBreakdown: 'Nach Kategorie',
    recentExpenses: 'Letzte Ausgaben', maintenance: 'Wartung', utilities: 'Versorgung',
    cleaning: 'Reinigung', supplies: 'Verbrauchsmaterial', marketing: 'Marketing',
    other: 'Sonstiges', noExpenses: 'Keine Ausgaben', expenseAdded: 'Ausgabe hinzugefügt',
    notes: 'Notizen',
    
    // Reports
    generateReport: 'Bericht erstellen', reportType: 'Berichtstyp', dateRange: 'Zeitraum',
    startDate: 'Startdatum', endDate: 'Enddatum', downloadPdf: 'PDF herunterladen',
    emailReport: 'Bericht per E-Mail', financialSummary: 'Finanzbericht', bookingSummary: 'Buchungsbericht',
    taxReport: 'Steuerbericht', customReport: 'Benutzerdefinierter Bericht', noReports: 'Keine Berichte',
    reportGenerated: 'Bericht erstellt', selectReportType: 'Typ auswählen', totalBookings: 'Gesamt Buchungen',
    netProfit: 'Nettogewinn',
    
    // iCal Sync
    syncCalendar: 'Synchronisierung', importCalendar: 'Importieren', exportCalendar: 'Exportieren',
    calendarUrl: 'Kalender-URL', copyUrl: 'Kopieren', pasteUrl: 'URL einfügen',
    lastSynced: 'Zuletzt synchronisiert', autoSync: 'Auto-Sync', syncEvery: 'Alle',
    hours: 'Stunden', airbnbSync: 'Airbnb', bookingSync: 'Booking.com',
    vrboSync: 'VRBO', noSyncs: 'Keine Kalender', syncCompleted: 'Synchronisiert',
    bothWays: 'Beide Richtungen', importOnly: 'Nur Import', exportOnly: 'Nur Export',
    
    // Smart Pricing
    suggestedPrice: 'Vorgeschlagener Preis', currentPrice: 'Aktueller Preis', applyPrice: 'Anwenden',
    priceHistory: 'Preisverlauf', demandForecast: 'Nachfrageprognose', competitorPricing: 'Konkurrenzpreise',
    seasonalTrends: 'Saisonale Trends', weekendPricing: 'Wochenendpreise', lastMinuteDiscount: 'Last-Minute-Rabatt',
    earlyBirdDiscount: 'Frühbucherrabatt', minimumStay: 'Mindestaufenthalt', noPricingSuggestions: 'Keine Vorschläge',
    priceUpdated: 'Preis aktualisiert', confidence: 'Vertrauen', low: 'Niedrig',
    medium: 'Mittel', high: 'Hoch',
    
    // WhatsApp
    whatsappTemplates: 'WhatsApp-Vorlagen', createTemplate: 'Vorlage erstellen', templateName: 'Name',
    templateMessage: 'Nachricht', useTemplate: 'Verwenden', bookingConfirmation: 'Buchungsbestätigung',
    checkInReminder: 'Check-in-Erinnerung', checkOutReminder: 'Check-out-Erinnerung', reviewRequest: 'Bewertungsanfrage',
    specialOffer: 'Sonderangebot', noTemplates: 'Keine Vorlagen', templateCreated: 'Vorlage erstellt',
    sendMessage: 'Senden', selectGuest: 'Gast auswählen', variables: 'Variablen',
    preview: 'Vorschau', edit: 'Bearbeiten',

    // Dashboard inline strings
    awaitingReview: 'wartet auf Überprüfung',
    pendingAdminReview: 'Ausstehende Admin-Überprüfung',
    noArrivals: 'Keine Ankünfte diese Woche',
    noActivity: 'Noch keine Aktivität',
    noSuggestions: 'Noch keine Vorschläge — fügen Sie zuerst Inserate hinzu',
    viewAllSuggestions: 'Alle Vorschläge →',
    renewsOn: 'Verlängert sich',
    lifetimePlan: 'Dauerhafter Plan',
    totalSlotsLbl: 'Gesamte Slots',
    upgradeBtn: 'Upgraden',
    choosePkgSub: 'Wählen Sie ein Paket, um Ihre Inserate zu veröffentlichen',
    priceCol: 'Preis',
    viewsCol: 'Ansichten',
    bookingsCol: 'Buchungen',
    bookedActivity: '{gName} hat "{lName}" gebucht',
    requestActivity: 'Neue Buchungsanfrage von {gName}',
    highDemandReason: 'Hohe Nachfrage — Gelegenheit zur Preiserhöhung',
    lowConversionReason: 'Niedrige Conversion — Preis senken für mehr Buchungen',
    ownerRole: 'Immobilieneigentümer',
    appearance: 'Erscheinungsbild',
    darkModeLabel: 'Dunkler Modus',
    chooseLang: 'Sprache',
    notifications: 'Benachrichtigungen',
  },

  // ========================================
  // ITALIAN (Italiano)
  // ========================================
  it: {
    // Navigation & General
    portal: 'Portale Proprietario', dashboard: 'Dashboard', listings: 'Annunci',
    packages: 'Pacchetti', settings: 'Impostazioni', signOut: 'Esci',
    addListing: 'Aggiungi annuncio', noSub: 'Nessun piano', browsePkg: 'Sfoglia piani',
    used: 'usato', left: 'rimasto', pending: 'In revisione',
    bookings: 'Prenotazioni', flashDeals: 'Offerte lampo', analytics: 'Analytics',
    financials: 'Finanze', calendar: 'Calendario', icalSync: 'iCal',
    smartPrice: 'Prezzi', whatsapp: 'WhatsApp', expenses: 'Spese',
    guestHistory: 'Ospiti', reports: 'Report', premium: 'Premium',
    viewSite: 'Sito', account: 'Account', general: 'Generale',
    growth: 'Crescita', goodMorning: 'Buongiorno', goodAfternoon: 'Buon pomeriggio',
    goodEvening: 'Buonasera', today: 'Oggi', thisMonth: 'Questo mese',
    revenue: 'Entrate', occupancy: 'Occupazione', adr: 'Prezzo medio',
    views: 'Visualizzazioni', bookingsLbl: 'Prenotazioni', vsLast: 'vs. mese scorso',
    upcoming: 'Prossime', checkIns: 'Check-in', checkOuts: 'Check-out',
    quickActions: 'Azioni rapide', newDeal: 'Crea offerta', message: 'Messaggio',
    blockDates: 'Blocca date', sync: 'Sincronizza', activity: 'Attività',
    pendingItems: 'In attesa di revisione', listingPerf: 'Performance',
    pricingTip: 'Suggerimenti prezzo', search: 'Cerca',
    allListings: 'Tutti gli annunci', properties: 'Proprietà', cars: 'Auto',
    status: 'Stato', live: 'Attivo', draft: 'Bozza', paused: 'In pausa',
    next7: 'Prossimi 7 giorni', month: 'Mese', week: 'Settimana', day: 'Giorno',
    viewAll: 'Vedi tutti', applyTip: 'Applica', dismiss: 'Ignora',
    
    // Team Management
    team: 'Team', teamManagement: 'Gestione Team', inviteMember: 'Invita',
    teamMembers: 'Membri del team', noTeamMembers: 'Nessun membro', inviteTeamMember: 'Invita membro',
    enterEmail: 'Email', selectRole: 'Ruolo', owner: 'Proprietario',
    coHost: 'Co-host', operations: 'Operazioni', accountant: 'Contabile',
    custom: 'Personalizzato', permissions: 'Permessi', sendInvite: 'Invia',
    cancel: 'Annulla', inviteSent: 'Invito inviato', invitationSent: 'Invito inviato',
    active: 'Attivo', lastActive: 'Ultima attività', remove: 'Rimuovi',
    editPermissions: 'Modifica permessi', viewFinancials: 'Finanze', viewAnalytics: 'Analytics',
    manageListings: 'Gestisci annunci', manageBookings: 'Gestisci prenotazioni', manageCalendar: 'Calendario',
    managePricing: 'Prezzi', manageFlashDeals: 'Offerte', viewGuestContact: 'Contatti ospiti',
    manageTeam: 'Team', manageSettings: 'Impostazioni', teamSub: 'Gestisci membri',
    member: 'Membro', role: 'Ruolo', pendingInvite: 'In attesa', resendInvite: 'Reinvia',
    
    // Analytics
    conversion: 'Conversione', avgSession: 'Sessione media', repeatGuests: 'Ospiti ricorrenti',
    responseTime: 'Tempo di risposta', topListings: 'Top annunci', revenueByMonth: 'Entrate per mese',
    bookingsBySource: 'Fonti prenotazioni', guestDemographics: 'Demografia ospiti',
    
    // API Keys
    apiKeys: 'Chiavi API', generateKey: 'Genera chiave', keyName: 'Nome',
    environment: 'Ambiente', production: 'Produzione', development: 'Sviluppo',
    created: 'Creato', lastUsed: 'Ultimo utilizzo', revoke: 'Revoca',
    copy: 'Copia', apiDocumentation: 'Documentazione API',
    
    // Common
    save: 'Salva', export: 'Esporta', total: 'Totale',
    category: 'Categoria', totalGuests: 'Totale ospiti', avgSpend: 'Spesa media',
    generate: 'Genera', download: 'Scarica', profit: 'Profitto',
    quarterly: 'Trimestrale', annual: 'Annuale', platform: 'Piattaforma',
    import: 'Importa', syncNow: 'Sincronizza ora',
    
    // Expenses
    addExpense: 'Aggiungi spesa', expenseName: 'Nome', amount: 'Importo',
    date: 'Data', receipt: 'Ricevuta', uploadReceipt: 'Carica ricevuta',
    totalExpenses: 'Spese totali', thisMonthExpenses: 'Questo mese', categoryBreakdown: 'Per categoria',
    recentExpenses: 'Spese recenti', maintenance: 'Manutenzione', utilities: 'Utenze',
    cleaning: 'Pulizia', supplies: 'Forniture', marketing: 'Marketing',
    other: 'Altro', noExpenses: 'Nessuna spesa', expenseAdded: 'Spesa aggiunta',
    notes: 'Note',
    
    // Reports
    generateReport: 'Genera report', reportType: 'Tipo di report', dateRange: 'Periodo',
    startDate: 'Data inizio', endDate: 'Data fine', downloadPdf: 'Scarica PDF',
    emailReport: 'Invia report', financialSummary: 'Riepilogo finanziario', bookingSummary: 'Riepilogo prenotazioni',
    taxReport: 'Report fiscale', customReport: 'Report personalizzato', noReports: 'Nessun report',
    reportGenerated: 'Report generato', selectReportType: 'Seleziona tipo', totalBookings: 'Totale prenotazioni',
    netProfit: 'Profitto netto',
    
    // iCal Sync
    syncCalendar: 'Sincronizza calendario', importCalendar: 'Importa', exportCalendar: 'Esporta',
    calendarUrl: 'URL calendario', copyUrl: 'Copia', pasteUrl: 'Incolla URL',
    lastSynced: 'Ultima sincronizzazione', autoSync: 'Auto-sync', syncEvery: 'Ogni',
    hours: 'ore', airbnbSync: 'Airbnb', bookingSync: 'Booking.com',
    vrboSync: 'VRBO', noSyncs: 'Nessun calendario', syncCompleted: 'Sincronizzato',
    bothWays: 'Bidirezionale', importOnly: 'Solo importazione', exportOnly: 'Solo esportazione',
    
    // Smart Pricing
    suggestedPrice: 'Prezzo suggerito', currentPrice: 'Prezzo attuale', applyPrice: 'Applica',
    priceHistory: 'Storico prezzi', demandForecast: 'Previsione domanda', competitorPricing: 'Prezzi concorrenti',
    seasonalTrends: 'Tendenze stagionali', weekendPricing: 'Prezzi weekend', lastMinuteDiscount: 'Sconto last minute',
    earlyBirdDiscount: 'Sconto prenotazione anticipata', minimumStay: 'Soggiorno minimo', noPricingSuggestions: 'Nessun suggerimento',
    priceUpdated: 'Prezzo aggiornato', confidence: 'Confidenza', low: 'Bassa',
    medium: 'Media', high: 'Alta',
    
    // WhatsApp
    whatsappTemplates: 'Template WhatsApp', createTemplate: 'Crea template', templateName: 'Nome',
    templateMessage: 'Messaggio', useTemplate: 'Usa', bookingConfirmation: 'Conferma prenotazione',
    checkInReminder: 'Promemoria check-in', checkOutReminder: 'Promemoria check-out', reviewRequest: 'Richiesta recensione',
    specialOffer: 'Offerta speciale', noTemplates: 'Nessun template', templateCreated: 'Template creato',
    sendMessage: 'Invia', selectGuest: 'Seleziona ospite', variables: 'Variabili',
    preview: 'Anteprima', edit: 'Modifica',

    // Dashboard inline strings
    awaitingReview: 'in attesa di revisione',
    pendingAdminReview: 'Revisione admin in corso',
    noArrivals: 'Nessun arrivo questa settimana',
    noActivity: 'Nessuna attività ancora',
    noSuggestions: 'Nessun suggerimento ancora — aggiungi prima degli annunci',
    viewAllSuggestions: 'Vedi tutti i suggerimenti →',
    renewsOn: 'Si rinnova',
    lifetimePlan: 'Piano a vita',
    totalSlotsLbl: 'Slot totali',
    upgradeBtn: 'Aggiorna',
    choosePkgSub: 'Scegli un pacchetto per iniziare a pubblicare i tuoi annunci',
    priceCol: 'Prezzo',
    viewsCol: 'Visualizzazioni',
    bookingsCol: 'Prenotazioni',
    bookedActivity: '{gName} ha prenotato "{lName}"',
    requestActivity: 'Nuova richiesta di prenotazione da {gName}',
    highDemandReason: 'Alta domanda — opportunità di aumentare il prezzo',
    lowConversionReason: 'Bassa conversione — riduci il prezzo per migliorare le prenotazioni',
    ownerRole: 'Proprietario immobiliare',
    appearance: 'Aspetto',
    darkModeLabel: 'Modalità scura',
    chooseLang: 'Lingua',
    notifications: 'Notifiche',
  },
}

export function getStrings(locale: Locale): T {
  return STRINGS[locale] || STRINGS.en
}
