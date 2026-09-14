'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import SmartSelect from './SmartSelect';
import UiIcon from './UiIcon';
import { COUNTRIES, INDIA_STATES, countryByCode } from '../lib/countries';

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

const COUNTRY_KEY = 'curiolens-country';
const STATE_KEY = 'curiolens-state';
const DISTRICT_KEY = 'curiolens-district';

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

function readStoredPlace() {
  if (typeof window === 'undefined') return { countryCode: 'IND', state: '', district: 'All districts' };
  const params = new URLSearchParams(window.location.search);
  const countryCode = countryByCode(params.get('country') || window.localStorage.getItem(COUNTRY_KEY) || 'IND').code;
  const state = params.get('state') || window.localStorage.getItem(STATE_KEY) || '';
  const district = params.get('district') || window.localStorage.getItem(DISTRICT_KEY) || 'All districts';
  return { countryCode, state, district };
}

function PlacePicker({ mobile = false, onNavigate, onApplied }) {
  const [countryCode, setCountryCode] = useState('IND');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('All districts');
  const [districts, setDistricts] = useState(['All districts']);
  const [districtStatus, setDistrictStatus] = useState('idle');

  useEffect(() => {
    const stored = readStoredPlace();
    setCountryCode(stored.countryCode);
    setState(stored.countryCode === 'IND' && INDIA_STATES.includes(stored.state) ? stored.state : '');
    setDistrict(stored.district || 'All districts');
  }, []);

  useEffect(() => {
    if (countryCode !== 'IND' || !state) {
      setDistrict('All districts');
      setDistricts(['All districts']);
      setDistrictStatus('idle');
      return;
    }
    let alive = true;
    setDistrictStatus('loading');
    fetch(`/api/geography?state=${encodeURIComponent(state)}`)
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw body;
        return body;
      })
      .then((body) => {
        if (!alive) return;
        const names = Array.from(new Set((body.districts || []).filter(Boolean))).sort((a,b) => a.localeCompare(b));
        setDistricts(['All districts', ...names]);
        setDistrict((current) => current !== 'All districts' && names.includes(current) ? current : 'All districts');
        setDistrictStatus(names.length ? 'ready' : 'error');
      })
      .catch(() => alive && setDistrictStatus('error'));
    return () => { alive = false; };
  }, [countryCode, state]);

  const countryOptions = useMemo(() => COUNTRIES.map((country) => ({ value: country.code, label: country.name })), []);
  const stateOptions = useMemo(() => [{ value: '', label: 'India overview' }, ...INDIA_STATES.map((name) => ({ value: name, label: name }))], []);

  const apply = () => {
    const country = countryByCode(countryCode);
    const safeState = country.code === 'IND' ? state : '';
    const safeDistrict = country.code === 'IND' && safeState ? district : 'All districts';
    window.localStorage.setItem(COUNTRY_KEY, country.code);
    if (safeState) window.localStorage.setItem(STATE_KEY, safeState); else window.localStorage.removeItem(STATE_KEY);
    if (safeDistrict && safeDistrict !== 'All districts') window.localStorage.setItem(DISTRICT_KEY, safeDistrict); else window.localStorage.removeItem(DISTRICT_KEY);

    const url = new URL(window.location.href);
    url.searchParams.set('country', country.code);
    if (safeState) url.searchParams.set('state', safeState); else url.searchParams.delete('state');
    if (safeDistrict !== 'All districts') url.searchParams.set('district', safeDistrict); else url.searchParams.delete('district');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);

    const detail = { countryCode: country.code, countryName: country.name, state: safeState, district: safeDistrict };
    window.dispatchEvent(new CustomEvent('curiolens:country-change', { detail }));
    window.dispatchEvent(new CustomEvent('curiolens:place-change', { detail }));
    onApplied?.(detail);
    onNavigate?.();
  };

  return <div className={mobile ? 'mobile-place-picker' : 'desktop-place-picker'}>
    <div className="place-picker-heading">
      <span className="place-picker-title"><UiIcon name="pin" size={18}/> Explore a place</span>
      <small>Country updates global topic data. India can also drill down to state and district.</small>
    </div>
    <SmartSelect label="Country" value={countryCode} options={countryOptions} onChange={(code) => { setCountryCode(code); setState(''); setDistrict('All districts'); }} searchable />
    {countryCode === 'IND' && <>
      <SmartSelect label="State / UT" value={state} options={stateOptions} onChange={(next) => { setState(next); setDistrict('All districts'); }} />
      <SmartSelect label="District" value={district} options={districts} onChange={setDistrict} disabled={!state || districtStatus === 'loading'} searchable={districts.length > 18} />
      {state && <small className={`place-picker-status ${districtStatus}`}>{districtStatus === 'loading' ? 'Loading districts…' : districtStatus === 'error' ? 'District list is temporarily unavailable.' : `${districts.length - 1} districts available`}</small>}
    </>}
    {countryCode !== 'IND' && <div className="place-picker-country-note">Subnational drill-down is currently connected for India. Other countries use country-level topic data.</div>}
    <button className="place-go" type="button" onClick={apply}>Use this place</button>
  </div>;
}

export default function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [country, setCountry] = useState(countryByCode('IND'));
  const topicTimer = useRef(null);
  const placeTimer = useRef(null);

  useEffect(() => {
    const stored = readStoredPlace();
    setCountry(countryByCode(stored.countryCode));
    const onCountry = (event) => setCountry(countryByCode(event.detail?.countryCode || 'IND'));
    window.addEventListener('curiolens:country-change', onCountry);
    return () => window.removeEventListener('curiolens:country-change', onCountry);
  }, []);

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
          <button className="v9-place-button" type="button" aria-expanded={placeOpen} onClick={() => setPlaceOpen(v => !v)}><UiIcon name="pin" size={17}/><span>{country.name}</span><NavChevron open={placeOpen}/></button>
          {placeOpen && <div onMouseEnter={() => keepOpen(placeTimer,setPlaceOpen)} onMouseLeave={() => delayedClose(placeTimer,setPlaceOpen)}><PlacePicker onApplied={(detail) => { setCountry(countryByCode(detail.countryCode)); setPlaceOpen(false); }}/></div>}
        </div>
        <button className="v9-mobile-menu-button" type="button" aria-label="Open menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><UiIcon name="menu" size={22}/></button>
      </div>
    </div>

    <div className="v9-mobile-placebar"><UiIcon name="pin" size={16}/><span>{country.name}</span><button type="button" onClick={() => setMobileOpen(true)}>Change</button></div>

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
          <details className="mobile-nested place-mobile-details"><summary><span><UiIcon name="pin" size={20}/> Country & place</span><NavChevron size={16}/></summary><PlacePicker mobile onApplied={(detail) => setCountry(countryByCode(detail.countryCode))}/></details>
          <Link className="mobile-menu-link muted-mobile-link" href="/about/" onClick={closeMobile}>About</Link>
        </div>
      </aside>
    </div>}
  </header>;
}
