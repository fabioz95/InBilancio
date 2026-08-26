import { IconClose, IconSearch } from './icons'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  allMonths: boolean
  onToggleAllMonths: (value: boolean) => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  allMonths,
  onToggleAllMonths,
  placeholder = 'Cerca per descrizione o categoria…',
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
        <IconSearch size={18} className="shrink-0 text-muted" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-fg placeholder:text-muted outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Cancella ricerca"
            className="shrink-0 text-muted hover:text-fg"
          >
            <IconClose size={16} />
          </button>
        )}
      </div>

      {value && (
        <label className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-muted">
          <input
            type="checkbox"
            checked={allMonths}
            onChange={(e) => onToggleAllMonths(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-accent"
          />
          Cerca in tutti i mesi
        </label>
      )}
    </div>
  )
}
