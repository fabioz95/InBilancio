import type { Category, RecurringTemplate } from '../types'
import { CategoryIcon } from './CategoryIcon'
import { formatCurrency } from '../utils/currency'

interface RecurringHighlightProps {
  template: RecurringTemplate
  occurrenceDate: number
  category?: Category
  currency: string
  adding?: boolean
  onAdd: () => void
}

const WEEKDAYS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']

export function RecurringHighlight({ template, occurrenceDate, category, currency, adding, onAdd }: RecurringHighlightProps) {
  const date = new Date(occurrenceDate)
  const dateLabel = `${WEEKDAYS[date.getDay()]} ${date.getDate()}`

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4">
      {category && <CategoryIcon icon={category.icon} color={category.color} />}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">
          {template.description?.trim() || category?.name || 'Ricorrenza'}
        </p>
        <p className="truncate text-xs text-muted">
          {dateLabel} · {category?.name ?? 'Varie'}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-semibold text-muted line-through decoration-2">
          {formatCurrency(template.amount, currency)}
        </span>
        <button
          type="button"
          onClick={onAdd}
          disabled={adding}
          className="text-xs font-semibold text-accent hover:underline disabled:opacity-50"
        >
          {adding ? 'aggiunta…' : 'aggiungi'}
        </button>
      </div>
    </div>
  )
}
