import { useAuthStore } from '../../store/authStore'
import { updateUserSettings } from '../../lib/firestore'
import type { Theme } from '../../types'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF']

export function PreferencesSection() {
  const user = useAuthStore((s) => s.user)
  const settings = useAuthStore((s) => s.settings)

  async function patch(update: Partial<typeof settings>) {
    if (!user) return
    await updateUserSettings(user.uid, update)
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Preferenze</h2>

      <div className="flex flex-col gap-4">
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm text-fg">Valuta</span>
          <select
            value={settings.currency}
            onChange={(e) => patch({ currency: e.target.value })}
            className="rounded-lg border border-border bg-fg/5 px-3 py-2 text-sm text-fg outline-none focus:border-accent"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center justify-between gap-4">
          <span className="text-sm text-fg">Primo giorno del mese</span>
          <input
            type="number"
            min={1}
            max={28}
            value={settings.firstDayOfMonth}
            onChange={(e) => patch({ firstDayOfMonth: Number(e.target.value) || 1 })}
            className="w-20 rounded-lg border border-border bg-fg/5 px-3 py-2 text-sm text-fg outline-none focus:border-accent"
          />
        </label>

        <label className="flex items-center justify-between gap-4">
          <span className="text-sm text-fg">Tema</span>
          <select
            value={settings.theme}
            onChange={(e) => patch({ theme: e.target.value as Theme })}
            className="rounded-lg border border-border bg-fg/5 px-3 py-2 text-sm text-fg outline-none focus:border-accent"
          >
            <option value="dark">Scuro</option>
            <option value="light">Chiaro</option>
          </select>
        </label>
      </div>
    </section>
  )
}
