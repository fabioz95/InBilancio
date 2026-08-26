import { useMemo } from 'react'
import type { Category, Transaction } from '../types'
import { TransactionRow } from './TransactionRow'
import { dayGroupKey, dayGroupLabel } from '../utils/date'
import { formatSignedCurrency } from '../utils/currency'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  currency: string
  onSelect?: (transaction: Transaction) => void
  emptyLabel?: string
}

interface DayGroup {
  key: string
  label: string
  date: Date
  net: number
  items: Transaction[]
}

export function TransactionList({
  transactions,
  categories,
  currency,
  onSelect,
  emptyLabel = 'Nessuna transazione',
}: TransactionListProps) {
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const groups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, DayGroup>()

    for (const t of transactions.slice().sort((a, b) => b.date - a.date)) {
      const date = new Date(t.date)
      const key = dayGroupKey(date)
      if (!map.has(key)) {
        map.set(key, { key, label: dayGroupLabel(date), date, net: 0, items: [] })
      }
      const group = map.get(key)!
      group.items.push(t)
      if (!t.isAdjustment) {
        if (t.type === 'income') group.net += t.amount
        if (t.type === 'expense') group.net -= t.amount
      }
    }

    return Array.from(map.values()).sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [transactions])

  if (groups.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">{emptyLabel}</p>
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <section key={group.key}>
          <div className="mb-1 flex items-center gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              {group.label}
            </h3>
            <div className="h-px flex-1 border-t border-dotted border-border" />
            <span
              className={`text-xs font-semibold ${
                group.net > 0 ? 'text-income' : group.net < 0 ? 'text-fg' : 'text-muted'
              }`}
            >
              {formatSignedCurrency(group.net, currency)}
            </span>
          </div>
          <div className="flex flex-col divide-y divide-border/60">
            {group.items.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                category={t.categoryId ? categoryById.get(t.categoryId) : undefined}
                currency={currency}
                onClick={() => onSelect?.(t)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
