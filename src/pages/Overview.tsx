import { useEffect, useMemo, useState } from 'react'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'
import { useUiStore } from '../store/uiStore'
import { MonthSelector } from '../components/MonthSelector'
import { SummaryCard } from '../components/SummaryCard'
import { RecurringHighlight } from '../components/RecurringHighlight'
import { SearchBar } from '../components/SearchBar'
import { TransactionList } from '../components/TransactionList'
import { IconChevronDown, IconRepeat } from '../components/icons'
import { setTransactionForOccurrence } from '../lib/firestore'
import { computeTotalBalance } from '../utils/balance'
import { endOfMonth, startOfMonth } from '../utils/date'
import { buildDraftFromTemplate, getUnpaidOccurrences } from '../utils/recurring'
import type { Transaction } from '../types'

// Oltre questa soglia le ricorrenze da registrare vengono raccolte in un
// riepilogo comprimibile invece di occupare spazio in cima alla pagina.
const COLLAPSE_THRESHOLD = 2

export function Overview() {
  const transactions = useDataStore((s) => s.transactions)
  const categories = useDataStore((s) => s.categories)
  const accounts = useDataStore((s) => s.accounts)
  const recurringTemplates = useDataStore((s) => s.recurringTemplates)
  const settings = useAuthStore((s) => s.settings)
  const dataOwnerUid = useAuthStore((s) => s.dataOwnerUid)

  const selectedMonth = useUiStore((s) => s.selectedMonth)
  const setSelectedMonth = useUiStore((s) => s.setSelectedMonth)
  const openTransactionModal = useUiStore((s) => s.openTransactionModal)
  const activeCategoryFilter = useUiStore((s) => s.activeCategoryFilter)
  const setActiveCategoryFilter = useUiStore((s) => s.setActiveCategoryFilter)

  const [search, setSearch] = useState('')
  const [searchAllMonths, setSearchAllMonths] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [recurringExpanded, setRecurringExpanded] = useState(false)
  const [addingKeys, setAddingKeys] = useState<Set<string>>(new Set())

  const monthStart = useMemo(() => startOfMonth(selectedMonth), [selectedMonth])
  const monthEnd = useMemo(() => endOfMonth(selectedMonth), [selectedMonth])

  const monthTransactions = useMemo(
    () =>
      transactions.filter(
        (t) => t.date >= monthStart.getTime() && t.date <= monthEnd.getTime()
      ),
    [transactions, monthStart, monthEnd]
  )

  const { income, expense } = useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of monthTransactions) {
      if (t.isAdjustment) continue
      if (t.type === 'income') income += t.amount
      if (t.type === 'expense') expense += t.amount
    }
    return { income, expense }
  }, [monthTransactions])

  // Saldo totale di tutti i conti: indipendente dal mese selezionato.
  const totalBalance = useMemo(
    () => computeTotalBalance(accounts, transactions),
    [accounts, transactions]
  )

  const unpaidRecurring = useMemo(
    () => getUnpaidOccurrences(recurringTemplates, transactions, monthStart.getTime(), monthEnd.getTime()),
    [recurringTemplates, transactions, monthStart, monthEnd]
  )

  useEffect(() => setRecurringExpanded(false), [selectedMonth])

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const searchBase = searchAllMonths ? transactions : monthTransactions

  const filteredTransactions = useMemo(() => {
    let list = searchBase

    const query = search.trim().toLowerCase()
    if (query) {
      list = list.filter((t) => {
        const categoryName = t.categoryId ? categoryById.get(t.categoryId)?.name ?? '' : ''
        return (
          t.description?.toLowerCase().includes(query) || categoryName.toLowerCase().includes(query)
        )
      })
    }

    if (activeCategoryFilter) {
      list = list.filter((t) => t.categoryId === activeCategoryFilter)
    }

    return list
  }, [searchBase, search, activeCategoryFilter, categoryById])

  function handleSelectTransaction(t: Transaction) {
    openTransactionModal(t)
  }

  async function handleAddOccurrence(templateId: string, occurrenceDate: number) {
    if (!dataOwnerUid) return
    const key = `${templateId}:${occurrenceDate}`
    if (addingKeys.has(key)) return
    setAddingKeys((prev) => new Set(prev).add(key))
    try {
      const template = recurringTemplates.find((t) => t.id === templateId)
      if (!template) return
      await setTransactionForOccurrence(dataOwnerUid, templateId, occurrenceDate, buildDraftFromTemplate(template, occurrenceDate))
    } catch (e) {
      console.error(e)
      setAddingKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  function handleToggleSearch() {
    setSearchOpen((open) => {
      const next = !open
      if (!next) setSearch('')
      return next
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <MonthSelector
        month={selectedMonth}
        onChange={setSelectedMonth}
        transactionCount={monthTransactions.length}
        searchActive={searchOpen}
        onToggleSearch={handleToggleSearch}
      />

      <div className={searchOpen ? '' : 'hidden md:block'}>
        <SearchBar
          value={search}
          onChange={setSearch}
          allMonths={searchAllMonths}
          onToggleAllMonths={setSearchAllMonths}
        />
      </div>

      <SummaryCard
        income={income}
        expense={expense}
        totalBalance={totalBalance}
        currency={settings.currency}
      />

      {unpaidRecurring.length > 0 && !search && (
        <>
          {unpaidRecurring.length > COLLAPSE_THRESHOLD && !recurringExpanded ? (
            <button
              type="button"
              onClick={() => setRecurringExpanded(true)}
              className="flex items-center justify-between rounded-2xl border border-accent/30 bg-accent/10 p-4 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-fg">
                <IconRepeat size={18} />
                {unpaidRecurring.length} spese ricorrenti da registrare questo mese
              </span>
              <IconChevronDown size={18} className="text-muted" />
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              {unpaidRecurring.length > COLLAPSE_THRESHOLD && (
                <button
                  type="button"
                  onClick={() => setRecurringExpanded(false)}
                  className="self-start text-xs font-semibold text-muted hover:text-fg"
                >
                  Comprimi ✕
                </button>
              )}
              {unpaidRecurring.map(({ template, occurrenceDate }) => (
                <RecurringHighlight
                  key={`${template.id}:${occurrenceDate}`}
                  template={template}
                  occurrenceDate={occurrenceDate}
                  category={template.categoryId ? categoryById.get(template.categoryId) : undefined}
                  currency={settings.currency}
                  adding={addingKeys.has(`${template.id}:${occurrenceDate}`)}
                  onAdd={() => handleAddOccurrence(template.id, occurrenceDate)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeCategoryFilter && (
        <button
          type="button"
          onClick={() => setActiveCategoryFilter(null)}
          className="self-start rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent hover:bg-accent/20"
        >
          Filtro: {categoryById.get(activeCategoryFilter)?.name ?? 'Categoria'} · rimuovi ✕
        </button>
      )}

      <TransactionList
        transactions={filteredTransactions}
        categories={categories}
        currency={settings.currency}
        onSelect={handleSelectTransaction}
        emptyLabel={search ? 'Nessun risultato per la ricerca' : 'Nessuna transazione questo mese'}
      />
    </div>
  )
}
