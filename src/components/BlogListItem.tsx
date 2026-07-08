import { Link } from 'react-router-dom'
import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import type { BlogPost } from '../lib/content'
import { formatContentDate } from '../lib/date'

type BlogListItemProps = {
  post: BlogPost
  isExpanded: boolean
  onToggle: () => void
}

function BlogListItem({ post, isExpanded, onToggle }: BlogListItemProps) {
  const detailId = `blog-preview-${post.slug}`
  const previewText = post.tldr ?? post.description
  const previewInnerRef = useRef<HTMLDivElement | null>(null)
  const [previewHeight, setPreviewHeight] = useState(0)

  useLayoutEffect(() => {
    const preview = previewInnerRef.current

    if (!preview) {
      return
    }

    const updatePreviewHeight = () => {
      setPreviewHeight(preview.scrollHeight)
    }

    updatePreviewHeight()

    const resizeObserver = new ResizeObserver(updatePreviewHeight)
    resizeObserver.observe(preview)
    window.addEventListener('resize', updatePreviewHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updatePreviewHeight)
    }
  }, [post.description, post.readingTime, post.takeaways, previewText])

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
      data-reveal
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

      <div
        id={detailId}
        className="blog-list-item__preview"
        aria-hidden={!isExpanded}
        style={{ '--blog-preview-height': `${previewHeight}px` } as CSSProperties}
      >
        <div className="blog-list-item__preview-inner" ref={previewInnerRef}>
          <div className="blog-list-item__tldr">
            <span className="blog-list-item__tldr-label">TL;DR</span>
            <p>{previewText}</p>
          </div>

          {post.takeaways && post.takeaways.length > 0 && (
            <ul className="blog-list-item__takeaways">
              {post.takeaways.map((takeaway) => (
                <li key={takeaway}>{takeaway}</li>
              ))}
            </ul>
          )}

          <div className="blog-list-item__footer">
            {post.readingTime && <span className="blog-list-item__reading-time">{post.readingTime}</span>}
            <Link
              to={`/blog/${post.slug}`}
              className="pill-link blog-list-item__link"
              tabIndex={isExpanded ? undefined : -1}
            >
              Read article
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export default BlogListItem
