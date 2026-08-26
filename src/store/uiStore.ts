import { create } from 'zustand'
import type { Transaction } from '../types'

interface UiState {
  selectedMonth: Date
  setSelectedMonth: (date: Date) => void
  isTransactionModalOpen: boolean
  editingTransaction: Transaction | null
  openTransactionModal: (transaction?: Transaction | null) => void
  closeTransactionModal: () => void
  activeCategoryFilter: string | null
  setActiveCategoryFilter: (categoryId: string | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  selectedMonth: new Date(),
  setSelectedMonth: (date) => set({ selectedMonth: date, activeCategoryFilter: null }),
  isTransactionModalOpen: false,
  editingTransaction: null,
  openTransactionModal: (transaction = null) =>
    set({ isTransactionModalOpen: true, editingTransaction: transaction }),
  closeTransactionModal: () => set({ isTransactionModalOpen: false, editingTransaction: null }),
  activeCategoryFilter: null,
  setActiveCategoryFilter: (categoryId) => set({ activeCategoryFilter: categoryId }),
}))
