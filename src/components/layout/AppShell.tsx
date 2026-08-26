import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { FAB } from '../FAB'
import { TransactionModal } from '../TransactionModal'
import { useUiStore } from '../../store/uiStore'

export function AppShell() {
  const openTransactionModal = useUiStore((s) => s.openTransactionModal)

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <Sidebar />
      {/* Il FAB (in basso a destra) arriva fino a ~9.25rem dal fondo (offset 5.75rem
          + sua altezza 3.5rem): il padding qui deve superare quella misura, altrimenti
          l'ultima transazione della lista resta "intrappolata" sotto FAB/bottom nav
          quando si scorre fino in fondo (più visibile da app installata, dove non c'è
          più la barra di Safari a nascondere quello spazio). */}
      <main className="pb-[calc(env(safe-area-inset-bottom,0px)+10.5rem)] pt-[env(safe-area-inset-top,0px)] md:ml-64 md:pb-10 md:pt-0">
        {/* `apple-mobile-web-app-status-bar-style: black-translucent` (in
            index.html) rende la status bar trasparente e sovrapposta alla
            pagina da app installata: senza questo padding l'header (mese,
            ricerca) finisce a renderizzarsi proprio sotto orologio/batteria
            invece che sotto di essi. Su desktop/browser normale
            safe-area-inset-top è 0, quindi qui non cambia nulla. */}
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
      {/* Il pulsante + e la barra di navigazione sono sempre "fixed": qualunque
          riga della lista che gli scorre sotto verrebbe tagliata di netto in modo
          brusco (specie da app installata, dove si vede più contenuto perché non
          c'è la UI del browser sotto a nascondere quella zona). Questa sfumatura
          fa sparire gradualmente il contenuto invece di farlo sembrare "rotto". */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-bg via-bg/85 to-transparent md:hidden"
        style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 13rem)' }}
        aria-hidden="true"
      />
      <BottomNav />
      <FAB onClick={() => openTransactionModal(null)} />
      <TransactionModal />
    </div>
  )
}
