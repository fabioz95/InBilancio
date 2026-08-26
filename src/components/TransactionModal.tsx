import { useEffect, useMemo, useRef, useState } from 'react'
import { useUiStore } from '../store/uiStore'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'
import {
  addRecurringTemplate,
  addTransaction,
  deleteTransaction,
  setTransactionForOccurrence,
  updateTransaction,
} from '../lib/firestore'
import { Modal } from './Modal'
import { CategoryPicker } from './CategoryPicker'
import { AccountPicker } from './AccountPicker'
import { Toggle } from './Toggle'
import { CategoryIcon } from './CategoryIcon'
import { IconCheck, IconTrash, IconWallet } from './icons'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { fromDateInputValue, startOfDay, toDateInputValue } from '../utils/date'
import type { RecurrenceRule, TransactionType } from '../types'

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'expense', label: 'Spesa' },
  { value: 'income', label: 'Reddito' },
  { value: 'transfer', label: 'Trasferisci' },
]

function parseAmount(raw: string): number {
  const normalized = raw.replace(',', '.').replace(/[^\d.]/g, '')
  const value = Number.parseFloat(normalized)
  return Number.isFinite(value) ? value : 0
}

// Ripulisce il testo digitato dall'utente nel campo importo: solo cifre e
// un'unica virgola decimale, massimo due decimali, senza zeri iniziali inutili.
function sanitizeAmountInput(raw: string): string {
  let value = raw.replace(/\./g, ',').replace(/[^0-9,]/g, '')

  const firstComma = value.indexOf(',')
  if (firstComma !== -1) {
    value = value.slice(0, firstComma + 1) + value.slice(firstComma + 1).replace(/,/g, '')
    const [intPart, decimals = ''] = value.split(',')
    value = decimals.length > 2 ? `${intPart},${decimals.slice(0, 2)}` : value
  }

  value = value.replace(/^0+(?=\d)/, '')
  return value === '' ? '0' : value
}

export function TransactionModal() {
  const isOpen = useUiStore((s) => s.isTransactionModalOpen)
  const editing = useUiStore((s) => s.editingTransaction)
  const close = useUiStore((s) => s.closeTransactionModal)

  const user = useAuthStore((s) => s.user)
  const dataOwnerUid = useAuthStore((s) => s.dataOwnerUid)
  const settings = useAuthStore((s) => s.settings)
  const categories = useDataStore((s) => s.categories)
  const accounts = useDataStore((s) => s.accounts)

  const [type, setType] = useState<TransactionType>('expense')
  const [amountStr, setAmountStr] = useState('0')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [toAccountId, setToAccountId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [dateStr, setDateStr] = useState(toDateInputValue(new Date()))
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>('monthly')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [pickerOpen, setPickerOpen] = useState<'category' | 'account' | 'toAccount' | null>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)
  const isOnline = useOnlineStatus()

  useEffect(() => {
    if (!isOpen) return
    if (editing) {
      setType(editing.type)
      setAmountStr(String(editing.amount).replace('.', ','))
      setCategoryId(editing.categoryId)
      setAccountId(editing.accountId)
      setToAccountId(editing.toAccountId ?? null)
      setDescription(editing.description ?? '')
      setDateStr(toDateInputValue(new Date(editing.date)))
      setIsRecurring(editing.isRecurring)
      setRecurrenceRule(editing.recurrenceRule ?? 'monthly')
    } else {
      setType('expense')
      setAmountStr('0')
      setCategoryId(null)
      setAccountId(accounts[0]?.id ?? null)
      setToAccountId(accounts[1]?.id ?? null)
      setDescription('')
      setDateStr(toDateInputValue(new Date()))
      setIsRecurring(false)
      setRecurrenceRule('monthly')
    }
    setError(null)

    // Porta subito il focus sull'importo: sul mobile apre la tastiera numerica.
    amountInputRef.current?.focus()
    amountInputRef.current?.select()
  }, [isOpen, editing, accounts])

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId]
  )
  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === accountId) ?? null,
    [accounts, accountId]
  )
  const selectedToAccount = useMemo(
    () => accounts.find((a) => a.id === toAccountId) ?? null,
    [accounts, toAccountId]
  )

  const amount = parseAmount(amountStr)
  const isValid =
    amount > 0 &&
    accountId &&
    (type === 'transfer' ? toAccountId && toAccountId !== accountId : Boolean(categoryId))

  async function handleSubmit() {
    if (!user || !dataOwnerUid || !isValid || !accountId) return
    setSaving(true)
    setError(null)
    try {
      const date = fromDateInputValue(dateStr).getTime()
      const draft = {
        amount,
        type,
        categoryId: type === 'transfer' ? null : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : null,
        description: description.trim(),
        date,
        isRecurring,
        recurrenceRule: isRecurring ? recurrenceRule : null,
      }

      const writePromise = (async () => {
        if (editing) {
          // Modifica di una transazione esistente: non tocca l'eventuale ricorrenza collegata.
          await updateTransaction(dataOwnerUid, editing.id, draft)
        } else if (isRecurring && type !== 'transfer') {
          // Nuova transazione segnata come ricorrente: crea anche il template, così le
          // occorrenze dei mesi successivi verranno proiettate automaticamente.
          const templateId = await addRecurringTemplate(dataOwnerUid, {
            amount,
            type,
            categoryId,
            accountId,
            description: description.trim(),
            recurrenceRule,
            startDate: startOfDay(date),
            active: true,
          })
          await setTransactionForOccurrence(dataOwnerUid, templateId, startOfDay(date), draft)
        } else {
          await addTransaction(dataOwnerUid, {
            ...draft,
            recurringTemplateId: null,
            recurringOccurrenceDate: null,
          })
        }
      })()

      // Le scritture Firestore non risolvono finché si è offline (restano in
      // coda e partono da sole alla riconnessione): online aspettiamo l'esito
      // per poter mostrare un eventuale errore, offline chiudiamo subito,
      // perché la transazione è già visibile localmente grazie alla cache.
      if (isOnline) {
        await writePromise
      } else {
        writePromise.catch((e) => console.error('Sincronizzazione rimandata (offline)', e))
      }
      close()
    } catch (e) {
      setError('Impossibile salvare la transazione. Riprova.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!dataOwnerUid || !editing) return
    setSaving(true)
    try {
      const deletePromise = deleteTransaction(dataOwnerUid, editing.id)
      if (isOnline) {
        await deletePromise
      } else {
        deletePromise.catch((e) => console.error('Eliminazione rimandata (offline)', e))
      }
      close()
    } catch (e) {
      setError('Impossibile eliminare la transazione.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Modal
        open={isOpen}
        onClose={close}
        title={editing ? 'Modifica transazione' : 'Nuova transazione'}
        footer={
          <div className="flex items-center gap-3">
            {editing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                aria-label="Elimina transazione"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-expense transition-colors hover:bg-expense/10 disabled:opacity-50"
              >
                <IconTrash size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || saving}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            >
              <IconCheck size={18} />
              {saving ? 'Salvataggio…' : 'Conferma'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          {/* Toggle tipo */}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-fg/5 p-1">
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

          {/* Importo: tocca per aprire la tastiera numerica del dispositivo */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-muted">Importo</p>
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <input
                ref={amountInputRef}
                type="text"
                inputMode="decimal"
                value={amountStr}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setAmountStr(sanitizeAmountInput(e.target.value))}
                placeholder="0"
                aria-label="Importo"
                className="w-40 bg-transparent text-center text-4xl font-semibold text-fg outline-none"
              />
              <span className="text-xl text-muted">{settings.currency === 'EUR' ? '€' : settings.currency}</span>
            </div>
          </div>

          {/* Categoria */}
          {type !== 'transfer' && (
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
          )}

          {/* Conto */}
          <button
            type="button"
            onClick={() => setPickerOpen('account')}
            className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-left"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-fg/10 text-fg">
              <IconWallet size={16} />
            </span>
            <span className={`flex-1 text-sm ${selectedAccount ? 'text-fg' : 'text-muted'}`}>
              {selectedAccount?.name ?? (type === 'transfer' ? 'Conto di origine' : 'Seleziona conto')}
            </span>
          </button>

          {type === 'transfer' && (
            <button
              type="button"
              onClick={() => setPickerOpen('toAccount')}
              className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-left"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-fg/10 text-fg">
                <IconWallet size={16} />
              </span>
              <span className={`flex-1 text-sm ${selectedToAccount ? 'text-fg' : 'text-muted'}`}>
                {selectedToAccount?.name ?? 'Conto di destinazione'}
              </span>
            </button>
          )}

          {/* Nota */}
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nota / descrizione (opzionale)"
            className="w-full rounded-xl border border-border bg-fg/5 px-3 py-2.5 text-sm text-fg placeholder:text-muted outline-none focus:border-accent"
          />

          {/* Data */}
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full rounded-xl border border-border bg-fg/5 px-3 py-2.5 text-sm text-fg outline-none focus:border-accent"
          />

          {/* Ricorrenza */}
          <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
            <span className="text-sm text-fg">Transazione ricorrente</span>
            <Toggle checked={isRecurring} onChange={setIsRecurring} label="Transazione ricorrente" />
          </div>

          {isRecurring && (
            <>
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
              {!editing && type !== 'transfer' && (
                <p className="-mt-2 text-xs text-muted">
                  Da ora, ogni periodo verrà registrata da sola in automatico appena arriva la
                  data (resterà comunque modificabile). Gestisci tutte le ricorrenze in
                  Impostazioni.
                </p>
              )}
            </>
          )}

          {error && <p className="text-sm text-expense">{error}</p>}
        </div>
      </Modal>

      <CategoryPicker
        open={pickerOpen === 'category'}
        onClose={() => setPickerOpen(null)}
        categories={categories}
        type={type === 'income' ? 'income' : 'expense'}
        selectedId={categoryId}
        onSelect={setCategoryId}
      />
      <AccountPicker
        open={pickerOpen === 'account'}
        onClose={() => setPickerOpen(null)}
        accounts={accounts}
        selectedId={accountId}
        onSelect={setAccountId}
        title={type === 'transfer' ? 'Conto di origine' : 'Conto'}
        excludeId={type === 'transfer' ? toAccountId : null}
      />
      <AccountPicker
        open={pickerOpen === 'toAccount'}
        onClose={() => setPickerOpen(null)}
        accounts={accounts}
        selectedId={toAccountId}
        onSelect={setToAccountId}
        title="Conto di destinazione"
        excludeId={accountId}
      />
    </>
  )
}
