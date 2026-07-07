import { useState } from 'react'
import type { BlogPost } from '../lib/content'
import { formatContentDate } from '../lib/date'
import MetadataBadge from './MetadataBadge'

type BlogHeaderProps = {
  post: BlogPost
}

function CoverImage({ src, alt }: { src: string; alt: string }) {
  const [visible, setVisible] = useState(true)

  if (!visible) {
    return null
  }

  return (
    <img
      src={src}
      alt={alt}
      className="blog-header__cover-image"
      loading="lazy"
      decoding="async"
      onError={() => setVisible(false)}
    />
  )
}

function BlogHeader({ post }: BlogHeaderProps) {
  return (
    <header className="blog-header glass-card">
      <div className="blog-header__copy">
        <p className="eyebrow">
          {formatContentDate(post.date)}
          {post.readingTime ? ` · ${post.readingTime}` : ''}
        </p>
        <h1>{post.title}</h1>
        <p>{post.description}</p>

        {post.tags.length > 0 && (
          <div className="metadata-stack" aria-label={`${post.title} tags`}>
            {post.tags.map((tag) => (
              <MetadataBadge key={tag}>{tag}</MetadataBadge>
            ))}
          </div>
        )}
      </div>

      {post.cover && (
        <div className="blog-header__cover">
          <CoverImage src={post.cover} alt={`${post.title} cover`} />
        </div>
      )}
    </header>
  )
}

export default BlogHeader
