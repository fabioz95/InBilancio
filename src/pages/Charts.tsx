import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useDataStore } from '../store/dataStore'
import { useUiStore } from '../store/uiStore'
import { MonthSelector } from '../components/MonthSelector'
import { CategoryPieChart } from '../components/CategoryPieChart'
import { CustomChartCard } from '../components/CustomChartCard'
import { addCustomChart, deleteCustomChart } from '../lib/firestore'
import { IconClose, IconPlus } from '../components/icons'
import { endOfMonth, startOfMonth } from '../utils/date'
import type { ChartGroupBy, ChartKind, ChartPeriod, ChartTransactionFilter, CustomChartDraft } from '../types'

const KIND_OPTIONS: { value: ChartKind; label: string }[] = [
  { value: 'pie', label: 'A torta' },
  { value: 'bar', label: 'A barre' },
]
const GROUP_OPTIONS: { value: ChartGroupBy; label: string }[] = [
  { value: 'category', label: 'Categoria' },
  { value: 'account', label: 'Conto' },
]
const FILTER_OPTIONS: { value: ChartTransactionFilter; label: string }[] = [
  { value: 'expense', label: 'Solo spese' },
  { value: 'income', label: 'Solo entrate' },
  { value: 'both', label: 'Entrambe' },
]
const PERIOD_OPTIONS: { value: ChartPeriod; label: string }[] = [
  { value: 'month', label: 'Mese selezionato' },
  { value: 'all', label: 'Tutti i periodi' },
]

const emptyForm: CustomChartDraft = {
  title: '',
  kind: 'pie',
  groupBy: 'category',
  transactionFilter: 'expense',
  period: 'month',
}

export function Charts() {
  const navigate = useNavigate()

  const transactions = useDataStore((s) => s.transactions)
  const categories = useDataStore((s) => s.categories)
  const accounts = useDataStore((s) => s.accounts)
  const customCharts = useDataStore((s) => s.customCharts)
  const settings = useAuthStore((s) => s.settings)
  const dataOwnerUid = useAuthStore((s) => s.dataOwnerUid)

  const selectedMonth = useUiStore((s) => s.selectedMonth)
  const setSelectedMonth = useUiStore((s) => s.setSelectedMonth)
  const setActiveCategoryFilter = useUiStore((s) => s.setActiveCategoryFilter)

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<CustomChartDraft>(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const monthStart = useMemo(() => startOfMonth(selectedMonth), [selectedMonth])
  const monthEnd = useMemo(() => endOfMonth(selectedMonth), [selectedMonth])

  const monthTransactions = useMemo(
    () =>
      transactions.filter(
        (t) => t.date >= monthStart.getTime() && t.date <= monthEnd.getTime()
      ),
    [transactions, monthStart, monthEnd]
  )

  function goToCategory(categoryId: string) {
    setActiveCategoryFilter(categoryId)
    navigate('/')
  }

  function startCreate() {
    setForm(emptyForm)
    setError(null)
    setFormOpen(true)
  }

  async function handleSave() {
    if (!dataOwnerUid) return
    if (!form.title.trim()) {
      setError('Dai un nome al grafico.')
      return
    }
    try {
      await addCustomChart(dataOwnerUid, { ...form, title: form.title.trim() })
      setFormOpen(false)
    } catch (e) {
      console.error(e)
      setError('Impossibile salvare il grafico.')
    }
  }

  async function handleDelete(id: string) {
    if (!dataOwnerUid) return
    await deleteCustomChart(dataOwnerUid, id)
  }

  return (
    <div className="flex flex-col gap-6">
      <MonthSelector month={selectedMonth} onChange={setSelectedMonth} transactionCount={monthTransactions.length} />

      <CategoryPieChart
        transactions={monthTransactions}
        categories={categories}
        currency={settings.currency}
        activeCategoryId={null}
        onSliceClick={(categoryId) => categoryId && goToCategory(categoryId)}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">I tuoi grafici</h2>
        <button
          type="button"
          onClick={startCreate}
          className="flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25"
        >
          <IconPlus size={14} /> Nuovo grafico
        </button>
      </div>

      {formOpen && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-fg">Nuovo grafico</h3>
            <button type="button" onClick={() => setFormOpen(false)} className="text-muted hover:text-fg">
              <IconClose size={18} />
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Nome del grafico"
              className="w-full rounded-xl border border-border bg-fg/5 px-3 py-2.5 text-sm text-fg placeholder:text-muted outline-none focus:border-accent"
            />

            <div>
              <p className="mb-1.5 text-xs text-muted">Tipo</p>
              <div className="flex gap-2">
                {KIND_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, kind: opt.value }))}
                    className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                      form.kind === opt.value ? 'bg-accent text-white' : 'bg-fg/5 text-muted hover:text-fg'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs text-muted">Raggruppa per</p>
              <div className="flex gap-2">
                {GROUP_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, groupBy: opt.value }))}
                    className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                      form.groupBy === opt.value ? 'bg-accent text-white' : 'bg-fg/5 text-muted hover:text-fg'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs text-muted">Movimenti</p>
              <div className="flex gap-2">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, transactionFilter: opt.value }))}
                    className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                      form.transactionFilter === opt.value ? 'bg-accent text-white' : 'bg-fg/5 text-muted hover:text-fg'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs text-muted">Periodo</p>
              <div className="flex gap-2">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, period: opt.value }))}
                    className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                      form.period === opt.value ? 'bg-accent text-white' : 'bg-fg/5 text-muted hover:text-fg'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-expense">{error}</p>}

            <button
              type="button"
              onClick={handleSave}
              className="mt-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white"
            >
              Salva grafico
            </button>
          </div>
        </div>
      )}

      {customCharts.length === 0 && !formOpen && (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
          Non hai ancora grafici personalizzati. Crea il primo con "Nuovo grafico".
        </p>
      )}

      <div className="flex flex-col gap-6">
        {customCharts.map((chart) => (
          <CustomChartCard
            key={chart.id}
            chart={chart}
            transactions={transactions}
            monthTransactions={monthTransactions}
            categories={categories}
            accounts={accounts}
            currency={settings.currency}
            onDelete={() => handleDelete(chart.id)}
            onCategoryClick={goToCategory}
          />
        ))}
      </div>
    </div>
  )
}
