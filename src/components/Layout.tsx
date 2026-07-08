import { NavLink, Outlet } from 'react-router-dom'
import type { Theme } from '../App'
import ThemeToggle from './ThemeToggle'

type LayoutProps = {
  theme: Theme
  onThemeToggle: () => void
}

const navItems = [
  { label: 'About', href: '/', end: true },
  { label: 'Software Engineering', href: '/projects' },
  { label: 'Research', href: '/blog' },
]

function Layout({ theme, onThemeToggle }: LayoutProps) {
  return (
    <>
      <div className="ambient-glow ambient-glow--one" />
      <div className="ambient-glow ambient-glow--two" />

      <div className="topbar-row">
        <header className="topbar glass-card">
          <nav className="nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                end={item.end}
                className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <div className="theme-toggle-shell glass-card" aria-label="Theme switcher area">
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        </div>
      </div>

      <main className="page-layout">
        <Outlet />
      </main>
    </>
  )
}

export default Layout
