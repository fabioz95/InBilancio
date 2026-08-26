import { IconChevronLeft, IconChevronRight, IconSearch } from './icons'
import { addMonths, formatMonthYear, toDateInputValue, fromDateInputValue, startOfMonth } from '../utils/date'

interface MonthSelectorProps {
  month: Date
  onChange: (date: Date) => void
  transactionCount: number
  searchActive?: boolean
  onToggleSearch?: () => void
}

export function MonthSelector({
  month,
  onChange,
  transactionCount,
  searchActive = false,
  onToggleSearch,
}: MonthSelectorProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(addMonths(month, -1))}
            aria-label="Mese precedente"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/5 hover:text-fg"
          >
            <IconChevronLeft size={18} />
          </button>
          <h1 className="min-w-[10ch] text-center text-xl font-semibold capitalize md:text-2xl">
            {formatMonthYear(month)}
          </h1>
          <button
            type="button"
            onClick={() => onChange(addMonths(month, 1))}
            aria-label="Mese successivo"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/5 hover:text-fg"
          >
            <IconChevronRight size={18} />
          </button>
        </div>
        <p className="mt-0.5 text-center text-sm text-muted md:text-left">
          {transactionCount} {transactionCount === 1 ? 'transazione' : 'transazioni'}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {onToggleSearch && (
          <button
            type="button"
            onClick={onToggleSearch}
            aria-label="Cerca"
            aria-pressed={searchActive}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors md:hidden ${
              searchActive
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-border bg-card text-muted hover:text-fg'
            }`}
          >
            <IconSearch size={18} />
          </button>
        )}

        <label className="hidden cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted transition-colors hover:text-fg md:flex">
          <input
            type="month"
            value={toDateInputValue(month).slice(0, 7)}
            onChange={(e) => {
              if (!e.target.value) return
              onChange(startOfMonth(fromDateInputValue(`${e.target.value}-01`)))
            }}
            className="bg-transparent outline-none"
          />
        </label>
      </div>
    </div>
  )
}
