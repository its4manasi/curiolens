import Link from 'next/link';

const topics = [
  ['🎓','Education','/education/'],
  ['❤️','Health','/health/'],
  ['👥','Women & Gender','/women/'],
  ['📈','Development','/development/'],
  ['🏛️','Democracy','/democracy/'],
  ['🤝','Welfare','/welfare/'],
  ['🌿','Climate','/climate/'],
  ['🪙','Economy','/economy/'],
  ['🌱','Environment','/environment/'],
  ['🏙️','Local Bodies','/local-bodies/'],
];

function TopicLinks({ mobile = false }) {
  return (
    <div className={mobile ? 'mobile-topic-list' : 'mega-topic-grid'}>
      {topics.map(([icon,label,href]) => (
        <Link href={href} key={href} className="topic-nav-item">
          <span className="topic-nav-icon" aria-hidden="true">{icon}</span>
          <span>{label}</span>
          {mobile && <b aria-hidden="true">›</b>}
        </Link>
      ))}
    </div>
  );
}

function PlacePicker({ mobile = false }) {
  return (
    <div className={mobile ? 'mobile-place-picker' : 'desktop-place-picker'}>
      <span className="place-picker-title">📍 Choose a place</span>
      <label><span>Country</span><select defaultValue="India"><option>India</option><option disabled>More countries soon</option></select></label>
      <label><span>State</span><select defaultValue="Bihar"><option>Bihar</option><option>Punjab</option><option>Kerala</option><option>Tamil Nadu</option><option>Maharashtra</option><option>Himachal Pradesh</option></select></label>
      <label><span>District</span><select defaultValue="All"><option>All</option><option>Patna</option><option>Muzaffarpur</option><option>Gaya</option></select></label>
      <Link className="place-go" href="/education/">Explore this place →</Link>
    </div>
  );
}

export default function SiteNav() {
  return (
    <header className="v8-header-wrap">
      <div className="v8-header">
        <Link className="v8-brand" href="/" aria-label="CurioLens home">
          <span className="v8-brand-mark">◉</span>
          <span><b>CurioLens</b><small>People · Places · Possibilities</small></span>
        </Link>

        <nav className="v8-desktop-nav" aria-label="Main navigation">
          <Link className="nav-pill active" href="/">⌂ <span>Home</span></Link>
          <details className="nav-details topic-details">
            <summary className="nav-pill">▦ <span>Topics</span>⌄</summary>
            <div className="mega-menu">
              <div className="mega-copy">
                <span className="menu-kicker">Explore public-interest topics</span>
                <h3>Start with what matters to you.</h3>
                <TopicLinks />
              </div>
              <Link className="mega-feature" href="/climate/">
                <div className="mega-feature-art" aria-hidden="true"><span>☀</span><i>♨</i><b>↗</b></div>
                <small>Featured topic</small>
                <strong>Explore Climate</strong>
                <p>What contributes, what is changing, who is affected and what can help.</p>
                <em>View climate →</em>
              </Link>
            </div>
          </details>
          <Link className="nav-pill" href="/education/#compare">▥ <span>Compare</span></Link>
          <Link className="nav-pill" href="/education/#maps">⌖ <span>Maps</span></Link>
          <Link className="nav-pill" href="/articles/">▣ <span>Stories</span></Link>
          <Link className="nav-pill" href="/sources/">▤ <span>Sources</span></Link>
        </nav>

        <div className="v8-header-actions">
          <Link className="search-button" href="/articles/" aria-label="Search and stories">⌕</Link>
          <details className="nav-details place-details">
            <summary className="place-button">📍 <span>Select Place</span>⌄</summary>
            <PlacePicker />
          </details>
          <details className="v8-mobile-menu">
            <summary aria-label="Open menu">☰</summary>
            <div className="mobile-drawer">
              <div className="mobile-drawer-head">
                <Link className="v8-brand" href="/"><span className="v8-brand-mark">◉</span><span><b>CurioLens</b><small>People · Places · Possibilities</small></span></Link>
              </div>
              <Link className="mobile-primary-link" href="/">⌂ Home</Link>
              <details className="mobile-nested">
                <summary>▦ Topics <b>⌄</b></summary>
                <TopicLinks mobile />
              </details>
              <Link className="mobile-menu-link" href="/education/#compare">▥ Compare</Link>
              <Link className="mobile-menu-link" href="/education/#maps">⌖ Maps</Link>
              <Link className="mobile-menu-link" href="/articles/">▣ Stories</Link>
              <Link className="mobile-menu-link" href="/sources/">▤ Sources</Link>
              <details className="mobile-nested place-mobile-details">
                <summary>📍 Choose a place <b>⌄</b></summary>
                <PlacePicker mobile />
              </details>
              <Link className="mobile-menu-link muted-mobile-link" href="/about/">ⓘ About</Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
