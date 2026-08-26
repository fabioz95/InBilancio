import { useDataStore } from '../../store/dataStore'
import { downloadCsv, transactionsToCsv } from '../../utils/csv'
import { IconDownload } from '../../components/icons'

export function DataSection() {
  const transactions = useDataStore((s) => s.transactions)
  const categories = useDataStore((s) => s.categories)
  const accounts = useDataStore((s) => s.accounts)

  function handleExport() {
    const csv = transactionsToCsv(transactions, categories, accounts)
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`inbilancio-transazioni-${date}.csv`, csv)
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Dati</h2>
      <p className="mb-4 text-sm text-muted">
        Esporta tutte le tue transazioni in un file CSV, compatibile con Excel e Fogli Google.
      </p>
      <button
        type="button"
        onClick={handleExport}
        disabled={transactions.length === 0}
        className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
      >
        <IconDownload size={18} />
        Esporta CSV ({transactions.length})
      </button>
    </section>
  )
}
