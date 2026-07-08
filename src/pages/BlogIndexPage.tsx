import { useState } from 'react'
import BlogListItem from '../components/BlogListItem'
import { blogPosts } from '../lib/content'

function BlogIndexPage() {
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set())

  function togglePost(slug: string) {
    setExpandedSlugs((currentSlugs) => {
      const nextSlugs = new Set(currentSlugs)

      if (nextSlugs.has(slug)) {
        nextSlugs.delete(slug)
      } else {
        nextSlugs.add(slug)
      }

      return nextSlugs
    })
  }

  return (
    <section className="index-page blog-index-page" aria-labelledby="blog-heading">
      <div className="page-heading" data-reveal>
        <p className="eyebrow">Research</p>
        <h1 id="blog-heading">Research</h1>
        <p>Technical write-ups accompanying software projects, experiments, and academic work.</p>
      </div>

      <div className="blog-list" role="list">
        {blogPosts.map((post) => (
          <BlogListItem
            key={post.slug}
            post={post}
            isExpanded={expandedSlugs.has(post.slug)}
            onToggle={() => togglePost(post.slug)}
          />
        ))}
      </div>
    </section>
  )
}

export default BlogIndexPage
