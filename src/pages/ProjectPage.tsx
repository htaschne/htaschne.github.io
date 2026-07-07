import { Link, useParams } from 'react-router-dom'
import MarkdownView from '../components/MarkdownView'
import ProjectHeader from '../components/ProjectHeader'
import { getProject } from '../lib/content'

function ProjectPage() {
  const { slug } = useParams()
  const project = slug ? getProject(slug) : undefined

  if (!project) {
    return (
      <section className="empty-state glass-card">
        <p className="eyebrow">Missing project</p>
        <h1>That project is not available.</h1>
        <Link to="/projects" className="pill-link">
          Back to projects
        </Link>
      </section>
    )
  }

  return (
    <section className="detail-page">
      <Link to="/projects" className="back-link">
        Back to projects
      </Link>

      <ProjectHeader project={project} />

      <MarkdownView content={project.body} />
    </section>
  )
}

export default ProjectPage
