export type TransactionType = 'expense' | 'income' | 'transfer'
export type CategoryType = 'expense' | 'income' | 'both'
export type AccountType = 'checking' | 'cash' | 'card' | 'other'
export type RecurrenceRule = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type Theme = 'dark' | 'light'

export interface AppUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  currency: string
  settings: UserSettings
}

/** Profilo utente collegato: chi condivide lo stesso spazio dati (incluso se stesso). */
export interface GroupMember {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

export interface UserSettings {
  currency: string
  firstDayOfMonth: number // 1-28
  theme: Theme
}

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  createdAt: number
}

export interface Category {
  id: string
  name: string
  icon: string // nome componente icona, es. "IconCibo"
  color: string // hex
  type: CategoryType
  isDefault: boolean
  hidden?: boolean
}

export interface Transaction {
  id: string
  amount: number // sempre positivo
  type: TransactionType
  categoryId: string | null // null se transfer
  accountId: string
  toAccountId?: string | null // solo se transfer
  description?: string
  date: number // epoch ms
  isRecurring: boolean
  recurrenceRule?: RecurrenceRule | null
  isAdjustment?: boolean // true per le correzioni di saldo generate da Impostazioni > Conti
  /** Se presente, questa transazione "salda" un'occorrenza di una ricorrenza (vedi RecurringTemplate). */
  recurringTemplateId?: string | null
  /** Mezzanotte locale (epoch ms) dell'occorrenza saldata da questa transazione: usata per capire quali occorrenze future risultano ancora da registrare. */
  recurringOccurrenceDate?: number | null
  createdAt: number
  updatedAt: number
}

/** Definizione di una spesa/entrata ricorrente: proietta occorrenze mese per mese finché non vengono registrate. */
export interface RecurringTemplate {
  id: string
  amount: number
  type: Extract<TransactionType, 'expense' | 'income'>
  categoryId: string | null
  accountId: string
  description?: string
  recurrenceRule: RecurrenceRule
  startDate: number // epoch ms, mezzanotte locale: ancora del giorno/mese/anno di ricorrenza
  active: boolean
  createdAt: number
  updatedAt: number
}

export type RecurringTemplateDraft = Omit<RecurringTemplate, 'id' | 'createdAt' | 'updatedAt'>

export type ChartKind = 'pie' | 'bar'
export type ChartGroupBy = 'category' | 'account'
export type ChartTransactionFilter = 'expense' | 'income' | 'both'
export type ChartPeriod = 'month' | 'all'

export interface CustomChart {
  id: string
  title: string
  kind: ChartKind
  groupBy: ChartGroupBy
  transactionFilter: ChartTransactionFilter
  period: ChartPeriod
  createdAt: number
}

export type CustomChartDraft = Omit<CustomChart, 'id' | 'createdAt'>

export interface TransactionDraft {
  amount: number
  type: TransactionType
  categoryId: string | null
  accountId: string
  toAccountId?: string | null
  description?: string
  date: number
  isRecurring: boolean
  recurrenceRule?: RecurrenceRule | null
  isAdjustment?: boolean
  recurringTemplateId?: string | null
  recurringOccurrenceDate?: number | null
}
