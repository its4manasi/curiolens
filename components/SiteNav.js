'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import SmartSelect from './SmartSelect';
import UiIcon from './UiIcon';

const topics = [
  ['education','Education','/education/'],
  ['health','Health','/health/'],
  ['women','Women & Society','/women/'],
  ['economy','Economy & Development','/development/'],
  ['democracy','Democracy & Governance','/democracy/'],
  ['climate','Climate & Environment','/climate/'],
  ['science','Science','/science/'],
  ['space','Space & Technology','/space-tech/'],
];

function NavChevron({ open = false, size = 14 }) {
  return <svg className={`v9-chevron-icon ${open ? 'is-open' : ''}`} width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function TopicLinks({ mobile = false, onNavigate }) {
  return <div className={mobile ? 'mobile-topic-list' : 'mega-topic-grid'}>
    {topics.map(([icon,label,href]) => <Link href={href} key={href} className="topic-nav-item" onClick={onNavigate}>
      <span className="topic-nav-icon"><UiIcon name={icon} size={18}/></span><span>{label}</span>{mobile && <b aria-hidden="true">›</b>}
    </Link>)}
  </div>;
}

function PlacePicker({ mobile = false, onNavigate }) {
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Bihar');
  const [district, setDistrict] = useState('All');
  return <div className={mobile ? 'mobile-place-picker' : 'desktop-place-picker'}>
    <span className="place-picker-title"><UiIcon name="pin" size={18}/> Choose a place</span>
    <SmartSelect label="Country" value={country} options={['India']} onChange={setCountry} />
    <SmartSelect label="State" value={state} options={['Bihar','Punjab','Kerala','Tamil Nadu','Maharashtra','Himachal Pradesh']} onChange={setState} />
    <SmartSelect label="District" value={district} options={['All','Patna','Muzaffarpur','Gaya']} onChange={setDistrict} />
    <Link className="place-go" href="/education/" onClick={onNavigate}>Explore this place →</Link>
  </div>;
}

export default function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);
  const topicTimer = useRef(null);
  const placeTimer = useRef(null);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setMobileOpen(false); setTopicOpen(false); setPlaceOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const delayedClose = (ref, setter) => {
    clearTimeout(ref.current);
    ref.current = setTimeout(() => setter(false), 160);
  };
  const keepOpen = (ref, setter) => { clearTimeout(ref.current); setter(true); };
  const closeMobile = () => setMobileOpen(false);

  return <header className="v9-header-wrap">
    <div className="v9-header">
      <Link className="v9-brand" href="/" aria-label="CurioLens home">
        <span className="v9-brand-mark" aria-hidden="true"><span/></span>
        <span><b>CurioLens</b><small>People · Places · Possibilities</small></span>
      </Link>

      <nav className="v9-desktop-nav" aria-label="Main navigation">
        <Link className="v9-nav-link is-active" href="/"><UiIcon name="home" size={16}/> <span>Home</span></Link>
        <div className="v9-nav-popover" onMouseEnter={() => keepOpen(topicTimer,setTopicOpen)} onMouseLeave={() => delayedClose(topicTimer,setTopicOpen)}>
          <button className="v9-nav-link v9-nav-button" type="button" aria-expanded={topicOpen} onClick={() => setTopicOpen(v => !v)}><UiIcon name="topics" size={16}/><span>Topics</span><NavChevron open={topicOpen}/></button>
          {topicOpen && <div className="v9-mega-menu" onMouseEnter={() => keepOpen(topicTimer,setTopicOpen)} onMouseLeave={() => delayedClose(topicTimer,setTopicOpen)}>
            <div className="v9-mega-main">
              <span className="menu-kicker">Explore topics</span>
              <h3>Start with what matters to you.</h3>
              <TopicLinks />
            </div>
            <Link className="v9-mega-feature" href="/climate/">
              <span className="v9-feature-icon"><UiIcon name="climate" size={30}/></span>
              <small>Featured topic</small><strong>Climate</strong>
              <p>Causes, changes, people affected and practical responses.</p><em>Explore climate →</em>
            </Link>
          </div>}
        </div>
        <Link className="v9-nav-link" href="/education/#compare"><UiIcon name="compare" size={16}/><span>Compare</span></Link>
        <Link className="v9-nav-link" href="/education/#maps"><UiIcon name="map" size={16}/><span>Maps</span></Link>
        <Link className="v9-nav-link" href="/articles/"><UiIcon name="stories" size={16}/><span>Stories</span></Link>
        <Link className="v9-nav-link" href="/sources/"><UiIcon name="sources" size={16}/><span>Sources</span></Link>
      </nav>

      <div className="v9-header-actions">
        <Link className="v9-icon-button" href="/articles/" aria-label="Search and stories"><UiIcon name="search" size={19}/></Link>
        <div className="v9-nav-popover v9-place-popover" onMouseEnter={() => keepOpen(placeTimer,setPlaceOpen)} onMouseLeave={() => delayedClose(placeTimer,setPlaceOpen)}>
          <button className="v9-place-button" type="button" aria-expanded={placeOpen} onClick={() => setPlaceOpen(v => !v)}><UiIcon name="pin" size={17}/><span>Select place</span><NavChevron open={placeOpen}/></button>
          {placeOpen && <div onMouseEnter={() => keepOpen(placeTimer,setPlaceOpen)} onMouseLeave={() => delayedClose(placeTimer,setPlaceOpen)}><PlacePicker /></div>}
        </div>
        <button className="v9-mobile-menu-button" type="button" aria-label="Open menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><UiIcon name="menu" size={22}/></button>
      </div>
    </div>

    <div className="v9-mobile-placebar"><UiIcon name="pin" size={16}/><span>India · Choose your place</span><button type="button" onClick={() => setMobileOpen(true)}>Change</button></div>

    {mobileOpen && <div className="mobile-nav-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) closeMobile(); }}>
      <aside className="mobile-drawer" role="dialog" aria-modal="true" aria-label="CurioLens menu">
        <div className="mobile-drawer-head">
          <Link className="v9-brand" href="/" onClick={closeMobile}><span className="v9-brand-mark"><span/></span><span><b>CurioLens</b><small>People · Places · Possibilities</small></span></Link>
          <button className="mobile-close-button" type="button" aria-label="Close menu" onClick={closeMobile}><UiIcon name="close" size={22}/></button>
        </div>
        <div className="mobile-drawer-scroll">
          <Link className="mobile-primary-link" href="/" onClick={closeMobile}><UiIcon name="home" size={20}/> Home</Link>
          <details className="mobile-nested"><summary><span><UiIcon name="topics" size={20}/> Topics</span><NavChevron size={16}/></summary><TopicLinks mobile onNavigate={closeMobile}/></details>
          <Link className="mobile-menu-link" href="/education/#compare" onClick={closeMobile}><UiIcon name="compare" size={20}/> Compare</Link>
          <Link className="mobile-menu-link" href="/education/#maps" onClick={closeMobile}><UiIcon name="map" size={20}/> Maps</Link>
          <Link className="mobile-menu-link" href="/articles/" onClick={closeMobile}><UiIcon name="stories" size={20}/> Stories</Link>
          <Link className="mobile-menu-link" href="/sources/" onClick={closeMobile}><UiIcon name="sources" size={20}/> Sources</Link>
          <details className="mobile-nested place-mobile-details"><summary><span><UiIcon name="pin" size={20}/> Choose a place</span><NavChevron size={16}/></summary><PlacePicker mobile onNavigate={closeMobile}/></details>
          <Link className="mobile-menu-link muted-mobile-link" href="/about/" onClick={closeMobile}>About</Link>
        </div>
      </aside>
    </div>}
  </header>;
}
