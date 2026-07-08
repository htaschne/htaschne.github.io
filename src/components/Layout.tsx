import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import type { Theme } from '../App'
import PageTransition from './PageTransition'
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

type PillStyle = CSSProperties & {
  opacity: number
}

function getActiveNavIndex(pathname: string) {
  if (pathname === '/') {
    return 0
  }

  const activeIndex = navItems.findIndex((item) => item.href !== '/' && pathname.startsWith(item.href))
  return activeIndex === -1 ? 0 : activeIndex
}

function getPillStyle(link: HTMLElement | null, nav: HTMLElement | null): PillStyle {
  if (!link || !nav) {
    return {
      opacity: 0,
      transform: 'translate3d(0, 0, 0)',
      width: 0,
      height: 0,
    }
  }

  const linkRect = link.getBoundingClientRect()
  const navRect = nav.getBoundingClientRect()

  return {
    opacity: 1,
    transform: `translate3d(${linkRect.left - navRect.left}px, ${linkRect.top - navRect.top}px, 0)`,
    width: linkRect.width,
    height: linkRect.height,
  }
}

function Layout({ theme, onThemeToggle }: LayoutProps) {
  const location = useLocation()
  const activeIndex = getActiveNavIndex(location.pathname)
  const transitionVariant = location.pathname === '/' ? 'home' : 'default'
  const navRef = useRef<HTMLElement | null>(null)
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [activePillStyle, setActivePillStyle] = useState<PillStyle>(() => ({
    opacity: 0,
    transform: 'translate3d(0, 0, 0)',
    width: 0,
    height: 0,
  }))
  const [hoverPillStyle, setHoverPillStyle] = useState<PillStyle>(() => ({
    opacity: 0,
    transform: 'translate3d(0, 0, 0)',
    width: 0,
    height: 0,
  }))

  const updatePills = useCallback(() => {
    setActivePillStyle(getPillStyle(linkRefs.current[activeIndex], navRef.current))

    if (hoverIndex === null || hoverIndex === activeIndex) {
      setHoverPillStyle((currentStyle) => ({ ...currentStyle, opacity: 0 }))
      return
    }

    setHoverPillStyle({ ...getPillStyle(linkRefs.current[hoverIndex], navRef.current), opacity: 0.68 })
  }, [activeIndex, hoverIndex])

  useLayoutEffect(() => {
    updatePills()
  }, [updatePills])

  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) {
      return undefined
    }

    const resizeObserver = new ResizeObserver(updatePills)
    resizeObserver.observe(nav)
    linkRefs.current.forEach((link) => {
      if (link) {
        resizeObserver.observe(link)
      }
    })
    window.addEventListener('resize', updatePills)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updatePills)
    }
  }, [updatePills])

  return (
    <>
      <div className="ambient-glow ambient-glow--one" />
      <div className="ambient-glow ambient-glow--two" />

      <div className="topbar-row">
        <header className="topbar glass-card">
          <nav
            ref={navRef}
            className="nav"
            aria-label="Main navigation"
            onMouseLeave={() => setHoverIndex(null)}
            onPointerLeave={() => setHoverIndex(null)}
          >
            <span
              className={`nav__pill nav__pill--active ${hoverIndex === activeIndex ? 'nav__pill--active-hover' : ''}`}
              style={activePillStyle}
              aria-hidden="true"
            />
            <span className="nav__pill nav__pill--hover" style={hoverPillStyle} aria-hidden="true" />

            {navItems.map((item, index) => (
              <NavLink
                key={item.label}
                to={item.href}
                end={item.end}
                ref={(element) => {
                  linkRefs.current[index] = element
                }}
                onMouseEnter={() => setHoverIndex(index)}
                onPointerEnter={() => setHoverIndex(index)}
                onFocus={() => setHoverIndex(index)}
                onBlur={() => setHoverIndex(null)}
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
        <PageTransition transitionKey={location.pathname} variant={transitionVariant}>
          <Outlet />
        </PageTransition>
      </main>
    </>
  )
}

export default Layout
