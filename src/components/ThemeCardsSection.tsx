const themeCards = [
  {
    title: 'Systems Engineering',
    items: ['Distributed Systems', 'Algorithms', 'Concurrency', 'Performance'],
  },
  {
    title: 'Full-Stack Development',
    items: ['Frontend', 'Backend', 'Developer Tools', 'APIs'],
  },
  {
    title: 'Interactive Computing',
    items: ['visionOS', 'iOS', 'Creative Tools', 'Learning Apps'],
  },
]

function ThemeCardsSection() {
  return (
    <section className="theme-cards-section" aria-labelledby="theme-cards-heading">
      <div className="section-heading section-heading--compact" data-reveal>
        <p className="eyebrow">Builder Themes</p>
        <h2 id="theme-cards-heading">What I enjoy building</h2>
      </div>

      <div className="theme-card-grid">
        {themeCards.map((card) => (
          <article key={card.title} className="theme-card glass-card" data-reveal>
            <h3>{card.title}</h3>
            <div className="theme-card__items">
              {card.items.map((item) => (
                <span key={item} className="theme-card__chip">
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ThemeCardsSection
