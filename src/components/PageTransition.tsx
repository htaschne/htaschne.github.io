import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'

type PageTransitionProps = {
  children: ReactNode
  transitionKey: string
}

const revealPresets = {
  default: {
    staggerMs: 90,
  },
}

function PageTransition({ children, transitionKey }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const revealItems = containerRef.current?.querySelectorAll<HTMLElement>('[data-reveal]')
    const preset = revealPresets.default

    revealItems?.forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${index * preset.staggerMs}ms`)
    })
  }, [transitionKey])

  return (
    <div key={transitionKey} ref={containerRef} className="page-transition">
      {children}
    </div>
  )
}

export default PageTransition
