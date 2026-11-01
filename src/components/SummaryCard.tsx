import { formatCurrency } from '../utils/currency'

interface SummaryCardProps {
  income: number
  expense: number
  totalBalance: number
  currency: string
}

export function SummaryCard({ income, expense, totalBalance, currency }: SummaryCardProps) {
  const net = income - expense

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-3 md:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-[10px] uppercase tracking-wide text-muted md:text-xs">Entrate</p>
          <p className="mt-1 truncate text-sm font-semibold text-fg md:text-xl">
            {formatCurrency(income, currency)}
          </p>
        </div>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[10px] uppercase tracking-wide text-muted md:text-xs">Uscite</p>
          <p className="mt-1 truncate text-sm font-semibold text-fg md:text-xl">
            {formatCurrency(expense, currency)}
          </p>
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="truncate text-[10px] uppercase tracking-wide text-muted md:text-xs">Saldo</p>
          <p
            className={`mt-1 truncate text-sm font-semibold md:text-xl ${
              net >= 0 ? 'text-income' : 'text-expense'
            }`}
          >
            {net >= 0 ? '+' : ''}
            {formatCurrency(net, currency)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-border pt-3">
        <p className="text-[10px] uppercase tracking-wide text-muted md:text-xs">
          Saldo Totale <span className="normal-case">· oggi</span>
        </p>
        <p
          className={`truncate text-sm font-semibold md:text-xl ${
            totalBalance < 0 ? 'text-expense' : 'text-fg'
          }`}
        >
          {formatCurrency(totalBalance, currency)}
        </p>
      </div>
    </div>
  )
}
