import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { Category, Transaction } from '../types'
import { formatCurrency } from '../utils/currency'
import { CategoryIcon } from './CategoryIcon'

interface CategoryPieChartProps {
  transactions: Transaction[]
  categories: Category[]
  currency: string
  activeCategoryId: string | null
  onSliceClick: (categoryId: string | null) => void
}

interface Slice {
  categoryId: string
  name: string
  color: string
  icon: string
  value: number
}

export function CategoryPieChart({
  transactions,
  categories,
  currency,
  activeCategoryId,
  onSliceClick,
}: CategoryPieChartProps) {
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const slices = useMemo<Slice[]>(() => {
    const totals = new Map<string, number>()
    for (const t of transactions) {
      if (t.type !== 'expense' || !t.categoryId) continue
      totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount)
    }
    return Array.from(totals.entries())
      .map(([categoryId, value]) => {
        const category = categoryById.get(categoryId)
        return {
          categoryId,
          value,
          name: category?.name ?? 'Varie',
          color: category?.color ?? '#9497A3',
          icon: category?.icon ?? 'IconVarie',
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [transactions, categoryById])

  const total = slices.reduce((sum, s) => sum + s.value, 0)

  if (slices.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-fg">Spese per categoria</h3>
        <p className="py-8 text-center text-sm text-muted">Nessuna spesa questo mese</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-3 text-sm font-semibold text-fg">Spese per categoria</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={2}
              onClick={(entry) =>
                onSliceClick(activeCategoryId === entry.categoryId ? null : entry.categoryId)
              }
            >
              {slices.map((s) => (
                <Cell
                  key={s.categoryId}
                  fill={s.color}
                  opacity={activeCategoryId && activeCategoryId !== s.categoryId ? 0.35 : 1}
                  className="cursor-pointer"
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'rgb(var(--color-card))',
                border: '1px solid rgb(var(--color-border))',
                borderRadius: 12,
              }}
              labelStyle={{ color: 'rgb(var(--color-fg))' }}
              formatter={(value: number) => formatCurrency(value, currency)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-2 flex flex-col gap-1">
        {slices.map((s) => (
          <li key={s.categoryId}>
            <button
              type="button"
              onClick={() => onSliceClick(activeCategoryId === s.categoryId ? null : s.categoryId)}
              className={`flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-fg/5 ${
                activeCategoryId === s.categoryId ? 'bg-fg/5' : ''
              }`}
            >
              <CategoryIcon icon={s.icon} color={s.color} size={16} circleSize={28} />
              <span className="flex-1 truncate text-sm text-fg">{s.name}</span>
              <span className="text-xs text-muted">{Math.round((s.value / total) * 100)}%</span>
              <span className="text-sm font-medium text-fg">{formatCurrency(s.value, currency)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
