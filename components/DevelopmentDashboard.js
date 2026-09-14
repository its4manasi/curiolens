'use client';

import { useEffect, useMemo, useState } from 'react';
import useLiveTopicData from './useLiveTopicData';

const hunger=[
  {country:'China', score:5, label:'<5'},
  {country:'Brazil', score:6.4, label:'6.4'},
  {country:'Vietnam', score:11.1, label:'11.1'},
  {country:'World', score:18.3, label:'18.3'},
  {country:'Bangladesh', score:19.2, label:'19.2'},
  {country:'India', score:25.8, label:'25.8'},
];
function Source({href, children}){return <a className="evidence-link" href={href} target="_blank" rel="noreferrer">{children} ↗</a>}

export default function DevelopmentDashboard(){
  const { metrics: live, status: liveStatus, countryName, isIndia } = useLiveTopicData('development');
  const [state, setState] = useState('Bihar');
  useEffect(() => {
    const stored = window.localStorage.getItem('curiolens-state');
    if (stored) setState(stored);
    const onPlace = (event) => { if (event.detail?.countryCode === 'IND' && event.detail?.state) setState(event.detail.state); };
    window.addEventListener('curiolens:place-change', onPlace);
    return () => window.removeEventListener('curiolens:place-change', onPlace);
  }, []);
  const latest = [
    ['Gini index', live.gini, (v) => Number(v).toFixed(1)],
    ['Poverty at lower-middle-income line', live.poverty, (v) => `${Number(v).toFixed(1)}%`],
    ['Life expectancy', live.lifeExpectancy, (v) => `${Number(v).toFixed(1)} years`],
    ['Under-5 mortality', live.under5, (v) => `${Number(v).toFixed(1)} / 1,000`],
  ].filter(([,m]) => m?.value != null);

  const globalMeasures = [
    {
      label:'Global SDG Index',
      value: live.globalSdgRank?.value != null ? `#${live.globalSdgRank.value}` : (isIndia ? '#94' : '—'),
      detail: live.globalSdgRank?.value != null ? `${live.globalSdgRank.period} · ${live.globalSdgRank.outOf ? `of ${live.globalSdgRank.outOf}` : 'latest edition'}${live.globalSdgScore?.value != null ? ` · score ${Number(live.globalSdgScore.value).toFixed(1)}` : ''}` : (isIndia ? 'SDR 2026 · 94 of 169 · score 68.3 · last verified' : 'Latest Sustainable Development Report country result checked live'),
      source: live.globalSdgRank || {source:'Sustainable Development Report', sourceUrl:'https://dashboards.sdgindex.org/profiles/india/fact-sheet/'},
    },
    {
      label:'Human Development Index',
      value: live.hdiRank?.value != null ? `#${live.hdiRank.value}` : (isIndia ? '#130' : '—'),
      detail: live.hdiRank?.value != null ? `${live.hdiRank.period || 'Latest HDR'}${live.hdiValue?.value != null ? ` · HDI ${Number(live.hdiValue.value).toFixed(3)}` : ''}` : (isIndia ? 'HDR 2025 · 130 of 193 · HDI 0.685 · last verified' : 'Latest UNDP country result checked live'),
      source: live.hdiRank || {source:'UNDP', sourceUrl:'https://hdr.undp.org/data-center/country-insights#/ranks'},
    },
    {
      label:'World Happiness Report',
      value: live.happinessRank?.value != null ? `#${live.happinessRank.value}` : (isIndia ? '#116' : '—'),
      detail: live.happinessRank?.value != null ? `${live.happinessRank.period || 'Latest edition'}${live.happinessScore?.value != null ? ` · life evaluation ${Number(live.happinessScore.value).toFixed(3)}` : ''}` : (isIndia ? '2026 · 116 of 147 · score 4.536 · last verified' : 'Latest World Happiness country result checked live'),
      source: live.happinessRank || {source:'World Happiness Report', sourceUrl:'https://www.worldhappiness.report/'},
    },
    {
      label:'Global Hunger Index',
      value: live.ghiRank?.value != null ? `#${live.ghiRank.value}` : (isIndia ? '#102' : '—'),
      detail: live.ghiRank?.value != null ? `${live.ghiRank.period || 'Latest edition'} · of ${live.ghiRank.outOf || '—'}${live.ghiScore?.value != null ? ` · score ${live.ghiScore.value}` : ''}` : (isIndia ? '2025 · 102 of 123 · score 25.8 · last verified' : 'Latest Global Hunger Index country result checked live'),
      source: live.ghiRank || {source:'Global Hunger Index', sourceUrl:'https://www.globalhungerindex.org/india.html'},
    },
  ];

  const stateRows = Array.isArray(live.nitiSdg?.states) ? live.nitiSdg.states : [];
  const selectedState = useMemo(() => stateRows.find((x) => x.state === state) || null, [stateRows, state]);
  const topStates = useMemo(() => [...stateRows].filter((x) => Number.isFinite(Number(x.score))).sort((a,b) => Number(b.score)-Number(a.score)).slice(0,5), [stateRows]);
  const stateNames = stateRows.length ? stateRows.map((x)=>x.state) : ['Bihar'];

  return <div className="public-data-dashboard development-data-dashboard">
    <section className="live-index-section compact-live-section"><div className="live-index-head"><div><span className="section-tag">Latest available {countryName} series</span><h2>Development indicators update on different schedules.</h2><p>The API asks each live source for its newest non-null {countryName} observation rather than requesting a fixed year.</p></div><span className={`live-status ${liveStatus}`}>{liveStatus === 'ready' ? 'Latest observations checked' : liveStatus === 'loading' ? 'Checking latest data…' : 'Using verified fallback where needed'}</span></div>{latest.length > 0 && <div className="live-index-grid">{latest.map(([label,m,fmt]) => <article key={label}><span>{label}</span><strong>{fmt(m.value)}</strong><small>{m.period}</small><Source href={m.sourceUrl}>{m.source}</Source></article>)}</div>}</section>

    <section className="live-index-section development-global-index"><div className="live-index-head"><div><span className="section-tag">{countryName} in the world</span><h2>Development is bigger than GDP.</h2><p>These indices answer different questions: sustainable development, human capability, life satisfaction and hunger.</p></div></div><div className="live-index-grid stable-index-grid">{globalMeasures.map((item)=><article key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.detail}</small><Source href={item.source.sourceUrl}>{item.source.source}</Source></article>)}</div></section>

    {isIndia && <>
    <section className="niti-sdg-panel">
      <div className="panel-title-row"><div><span className="section-tag">NITI Aayog · State / UT view</span><h2>How is your state doing on the SDGs?</h2><p>CurioLens checks NITI for the latest SDG India Index edition, then shows the selected State/UT score. If the live table cannot be read, the last verified NITI edition remains clearly labelled.</p></div><Source href={live.nitiSdg?.sourceUrl || 'https://www.niti.gov.in/divisions/division/sustainable-development-goal'}>NITI Aayog SDG Index</Source></div>
      <div className="niti-sdg-controls">
        <label><span>State / UT</span><select value={state} onChange={(e)=>setState(e.target.value)}>{stateNames.map((name)=><option key={name} value={name}>{name}</option>)}</select></label>
        <div className="niti-sdg-score"><span>{state}</span><strong>{selectedState?.score ?? '—'}</strong><small>{live.nitiSdg?.period || 'Latest NITI edition'} · score out of 100</small></div>
        <div className="niti-sdg-score"><span>India</span><strong>{live.nitiSdg?.indiaScore ?? '—'}</strong><small>National composite score</small></div>
      </div>
      {topStates.length > 0 && <div className="niti-top-five"><b>Top five by composite score</b><div>{topStates.map((row,index)=><span key={row.state}>{index+1}. {row.state} <strong>{row.score}</strong></span>)}</div></div>}
      <p className="live-index-footnote">NITI’s SDG India Index is a State/UT benchmark. It is separate from the global Sustainable Development Report, so CurioLens does not combine the two scores.</p>
    </section>

    </>}

    <section className="public-metric-grid compact-four">
      <article className="public-metric-card coral"><span>Global Hunger Index score</span><strong>{live.ghiScore?.value ?? (isIndia ? 25.8 : '—')}</strong><b>{countryName}: rank {live.ghiRank?.value ?? (isIndia ? 102 : '—')} / {live.ghiRank?.outOf ?? (isIndia ? 123 : '—')}</b><p>The GHI combines undernourishment, child wasting, child stunting and child mortality.</p><Source href={live.ghiScore?.sourceUrl || 'https://www.globalhungerindex.org/india.html'}>Latest GHI</Source></article>
      <article className="public-metric-card amber"><span>Child wasting</span><strong>{live.childWasting?.value != null ? `${live.childWasting.value}%` : (isIndia ? '18.7%' : '—')}</strong><b>{countryName} · latest GHI inputs</b><p>Wasting means a child has low weight for height — a sign of acute undernutrition.</p><Source href={live.childWasting?.sourceUrl || 'https://www.globalhungerindex.org/india.html'}>Check indicator</Source></article>
      <article className="public-metric-card mint"><span>Consumption inequality</span><strong>{live.gini?.value != null ? Number(live.gini.value).toFixed(1) : (isIndia ? '25.5' : '—')}</strong><b>{live.gini?.period || 'Latest available'}</b><p>A lower Gini means consumption is more evenly distributed; it does not fully capture wealth concentration.</p><Source href={live.gini?.sourceUrl || 'https://pip.worldbank.org/country-profiles/IND'}>World Bank</Source></article>
      <article className="public-metric-card blue"><span>Life expectancy</span><strong>{live.lifeExpectancy?.value != null ? `${Number(live.lifeExpectancy.value).toFixed(1)} yrs` : '—'}</strong><b>{live.lifeExpectancy?.period || 'Latest available'}</b><p>A simple health-and-longevity measure used in broader development comparisons.</p><Source href={live.lifeExpectancy?.sourceUrl || 'https://data.worldbank.org/indicator/SP.DYN.LE00.IN?locations=IN'}>World Bank</Source></article>
    </section>

    {isIndia ? <section className="ranking-panel"><div className="panel-title-row"><div><span className="section-tag">Hunger in context</span><h2>India compared with selected countries and the world</h2><p>Lower GHI scores are better. Countries below 5 are grouped rather than individually ranked.</p></div><Source href="https://www.globalhungerindex.org/ranking.html">GHI ranking</Source></div><div className="rank-bars hunger-bars">{hunger.map(x=><div className={x.country==='India'?'rank-row focus':'rank-row'} key={x.country}><b>{x.country}</b><i><span style={{width:`${Math.min(100,(x.score/30)*100)}%`}}/></i><strong>{x.label}</strong></div>)}</div></section> : <div className="country-scope-note"><b>{countryName} selected.</b> Global development cards above update for this country. NITI State/UT SDG comparisons are India-only and are hidden outside India.</div>}

    <section className="split-story-grid">
      <article className="story-panel"><span className="section-tag">Read indices carefully</span><h2>One rank cannot describe development.</h2><p>HDI focuses on health, education and income. SDG indices cover a much wider policy agenda. Happiness is based on life evaluation, while GHI focuses on hunger and child nutrition.</p></article>
      {isIndia ? <article className="story-panel"><span className="section-tag">State context</span><h2>Use national and state views together.</h2><p>The global SDG rank tells us where India stands internationally. NITI’s SDG India Index helps compare States and UTs inside India using a different indicator framework.</p><Source href="https://www.niti.gov.in/divisions/division/sustainable-development-goal">NITI SDG programme</Source></article> : <article className="story-panel"><span className="section-tag">Country context</span><h2>Different sources update at different times.</h2><p>CurioLens keeps the source year visible and does not substitute India-specific State/UT data when another country is selected.</p></article>}
    </section>
  </div>;
}
