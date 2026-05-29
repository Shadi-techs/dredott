// ============================================
// DredottSTAY — Safety Tips Component
// 3 Variants: Modal (first-time), Collapsible, Inline Banner
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { X, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Camera, DollarSign, FileText, MapPin, AlertTriangle, User } from 'lucide-react'

// ============================================
// TYPES
// ============================================

type SafetyTipsVariant = 'modal' | 'collapsible' | 'banner'

interface SafetyTipsProps {
  variant?: SafetyTipsVariant
  onClose?: () => void
  propertyId?: string // For localStorage key (first-time modal)
}

// ============================================
// SAFETY TIPS CONTENT (All 5 Languages)
// ============================================

const SAFETY_TIPS = {
  en: {
    title: "Safe Contact Guidelines",
    tips: [
      {
        icon: CheckCircle,
        text: "Always use WhatsApp - messages are legally recognized as proof"
      },
      {
        icon: Camera,
        text: "Request recent photos or video of the property before booking"
      },
      {
        icon: DollarSign,
        text: "Never pay full amount upfront - reasonable deposit only (10-20%)"
      },
      {
        icon: FileText,
        text: "Request a clear rental contract with cancellation & refund terms"
      },
      {
        icon: MapPin,
        text: "Verify property location on Google Maps before transferring money"
      },
      {
        icon: AlertTriangle,
        text: "Be cautious of unrealistic offers or extremely low prices"
      },
      {
        icon: User,
        text: "Ask for owner's ID card photo to verify identity"
      }
    ],
    footer: "Dredottprovides contact info only. Direct dealings are between you and the owner.",
    cta: "Got it, continue",
    learnMore: "Learn more",
    collapse: "Hide tips",
    disclaimer: "Disclaimer: Dredottis an advertising intermediary only and assumes no responsibility for direct transactions between users and owners. Verification of all details before booking is advised."
  },
  ar: {
    title: "نصائح للتواصل الآمن",
    tips: [
      {
        icon: CheckCircle,
        text: "استخدم واتساب دائماً - الرسائل معتمدة قانونياً كإثبات"
      },
      {
        icon: Camera,
        text: "اطلب صور إضافية أو فيديو حديث للوحدة قبل الحجز"
      },
      {
        icon: DollarSign,
        text: "لا تدفع المبلغ كاملاً مقدماً - عربون معقول فقط (10-20%)"
      },
      {
        icon: FileText,
        text: "اطلب عقد إيجار واضح يحدد شروط الإلغاء والاسترداد"
      },
      {
        icon: MapPin,
        text: "تحقق من موقع الوحدة على Google Maps قبل التحويل"
      },
      {
        icon: AlertTriangle,
        text: "احذر من العروض المبالغ فيها أو الأسعار المنخفضة جداً"
      },
      {
        icon: User,
        text: "اطلب صورة البطاقة الشخصية للمالك للتأكد من الهوية"
      }
    ],
    footer: "وايت ستورك توفر بيانات الاتصال فقط. التعامل المباشر بينك وبين المالك.",
    cta: "فهمت، المتابعة",
    learnMore: "اعرف المزيد",
    collapse: "إخفاء النصائح",
    disclaimer: "إخلاء المسؤولية: وايت ستورك وسيط إعلاني فقط ولا تتحمل مسؤولية التعاملات المباشرة بين المستخدمين والملاك. يُنصح بالتحقق من كافة التفاصيل قبل إتمام أي حجز."
  },
  it: {
    title: "Linee guida per contatti sicuri",
    tips: [
      {
        icon: CheckCircle,
        text: "Usa sempre WhatsApp - i messaggi sono legalmente riconosciuti come prova"
      },
      {
        icon: Camera,
        text: "Richiedi foto recenti o video della proprietà prima di prenotare"
      },
      {
        icon: DollarSign,
        text: "Non pagare mai l'intero importo in anticipo - solo deposito ragionevole (10-20%)"
      },
      {
        icon: FileText,
        text: "Richiedi un contratto chiaro con termini di cancellazione e rimborso"
      },
      {
        icon: MapPin,
        text: "Verifica la posizione su Google Maps prima di trasferire denaro"
      },
      {
        icon: AlertTriangle,
        text: "Fai attenzione alle offerte irrealistiche o prezzi estremamente bassi"
      },
      {
        icon: User,
        text: "Chiedi foto della carta d'identità del proprietario per verificare l'identità"
      }
    ],
    footer: "Dredottfornisce solo informazioni di contatto. I rapporti diretti sono tra te e il proprietario.",
    cta: "Ho capito, continua",
    learnMore: "Per saperne di più",
    collapse: "Nascondi suggerimenti",
    disclaimer: "Disclaimer: Dredottè solo un intermediario pubblicitario e non si assume alcuna responsabilità per le transazioni dirette tra utenti e proprietari. Si consiglia di verificare tutti i dettagli prima di prenotare."
  },
  ru: {
    title: "Рекомендации по безопасным контактам",
    tips: [
      {
        icon: CheckCircle,
        text: "Всегда используйте WhatsApp - сообщения юридически признаны доказательством"
      },
      {
        icon: Camera,
        text: "Запросите недавние фото или видео объекта перед бронированием"
      },
      {
        icon: DollarSign,
        text: "Никогда не платите полную сумму заранее - только разумный депозит (10-20%)"
      },
      {
        icon: FileText,
        text: "Запросите четкий договор аренды с условиями отмены и возврата"
      },
      {
        icon: MapPin,
        text: "Проверьте местоположение на Google Maps перед переводом денег"
      },
      {
        icon: AlertTriangle,
        text: "Остерегайтесь нереалистичных предложений или чрезвычайно низких цен"
      },
      {
        icon: User,
        text: "Попросите фото паспорта владельца для подтверждения личности"
      }
    ],
    footer: "Dredottпредоставляет только контактную информацию. Прямые сделки между вами и владельцем.",
    cta: "Понятно, продолжить",
    learnMore: "Узнать больше",
    collapse: "Скрыть советы",
    disclaimer: "Отказ от ответственности: Dredottявляется только рекламным посредником и не несет ответственности за прямые сделки между пользователями и владельцами. Рекомендуется проверить все детали перед бронированием."
  },
  de: {
    title: "Sichere Kontaktrichtlinien",
    tips: [
      {
        icon: CheckCircle,
        text: "Immer WhatsApp verwenden - Nachrichten sind rechtlich als Nachweis anerkannt"
      },
      {
        icon: Camera,
        text: "Aktuelle Fotos oder Videos der Immobilie vor der Buchung anfordern"
      },
      {
        icon: DollarSign,
        text: "Niemals vollen Betrag im Voraus zahlen - nur angemessene Anzahlung (10-20%)"
      },
      {
        icon: FileText,
        text: "Klaren Mietvertrag mit Storno- und Rückerstattungsbedingungen anfordern"
      },
      {
        icon: MapPin,
        text: "Standort auf Google Maps überprüfen, bevor Sie Geld überweisen"
      },
      {
        icon: AlertTriangle,
        text: "Vorsicht bei unrealistischen Angeboten oder extrem niedrigen Preisen"
      },
      {
        icon: User,
        text: "Foto des Personalausweises des Eigentümers zur Identitätsprüfung anfordern"
      }
    ],
    footer: "Dredottstellt nur Kontaktinformationen bereit. Direkte Geschäfte sind zwischen Ihnen und dem Eigentümer.",
    cta: "Verstanden, weiter",
    learnMore: "Mehr erfahren",
    collapse: "Tipps ausblenden",
    disclaimer: "Haftungsausschluss: Dredottist nur ein Werbevermittler und übernimmt keine Verantwortung für direkte Transaktionen zwischen Benutzern und Eigentümern. Es wird empfohlen, alle Details vor der Buchung zu überprüfen."
  }
}

// ============================================
// VARIANT 1: FIRST-TIME MODAL
// ============================================

export function SafetyTipsModal({ onClose, propertyId }: SafetyTipsProps) {
  const locale = useLocale() as 'en' | 'ar' | 'it' | 'ru' | 'de'
  const content = SAFETY_TIPS[locale]
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if user has seen this modal before
    const hasSeenKey = `safety_tips_seen_${propertyId || 'global'}`
    const hasSeen = localStorage.getItem(hasSeenKey)
    
    if (!hasSeen) {
      setShow(true)
    }
  }, [propertyId])

  const handleClose = () => {
    const hasSeenKey = `safety_tips_seen_${propertyId || 'global'}`
    localStorage.setItem(hasSeenKey, 'true')
    setShow(false)
    onClose?.()
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tips List */}
        <div className="px-6 py-5 space-y-4">
          {content.tips.map((tip, index) => {
            const Icon = tip.icon
            return (
              <div key={index} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{tip.text}</p>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-600 leading-relaxed">{content.footer}</p>
          </div>
          
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            {content.cta}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// VARIANT 2: COLLAPSIBLE SECTION
// ============================================

export function SafetyTipsCollapsible({ propertyId }: SafetyTipsProps) {
  const locale = useLocale() as 'en' | 'ar' | 'it' | 'ru' | 'de'
  const content = SAFETY_TIPS[locale]
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
      className="border border-amber-200 bg-amber-50/50 rounded-xl overflow-hidden"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-900">{content.title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-amber-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-600" />
        )}
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-4 pb-4 pt-2 space-y-3 border-t border-amber-200">
          {content.tips.map((tip, index) => {
            const Icon = tip.icon
            return (
              <div key={index} className="flex gap-2 items-start">
                <Icon className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 leading-relaxed">{tip.text}</p>
              </div>
            )
          })}
          <div className="pt-2 mt-3 border-t border-amber-200">
            <p className="text-xs text-gray-600">{content.footer}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// VARIANT 3: INLINE BANNER
// ============================================

export function SafetyTipsBanner({ propertyId }: SafetyTipsProps) {
  const locale = useLocale() as 'en' | 'ar' | 'it' | 'ru' | 'de'
  const content = SAFETY_TIPS[locale]

  return (
    <div 
      className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-lg p-4"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900 mb-1">
            {locale === 'ar' ? 'نصيحة: استخدم واتساب للتواصل الآمن والمعتمد قانونياً' : 
             locale === 'it' ? 'Suggerimento: usa WhatsApp per contatti sicuri e legalmente validi' :
             locale === 'ru' ? 'Совет: используйте WhatsApp для безопасных контактов' :
             locale === 'de' ? 'Tipp: WhatsApp für sichere Kommunikation verwenden' :
             'Tip: Use WhatsApp for safe, legally-recognized contact'}
          </p>
          <SafetyTipsCollapsible propertyId={propertyId} />
        </div>
      </div>
    </div>
  )
}

// ============================================
// DEFAULT EXPORT (Combined Component)
// ============================================

export default function SafetyTips({ variant = 'collapsible', ...props }: SafetyTipsProps) {
  switch (variant) {
    case 'modal':
      return <SafetyTipsModal {...props} />
    case 'banner':
      return <SafetyTipsBanner {...props} />
    case 'collapsible':
    default:
      return <SafetyTipsCollapsible {...props} />
  }
}
