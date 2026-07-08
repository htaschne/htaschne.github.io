import { Link } from 'react-router-dom'
import { projects } from '../lib/content'

const focusItems = [
  {
    title: 'Graffitone',
    description: 'Spatial graffiti experience for visionOS combining painting, music, and immersive interaction.',
    href: '/projects/graffitone',
  },
  {
    title: "Skeen's Atomic Multicast",
    description:
      "Implementing and evaluating Skeen's atomic multicast protocol and the ACK-gated extension for atomic global order.",
    href: '/blog/skeenkv',
  },
  {
    title: 'Mimicards',
    description: 'Offline-first flashcards with local storage and Google Drive synchronization.',
    href: '/projects/mimicards',
  },
]

function CurrentFocusCard() {
  const projectSlugs = new Set(projects.map((project) => `/projects/${project.slug}`))

  return (
    <section className="current-focus-card glass-card" aria-labelledby="current-focus-heading" data-reveal>
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
