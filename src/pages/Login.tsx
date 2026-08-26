import { useState } from 'react'
import { signInWithGoogle, isFirebaseConfigured } from '../lib/firebase'
import { IconGoogle } from '../components/icons'
import { useAuthStore } from '../store/authStore'

export function Login() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const redirectError = useAuthStore((s) => s.redirectError)

  async function handleSignIn() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (e) {
      console.error(e)
      setError('Accesso non riuscito. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-2xl font-bold text-white">
        IB
      </div>
      <h1 className="text-2xl font-semibold text-fg">InBilancio</h1>
      <p className="mt-2 max-w-xs text-sm text-muted">
        Tieni sotto controllo entrate e uscite, in modo semplice e ordinato.
      </p>

      {!isFirebaseConfigured && (
        <p className="mt-6 max-w-sm rounded-xl border border-expense/30 bg-expense/10 p-3 text-xs text-expense">
          Configurazione Firebase mancante. Copia <code>.env.example</code> in <code>.env</code> e
          inserisci le chiavi del tuo progetto Firebase (vedi README).
        </p>
      )}

      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading || !isFirebaseConfigured}
        className="mt-10 flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-lg transition-opacity disabled:opacity-50"
      >
        <IconGoogle size={20} />
        {loading ? 'Accesso in corso…' : 'Accedi con Google'}
      </button>

      {(error || redirectError) && <p className="mt-4 text-sm text-expense">{error ?? redirectError}</p>}
    </div>
  )
}
