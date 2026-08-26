import { useMemo, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { addAccount, addTransaction, deleteAccount, updateAccount } from '../../lib/firestore'
import { Modal } from '../../components/Modal'
import { IconBank, IconCard, IconEdit, IconPlus, IconTrash, IconWallet } from '../../components/icons'
import { formatCurrency } from '../../utils/currency'
import { computeAccountBalances } from '../../utils/balance'
import type { Account, AccountType } from '../../types'

const ACCOUNT_ICONS = { checking: IconBank, cash: IconWallet, card: IconCard, other: IconWallet } as const
const TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Conto corrente',
  cash: 'Contanti',
  card: 'Carta',
  other: 'Altro',
}

export function AccountsSection() {
  const user = useAuthStore((s) => s.user)
  const dataOwnerUid = useAuthStore((s) => s.dataOwnerUid)
  const settings = useAuthStore((s) => s.settings)
  const accounts = useDataStore((s) => s.accounts)
  const transactions = useDataStore((s) => s.transactions)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('checking')
  const [balanceInput, setBalanceInput] = useState('0')
  const [formError, setFormError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const currentBalances = useMemo(
    () => computeAccountBalances(accounts, transactions),
    [accounts, transactions]
  )
  const totalBalance = useMemo(() => {
    let total = 0
    for (const value of currentBalances.values()) total += value
    return total
  }, [currentBalances])

  function startCreate() {
    setEditingId(null)
    setName('')
    setType('checking')
    setBalanceInput('0')
    setFormError(null)
    setFormOpen(true)
  }

  function startEdit(account: Account) {
    setEditingId(account.id)
    setName(account.name)
    setType(account.type)
    // Nel form di modifica si parte dal saldo attuale (base + transazioni), non dal saldo iniziale.
    setBalanceInput(String(currentBalances.get(account.id) ?? account.balance))
    setFormError(null)
    setFormOpen(true)
  }

  async function handleSave() {
    if (!user || !dataOwnerUid) return
    if (!name.trim()) {
      setFormError('Inserisci un nome per il conto.')
      return
    }
    const balance = Number(balanceInput.replace(',', '.'))
    if (Number.isNaN(balance)) {
      setFormError('Il saldo deve essere un numero valido.')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await updateAccount(dataOwnerUid, editingId, { name: name.trim(), type })

        // Correzione saldo: la differenza tra il valore inserito e il saldo
        // attuale calcolato viene registrata come transazione dedicata, così
        // il nuovo saldo diventa esattamente il valore inserito (non
        // "valore inserito - transazioni") e le transazioni successive
        // continuano a incidere a partire da lì.
        const currentComputed = currentBalances.get(editingId) ?? 0
        const delta = Math.round((balance - currentComputed) * 100) / 100
        if (delta !== 0) {
          await addTransaction(dataOwnerUid, {
            amount: Math.abs(delta),
            type: delta > 0 ? 'income' : 'expense',
            categoryId: null,
            accountId: editingId,
            toAccountId: null,
            description: 'Correzione saldo',
            date: Date.now(),
            isRecurring: false,
            recurrenceRule: null,
            isAdjustment: true,
          })
        }
      } else {
        await addAccount(dataOwnerUid, { name: name.trim(), type, balance })
      }
      setFormOpen(false)
    } catch (e) {
      console.error(e)
      setFormError('Impossibile salvare il conto.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, accountName: string) {
    if (!dataOwnerUid) return
    const inUse = transactions.some((t) => t.accountId === id || t.toAccountId === id)
    if (inUse) {
      setListError(`"${accountName}" è collegato a delle transazioni: non può essere eliminato.`)
      return
    }
    setListError(null)
    await deleteAccount(dataOwnerUid, id)
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Conti</h2>
        <button
          type="button"
          onClick={startCreate}
          className="flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25"
        >
          <IconPlus size={14} /> Nuovo
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-3">
        <span className="text-xs text-muted">Saldo totale</span>
        <span className={`text-sm font-semibold ${totalBalance >= 0 ? 'text-fg' : 'text-expense'}`}>
          {formatCurrency(totalBalance, settings.currency)}
        </span>
      </div>

      <ul className="flex flex-col divide-y divide-border/60">
        {accounts.map((account) => {
          const Icon = ACCOUNT_ICONS[account.type] ?? IconWallet
          const current = currentBalances.get(account.id) ?? account.balance
          return (
            <li key={account.id} className="flex items-center gap-3 py-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fg/10 text-fg">
                <Icon size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">{account.name}</p>
                <p className="text-xs text-muted">{TYPE_LABELS[account.type]}</p>
              </div>
              <span className="text-sm text-muted">{formatCurrency(current, settings.currency)}</span>
              <button
                type="button"
                onClick={() => startEdit(account)}
                aria-label="Modifica conto"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-accent/10 hover:text-accent"
              >
                <IconEdit size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(account.id, account.name)}
                aria-label="Elimina conto"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-expense/10 hover:text-expense"
              >
                <IconTrash size={16} />
              </button>
            </li>
          )
        })}
      </ul>

      {listError && <p className="mt-3 text-sm text-expense">{listError}</p>}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Modifica conto' : 'Nuovo conto'}
        footer={
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Salvataggio…' : 'Salva conto'}
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome conto"
            className="w-full rounded-xl border border-border bg-fg/5 px-3 py-2.5 text-sm text-fg placeholder:text-muted outline-none focus:border-accent"
          />
          <div className="flex gap-2">
            {(Object.keys(TYPE_LABELS) as AccountType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                  type === t ? 'bg-accent text-white' : 'bg-fg/5 text-muted hover:text-fg'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">
              {editingId ? 'Saldo attuale' : 'Saldo iniziale'}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-border bg-fg/5 px-3 py-2.5 text-sm text-fg placeholder:text-muted outline-none focus:border-accent"
            />
            {editingId && (
              <p className="mt-1.5 text-xs text-muted">
                Il saldo diventerà esattamente questo valore (registriamo la differenza come
                "Correzione saldo" tra le transazioni). Le transazioni successive continueranno a
                sommarsi/sottrarsi da qui.
              </p>
            )}
          </div>
          {formError && <p className="text-sm text-expense">{formError}</p>}
        </div>
      </Modal>
    </section>
  )
}
