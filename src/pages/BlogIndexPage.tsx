import ContentCard from '../components/ContentCard'
import { blogPosts } from '../lib/content'

function BlogIndexPage() {
  return (
    <section className="index-page" aria-labelledby="blog-heading">
      <div className="page-heading">
        <p className="eyebrow">Notes</p>
        <h1 id="blog-heading">Blog</h1>
        <p>Short writeups about projects, learning notes, and the things I am experimenting with.</p>
      </div>

      <div className="content-grid">
        {blogPosts.map((post) => (
          <ContentCard key={post.slug} item={post} href={`/blog/${post.slug}`} />
        ))}
      </div>
    </section>
  )
}

export default BlogIndexPage
