'use client'
// src/app/[locale]/owner/expenses/page.tsx
// Expense tracking with categories and receipt uploads

import { use, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Plus, Upload, X, DollarSign, TrendingDown,
  FileText, Calendar as CalIcon, Filter
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

interface Expense {
  id: string
  property_id: string | null
  name: string
  amount: number
  currency: string
  category: string
  expense_date: string
  receipt_url: string | null
  notes: string | null
  created_at: string
  property?: {
    name: string
  }
}

type Category = 'maintenance' | 'utilities' | 'cleaning' | 'supplies' | 'marketing' | 'other'

// ============================================
// ADD EXPENSE MODAL
// ============================================

function AddExpenseModal({
  locale,
  properties,
  onClose,
  onAdded,
}: {
  locale: string
  properties: any[]
  onClose: () => void
  onAdded: () => void
}) {
  const { t, d } = useOwnerTheme()
  const tx = getStrings(locale as any)

  const supabase = createClient()

  const [form, setForm] = useState({
    property_id: '',
    name: '',
    amount: '',
    category: 'maintenance' as Category,
    expense_date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.name || !form.amount) {
      setError('Please fill required fields')
      return
    }

    setSubmitting(true)
    setError('')

    const { error: insertError } = await supabase.from('expenses').insert({
      property_id: form.property_id || null,
      name: form.name,
      amount: parseFloat(form.amount),
      currency: 'AED',
      category: form.category,
      expense_date: form.expense_date,
      notes: form.notes || null,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      onAdded()
      onClose()
    }
    setSubmitting(false)
  }

  const categories: { value: Category; label: string; icon: string }[] = [
    { value: 'maintenance', label: tx.maintenance, icon: '🔧' },
    { value: 'utilities', label: tx.utilities, icon: '💡' },
    { value: 'cleaning', label: tx.cleaning, icon: '🧹' },
    { value: 'supplies', label: tx.supplies, icon: '📦' },
    { value: 'marketing', label: tx.marketing, icon: '📢' },
    { value: 'other', label: tx.other, icon: '📝' },
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
          maxWidth: 480,
          padding: 24,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              color: t.text,
            }}>
              Add Expense
            </h3>
            <button onClick={onClose} style={{
              background: 'none',
              border: 'none',
              color: t.textMuted,
              cursor: 'pointer',
              padding: 4,
            }}>
              <X size={20} />
            </button>
          </div>

          {error && (
            <div style={{
              padding: 12,
              borderRadius: 8,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444',
              fontSize: 13,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}>
                Expense name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., AC repair, Water bill"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: t.bg,
                  color: t.text,
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Amount & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: t.text,
                  marginBottom: 6,
                }}>
                  Amount (AED) *
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1px solid ${t.border}`,
                    background: t.bg,
                    color: t.text,
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: t.text,
                  marginBottom: 6,
                }}>
                  Date
                </label>
                <input
                  type="date"
                  value={form.expense_date}
                  onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1px solid ${t.border}`,
                    background: t.bg,
                    color: t.text,
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}>
                Category
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
              }}>
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setForm({ ...form, category: cat.value })}
                    style={{
                      padding: '10px',
                      borderRadius: 8,
                      border: `1px solid ${form.category === cat.value ? t.accent : t.border}`,
                      background: form.category === cat.value ? t.accentSoft : t.bg,
                      color: form.category === cat.value ? t.accent : t.text,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Property (optional) */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}>
                Property (optional)
              </label>
              <select
                value={form.property_id}
                onChange={(e) => setForm({ ...form, property_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: t.bg,
                  color: t.text,
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              >
                <option value="">General expense</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                marginBottom: 6,
              }}>
                Notes (optional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional details..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: t.bg,
                  color: t.text,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              onClick={onClose}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: 'transparent',
                color: t.textMuted,
                fontSize: 13,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: submitting ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: t.accentDark,
                color: t.accentInk,
                fontSize: 13,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Adding...' : tx.addExpense}
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

export default function ExpensesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const tx = getStrings(locale as any)
  const { t, d } = useOwnerTheme()
  const router = useRouter()

  const supabase = createClient()

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push(`/${locale}/login`)
      return
    }

    // Get properties
    const { data: propsData } = await supabase
      .from('properties')
      .select('id, name')
      .eq('owner_user_id', session.user.id)

    setProperties(propsData || [])

    // Get expenses
    const propertyIds = (propsData || []).map(p => p.id)
    const { data: expensesData } = await supabase
      .from('expenses')
      .select(`
        *,
        property:properties(name)
      `)
      .or(`property_id.in.(${propertyIds.join(',')}),property_id.is.null`)
      .order('expense_date', { ascending: false })

    setExpenses(expensesData || [])
    setLoading(false)
  }

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter(e => e.category === filterCategory)

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const thisMonth = expenses
    .filter(e => {
      const expenseMonth = new Date(e.expense_date).getMonth()
      const currentMonth = new Date().getMonth()
      return expenseMonth === currentMonth
    })
    .reduce((sum, e) => sum + e.amount, 0)

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const categories = [
    { value: 'all', label: 'All', icon: '📊' },
    { value: 'maintenance', label: tx.maintenance, icon: '🔧' },
    { value: 'utilities', label: tx.utilities, icon: '💡' },
    { value: 'cleaning', label: tx.cleaning, icon: '🧹' },
    { value: 'supplies', label: tx.supplies, icon: '📦' },
    { value: 'marketing', label: tx.marketing, icon: '📢' },
    { value: 'other', label: tx.other, icon: '📝' },
  ]

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
        kicker="Expenses"
        title="Expense Tracking"
        sub="Monitor and categorize your property expenses"
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add Expense
          </Button>
        }
      />

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${t.danger}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingDown size={20} color={t.danger} />
            </div>
            <div>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: t.text,
                fontFamily: 'var(--mono)',
              }}>
                AED {totalExpenses.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: t.textMuted }}>
                Total expenses
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${t.accent}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CalIcon size={20} color={t.accent} />
            </div>
            <div>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: t.text,
                fontFamily: 'var(--mono)',
              }}>
                AED {thisMonth.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: t.textMuted }}>
                This month
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 20,
        flexWrap: 'wrap',
      }}>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(cat.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: `1px solid ${filterCategory === cat.value ? t.accent : t.border}`,
              background: filterCategory === cat.value ? t.accentSoft : t.surface,
              color: filterCategory === cat.value ? t.accent : t.text,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <Card style={{ padding: 60, textAlign: 'center' }}>
          <FileText size={48} color={t.textFaint} style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: 15, color: t.textMuted, marginBottom: 8 }}>
            No expenses yet
          </div>
          <div style={{ fontSize: 13, color: t.textFaint, marginBottom: 20 }}>
            Track your property expenses to monitor profitability
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add First Expense
          </Button>
        </Card>
      ) : (
        <Card padding={0}>
          <div>
            {filteredExpenses.map((expense, idx) => (
              <div
                key={expense.id}
                style={{
                  padding: '16px 20px',
                  borderTop: idx === 0 ? 'none' : `1px solid ${t.borderSoft}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: `${t.danger}10`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}>
                  {categories.find(c => c.value === expense.category)?.icon || '📝'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: t.text,
                    marginBottom: 4,
                  }}>
                    {expense.name}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: t.textMuted,
                  }}>
                    {expense.property?.name || 'General'} · {new Date(expense.expense_date).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <div style={{
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: t.danger,
                    fontFamily: 'var(--mono)',
                  }}>
                    -{expense.currency} {expense.amount.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: t.textMuted,
                    textTransform: 'capitalize',
                  }}>
                    {expense.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddExpenseModal
          locale={locale}
          properties={properties}
          onClose={() => setShowAddModal(false)}
          onAdded={fetchData}
        />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
