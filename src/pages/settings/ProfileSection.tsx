import { useAuthStore } from '../../store/authStore'
import { signOut } from '../../lib/firebase'
import { IconLogout, IconUser } from '../../components/icons'

export function ProfileSection() {
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Profilo</h2>
      <div className="flex items-center gap-4">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName ?? ''} className="h-14 w-14 rounded-full" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent">
            <IconUser size={24} />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-base font-medium text-fg">{user.displayName}</p>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => signOut()}
        className="mt-5 flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-expense transition-colors hover:bg-expense/10"
      >
        <IconLogout size={18} />
        Esci
      </button>
    </section>
  )
}
