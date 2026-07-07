import { Link } from 'react-router-dom'
import type { BlogPost, Project } from '../lib/content'
import { resolveAssetUrl } from '../lib/assetUrls'
import { formatContentDate } from '../lib/date'

type ContentCardProps = {
  item: BlogPost | Project
  href: string
}

function ContentCard({ item, href }: ContentCardProps) {
  const isProject = item.kind === 'project'
  const badges = isProject ? (item.technologies ?? item.tags) : item.tags
  const iconSrc = isProject ? resolveAssetUrl(item.icon) : undefined

  return (
    <article className="content-card glass-card">
      <div className="content-card__body">
        <div className="content-card__header">
          {iconSrc && <img src={iconSrc} alt="" className="content-card__icon" onError={(event) => event.currentTarget.remove()} />}
          <div className="content-card__heading">
            <div className="content-card__meta">
              <span>{isProject ? 'Project' : formatContentDate(item.date)}</span>
              {isProject && <span>{formatContentDate(item.date)}</span>}
            </div>
            <h2>
              <Link to={href}>{item.title}</Link>
            </h2>
          </div>
        </div>
        <p>{item.description}</p>
      </div>

      {badges.length > 0 && (
        <ul className="tag-list" aria-label={`${item.title} tags`}>
          {badges.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}

      <div className="content-card__footer">
        <Link to={href} className="text-link">
          Read more
        </Link>
        {isProject && item.github && (
          <a href={item.github} className="text-link" target="_blank" rel="noreferrer">
            GitHub
          </a>
        )}
        {isProject && item.website && (
          <a href={item.website} className="text-link" target="_blank" rel="noreferrer">
            Website
          </a>
        )}
      </div>
    </article>
  )
}

export default ContentCard
