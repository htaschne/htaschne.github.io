import { Link } from 'react-router-dom'
import { projects } from '../lib/content'

const focusItems = [
  {
    title: 'Graffitone',
    description: 'Spatial graffiti for Apple Vision Pro',
    slug: 'graffitone',
  },
  {
    title: 'Mimicards',
    description: 'Offline-first flashcards with Drive sync',
    slug: 'mimicards',
  },
  {
    title: 'SinaLu',
    description: 'Libras learning app on the App Store',
    slug: 'sinalu',
  },
]

function CurrentFocusCard() {
  const projectSlugs = new Set(projects.map((project) => project.slug))

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

          if (projectSlugs.has(item.slug)) {
            return (
              <Link key={item.slug} to={`/projects/${item.slug}`} className="current-focus-item">
                {content}
              </Link>
            )
          }

          return (
            <div key={item.slug} className="current-focus-item current-focus-item--static">
              {content}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default CurrentFocusCard
