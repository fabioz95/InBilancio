import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'

export function BottomNav() {
  return (
    <nav
      className="glass-nav fixed inset-x-4 z-30 flex justify-around gap-1 rounded-2xl p-1.5 md:hidden"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-medium transition-colors ${
              isActive ? 'bg-accent/15 text-accent' : 'text-muted'
            }`
          }
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
