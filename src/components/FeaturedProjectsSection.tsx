import { useState } from 'react'
import { Link } from 'react-router-dom'
import { projects, type Project } from '../lib/content'
import { resolveAssetUrl } from '../lib/assetUrls'

function sortFeaturedProjects(projectsToSort: Project[]) {
  return [...projectsToSort].sort((a, b) => {
    if (a.order !== undefined || b.order !== undefined) {
      return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
    }

    return (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0)
  })
}

function FeaturedProjectImage({ project }: { project: Project }) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const src = resolveAssetUrl(project.icon ?? project.hero)

  if (!src || failedSrc === src) {
    return null
  }

  return (
    <div className={`featured-project-card__media ${project.icon ? 'featured-project-card__media--icon' : ''}`}>
      <img src={src} alt="" onError={() => setFailedSrc(src)} />
    </div>
  )
}

function FeaturedProjectsSection() {
  const featuredProjects = sortFeaturedProjects(projects.filter((project) => project.featured)).slice(0, 3)

  if (featuredProjects.length === 0) {
    return null
  }

  return (
    <section className="featured-projects-section" aria-labelledby="featured-projects-heading">
      <div className="section-heading">
        <p className="eyebrow">Selected Work</p>
        <h2 id="featured-projects-heading">Featured Projects</h2>
      </div>

      <div className="featured-project-grid">
        {featuredProjects.map((project) => {
          const badges = project.platforms?.length ? project.platforms : project.tags

          return (
            <Link key={project.slug} to={`/projects/${project.slug}`} className="featured-project-card glass-card">
              <FeaturedProjectImage project={project} />

              <div className="featured-project-card__copy">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>

              {badges.length > 0 && (
                <div className="featured-project-card__badges" aria-label={`${project.title} tags`}>
                  {badges.slice(0, 4).map((badge) => (
                    <span key={badge}>{badge}</span>
                  ))}
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default FeaturedProjectsSection
