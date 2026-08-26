import type { Category, Transaction } from '../types'
import { CategoryIcon } from './CategoryIcon'
import { IconEdit, IconTransfer } from './icons'
import { formatCurrency } from '../utils/currency'

interface TransactionRowProps {
  transaction: Transaction
  category?: Category
  currency: string
  onClick?: () => void
}

export function TransactionRow({ transaction, category, currency, onClick }: TransactionRowProps) {
  const isTransfer = transaction.type === 'transfer'
  const isIncome = transaction.type === 'income'
  const isAdjustment = Boolean(transaction.isAdjustment)

  // Regola esplicita: titolo = descrizione se presente, altrimenti nome categoria.
  const title = isAdjustment
    ? transaction.description?.trim() || 'Correzione saldo'
    : transaction.description?.trim()
    ? transaction.description
    : isTransfer
    ? 'Trasferimento'
    : category?.name ?? 'Varie'

  const subtitle = isAdjustment
    ? 'Correzione saldo manuale'
    : isTransfer
    ? 'Trasferimento tra conti'
    : category?.name ?? 'Varie'

  const amountColor = isIncome ? 'text-income' : isTransfer ? 'text-muted' : 'text-fg'
  const amountPrefix = isIncome ? '+' : isTransfer ? '' : '-'

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-fg/5"
    >
      {isAdjustment ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fg/10 text-muted">
          <IconEdit size={16} />
        </span>
      ) : isTransfer || !category ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fg/10 text-muted">
          <IconTransfer size={18} />
        </span>
      ) : (
        <CategoryIcon icon={category.icon} color={category.color} />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">{title}</p>
        <p className="truncate text-xs text-muted">{subtitle}</p>
      </div>

      <span className={`shrink-0 text-sm font-semibold ${amountColor}`}>
        {amountPrefix}
        {formatCurrency(transaction.amount, currency)}
      </span>
    </button>
  )
}
