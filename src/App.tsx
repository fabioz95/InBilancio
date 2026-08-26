import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthListener } from './hooks/useAuthListener'
import { useAutoInsertRecurring } from './hooks/useAutoInsertRecurring'
import { useAuthStore } from './store/authStore'
import { completeRedirectSignIn } from './lib/firebase'
import { AppShell } from './components/layout/AppShell'
import { OfflineBanner } from './components/OfflineBanner'
import { Login } from './pages/Login'
import { Overview } from './pages/Overview'
import { Charts } from './pages/Charts'
import { Settings } from './pages/Settings'

function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  )
}

export default function App() {
  useAuthListener()
  useAutoInsertRecurring()
  const user = useAuthStore((s) => s.user)
  const initializing = useAuthStore((s) => s.initializing)
  const settings = useAuthStore((s) => s.settings)
  const setRedirectError = useAuthStore((s) => s.setRedirectError)

  useEffect(() => {
    completeRedirectSignIn().catch((e) => {
      console.error('Errore redirect sign-in', e)
      setRedirectError('Accesso non riuscito. Riprova.')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Applica il tema scelto nelle impostazioni all'intera app (usato dai token colore in index.css).
  useEffect(() => {
    document.documentElement.classList.toggle('light', settings.theme === 'light')
  }, [settings.theme])

  if (initializing) {
    return (
      <>
        <OfflineBanner />
        <LoadingScreen />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <OfflineBanner />
        <Login />
      </>
    )
  }

  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Overview />} />
          <Route path="/grafici" element={<Charts />} />
          <Route path="/impostazioni" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}
