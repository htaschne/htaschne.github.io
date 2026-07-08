import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'

type PageTransitionProps = {
  children: ReactNode
  transitionKey: string
  variant?: 'default' | 'home'
}

const revealPresets = {
  default: {
    staggerMs: 90,
  },
  home: {
    staggerMs: 110,
  },
}

function PageTransition({ children, transitionKey, variant = 'default' }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const revealItems = containerRef.current?.querySelectorAll<HTMLElement>('[data-reveal]')
    const preset = revealPresets[variant]

    revealItems?.forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${index * preset.staggerMs}ms`)
    })
  }, [transitionKey, variant])

  return (
    <div key={transitionKey} ref={containerRef} className={`page-transition page-transition--${variant}`}>
      {children}
    </div>
  )
}

export default PageTransition
