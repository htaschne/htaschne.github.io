import type { Theme } from '../App'

type ThemeToggleProps = {
  theme: Theme
  onToggle: () => void
}

function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
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

export default ThemeToggle
