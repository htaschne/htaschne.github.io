import { Link } from 'react-router-dom'
import { projects } from '../lib/content'

const focusItems = [
  {
    title: 'Distributed Systems',
    description: 'Matrix multiplication with MPI in Go',
    href: '/blog/parallel-matrix-multiplication',
  },
  {
    title: 'Mimicards',
    description: 'Offline-first flashcards with local files and Drive sync',
    href: '/projects/mimicards',
  },
  {
    title: 'SinaLu',
    description: 'Libras learning app published on the App Store',
    href: '/projects/sinalu',
  },
]

function CurrentFocusCard() {
  const projectSlugs = new Set(projects.map((project) => `/projects/${project.slug}`))

  return (
    <section className="current-focus-card glass-card" aria-labelledby="current-focus-heading">
      <h2 id="current-focus-heading">Current Focus</h2>

      <div className="current-focus-list">
        {focusItems.map((item) => {
          const content = (
            <>
              <span className="current-focus-item__title">{item.title}</span>
              <span className="current-focus-item__description">{item.description}</span>
            </>
          )

          if (item.href.startsWith('/blog/') || projectSlugs.has(item.href)) {
            return (
              <Link key={item.title} to={item.href} className="current-focus-item">
                {content}
              </Link>
            )
          }

          return (
            <div key={item.title} className="current-focus-item current-focus-item--static">
              {content}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default CurrentFocusCard
