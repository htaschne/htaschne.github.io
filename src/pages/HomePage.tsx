import CurrentFocusCard from '../components/CurrentFocusCard'
import CredibilityStrip from '../components/CredibilityStrip'
import FeaturedProjectsSection from '../components/FeaturedProjectsSection'
import ProfileCard from '../components/ProfileCard'
import ThemeCardsSection from '../components/ThemeCardsSection'

const GITHUB_USERNAME = 'htaschne'
const GITHUB_GRAPH_SRC = `https://ghchart.rshah.org/ec65c5/${GITHUB_USERNAME}`

function HomePage() {
  return (
    <section className="home-page" aria-label="Portfolio home">
      <div className="hero-stack">
        <ProfileCard />
        <CurrentFocusCard />
      </div>

      <CredibilityStrip />

      <FeaturedProjectsSection />

      <ThemeCardsSection />

      <section className="graph-section glass-card graph-section--compact" aria-labelledby="github-graph-heading">
        <div className="section-header graph-section__header">
          <div>
            <p className="eyebrow">GitHub</p>
            <h2 id="github-graph-heading">Contribution Graph</h2>
          </div>
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noreferrer"
            className="pill-link graph-section__link"
          >
            Open profile
          </a>
        </div>

        <div className="graph-card">
          <img
            src={GITHUB_GRAPH_SRC}
            alt={`GitHub contribution graph for ${GITHUB_USERNAME}`}
            className="github-graph"
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>
    </section>
  )
}

export default HomePage
