import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Account, Category, CustomChart, Transaction } from '../types'
import { formatCurrency } from '../utils/currency'
import { CategoryIcon } from './CategoryIcon'
import { IconBank, IconCard, IconTrash, IconWallet } from './icons'

interface CustomChartCardProps {
  chart: CustomChart
  transactions: Transaction[]
  monthTransactions: Transaction[]
  categories: Category[]
  accounts: Account[]
  currency: string
  onDelete: () => void
  onCategoryClick?: (categoryId: string) => void
}

interface Slice {
  key: string
  name: string
  color: string
  icon: string
  value: number
}

const PALETTE = [
  '#5AC8FA', '#FF9F43', '#F4B400', '#34C759', '#FF6FA5',
  '#AF7DFF', '#FF5A5F', '#3B4FCB', '#8E97A8', '#2ECC71',
]

const ACCOUNT_ICONS = { checking: IconBank, cash: IconWallet, card: IconCard, other: IconWallet } as const

const KIND_LABELS = { pie: 'A torta', bar: 'A barre' }
const GROUP_LABELS = { category: 'Categoria', account: 'Conto' }
const FILTER_LABELS = { expense: 'Solo spese', income: 'Solo entrate', both: 'Entrate e spese' }
const PERIOD_LABELS = { month: 'Mese selezionato', all: 'Tutti i periodi' }

export function CustomChartCard({
  chart,
  transactions,
  monthTransactions,
  categories,
  accounts,
  currency,
  onDelete,
  onCategoryClick,
}: CustomChartCardProps) {
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const accountById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts])

  const slices = useMemo<Slice[]>(() => {
    const source = chart.period === 'month' ? monthTransactions : transactions
    const filtered = source.filter((t) => {
      if (t.type === 'transfer' || t.isAdjustment) return false
      if (chart.transactionFilter === 'both') return true
      return t.type === chart.transactionFilter
    })

    const totals = new Map<string, number>()
    for (const t of filtered) {
      const key = chart.groupBy === 'category' ? t.categoryId : t.accountId
      if (!key) continue
      totals.set(key, (totals.get(key) ?? 0) + t.amount)
    }

    return Array.from(totals.entries())
      .map(([key, value], i) => {
        if (chart.groupBy === 'category') {
          const category = categoryById.get(key)
          return {
            key,
            value,
            name: category?.name ?? 'Varie',
            color: category?.color ?? PALETTE[i % PALETTE.length],
            icon: category?.icon ?? 'IconVarie',
          }
        }
        const account = accountById.get(key)
        return {
          key,
          value,
          name: account?.name ?? 'Conto',
          color: PALETTE[i % PALETTE.length],
          icon: account?.type ?? 'other',
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [chart, transactions, monthTransactions, categoryById, accountById])

  const total = slices.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-fg">{chart.title}</h3>
          <p className="text-xs text-muted">
            {KIND_LABELS[chart.kind]} · {GROUP_LABELS[chart.groupBy]} · {FILTER_LABELS[chart.transactionFilter]} ·{' '}
            {PERIOD_LABELS[chart.period]}
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Elimina grafico"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-expense/10 hover:text-expense"
        >
          <IconTrash size={16} />
        </button>
      </div>

      {slices.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Nessun dato per questo grafico</p>
      ) : chart.kind === 'pie' ? (
        <>
          <div className="mt-2 h-56">
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
                    chart.groupBy === 'category' && onCategoryClick?.(entry.key)
                  }
                >
                  {slices.map((s) => (
                    <Cell
                      key={s.key}
                      fill={s.color}
                      className={chart.groupBy === 'category' ? 'cursor-pointer' : undefined}
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
              <li key={s.key}>
                <button
                  type="button"
                  disabled={chart.groupBy !== 'category'}
                  onClick={() => chart.groupBy === 'category' && onCategoryClick?.(s.key)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-fg/5 disabled:hover:bg-transparent"
                >
                  {chart.groupBy === 'category' ? (
                    <CategoryIcon icon={s.icon} color={s.color} size={16} circleSize={28} />
                  ) : (
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${s.color}26`, color: s.color }}
                    >
                      {(() => {
                        const Icon = ACCOUNT_ICONS[s.icon as keyof typeof ACCOUNT_ICONS] ?? IconWallet
                        return <Icon size={14} />
                      })()}
                    </span>
                  )}
                  <span className="flex-1 truncate text-sm text-fg">{s.name}</span>
                  <span className="text-xs text-muted">{Math.round((s.value / total) * 100)}%</span>
                  <span className="text-sm font-medium text-fg">{formatCurrency(s.value, currency)}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={slices} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgb(var(--color-muted))', fontSize: 12 }}
                axisLine={{ stroke: 'rgb(var(--color-border))' }}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'rgb(var(--color-fg) / 0.05)' }}
                contentStyle={{
                  background: 'rgb(var(--color-card))',
                  border: '1px solid rgb(var(--color-border))',
                  borderRadius: 12,
                }}
                labelStyle={{ color: 'rgb(var(--color-fg))' }}
                formatter={(value: number) => formatCurrency(value, currency)}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                onClick={(entry: any) => chart.groupBy === 'category' && onCategoryClick?.(entry.key)}
                className={chart.groupBy === 'category' ? 'cursor-pointer' : undefined}
              >
                {slices.map((s) => (
                  <Cell key={s.key} fill={s.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
