import { SITE_PROFILE } from '../lib/siteProfile';

export default function SiteFooter() {
  const { name, role, company, location, email, linkedin } = SITE_PROFILE;
  return (
    <footer className="site-footer-v17">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <span className="section-tag">About CurioLens</span>
          <h2>Curiosity, backed by evidence.</h2>
          <p>CurioLens is an independent public-interest project that makes government, institutional and global data easier to understand.</p>
        </div>
        <div className="site-footer-profile">
          <small>Built by</small>
          <strong>{name}</strong>
          <span>{role} at {company}</span>
          <span>{location}</span>
          <div className="site-footer-links">
            {email && <a href={`mailto:${email}`}>Email ↗</a>}
            {linkedin && <a href={linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
            <a href="/about/">About ↗</a>
            <a href="/sources/">Sources ↗</a>
          </div>
        </div>
      </div>
      <div className="site-footer-note">Independent project. Employer details are biographical only and do not imply sponsorship or endorsement by Cimpress.</div>
    </footer>
  );
}
