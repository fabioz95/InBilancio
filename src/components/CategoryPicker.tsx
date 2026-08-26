import type { Category, CategoryType } from '../types'
import { CategoryIcon } from './CategoryIcon'
import { Modal } from './Modal'
import { IconCheck } from './icons'

interface CategoryPickerProps {
  open: boolean
  onClose: () => void
  categories: Category[]
  type: CategoryType
  selectedId: string | null
  onSelect: (categoryId: string) => void
}

export function CategoryPicker({ open, onClose, categories, type, selectedId, onSelect }: CategoryPickerProps) {
  const visible = categories.filter((c) => !c.hidden && (c.type === type || c.type === 'both'))

  return (
    <Modal open={open} onClose={onClose} title="Categoria">
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
          <p className="py-6 text-center text-sm text-muted">Nessuna categoria disponibile</p>
        )}
      </ul>
    </Modal>
  )
}
