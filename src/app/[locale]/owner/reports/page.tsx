'use client'
// src/app/[locale]/owner/reports/page.tsx
// Generate financial and booking reports with PDF export

import { use, useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import {
  FileText, Download, Calendar as CalIcon,
  DollarSign, TrendingUp, Users, Home, Mail
} from 'lucide-react'

import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { DENSITY } from '@/lib/owner/theme'
import { Card } from '@/components/owner/Card'
import { Button } from '@/components/owner/Button'
import { ScreenHeader } from '@/components/owner/ScreenHeader'
import { getStrings } from '@/lib/owner/strings'

// ============================================
// TYPES
// ============================================

interface ReportData {
  totalRevenue: number
  totalBookings: number
  totalGuests: number
  totalExpenses: number
  netProfit: number
  occupancyRate: number
  averageNightlyRate: number
  bookingsByMonth: { month: string; count: number; revenue: number }[]
  topProperties: { name: string; revenue: number; bookings: number }[]
}

type ReportType = 'financial' | 'booking' | 'tax' | 'custom'

// ============================================
// GENERATE REPORT MODAL
// ============================================

function GenerateReportModal({
  locale,
  onClose,
  onGenerate,
}: {
  locale: string
  onClose: () => void
  onGenerate: (type: ReportType, startDate: string, endDate: string) => void
}) {
  const { palette } = useOwnerTheme()
  const t = palette
  const tx = getStrings(locale as any)

  const [reportType, setReportType] = useState<ReportType>('financial')
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const reportTypes = [
    { value: 'financial' as ReportType, label: tx.financialSummary, icon: DollarSign, desc: 'Revenue, expenses, and profit' },
    { value: 'booking' as ReportType, label: tx.bookingSummary, icon: CalIcon, desc: 'Bookings and occupancy stats' },
    { value: 'tax' as ReportType, label: tx.taxReport, icon: FileText, desc: 'Annual tax documentation' },
    { value: 'custom' as ReportType, label: tx.customReport, icon: TrendingUp, desc: 'Build your own report' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 40,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}>
        <div style={{
          background: t.surface,
          borderRadius: 16,
          border: `1px solid ${t.border}`,
          width: '100%',
          maxWidth: 520,
          padding: 24,
        }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: t.text,
            marginBottom: 20,
          }}>
            Generate Report
          </h3>

          {/* Report Types */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            marginBottom: 20,
          }}>
            {reportTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.value}
                  onClick={() => setReportType(type.value)}
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    border: `1px solid ${reportType === type.value ? t.accent : t.border}`,
                    background: reportType === type.value ? t.accentSoft : t.bg,
                    color: reportType === type.value ? t.accent : t.text,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                  }}>
                    <Icon size={18} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {type.label}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: reportType === type.value ? t.accent : t.textMuted,
                  }}>
                    {type.desc}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Date Range */}
          <div style={{
            padding: 16,
            background: t.bg,
            borderRadius: 10,
            marginBottom: 20,
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: t.text,
              marginBottom: 12,
            }}>
              Date Range
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11,
                  color: t.textMuted,
                  marginBottom: 4,
                }}>
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: `1px solid ${t.border}`,
                    background: t.surface,
                    color: t.text,
                    fontSize: 12,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11,
                  color: t.textMuted,
                  marginBottom: 4,
                }}>
                  End date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: `1px solid ${t.border}`,
                    background: t.surface,
                    color: t.text,
                    fontSize: 12,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: 'transparent',
                color: t.textMuted,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onGenerate(reportType, startDate, endDate)
                onClose()
              }}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: t.accentDark,
                color: t.accentInk,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <FileText size={16} />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function ReportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { palette } = useOwnerTheme()
  const t = palette
  const tx = getStrings(locale as any)
  const d = DENSITY.regular
  const router = useRouter()
  const tx = getStrings(locale as any)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    void loadDefaultReport()
  }, [])

  async function loadDefaultReport() {
    const startDate = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
    const endDate = new Date().toISOString().split('T')[0]
    await fetchReportData('financial', startDate, endDate)
  }

  async function fetchReportData(type: ReportType, startDate: string, endDate: string) {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push(`/${locale}/login`)
      return
    }

    // Get bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, property:properties(name)')
      .eq('owner_id', session.user.id)
      .gte('check_in', startDate)
      .lte('check_in', endDate)

    // Get expenses
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)

    // Calculate stats
    const totalRevenue = (bookings || [])
      .filter(b => b.payment_status === 'paid')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0)

    const totalExpenses = (expenses || []).reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalRevenue - totalExpenses

    const totalBookings = bookings?.length || 0
    const uniqueGuests = new Set((bookings || []).map(b => b.guest_id)).size

    // Group by month
    const monthlyData: Record<string, { count: number; revenue: number }> = {}
    bookings?.forEach(b => {
      const month = new Date(b.check_in).toLocaleDateString(locale, { month: 'short', year: 'numeric' })
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, revenue: 0 }
      }
      monthlyData[month].count++
      if (b.payment_status === 'paid') {
        monthlyData[month].revenue += b.total_amount || 0
      }
    })

    // Top properties
    const propertyStats: Record<string, { name: string; revenue: number; bookings: number }> = {}
    bookings?.forEach(b => {
      const propId = b.property_id
      if (!propertyStats[propId]) {
        propertyStats[propId] = {
          name: b.property?.name || 'Property',
          revenue: 0,
          bookings: 0,
        }
      }
      propertyStats[propId].bookings++
      if (b.payment_status === 'paid') {
        propertyStats[propId].revenue += b.total_amount || 0
      }
    })

    setReportData({
      totalRevenue,
      totalBookings,
      totalGuests: uniqueGuests,
      totalExpenses,
      netProfit,
      occupancyRate: 0, // TODO: Calculate based on available days
      averageNightlyRate: totalBookings > 0 ? totalRevenue / totalBookings : 0,
      bookingsByMonth: Object.entries(monthlyData).map(([month, data]) => ({
        month,
        ...data,
      })),
      topProperties: Object.values(propertyStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
    })

    setLoading(false)
  }

  async function handleGenerateReport(type: ReportType, startDate: string, endDate: string) {
    setGenerating(true)
    await fetchReportData(type, startDate, endDate)
    setGenerating(false)
  }

  if (loading) {
    return (
      <div style={{ padding: d.pad, display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
        <div style={{
          width: 32,
          height: 32,
          border: `3px solid ${t.border}`,
          borderTopColor: t.accent,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <div style={{ padding: d.pad }}>
      <ScreenHeader
        kicker="Reports"
        title="Financial Reports"
        sub="Generate detailed reports for your properties"
        actions={
          <>
            <Button variant="ghost" icon={Mail}>Email Report</Button>
            <Button variant="ghost" icon={Download}>Download PDF</Button>
            <Button variant="primary" icon={FileText} onClick={() => setShowGenerateModal(true)}>
              Generate Report
            </Button>
          </>
        }
      />

      {!reportData ? (
        <Card style={{ padding: 60, textAlign: 'center' }}>
          <FileText size={48} color={t.textFaint} style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: 15, color: t.textMuted, marginBottom: 20 }}>
            No report data available
          </div>
          <Button variant="primary" icon={FileText} onClick={() => setShowGenerateModal(true)}>
            Generate Your First Report
          </Button>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}>
            {[
              { label: 'Total Revenue', value: `AED ${reportData.totalRevenue.toLocaleString()}`, icon: DollarSign, color: t.success },
              { label: 'Total Expenses', value: `AED ${reportData.totalExpenses.toLocaleString()}`, icon: TrendingUp, color: t.danger },
              { label: tx.netProfit, value: `AED ${reportData.netProfit.toLocaleString()}`, icon: TrendingUp, color: reportData.netProfit >= 0 ? t.success : t.danger },
              { label: tx.totalBookings, value: reportData.totalBookings.toString(), icon: CalIcon, color: t.accent },
              { label: 'Unique Guests', value: reportData.totalGuests.toString(), icon: Users, color: '#60a5fa' },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${stat.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon size={20} color={stat.color} />
                    </div>
                    <div>
                      <div style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: t.text,
                        fontFamily: 'var(--mono)',
                      }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: 11, color: t.textMuted }}>
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Bookings by Month */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginBottom: 24,
          }}>
            <Card>
              <div style={{
                fontSize: 11,
                fontFamily: 'var(--mono)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: t.textFaint,
                marginBottom: 16,
              }}>
                Bookings by Month
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reportData.bookingsByMonth.map((month) => (
                  <div
                    key={month.month}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: `1px solid ${t.borderSoft}`,
                    }}
                  >
                    <span style={{ fontSize: 13, color: t.text }}>
                      {month.month}
                    </span>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{
                        fontSize: 12,
                        color: t.textMuted,
                        fontFamily: 'var(--mono)',
                      }}>
                        {month.count} bookings
                      </span>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: t.accent,
                        fontFamily: 'var(--mono)',
                      }}>
                        AED {month.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Properties */}
            <Card>
              <div style={{
                fontSize: 11,
                fontFamily: 'var(--mono)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: t.textFaint,
                marginBottom: 16,
              }}>
                Top Properties
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reportData.topProperties.map((prop, idx) => (
                  <div
                    key={prop.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom: `1px solid ${t.borderSoft}`,
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: idx === 0 ? t.accent : t.bg,
                      color: idx === 0 ? t.accentInk : t.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: 'var(--mono)',
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: t.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {prop.name}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: t.textMuted,
                      }}>
                        {prop.bookings} bookings
                      </div>
                    </div>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: t.accent,
                      fontFamily: 'var(--mono)',
                      flexShrink: 0,
                    }}>
                      AED {prop.revenue.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <GenerateReportModal
          locale={locale}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerateReport}
        />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
