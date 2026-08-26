import type { Account } from '../types'
import { Modal } from './Modal'
import { IconBank, IconCard, IconCheck, IconWallet } from './icons'

interface AccountPickerProps {
  open: boolean
  onClose: () => void
  accounts: Account[]
  selectedId: string | null
  onSelect: (accountId: string) => void
  title?: string
  excludeId?: string | null
}

const ACCOUNT_ICONS = {
  checking: IconBank,
  cash: IconWallet,
  card: IconCard,
  other: IconWallet,
} as const

export function AccountPicker({
  open,
  onClose,
  accounts,
  selectedId,
  onSelect,
  title = 'Conto',
  excludeId = null,
}: AccountPickerProps) {
  const visible = accounts.filter((a) => a.id !== excludeId)

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <ul className="flex flex-col gap-1">
        {visible.map((account) => {
          const Icon = ACCOUNT_ICONS[account.type] ?? IconWallet
          return (
            <li key={account.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(account.id)
                  onClose()
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-fg/5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fg/10 text-fg">
                  <Icon size={18} />
                </span>
                <span className="flex-1 text-sm text-fg">{account.name}</span>
                {selectedId === account.id && <IconCheck size={18} className="text-accent" />}
              </button>
            </li>
          )
        })}
        {visible.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">Nessun conto disponibile</p>
        )}
      </ul>
    </Modal>
  )
}
