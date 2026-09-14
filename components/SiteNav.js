'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const topics = [
  ['🎓','Education','/education/'], ['❤️','Health','/health/'], ['👥','Women & Gender','/women/'],
  ['📈','Development','/development/'], ['🏛️','Democracy','/democracy/'], ['🤝','Welfare','/welfare/'],
  ['🌿','Climate','/climate/'], ['🪙','Economy','/economy/'], ['🌱','Environment','/environment/'], ['🏙️','Local Bodies','/local-bodies/'],
];

function TopicLinks({ mobile = false, onNavigate }) {
  return <div className={mobile ? 'mobile-topic-list' : 'mega-topic-grid'}>
    {topics.map(([icon,label,href]) => <Link href={href} key={href} className="topic-nav-item" onClick={onNavigate}>
      <span className="topic-nav-icon" aria-hidden="true">{icon}</span><span>{label}</span>{mobile && <b aria-hidden="true">›</b>}
    </Link>)}
  </div>;
}

function PlacePicker({ mobile = false, onNavigate }) {
  return <div className={mobile ? 'mobile-place-picker' : 'desktop-place-picker'}>
    <span className="place-picker-title">📍 Choose a place</span>
    <label><span>Country</span><select defaultValue="India"><option>India</option><option disabled>More countries soon</option></select></label>
    <label><span>State</span><select defaultValue="Bihar"><option>Bihar</option><option>Punjab</option><option>Kerala</option><option>Tamil Nadu</option><option>Maharashtra</option><option>Himachal Pradesh</option></select></label>
    <label><span>District</span><select defaultValue="All"><option>All</option><option>Patna</option><option>Muzaffarpur</option><option>Gaya</option></select></label>
    <Link className="place-go" href="/education/" onClick={onNavigate}>Explore this place →</Link>
  </div>;
}

export default function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return <header className="v8-header-wrap">
    <div className="v8-header">
      <Link className="v8-brand" href="/" aria-label="CurioLens home">
        <span className="v8-brand-mark">◉</span><span><b>CurioLens</b><small>People · Places · Possibilities</small></span>
      </Link>

      <nav className="v8-desktop-nav" aria-label="Main navigation">
        <Link className="nav-pill active" href="/">⌂ <span>Home</span></Link>
        <div className="nav-popover" onMouseEnter={() => setTopicOpen(true)} onMouseLeave={() => setTopicOpen(false)}>
          <button className="nav-pill nav-button" type="button" aria-expanded={topicOpen} onClick={() => setTopicOpen(v => !v)}>▦ <span>Topics</span>⌄</button>
          {topicOpen && <div className="mega-menu">
            <div className="mega-copy"><span className="menu-kicker">Explore public-interest topics</span><h3>Start with what matters to you.</h3><TopicLinks /></div>
            <Link className="mega-feature" href="/climate/"><div className="mega-feature-art" aria-hidden="true"><span>☀</span><i>♨</i><b>↗</b></div><small>Featured topic</small><strong>Explore Climate</strong><p>What contributes, what is changing, who is affected and what can help.</p><em>View climate →</em></Link>
          </div>}
        </div>
        <Link className="nav-pill" href="/education/#compare">▥ <span>Compare</span></Link>
        <Link className="nav-pill" href="/education/#maps">⌖ <span>Maps</span></Link>
        <Link className="nav-pill" href="/articles/">▣ <span>Stories</span></Link>
        <Link className="nav-pill" href="/sources/">▤ <span>Sources</span></Link>
      </nav>

      <div className="v8-header-actions">
        <Link className="search-button" href="/articles/" aria-label="Search and stories">⌕</Link>
        <div className="nav-popover place-popover" onMouseEnter={() => setPlaceOpen(true)} onMouseLeave={() => setPlaceOpen(false)}>
          <button className="place-button" type="button" aria-expanded={placeOpen} onClick={() => setPlaceOpen(v => !v)}>📍 <span>Select Place</span>⌄</button>
          {placeOpen && <PlacePicker />}
        </div>
        <button className="mobile-menu-button" type="button" aria-label="Open menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}>☰</button>
      </div>
    </div>

    {mobileOpen && <div className="mobile-nav-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) closeMobile(); }}>
      <aside className="mobile-drawer" role="dialog" aria-modal="true" aria-label="CurioLens menu">
        <div className="mobile-drawer-head">
          <Link className="v8-brand" href="/" onClick={closeMobile}><span className="v8-brand-mark">◉</span><span><b>CurioLens</b><small>People · Places · Possibilities</small></span></Link>
          <button className="mobile-close-button" type="button" aria-label="Close menu" onClick={closeMobile}>×</button>
        </div>
        <div className="mobile-drawer-scroll">
          <Link className="mobile-primary-link" href="/" onClick={closeMobile}>⌂ Home</Link>
          <details className="mobile-nested"><summary>▦ Topics <b>⌄</b></summary><TopicLinks mobile onNavigate={closeMobile}/></details>
          <Link className="mobile-menu-link" href="/education/#compare" onClick={closeMobile}>▥ Compare</Link>
          <Link className="mobile-menu-link" href="/education/#maps" onClick={closeMobile}>⌖ Maps</Link>
          <Link className="mobile-menu-link" href="/articles/" onClick={closeMobile}>▣ Stories</Link>
          <Link className="mobile-menu-link" href="/sources/" onClick={closeMobile}>▤ Sources</Link>
          <details className="mobile-nested place-mobile-details"><summary>📍 Choose a place <b>⌄</b></summary><PlacePicker mobile onNavigate={closeMobile}/></details>
          <Link className="mobile-menu-link muted-mobile-link" href="/about/" onClick={closeMobile}>ⓘ About</Link>
        </div>
      </aside>
    </div>}
  </header>;
}
