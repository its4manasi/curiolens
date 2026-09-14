import { SITE_PROFILE } from '../../lib/siteProfile';

export const metadata = { title: 'About' };

export default function AboutPage() {
  const { name, role, company, location, email, linkedin } = SITE_PROFILE;
  return (
    <article className="article about-v17">
      <div className="kicker">About CurioLens</div>
      <h1>Curiosity deserves good evidence.</h1>
      <p className="article-deck">CurioLens is an independent public-interest project for people who want to understand important questions through credible data, clear comparisons and plain-language explanations.</p>
      <div className="article-body">
        <h2>What CurioLens aims for</h2>
        <p>Concise writing, traceable sources, useful visuals and a clear distinction between reported facts, public data and interpretation.</p>
        <h2>How the data works</h2>
        <p>Where practical, CurioLens checks the latest available value from original government and institutional sources. If a finer geography or newer release is not available, the site keeps that limitation visible instead of guessing.</p>
        <h2>Who is behind it</h2>
        <div className="about-profile-card">
          <strong>{name}</strong>
          <span>{role} at {company}</span>
          <span>From {location}</span>
          <p>CurioLens is a personal, independent project. Employer information is included only as biographical context.</p>
          <div className="about-profile-links">
            {email && <a href={`mailto:${email}`}>Email ↗</a>}
            {linkedin && <a href={linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
          </div>
        </div>
      </div>
    </article>
  );
}
