import { Link } from 'react-router-dom'

type LatestResearchEntry = {
  title: string
  summary: string[]
  highlights: string[]
  articleHref: string
  repositoryHref?: string
}

const latestResearch: LatestResearchEntry = {
  title: 'Building Hz, a Huffman Compressor for macOS',
  summary: [
    'I built Hz as a native macOS Huffman archiver, then used it to explore archive design, bit-level I/O, streaming compression, and Swift/Rust interoperability.',
    'The project includes a Swift reference codec, a Rust native backend, bounded-memory streaming paths, reproducible benchmarks, and written notes on the archive format and implementation trade-offs.',
  ],
  highlights: [
    'SwiftUI macOS app',
    'Custom .hz archive format',
    'Rust native backend',
    'Streaming and benchmarks',
  ],
  articleHref: '/blog/hz',
  repositoryHref: 'https://github.com/htaschne/hz',
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
