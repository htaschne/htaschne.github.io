import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'

type PageTransitionProps = {
  children: ReactNode
  transitionKey: string
}

const STAGGER_MS = 60
const MAX_STAGGER_MS = 300

function PageTransition({ children, transitionKey }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const revealItems = containerRef.current?.querySelectorAll<HTMLElement>('[data-reveal]')

    revealItems?.forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${Math.min(index * STAGGER_MS, MAX_STAGGER_MS)}ms`)
    })
  }, [transitionKey])

  return (
    <div key={transitionKey} ref={containerRef} className="page-transition">
      {children}
    </div>
  )
}

export default PageTransition
