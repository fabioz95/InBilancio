import { create } from 'zustand'
import type { Unsubscribe } from 'firebase/firestore'
import type { Account, Category, CustomChart, RecurringTemplate, Transaction } from '../types'
import {
  subscribeAccounts,
  subscribeCategories,
  subscribeCustomCharts,
  subscribeRecurringTemplates,
  subscribeTransactions,
} from '../lib/firestore'

interface DataState {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  customCharts: CustomChart[]
  recurringTemplates: RecurringTemplate[]
  loading: boolean
  unsubscribers: Unsubscribe[]
  subscribe: (uid: string) => void
  unsubscribe: () => void
}

export const useDataStore = create<DataState>((set, get) => ({
  accounts: [],
  categories: [],
  transactions: [],
  customCharts: [],
  recurringTemplates: [],
  loading: true,
  unsubscribers: [],

  subscribe: (uid: string) => {
    get().unsubscribe()

    const flags = {
      accounts: false,
      categories: false,
      transactions: false,
      customCharts: false,
      recurringTemplates: false,
    }
    const maybeDone = () => {
      if (Object.values(flags).every(Boolean)) set({ loading: false })
    }

    const unsubs = [
      subscribeAccounts(uid, (accounts) => {
        flags.accounts = true
        set({ accounts: accounts.sort((a, b) => a.createdAt - b.createdAt) })
        maybeDone()
      }),
      subscribeCategories(uid, (categories) => {
        flags.categories = true
        set({ categories })
        maybeDone()
      }),
      subscribeTransactions(uid, (transactions) => {
        flags.transactions = true
        set({ transactions })
        maybeDone()
      }),
      subscribeCustomCharts(uid, (customCharts) => {
        flags.customCharts = true
        set({ customCharts })
        maybeDone()
      }),
      subscribeRecurringTemplates(uid, (recurringTemplates) => {
        flags.recurringTemplates = true
        set({ recurringTemplates })
        maybeDone()
      }),
    ]

    set({ unsubscribers: unsubs, loading: true })
  },

  unsubscribe: () => {
    get().unsubscribers.forEach((fn) => fn())
    set({
      unsubscribers: [],
      accounts: [],
      categories: [],
      transactions: [],
      customCharts: [],
      recurringTemplates: [],
      loading: true,
    })
  },
}))
