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
      <main className="pb-[calc(env(safe-area-inset-bottom,0px)+6rem)] md:ml-64 md:pb-10">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <FAB onClick={() => openTransactionModal(null)} />
      <TransactionModal />
    </div>
  )
}
