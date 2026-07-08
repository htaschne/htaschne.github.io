import { Link, useParams } from 'react-router-dom'
import BlogHeader from '../components/BlogHeader'
import MarkdownView from '../components/MarkdownView'
import { getBlogPost } from '../lib/content'

function BlogPostPage() {
  const { slug } = useParams()
  const post = slug ? getBlogPost(slug) : undefined

  if (!post) {
    return (
      <section className="empty-state glass-card">
        <p className="eyebrow">Missing article</p>
        <h1>That research article is not available.</h1>
        <Link to="/blog" className="pill-link">
          Back to Research
        </Link>
      </section>
    )
  }

  return (
    <section className="detail-page">
      <Link to="/blog" className="back-link">
        Back to Research
      </Link>

      <BlogHeader post={post} />

      <MarkdownView content={post.body} />
    </section>
  )
}

export default BlogPostPage
