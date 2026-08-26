import { useMemo, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import {
  addRecurringTemplate,
  deleteRecurringTemplate,
  updateRecurringTemplate,
} from '../../lib/firestore'
import { Modal } from '../../components/Modal'
import { CategoryPicker } from '../../components/CategoryPicker'
import { AccountPicker } from '../../components/AccountPicker'
import { CategoryIcon } from '../../components/CategoryIcon'
import { Toggle } from '../../components/Toggle'
import { IconEdit, IconPlus, IconRepeat, IconTrash, IconWallet } from '../../components/icons'
import { formatCurrency } from '../../utils/currency'
import { fromDateInputValue, toDateInputValue } from '../../utils/date'
import { getNextOccurrence, RECURRENCE_LABELS } from '../../utils/recurring'
import type { RecurrenceRule, RecurringTemplate, TransactionType } from '../../types'

const TYPE_OPTIONS: { value: Extract<TransactionType, 'expense' | 'income'>; label: string }[] = [
  { value: 'expense', label: 'Spesa' },
  { value: 'income', label: 'Reddito' },
]

function parseAmount(raw: string): number {
  const value = Number.parseFloat(raw.replace(',', '.'))
  return Number.isFinite(value) ? value : 0
}

export function RecurringSection() {
  const dataOwnerUid = useAuthStore((s) => s.dataOwnerUid)
  const settings = useAuthStore((s) => s.settings)
  const categories = useDataStore((s) => s.categories)
  const accounts = useDataStore((s) => s.accounts)
  const templates = useDataStore((s) => s.recurringTemplates)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [type, setType] = useState<Extract<TransactionType, 'expense' | 'income'>>('expense')
  const [amountStr, setAmountStr] = useState('0')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [dateStr, setDateStr] = useState(toDateInputValue(new Date()))
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>('monthly')
  const [active, setActive] = useState(true)
  const [pickerOpen, setPickerOpen] = useState<'category' | 'account' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const accountById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts])

  function startCreate() {
    setEditingId(null)
    setType('expense')
    setAmountStr('0')
    setCategoryId(null)
    setAccountId(accounts[0]?.id ?? null)
    setDescription('')
    setDateStr(toDateInputValue(new Date()))
    setRecurrenceRule('monthly')
    setActive(true)
    setFormError(null)
    setFormOpen(true)
  }

  function startEdit(template: RecurringTemplate) {
    setEditingId(template.id)
    setType(template.type)
    setAmountStr(String(template.amount).replace('.', ','))
    setCategoryId(template.categoryId)
    setAccountId(template.accountId)
    setDescription(template.description ?? '')
    setDateStr(toDateInputValue(new Date(template.startDate)))
    setRecurrenceRule(template.recurrenceRule)
    setActive(template.active)
    setFormError(null)
    setFormOpen(true)
  }

  const selectedCategory = categoryId ? categoryById.get(categoryId) : null
  const selectedAccount = accountId ? accountById.get(accountId) : null

  async function handleSave() {
    if (!dataOwnerUid) return
    const amount = parseAmount(amountStr)
    if (amount <= 0) {
      setFormError('Inserisci un importo valido.')
      return
    }
    if (!categoryId) {
      setFormError('Seleziona una categoria.')
      return
    }
    if (!accountId) {
      setFormError('Seleziona un conto.')
      return
    }
    setSaving(true)
    try {
      const draft = {
        amount,
        type,
        categoryId,
        accountId,
        description: description.trim(),
        recurrenceRule,
        startDate: fromDateInputValue(dateStr).getTime(),
        active,
      }
      if (editingId) {
        await updateRecurringTemplate(dataOwnerUid, editingId, draft)
      } else {
        await addRecurringTemplate(dataOwnerUid, draft)
      }
      setFormOpen(false)
    } catch (e) {
      console.error(e)
      setFormError('Impossibile salvare la ricorrenza.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!dataOwnerUid) return
    setListError(null)
    try {
      await deleteRecurringTemplate(dataOwnerUid, id)
    } catch (e) {
      console.error(e)
      setListError('Impossibile eliminare la ricorrenza.')
    }
  }

  async function toggleActive(template: RecurringTemplate) {
    if (!dataOwnerUid) return
    await updateRecurringTemplate(dataOwnerUid, template.id, { active: !template.active })
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
          <IconRepeat size={16} />
          Spese e entrate ricorrenti
        </h2>
        <button
          type="button"
          onClick={startCreate}
          className="flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25"
        >
          <IconPlus size={14} /> Nuova
        </button>
      </div>
      <p className="mb-3 border-b border-border/60 pb-3 text-xs text-muted">
        Appena arriva la data, ogni occorrenza si registra da sola come transazione (resta
        modificabile dopo). Prima della scadenza compare in Panoramica come promemoria se vuoi
        registrarla in anticipo.
      </p>

      {templates.length === 0 ? (
        <p className="py-3 text-sm text-muted">Nessuna ricorrenza configurata.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border/60">
          {templates.map((template) => {
            const category = template.categoryId ? categoryById.get(template.categoryId) : undefined
            const next = getNextOccurrence(template)
            return (
              <li key={template.id} className="flex items-center gap-3 py-2.5">
                {category ? (
                  <CategoryIcon icon={category.icon} color={category.color} />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fg/10 text-muted">
                    <IconWallet size={16} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${template.active ? 'text-fg' : 'text-muted line-through'}`}>
                    {template.description?.trim() || category?.name || 'Ricorrenza'}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {RECURRENCE_LABELS[template.recurrenceRule]}
                    {template.active && next ? ` · prossima ${new Date(next).toLocaleDateString('it-IT')}` : ''}
                    {!template.active ? ' · in pausa' : ''}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-muted">
                  {template.type === 'income' ? '+' : '-'}
                  {formatCurrency(template.amount, settings.currency)}
                </span>
                <Toggle checked={template.active} onChange={() => toggleActive(template)} label="Attiva ricorrenza" />
                <button
                  type="button"
                  onClick={() => startEdit(template)}
                  aria-label="Modifica ricorrenza"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-fg/5 hover:text-fg"
                >
                  <IconEdit size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(template.id)}
                  aria-label="Elimina ricorrenza"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-expense/10 hover:text-expense"
                >
                  <IconTrash size={16} />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {listError && <p className="mt-3 text-sm text-expense">{listError}</p>}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Modifica ricorrenza' : 'Nuova ricorrenza'}
        footer={
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Salvataggio…' : 'Salva ricorrenza'}
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-fg/5 p-1">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                  type === opt.value ? 'bg-accent text-white' : 'text-muted hover:text-fg'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            inputMode="decimal"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder="Importo"
            className="w-full rounded-xl border border-border bg-fg/5 px-3 py-2.5 text-sm text-fg placeholder:text-muted outline-none focus:border-accent"
          />

          <button
            type="button"
            onClick={() => setPickerOpen('category')}
            className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-left"
          >
            {selectedCategory ? (
              <CategoryIcon icon={selectedCategory.icon} color={selectedCategory.color} circleSize={32} size={16} />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-fg/10 text-muted">
                <IconWallet size={16} />
              </span>
            )}
            <span className={`flex-1 text-sm ${selectedCategory ? 'text-fg' : 'text-muted'}`}>
              {selectedCategory?.name ?? 'Seleziona categoria'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPickerOpen('account')}
            className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-left"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-fg/10 text-fg">
              <IconWallet size={16} />
            </span>
            <span className={`flex-1 text-sm ${selectedAccount ? 'text-fg' : 'text-muted'}`}>
              {selectedAccount?.name ?? 'Seleziona conto'}
            </span>
          </button>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nota / descrizione (opzionale)"
            className="w-full rounded-xl border border-border bg-fg/5 px-3 py-2.5 text-sm text-fg placeholder:text-muted outline-none focus:border-accent"
          />

          <div>
            <label className="mb-1 block text-xs text-muted">
              {editingId ? 'Data di riferimento (giorno/mese del ciclo)' : 'Prima occorrenza'}
            </label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full rounded-xl border border-border bg-fg/5 px-3 py-2.5 text-sm text-fg outline-none focus:border-accent"
            />
          </div>

          <select
            value={recurrenceRule}
            onChange={(e) => setRecurrenceRule(e.target.value as RecurrenceRule)}
            className="w-full rounded-xl border border-border bg-fg/5 px-3 py-2.5 text-sm text-fg outline-none focus:border-accent"
          >
            <option value="daily">Giornaliera</option>
            <option value="weekly">Settimanale</option>
            <option value="monthly">Mensile</option>
            <option value="yearly">Annuale</option>
          </select>

          <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
            <span className="text-sm text-fg">Attiva</span>
            <Toggle checked={active} onChange={setActive} label="Ricorrenza attiva" />
          </div>

          {formError && <p className="text-sm text-expense">{formError}</p>}
        </div>
      </Modal>

      <CategoryPicker
        open={pickerOpen === 'category'}
        onClose={() => setPickerOpen(null)}
        categories={categories}
        type={type}
        selectedId={categoryId}
        onSelect={setCategoryId}
      />
      <AccountPicker
        open={pickerOpen === 'account'}
        onClose={() => setPickerOpen(null)}
        accounts={accounts}
        selectedId={accountId}
        onSelect={setAccountId}
        title="Conto"
        excludeId={null}
      />
    </section>
  )
}
