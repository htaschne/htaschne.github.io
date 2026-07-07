import ContentCard from '../components/ContentCard'
import { projects } from '../lib/content'

function ProjectsIndexPage() {
  return (
    <section className="index-page" aria-labelledby="projects-heading">
      <div className="page-heading">
        <p className="eyebrow">Work</p>
        <h1 id="projects-heading">Projects</h1>
        <p>Full-stack projects, systems experiments, and interactive tools with practical implementation details.</p>
      </div>

      <div className="content-grid">
        {projects.map((project) => (
          <ContentCard key={project.slug} item={project} href={`/projects/${project.slug}`} />
        ))}
      </div>
    </section>
  )
}

export default ProjectsIndexPage
