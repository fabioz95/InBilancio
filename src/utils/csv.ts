import type { Account, Category, Transaction } from '../types'

function csvEscape(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function transactionsToCsv(
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[]
): string {
  const categoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? ''
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? ''

  const header = ['Data', 'Tipo', 'Categoria', 'Conto', 'Conto destinazione', 'Descrizione', 'Importo']
  const rows = transactions
    .slice()
    .sort((a, b) => b.date - a.date)
    .map((t) => [
      new Date(t.date).toISOString().slice(0, 10),
      t.type,
      categoryName(t.categoryId),
      accountName(t.accountId),
      t.toAccountId ? accountName(t.toAccountId) : '',
      t.description ?? '',
      t.amount.toFixed(2),
    ])

  return [header, ...rows]
    .map((row) => row.map((cell) => csvEscape(String(cell))).join(';'))
    .join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
