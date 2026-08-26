import { IconPlus } from './icons'

interface FABProps {
  onClick: () => void
}

export function FAB({ onClick }: FABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Nuova transazione"
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.75rem)] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-fab transition-transform active:scale-95 md:bottom-8 md:right-8"
    >
      <IconPlus size={26} />
    </button>
  )
}
