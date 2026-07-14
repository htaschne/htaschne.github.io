import { Link } from 'react-router-dom'
import profileImg from '../assets/profile.png'
import SocialIcon from './SocialIcon'

function ProfileCard() {
  return (
    <section className="profile-card glass-card" aria-label="Profile summary">
      <div className="profile-card__content">
        <div className="profile-card__memoji-frame" data-reveal>
          <img src={profileImg} alt="Profile" className="memoji-image" />

          <div className="profile-card__links" aria-label="Profile links">
            <a
              href="https://github.com/htaschne"
              className="icon-button"
              aria-label="GitHub profile"
              target="_blank"
              rel="noreferrer"
              data-reveal
            >
              <SocialIcon kind="github" />
            </a>
            <a
              href="https://www.linkedin.com/in/agatha-schneider-68400b172/"
              className="icon-button"
              aria-label="LinkedIn profile"
              target="_blank"
              rel="noreferrer"
              data-reveal
            >
              <SocialIcon kind="linkedin" />
            </a>
          </div>
        </div>

        <div className="profile-card__copy">
          <h1 className="profile-card__title" data-reveal>
            Agatha Schneider
          </h1>

          <div className="profile-card__bio">
            <p className="profile-card__identity" data-reveal>
              Computer Science student
            </p>
            <p data-reveal>
              building full-stack applications,
              <br />
              distributed systems,
              <br />
              and interactive software.
            </p>
          </div>

          <div className="profile-card__actions" data-reveal>
            <Link to="/projects" className="primary-cta">
              Explore Software Engineering <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProfileCard
