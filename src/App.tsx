import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Theme = 'light' | 'dark'
type Page = 'about' | 'projects' | 'blog'

const NAV_ITEMS: Array<{ label: string; page: Page }> = [
  { label: 'About', page: 'about' },
  { label: 'Projects', page: 'projects' },
  { label: 'Blog', page: 'blog' },
]

const BIO = `Started watching random videos about programming and ended up falling in love with Computer Science. I’m passionate about software — how it works and how it’s built — and I spend my free time watching technology talks, coding, and pretending to play the guitar.`

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle__track">
        <span className={`theme-toggle__thumb theme-toggle__thumb--${theme}`} />
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

function App() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [currentPage, setCurrentPage] = useState<Page>('about')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = (matchesDark: boolean) => {
      setTheme(matchesDark ? 'dark' : 'light')
    }

    applyTheme(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      applyTheme(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const isAboutPage = useMemo(() => currentPage === 'about', [currentPage])

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-label="Portfolio home">
          AS
        </div>

        <nav className="nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.page}
              type="button"
              className={`nav__link ${currentPage === item.page ? 'nav__link--active' : ''}`}
              onClick={() => setCurrentPage(item.page)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <ThemeToggle
          theme={theme}
          onToggle={() => setTheme((previousTheme) => (previousTheme === 'dark' ? 'light' : 'dark'))}
        />
      </header>

      <main className="page">
        {isAboutPage ? (
          <>
            <section className="hero-card">
              <div className="hero-copy">
                <p className="eyebrow">About</p>
                <h1>Software Developer</h1>
                <p className="hero-description">{BIO}</p>

                <div className="social-links" aria-label="Social links">
                  <a href="#" className="social-link" aria-label="GitHub">
                    <SocialIcon kind="github" />
                    <span>GitHub</span>
                  </a>
                  <a href="#" className="social-link" aria-label="LinkedIn">
                    <SocialIcon kind="linkedin" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>

              <div className="hero-portrait">
                <div className="memoji-placeholder">
                  <span>Memoji</span>
                </div>
                <p className="portrait-name">Agatha Schneider</p>
              </div>
            </section>

            <section className="section-card">
              <div className="section-heading-row">
                <div>
                  <p className="section-kicker">GitHub</p>
                  <h2>Recent Contributions</h2>
                </div>
                <a
                  href="https://github.com/htaschne"
                  target="_blank"
                  rel="noreferrer"
                  className="section-action"
                >
                  Open profile
                </a>
              </div>

              <div className="graph-placeholder" role="img" aria-label="GitHub contribution graph placeholder">
                <div className="graph-placeholder__badge">Live graph comes next</div>
                <p>
                  We’ll wire your GitHub contribution graph here and recolor it with the portfolio accent instead of the default green.
                </p>
              </div>
            </section>
          </>
        ) : (
          <section className="section-card section-card--coming-soon">
            <p className="section-kicker">{currentPage === 'projects' ? 'Projects' : 'Blog'}</p>
            <h2>{currentPage === 'projects' ? 'Projects page' : 'Blog page'}</h2>
            <p>
              This route is reserved already. We can build the real page structure next without changing the overall shell.
            </p>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
