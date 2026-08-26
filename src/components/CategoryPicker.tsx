import { useEffect, useState } from 'react'
import type { Category, CategoryType } from '../types'
import { CategoryIcon } from './CategoryIcon'
import { Modal } from './Modal'
import { IconCheck, IconClose, IconSearch } from './icons'

interface CategoryPickerProps {
  open: boolean
  onClose: () => void
  categories: Category[]
  type: CategoryType
  selectedId: string | null
  onSelect: (categoryId: string) => void
}

export function CategoryPicker({ open, onClose, categories, type, selectedId, onSelect }: CategoryPickerProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  const visible = categories
    .filter((c) => !c.hidden && (c.type === type || c.type === 'both'))
    .filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <Modal open={open} onClose={onClose} title="Categoria">
      {categories.length > 6 && (
        <div className="sticky top-0 z-10 mb-3 flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2">
          <IconSearch size={16} className="shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca categoria…"
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full bg-transparent text-sm text-fg placeholder:text-muted outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Cancella ricerca"
              className="shrink-0 text-muted hover:text-fg"
            >
              <IconClose size={14} />
            </button>
          )}
        </div>
      )}
      <ul className="flex flex-col gap-1">
        {visible.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => {
                onSelect(category.id)
                onClose()
              }}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-fg/5"
            >
              <CategoryIcon icon={category.icon} color={category.color} />
              <span className="flex-1 text-sm text-fg">{category.name}</span>
              {selectedId === category.id && <IconCheck size={18} className="text-accent" />}
            </button>
          </li>
        ))}
        {visible.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">
            {query ? 'Nessuna categoria trovata' : 'Nessuna categoria disponibile'}
          </p>
        )}
      </ul>
    </Modal>
  )
}
