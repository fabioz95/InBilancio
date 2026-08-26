import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'
import { useAuthStore } from '../../store/authStore'

export function Sidebar() {
  const user = useAuthStore((s) => s.user)

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white font-bold">
          IB
        </div>
        <span className="text-lg font-semibold">InBilancio</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-accent/15 text-accent' : 'text-muted hover:bg-fg/5 hover:text-fg'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName ?? ''} className="h-9 w-9 rounded-full" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-accent">
              {user.displayName?.[0] ?? '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.displayName}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
        </div>
      )}
    </aside>
  )
}
