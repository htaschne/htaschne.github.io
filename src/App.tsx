import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import BlogIndexPage from './pages/BlogIndexPage'
import BlogPostPage from './pages/BlogPostPage'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'
import ProjectsIndexPage from './pages/ProjectsIndexPage'

export type Theme = 'light' | 'dark'
type ThemePreference = Theme | 'system'

const THEME_STORAGE_KEY = 'portfolio-theme-preference'

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'system'
  }

  const savedPreference = window.localStorage.getItem(THEME_STORAGE_KEY)
  return savedPreference === 'light' || savedPreference === 'dark' ? savedPreference : 'system'
}

function getInitialTheme(): Theme {
  const preference = getStoredThemePreference()
  return preference === 'system' ? getSystemTheme() : preference
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      setTheme((currentTheme) => {
        if (getStoredThemePreference() !== 'system') {
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
    () =>
      ({
        '--bg':
          theme === 'dark'
            ? 'linear-gradient(135deg, #18141f 0%, #201a29 38%, #15171d 100%)'
            : 'linear-gradient(135deg, #fff5fb 0%, #f8f0ff 42%, #eef8ff 100%)',
        '--surface': theme === 'dark' ? 'rgba(42, 35, 52, 0.66)' : 'rgba(255, 255, 255, 0.68)',
        '--surface-strong': theme === 'dark' ? 'rgba(50, 42, 62, 0.84)' : 'rgba(255, 255, 255, 0.84)',
        '--surface-soft': theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.44)',
        '--border': theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(126, 72, 130, 0.16)',
        '--text': theme === 'dark' ? 'rgb(252, 247, 255)' : 'rgb(38, 31, 47)',
        '--text-soft': theme === 'dark' ? 'rgba(252, 247, 255, 0.72)' : 'rgba(38, 31, 47, 0.68)',
        '--text-muted': theme === 'dark' ? 'rgba(252, 247, 255, 0.5)' : 'rgba(38, 31, 47, 0.52)',
        '--accent': 'rgb(232, 88, 158)',
        '--accent-strong': 'rgb(196, 87, 255)',
        '--accent-soft': theme === 'dark' ? 'rgba(232, 88, 158, 0.18)' : 'rgba(232, 88, 158, 0.14)',
        '--accent-border': theme === 'dark' ? 'rgba(232, 88, 158, 0.34)' : 'rgba(196, 87, 255, 0.22)',
        '--code-bg': theme === 'dark' ? 'rgba(16, 13, 22, 0.72)' : 'rgba(255, 255, 255, 0.72)',
        '--shadow': theme === 'dark' ? '0 24px 70px rgba(0, 0, 0, 0.34)' : '0 24px 60px rgba(111, 63, 126, 0.14)',
        '--shadow-soft':
          theme === 'dark' ? '0 14px 34px rgba(0, 0, 0, 0.22)' : '0 14px 34px rgba(190, 103, 176, 0.12)',
      }) as CSSProperties,
    [theme],
  )

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }

  return (
    <BrowserRouter>
      <div className="app-shell" style={themeVariables}>
        <Routes>
          <Route element={<Layout theme={theme} onThemeToggle={toggleTheme} />}>
            <Route index element={<HomePage />} />
            <Route path="projects" element={<ProjectsIndexPage />} />
            <Route path="projects/:slug" element={<ProjectPage />} />
            <Route path="blog" element={<BlogIndexPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
