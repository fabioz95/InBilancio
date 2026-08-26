import type { Account, Transaction } from '../types'

/**
 * Calcola il saldo corrente di ogni conto: parte dal saldo di base impostato
 * manualmente sul conto (una sorta di "correzione") e applica l'effetto di
 * tutte le transazioni registrate da quel momento in poi.
 */
export function computeAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): Map<string, number> {
  const balances = new Map(accounts.map((a) => [a.id, a.balance]))

  for (const t of transactions) {
    if (t.type === 'income') {
      balances.set(t.accountId, (balances.get(t.accountId) ?? 0) + t.amount)
    } else if (t.type === 'expense') {
      balances.set(t.accountId, (balances.get(t.accountId) ?? 0) - t.amount)
    } else if (t.type === 'transfer') {
      balances.set(t.accountId, (balances.get(t.accountId) ?? 0) - t.amount)
      if (t.toAccountId) {
        balances.set(t.toAccountId, (balances.get(t.toAccountId) ?? 0) + t.amount)
      }
    }
  }

  return balances
}

/** Somma dei saldi correnti di tutti i conti: il totale dei "soldi principali". */
export function computeTotalBalance(accounts: Account[], transactions: Transaction[]): number {
  const balances = computeAccountBalances(accounts, transactions)
  let total = 0
  for (const value of balances.values()) total += value
  return total
}
