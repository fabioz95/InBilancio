import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { addCategory, deleteCategory, updateCategory } from '../../lib/firestore'
import { CategoryIcon } from '../../components/CategoryIcon'
import { Modal } from '../../components/Modal'
import { CATEGORY_ICONS, IconEdit, IconPlus, IconTrash, type CategoryIconName } from '../../components/icons'
import type { Category, CategoryType } from '../../types'

const ICON_NAMES = Object.keys(CATEGORY_ICONS) as CategoryIconName[]
const COLOR_PRESETS = [
  '#5AC8FA', '#FF9F43', '#F4B400', '#FFD60A', '#34C759', '#FF6FA5',
  '#AF7DFF', '#FF5A5F', '#3B4FCB', '#8E97A8', '#FF8A8A', '#E0A73A',
  '#6C63FF', '#2ECC71', '#9497A3',
]

const TYPE_LABELS: Record<CategoryType, string> = {
  expense: 'Spesa',
  income: 'Entrata',
  both: 'Entrambe',
}

interface FormState {
  name: string
  icon: CategoryIconName
  color: string
  type: CategoryType
}

const emptyForm: FormState = { name: '', icon: 'IconVarie', color: COLOR_PRESETS[0], type: 'expense' }

export function CategoriesSection() {
  const dataOwnerUid = useAuthStore((s) => s.dataOwnerUid)
  const categories = useDataStore((s) => s.categories)
  const transactions = useDataStore((s) => s.transactions)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
    setFormOpen(true)
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setForm({
      name: category.name,
      icon: (category.icon as CategoryIconName) ?? 'IconVarie',
      color: category.color,
      type: category.type,
    })
    setFormError(null)
    setFormOpen(true)
  }

  async function handleSave() {
    if (!dataOwnerUid) return
    if (!form.name.trim()) {
      setFormError('Inserisci un nome per la categoria.')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await updateCategory(dataOwnerUid, editingId, { ...form, name: form.name.trim() })
      } else {
        await addCategory(dataOwnerUid, { ...form, name: form.name.trim(), color: form.color })
      }
      setFormOpen(false)
    } catch (e) {
      console.error(e)
      setFormError('Impossibile salvare la categoria.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category: Category) {
    if (!dataOwnerUid) return
    const inUse = transactions.some((t) => t.categoryId === category.id)
    if (inUse) {
      setListError(`"${category.name}" è collegata a delle transazioni: non può essere eliminata.`)
      return
    }
    setListError(null)
    await deleteCategory(dataOwnerUid, category.id)
  }

  async function toggleHidden(category: Category) {
    if (!dataOwnerUid) return
    await updateCategory(dataOwnerUid, category.id, { hidden: !category.hidden })
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Categorie</h2>
        <button
          type="button"
          onClick={startCreate}
          className="flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25"
        >
          <IconPlus size={14} /> Nuova
        </button>
      </div>

      <ul className="flex flex-col divide-y divide-border/60">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center gap-3 py-2.5">
            <CategoryIcon icon={category.icon} color={category.color} circleSize={36} size={18} />
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-medium ${category.hidden ? 'text-muted line-through' : 'text-fg'}`}>
                {category.name}
              </p>
              <p className="text-xs text-muted">
                {TYPE_LABELS[category.type]} {category.isDefault && '· predefinita'}
              </p>
            </div>
            {category.isDefault ? (
              <button
                type="button"
                onClick={() => toggleHidden(category)}
                className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted hover:text-fg"
              >
                {category.hidden ? 'Mostra' : 'Nascondi'}
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(category)}
                  aria-label="Modifica categoria"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-fg/5 hover:text-fg"
                >
                  <IconEdit size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  aria-label="Elimina categoria"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-expense/10 hover:text-expense"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {listError && <p className="mt-3 text-sm text-expense">{listError}</p>}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Modifica categoria' : 'Nuova categoria'}
        footer={
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Salvataggio…' : 'Salva categoria'}
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Nome categoria"
            className="w-full rounded-xl border border-border bg-fg/5 px-3 py-2.5 text-sm text-fg placeholder:text-muted outline-none focus:border-accent"
          />

          <div className="flex gap-2">
            {(['expense', 'income', 'both'] as CategoryType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                  form.type === t ? 'bg-accent text-white' : 'bg-fg/5 text-muted hover:text-fg'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <div>
            <p className="mb-1.5 text-xs text-muted">Icona</p>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
              {ICON_NAMES.map((iconName) => {
                const Icon = CATEGORY_ICONS[iconName]
                const selected = form.icon === iconName
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, icon: iconName }))}
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                      selected ? 'bg-accent text-white' : 'bg-fg/5 text-muted hover:text-fg'
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs text-muted">Colore</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  style={{ backgroundColor: color }}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-card' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {formError && <p className="text-sm text-expense">{formError}</p>}
        </div>
      </Modal>
    </section>
  )
}
