import type { ReactNode } from 'react'
import { IconChevronLeft, IconClose } from './icons'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  onBack?: () => void
  footer?: ReactNode
}

export function Modal({ open, onClose, title, children, onBack, footer }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 md:items-center">
      <button
        aria-label="Chiudi"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative z-10 flex max-h-[92vh] w-full flex-col rounded-t-2xl border border-border bg-card md:max-w-md md:rounded-2xl">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
          {onBack && (
            <button type="button" onClick={onBack} aria-label="Indietro" className="text-muted hover:text-fg">
              <IconChevronLeft size={20} />
            </button>
          )}
          <h2 className="flex-1 text-center text-base font-semibold text-fg">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Chiudi" className="text-muted hover:text-fg">
            <IconClose size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>

        {footer && <div className="border-t border-border px-4 py-3.5">{footer}</div>}
      </div>
    </div>
  )
}
