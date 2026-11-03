import { Link, NavLink } from 'react-router'
import { company } from '../data/company'

const navItems = [
  { to: '/', label: 'Tableau de bord', end: true },
  { to: '/comptes', label: 'Comptes' },
  { to: '/factures', label: 'Factures' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-baseline gap-1">
          <span className="font-display text-xl font-extrabold tracking-tight text-navy">Wave</span>
          <span className="font-display text-xl font-extrabold tracking-tight text-blue">Bank Pro</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-ink sm:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? 'text-navy' : 'transition-colors hover:text-navy'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-white">
            AD
          </div>
          <span className="hidden text-sm font-medium text-navy md:inline">{company.name}</span>
        </div>
      </div>

      <nav className="flex items-center gap-6 border-t border-line px-6 py-2 text-sm font-medium text-slate-ink sm:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              isActive ? 'text-navy' : 'transition-colors hover:text-navy'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
