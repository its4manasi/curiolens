'use client';

import useLiveTopicData from './useLiveTopicData';

const cpi = [
  {country:'Denmark', score:89, rank:1},
  {country:'Singapore', score:84, rank:3},
  {country:'China', score:43, rank:76},
  {country:'Vietnam', score:41, rank:81},
  {country:'India', score:39, rank:91},
  {country:'Brazil', score:35, rank:107},
  {country:'Bangladesh', score:24, rank:150},
];
const cpiLink='https://www.transparency.org/en/countries/india';
function Source({href, children}){return <a className="evidence-link" href={href} target="_blank" rel="noreferrer">{children} ↗</a>}
export default function DemocracyDashboard(){
  const { metrics: live, status: liveStatus, countryName, isIndia } = useLiveTopicData('democracy');
  const governance = [
    ['Voice & accountability', live.voice],
    ['Control of corruption', live.corruptionControl],
    ['Government effectiveness', live.governmentEffectiveness],
    ['Rule of law', live.ruleOfLaw],
  ].filter(([,m]) => m?.value != null);

  const globalMeasures = [
    {
      label:'Global Peace Index',
      value: live.peaceRank?.value != null ? `#${live.peaceRank.value}` : (isIndia ? '#127' : '—'),
      detail: live.peaceRank?.value != null ? `${live.peaceRank.period || 'Latest edition'}${live.peaceRank.outOf ? ` · of ${live.peaceRank.outOf}` : ''}` : (isIndia ? '2026 · 127 of 163 · last verified' : 'Latest Global Peace Index result checked live'),
      source: live.peaceRank || {source:'Institute for Economics & Peace', sourceUrl:'https://www.visionofhumanity.org/resources/global-peace-index/'},
    },
    {
      label:'World Press Freedom Index',
      value: live.pressFreedomRank?.value != null ? `#${live.pressFreedomRank.value}` : '—',
      detail: live.pressFreedomRank?.value != null ? `${live.pressFreedomRank.period || 'Latest RSF ranking'}${live.pressFreedomRank.outOf ? ` · of ${live.pressFreedomRank.outOf}` : ''}` : 'Latest RSF country ranking checked live',
      source: live.pressFreedomRank || {source:'Reporters Without Borders', sourceUrl:'https://rsf.org/en/ranking'},
    },
    {
      label:'Corruption Perceptions Index',
      value: live.cpiRank?.value != null ? `#${live.cpiRank.value}` : (isIndia ? '#91' : '—'),
      detail: live.cpiScore?.value != null ? `Score ${live.cpiScore.value}/100${live.cpiRank?.outOf ? ` · of ${live.cpiRank.outOf}` : ''}` : (isIndia ? 'Score 39/100 · last verified' : 'Latest Transparency International country result checked live'),
      source: live.cpiRank || {source:'Transparency International', sourceUrl:cpiLink},
    },
    {
      label:'Voice & accountability',
      value: live.voice?.value != null ? Number(live.voice.value).toFixed(2) : '—',
      detail: live.voice?.value != null ? `${live.voice.period} · WGI estimate` : 'Latest Worldwide Governance Indicators observation',
      source: live.voice || {source:'World Bank WGI', sourceUrl:'https://www.worldbank.org/en/publication/worldwide-governance-indicators'},
    },
  ];

  return <div className="public-data-dashboard democracy-data-dashboard">
    <section className="live-index-section democracy-global-index"><div className="live-index-head"><div><span className="section-tag">{countryName} in global governance measures</span><h2>Peace, press freedom, corruption and voice.</h2><p>These are different lenses. The Global Peace Index belongs here; the Women, Peace & Security Index remains on Women & Society because it measures women’s inclusion, justice and security.</p></div><span className={`live-status ${liveStatus}`}>{liveStatus === 'ready' ? 'Latest sources checked' : liveStatus === 'loading' ? 'Checking latest sources…' : 'Verified fallback shown where needed'}</span></div><div className="live-index-grid stable-index-grid">{globalMeasures.map((item)=><article key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.detail}</small><Source href={item.source.sourceUrl}>{item.source.source}</Source></article>)}</div></section>

    <section className="live-index-section compact-live-section"><div className="live-index-head"><div><span className="section-tag">Latest comparable governance series</span><h2>Governance changes slowly — track the newest published observation.</h2></div></div>{governance.length > 0 && <div className="live-index-grid">{governance.map(([label,m]) => <article key={label}><span>{label}</span><strong>{Number(m.value).toFixed(2)}</strong><small>{m.period} · estimate scale</small><Source href={m.sourceUrl}>{m.source}</Source></article>)}</div>}</section>

    <section className="public-metric-grid compact-four">
      <article className="public-metric-card mint"><span>Corruption perception score</span><strong>{live.cpiScore?.value != null ? `${live.cpiScore.value} / 100` : (isIndia ? '39 / 100' : '—')}</strong><b>{countryName} · {live.cpiScore?.period || 'latest CPI'}</b><p>Higher scores mean the public sector is perceived as cleaner.</p><Source href={live.cpiScore?.sourceUrl || cpiLink}>Transparency International</Source></article>
      <article className="public-metric-card coral"><span>Global CPI rank</span><strong>{live.cpiRank?.value != null ? `${live.cpiRank.value} / ${live.cpiRank.outOf || '—'}` : (isIndia ? '91 / 182' : '—')}</strong><b>{countryName} · latest CPI</b><p>Rank is useful for comparison, but the score itself is better for tracking change.</p><Source href={live.cpiRank?.sourceUrl || cpiLink}>Check CPI ranking</Source></article>
      <article className="public-metric-card blue"><span>Global Peace Index</span><strong>{live.peaceRank?.value != null ? `#${live.peaceRank.value}` : (isIndia ? '#127' : '—')}</strong><b>{live.peaceRank?.period || '2026 · last verified'}</b><p>Measures societal safety, conflict and militarisation. It is not a democracy score.</p><Source href={live.peaceRank?.sourceUrl || 'https://www.visionofhumanity.org/resources/global-peace-index/'}>Vision of Humanity</Source></article>
      <article className="public-metric-card amber"><span>Press freedom</span><strong>{live.pressFreedomRank?.value != null ? `#${live.pressFreedomRank.value}` : '—'}</strong><b>{live.pressFreedomRank?.period || 'Latest RSF ranking'}</b><p>Tracks the environment for journalism and media freedom; methodology differs from governance indices.</p><Source href={live.pressFreedomRank?.sourceUrl || 'https://rsf.org/en/ranking'}>RSF</Source></article>
    </section>

    {isIndia ? <section className="ranking-panel"><div className="panel-title-row"><div><span className="section-tag">India in context</span><h2>How does India compare on corruption perception?</h2><p>0 means highly corrupt; 100 means very clean.</p></div><Source href={cpiLink}>Official CPI table</Source></div><div className="rank-bars">{cpi.map(x=><div className={x.country==='India'?'rank-row focus':'rank-row'} key={x.country}><span className="rank-num">#{x.rank}</span><b>{x.country}</b><i><span style={{width:`${x.score}%`}}/></i><strong>{x.score}</strong></div>)}</div></section> : <div className="country-scope-note"><b>{countryName} selected.</b> The global cards above update from live comparable sources. The hand-picked India comparison chart is hidden so CurioLens does not mix countries.</div>}

    <section className="split-story-grid">
      <article className="story-panel"><span className="section-tag">Democracy is broader than elections</span><h2>Participation, accountability and clean institutions</h2><p>A democracy dashboard should combine elections, voice, institutional quality, media freedom, peace and corruption indicators — while keeping each methodology separate.</p><div className="simple-callout"><b>What to ask</b><span>Who votes? · Who represents? · Who decides? · Who checks power?</span></div></article>
      <article className="story-panel"><span className="section-tag">Important caution</span><h2>A ranking is not a complete verdict</h2><p>Global Peace, Press Freedom and CPI measure different things. CurioLens shows them together for context but never combines them into a single “democracy score”.</p></article>
    </section>
  </div>;
}
