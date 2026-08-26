interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
}

// Interruttore on/off. Il pallino NON è posizionato in absolute: è un figlio
// normale di un contenitore flex con padding fisso (p-0.5), così la sua
// posizione di riposo è sempre corretta e la sola transform lo fa scorrere
// fino al bordo opposto, senza sbordare dalla pillola.
export function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-accent' : 'bg-fg/15'
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
