const highlights = [
  'Apple Developer Academy',
  'Claro Campus Mobile Finalist',
  'Published on the App Store',
  'SwiftUI · React · TypeScript · visionOS',
]

function CredibilityStrip() {
  return (
    <section className="credibility-strip glass-card" aria-label="Portfolio highlights">
      {highlights.map((highlight) => (
        <span key={highlight} className="credibility-chip">
          {highlight}
        </span>
      ))}
    </section>
  )
}

export default CredibilityStrip
