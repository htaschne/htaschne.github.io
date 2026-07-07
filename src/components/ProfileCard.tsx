import { Link } from 'react-router-dom'
import profileImg from '../assets/profile.png'
import SocialIcon from './SocialIcon'

const HERO_COPY =
  'Computer Science student and full-stack developer building web, systems, and interactive software.'

function ProfileCard() {
  return (
    <section className="profile-card glass-card" aria-label="Profile summary">
      <div className="profile-card__content">
        <div className="profile-card__memoji-column">
          <div className="profile-card__memoji-frame">
            <img src={profileImg} alt="Profile" className="memoji-image" />
          </div>

          <div className="profile-card__links" aria-label="Profile links">
            <a
              href="https://github.com/htaschne"
              className="icon-button"
              aria-label="GitHub profile"
              target="_blank"
              rel="noreferrer"
            >
              <SocialIcon kind="github" />
            </a>
            <a
              href="https://www.linkedin.com/in/agatha-schneider-68400b172/"
              className="icon-button"
              aria-label="LinkedIn profile"
              target="_blank"
              rel="noreferrer"
            >
              <SocialIcon kind="linkedin" />
            </a>
          </div>
        </div>

        <div className="profile-card__copy">
          <p className="eyebrow">Computer Science Student</p>
          <h1 className="profile-card__title">Agatha Schneider</h1>
          <p className="profile-card__bio">{HERO_COPY}</p>

          <div className="profile-card__actions">
            <Link to="/projects" className="primary-cta">
              Explore Projects
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProfileCard
