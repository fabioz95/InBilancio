import type { Account } from '../types'

export const DEFAULT_ACCOUNTS: Omit<Account, 'createdAt'>[] = [
  { id: 'conto-corrente', name: 'Conto corrente', type: 'checking', balance: 0 },
  { id: 'contanti', name: 'Contanti', type: 'cash', balance: 0 },
]
