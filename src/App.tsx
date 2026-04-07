import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Theme = 'light' | 'dark'
type ThemePreference = Theme | 'system'

const NAV_ITEMS = [
  { label: 'About', href: '/', isActive: true },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
]

const BIO = `Started watching random videos about programming and ended up falling in love with Computer Science. I’m passionate about software — how it works and how it’s built — and I spend my free time watching technology talks, coding, and pretending to play the guitar.`

const THEME_STORAGE_KEY = 'portfolio-theme-preference'
const GITHUB_USERNAME = 'htaschne'
const GITHUB_GRAPH_SRC = `https://ghchart.rshah.org/e04c91/${GITHUB_USERNAME}`

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle__track">
        <span className={`theme-toggle__thumb ${isDark ? 'theme-toggle__thumb--dark' : 'theme-toggle__thumb--light'}`}>
          <span className="theme-toggle__icon">{isDark ? '☾' : '☀'}</span>
        </span>
      </span>
    </button>
  )
}

function SocialIcon({ kind }: { kind: 'github' | 'linkedin' }) {
  if (kind === 'github') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.589 2 12.248c0 4.527 2.865 8.367 6.839 9.722.5.096.682-.223.682-.495 0-.245-.009-.894-.014-1.754-2.782.617-3.37-1.373-3.37-1.373-.455-1.184-1.11-1.498-1.11-1.498-.908-.637.069-.624.069-.624 1.004.072 1.532 1.055 1.532 1.055.892 1.565 2.341 1.113 2.91.851.09-.664.35-1.113.636-1.369-2.221-.261-4.555-1.14-4.555-5.074 0-1.121.39-2.038 1.029-2.756-.103-.262-.446-1.317.098-2.746 0 0 .84-.276 2.75 1.053A9.325 9.325 0 0 1 12 6.836a9.29 9.29 0 0 1 2.504.346c1.909-1.329 2.748-1.053 2.748-1.053.545 1.429.202 2.484.1 2.746.64.718 1.028 1.635 1.028 2.756 0 3.944-2.338 4.81-4.566 5.066.359.317.679.942.679 1.899 0 1.371-.012 2.476-.012 2.813 0 .274.18.596.688.494C19.138 20.611 22 16.773 22 12.248 22 6.589 17.523 2 12 2Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.96 1.96 0 0 0 3.3 4.96c0 1.08.86 1.96 1.93 1.96h.02c1.09 0 1.96-.88 1.96-1.96A1.95 1.95 0 0 0 5.25 3ZM20.7 12.88c0-3.53-1.88-5.17-4.4-5.17-2.03 0-2.94 1.14-3.45 1.94V8.5H9.47c.05.76 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.68.12-.92.27-.68.88-1.39 1.91-1.39 1.35 0 1.89 1.05 1.89 2.58V20h3.38v-7.12Z" />
    </svg>
  )
}

function ProfileCard() {
  return (
    <section className="profile-card" aria-label="Profile summary">
      <h2 className="profile-card__title">Agatha Schneider</h2>
      <p className="profile-card__bio">{BIO}</p>

      <div className="profile-card__links" aria-label="Profile links">
        <a href="#" className="profile-card__icon-link" aria-label="GitHub profile placeholder">
          <SocialIcon kind="github" />
        </a>
        <a href="#" className="profile-card__icon-link" aria-label="LinkedIn profile placeholder">
          <SocialIcon kind="linkedin" />
        </a>
      </div>
    </section>
  )
}

function App() {
  const [themePreference, setThemePreference] = useState<ThemePreference>('system')
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const savedPreference = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null
    const initialPreference = savedPreference === 'light' || savedPreference === 'dark' ? savedPreference : 'system'

    setThemePreference(initialPreference)
    setTheme(initialPreference === 'system' ? getSystemTheme() : initialPreference)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      setTheme((currentTheme) => {
        if ((window.localStorage.getItem(THEME_STORAGE_KEY) ?? 'system') !== 'system') {
          return currentTheme
        }
        return getSystemTheme()
      })
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    document.body.style.colorScheme = theme
  }, [theme])

  const themeVariables = useMemo(
    () => ({
      '--bg': theme === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(230, 230, 230)',
      '--surface': theme === 'dark' ? 'rgba(40, 40, 40, 0.84)' : 'rgba(255, 255, 255, 0.74)',
      '--surface-strong': theme === 'dark' ? 'rgba(48, 48, 48, 0.96)' : 'rgba(255, 255, 255, 0.9)',
      '--border': theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(25, 25, 25, 0.08)',
      '--text': theme === 'dark' ? 'rgb(245, 245, 245)' : 'rgb(25, 25, 25)',
      '--text-soft': theme === 'dark' ? 'rgba(245, 245, 245, 0.68)' : 'rgba(25, 25, 25, 0.72)',
      '--accent': 'rgb(224, 76, 145)',
      '--accent-soft': 'rgba(224, 76, 145, 0.12)',
      '--shadow': theme === 'dark' ? '0 22px 56px rgba(0, 0, 0, 0.34)' : '0 18px 44px rgba(0, 0, 0, 0.08)',
    }) as React.CSSProperties,
    [theme],
  )

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    setThemePreference(nextTheme)
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }

  return (
    <div className="app-shell" style={themeVariables}>
      <div className="topbar-row">
        <header className="topbar">
          <nav className="nav nav--centered" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`nav__link ${item.isActive ? 'nav__link--active' : ''}`}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <div className="theme-toggle-shell" aria-label="Theme switcher area">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>

      <main className="page-layout">
        <section className="hero-section">
          <div className="hero-copy">
            <h1>Software Developer</h1>
            <p className="hero-description">{BIO}</p>
          </div>

          <aside className="hero-portrait" aria-label="Profile area">
            <div className="memoji-frame">
              <div className="memoji-placeholder">Memoji</div>
            </div>
            <ProfileCard />
          </aside>
        </section>

        <section className="graph-section" aria-labelledby="github-graph-heading">
          <div className="section-header">
            <div>
              <h2 id="github-graph-heading">Contribution Graph</h2>
              <p className="section-subtitle">Recent GitHub activity</p>
            </div>

            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noreferrer"
              className="section-link"
            >
              Open profile
            </a>
          </div>

          <div className="graph-card">
            <img
              src={GITHUB_GRAPH_SRC}
              alt={`GitHub contribution graph for ${GITHUB_USERNAME}`}
              className="github-graph"
            />
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
