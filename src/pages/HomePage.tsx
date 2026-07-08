import CurrentFocusCard from '../components/CurrentFocusCard'
import CredibilityStrip from '../components/CredibilityStrip'
import FeaturedProjectsSection from '../components/FeaturedProjectsSection'
import LatestResearchSection from '../components/LatestResearchSection'
import ProfileCard from '../components/ProfileCard'
import ThemeCardsSection from '../components/ThemeCardsSection'

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

      <LatestResearchSection />
    </section>
  )
}

export default HomePage
