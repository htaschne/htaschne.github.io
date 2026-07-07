import { Link } from 'react-router-dom'
import type { KeyboardEvent } from 'react'
import type { BlogPost } from '../lib/content'
import { formatContentDate } from '../lib/date'

type BlogListItemProps = {
  post: BlogPost
  isExpanded: boolean
  onToggle: () => void
}

function BlogListItem({ post, isExpanded, onToggle }: BlogListItemProps) {
  const detailId = `blog-preview-${post.slug}`

  function handleToggleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onToggle()
    }
  }

  return (
    <article
      className={`blog-list-item glass-card${isExpanded ? ' blog-list-item--expanded' : ''}`}
      role="listitem"
    >
      <button
        type="button"
        className="blog-list-item__toggle"
        aria-expanded={isExpanded}
        aria-controls={detailId}
        onClick={onToggle}
        onKeyDown={handleToggleKeyDown}
      >
        <span className="blog-list-item__date">{formatContentDate(post.date)}</span>
        <span className="blog-list-item__summary">
          <span className="blog-list-item__title">{post.title}</span>
          <span className="blog-list-item__description">{post.description}</span>
          {post.tags.length > 0 && (
            <span className="blog-list-item__tags" aria-label={`${post.title} tags`}>
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </span>
          )}
        </span>
        <span className="blog-list-item__indicator" aria-hidden="true" />
      </button>

      <div id={detailId} className="blog-list-item__preview" aria-hidden={!isExpanded}>
        <div className="blog-list-item__preview-inner">
          <p>{post.description}</p>

          <div className="blog-list-item__preview-meta">
            {post.readingTime && <span className="blog-list-item__reading-time">{post.readingTime}</span>}
            {post.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <Link
            to={`/blog/${post.slug}`}
            className="pill-link blog-list-item__link"
            tabIndex={isExpanded ? undefined : -1}
          >
            Read article
          </Link>
        </div>
      </div>
    </article>
  )
}

export default BlogListItem
