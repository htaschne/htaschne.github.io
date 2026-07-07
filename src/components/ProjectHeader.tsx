import { useState } from 'react'
import type { Project } from '../lib/content'
import { resolveAssetUrl } from '../lib/assetUrls'
import { formatContentDate } from '../lib/date'
import ActionButton from './ActionButton'
import MetadataBadge from './MetadataBadge'

type ProjectHeaderProps = {
  project: Project
}

function ProjectImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [failedSrc, setFailedSrc] = useState<string>()

  if (failedSrc === src) {
    return null
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} />
}

function ProjectHeader({ project }: ProjectHeaderProps) {
  const technologyBadges = project.technologies ?? project.tags
  const hasActions = Boolean(project.appStore || project.github || project.website)
  const hasMetadata = Boolean(project.status || project.platforms?.length || technologyBadges.length)
  const iconSrc = resolveAssetUrl(project.icon)
  const heroSrc = resolveAssetUrl(project.hero)

  return (
    <header className="project-header glass-card">
      <div className="project-header__top">
        {iconSrc && (
          <div className="project-header__icon-shell" aria-hidden="true">
            <ProjectImage src={iconSrc} alt="" className="project-header__icon" />
          </div>
        )}

        <div className="project-header__intro">
          <p className="eyebrow">{formatContentDate(project.date)}</p>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
        </div>
      </div>

      {hasMetadata && (
        <div className="metadata-stack" aria-label={`${project.title} metadata`}>
          {project.status && <MetadataBadge tone="status">{project.status}</MetadataBadge>}
          {project.platforms?.map((platform) => (
            <MetadataBadge key={platform} tone="accent">
              {platform}
            </MetadataBadge>
          ))}
          {technologyBadges.map((technology) => (
            <MetadataBadge key={technology}>{technology}</MetadataBadge>
          ))}
        </div>
      )}

      {hasActions && (
        <div className="action-row">
          {project.appStore && (
            <ActionButton href={project.appStore} kind="app-store">
              View on App Store
            </ActionButton>
          )}
          {project.github && (
            <ActionButton href={project.github} kind="github">
              GitHub
            </ActionButton>
          )}
          {project.website && (
            <ActionButton href={project.website} kind="website">
              Website
            </ActionButton>
          )}
        </div>
      )}

      {heroSrc && (
        <div className="project-header__hero">
          <ProjectImage src={heroSrc} alt={`${project.title} preview`} className="project-header__hero-image" />
        </div>
      )}
    </header>
  )
}

export default ProjectHeader
