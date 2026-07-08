import { Link } from 'react-router-dom'

type LatestResearchEntry = {
  title: string
  summary: string[]
  highlights: string[]
  articleHref: string
  repositoryHref?: string
}

const latestResearch: LatestResearchEntry = {
  title:
    "Implementing and Evaluating Skeen's Atomic Multicast Protocol and the ACK-Gated Extension for Atomic Global Order",
  summary: [
    "I implemented both the original Skeen atomic multicast protocol and the ACK-gated extension proposed by Pacheco et al. to experimentally evaluate their correctness and quantify the performance cost of stronger ordering guarantees.",
    'The project includes deterministic protocol validation, configurable N-partition clusters, reproducible benchmarks, and artificial latency experiments.',
  ],
  highlights: [
    'Original Skeen implementation',
    'ACK-gated extension',
    'Deterministic correctness validation',
    'Benchmarked up to 5 partitions',
  ],
  articleHref: '/blog/skeenkv',
  repositoryHref: 'https://github.com/htaschne/skeenkv',
}

function LatestResearchSection({ entry = latestResearch }: { entry?: LatestResearchEntry }) {
  return (
    <section className="latest-research-section glass-card" aria-labelledby="latest-research-heading" data-reveal>
      <div className="latest-research-section__header">
        <p className="eyebrow">Latest Research</p>
        <h2 id="latest-research-heading">{entry.title}</h2>
      </div>

      <div className="latest-research-section__summary">
        {entry.summary.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <ul className="latest-research-section__highlights" aria-label="Research highlights">
        {entry.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>

      <div className="latest-research-section__actions">
        <Link to={entry.articleHref} className="pill-link">
          Read article <span aria-hidden="true">&rarr;</span>
        </Link>
        {entry.repositoryHref && (
          <a href={entry.repositoryHref} target="_blank" rel="noreferrer" className="pill-link pill-link--secondary">
            View repository <span aria-hidden="true">&rarr;</span>
          </a>
        )}
      </div>
    </section>
  )
}

export default LatestResearchSection
