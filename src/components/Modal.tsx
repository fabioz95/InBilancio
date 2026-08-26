import type { ReactNode } from 'react'
import { IconChevronLeft, IconClose } from './icons'
import { useKeyboardInset } from '../hooks/useKeyboardInset'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  onBack?: () => void
  footer?: ReactNode
  /**
   * Se true, quando la tastiera è aperta spingiamo su il modale di quel tanto
   * (padding sul fondo del contenitore, che coi bordi bottom-aligned del
   * foglio lo fa salire sopra la tastiera). Utile solo per modali con un
   * campo di ricerca in cima (es. CategoryPicker): altrove questo
   * spostamento dinamico creava un layout "sticky" inutilizzabile, quindi
   * di default resta disattivato e il modale si comporta come prima
   * (fixed inset-0 + dvh, nessuno spostamento).
   */
  avoidKeyboard?: boolean
}

export function Modal({ open, onClose, title, children, onBack, footer, avoidKeyboard = false }: ModalProps) {
  const keyboardInset = useKeyboardInset()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 md:items-center"
      style={avoidKeyboard ? { paddingBottom: keyboardInset } : undefined}
    >
      <button
        aria-label="Chiudi"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative z-10 flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-border bg-card md:max-w-md md:rounded-2xl">
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

        {footer && (
          <div className="border-t border-border px-4 py-3.5 pb-[calc(env(safe-area-inset-bottom,0px)+0.875rem)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
