const highlights = [
  'Full-Stack Projects',
  'Distributed Systems · Algorithms',
  'Published on the App Store',
  'React · TypeScript · Swift · Go',
]

function CredibilityStrip() {
  return (
    <section className="credibility-strip glass-card" aria-label="Portfolio highlights" data-reveal>
      {highlights.map((highlight) => (
        <span key={highlight} className="credibility-chip">
          {highlight}
        </span>
      ))}
    </section>
  )
}

export default CredibilityStrip
