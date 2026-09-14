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
function RankValue({rank, outOf}){
  if (rank == null) return <>—</>;
  return <>{rank}{outOf ? <span className="rank-out-of"> / {outOf}</span> : null}</>;
}

export default function DemocracyDashboard(){
  const { metrics: live, status: liveStatus, countryName, isIndia } = useLiveTopicData('democracy');

  const governance = [
    ['Voice & accountability', live.voice, 'Can people participate, speak freely and hold government accountable?'],
    ['Control of corruption', live.corruptionControl, 'How effectively is public power kept from private misuse?'],
    ['Government effectiveness', live.governmentEffectiveness, 'How strong are public services and policy implementation?'],
    ['Rule of law', live.ruleOfLaw, 'How much confidence is there in rules, courts and contract enforcement?'],
  ];

  const globalIndices = [
    {
      key:'peace',
      label:'Global Peace Index',
      rank: live.peaceRank?.value ?? (isIndia ? 127 : null),
      outOf: live.peaceRank?.outOf ?? (isIndia ? 163 : null),
      period: live.peaceRank?.period || (isIndia ? '2026 · last verified' : 'Latest edition'),
      score: live.peaceRank?.score != null ? `Score ${live.peaceRank.score}` : null,
      description:'Ranks peacefulness rather than democracy itself.',
      factors:['Safety & security','Ongoing conflict','Militarisation'],
      source: live.peaceRank || {source:'Institute for Economics & Peace', sourceUrl:'https://www.visionofhumanity.org/resources/global-peace-index/'},
    },
    {
      key:'press',
      label:'World Press Freedom Index',
      rank: live.pressFreedomRank?.value ?? (isIndia ? 157 : null),
      outOf: live.pressFreedomRank?.outOf ?? (isIndia ? 180 : null),
      period: live.pressFreedomRank?.period || (isIndia ? '2026 · last verified' : 'Latest RSF ranking'),
      score: live.pressFreedomRank?.score != null ? `Score ${Number(live.pressFreedomRank.score).toFixed(2)}` : (isIndia ? 'Score 31.96' : null),
      description:'Shows the environment in which journalists and news organisations can work.',
      factors:['Political','Economic','Legal','Social','Security'],
      source: live.pressFreedomRank || {source:'Reporters Without Borders', sourceUrl:isIndia ? 'https://rsf.org/en/country/india' : 'https://rsf.org/en/ranking'},
    },
    {
      key:'cpi',
      label:'Corruption Perceptions Index',
      rank: live.cpiRank?.value ?? (isIndia ? 91 : null),
      outOf: live.cpiRank?.outOf ?? (isIndia ? 182 : null),
      period: live.cpiRank?.period || live.cpiScore?.period || (isIndia ? '2025 · last verified' : 'Latest CPI'),
      score: live.cpiScore?.value != null ? `Score ${live.cpiScore.value}/100` : (isIndia ? 'Score 39/100' : null),
      description:'Compares perceived public-sector corruption across countries.',
      factors:['Bribery','Misuse of public funds','Public-office abuse','Integrity safeguards','Transparency'],
      source: live.cpiRank || live.cpiScore || {source:'Transparency International', sourceUrl:cpiLink},
    },
  ];

  return <div className="public-data-dashboard democracy-data-dashboard">
    <section className="live-index-section democracy-global-index">
      <div className="live-index-head"><div>
        <span className="section-tag">{countryName} in global governance measures</span>
        <h2>Three rankings, three different questions.</h2>
        <p>CurioLens keeps rank, total countries, score and methodology together so a ranking is not read without context.</p>
      </div><span className={`live-status ${liveStatus}`}>{liveStatus === 'ready' ? 'Latest sources checked' : liveStatus === 'loading' ? 'Checking latest sources…' : 'Verified fallback shown where needed'}</span></div>

      <div className="governance-index-grid">
        {globalIndices.map((item)=><article className="governance-index-card" key={item.key}>
          <span className="governance-index-label">{item.label}</span>
          <strong className="governance-rank"><RankValue rank={item.rank} outOf={item.outOf}/></strong>
          <div className="governance-index-meta">
            {item.score && <b>{item.score}</b>}
            <small>{item.period}</small>
          </div>
          <p>{item.description}</p>
          <div className="index-factor-block"><span>What this index considers</span><div>{item.factors.map((factor)=><em key={factor}>{factor}</em>)}</div></div>
          <Source href={item.source.sourceUrl}>{item.source.source}</Source>
        </article>)}
      </div>
    </section>

    <section className="live-index-section compact-live-section">
      <div className="live-index-head"><div><span className="section-tag">Comparable governance series</span><h2>Institutional quality changes slowly.</h2><p>Worldwide Governance Indicators use an estimate scale rather than a simple global rank. They are shown separately so unlike measures are not mixed.</p></div></div>
      <div className="governance-series-grid">{governance.map(([label,m,description]) => <article key={label} className={!m?.value && m?.value !== 0 ? 'is-unavailable' : ''}><span>{label}</span><strong>{m?.value != null ? Number(m.value).toFixed(2) : '—'}</strong><small>{m?.value != null ? `${m.period || 'Latest'} · WGI estimate` : 'Latest comparable value unavailable'}</small><p>{description}</p><Source href={m?.sourceUrl || 'https://www.worldbank.org/en/publication/worldwide-governance-indicators'}>{m?.source || 'World Bank WGI'}</Source></article>)}</div>
    </section>

    {isIndia ? <section className="ranking-panel"><div className="panel-title-row"><div><span className="section-tag">India in context</span><h2>How does India compare on corruption perception?</h2><p>Score is 0–100; higher is cleaner. Rank is shown separately because score is better for tracking change over time.</p></div><Source href={cpiLink}>Official CPI table</Source></div><div className="rank-bars">{cpi.map(x=><div className={x.country==='India'?'rank-row focus':'rank-row'} key={x.country}><span className="rank-num">#{x.rank}</span><b>{x.country}</b><i><span style={{width:`${x.score}%`}}/></i><strong>{x.score}</strong></div>)}</div></section> : <div className="country-scope-note"><b>{countryName} selected.</b> The global cards above update from comparable sources. The hand-picked India comparison chart is hidden so CurioLens does not mix countries.</div>}

    <section className="split-story-grid">
      <article className="story-panel"><span className="section-tag">Democracy is broader than elections</span><h2>Participation, accountability and clean institutions</h2><p>A democracy dashboard should combine elections, voice, institutional quality, media freedom, peace and corruption indicators — while keeping each methodology separate.</p><div className="simple-callout"><b>What to ask</b><span>Who votes? · Who represents? · Who decides? · Who checks power?</span></div></article>
      <article className="story-panel"><span className="section-tag">Important caution</span><h2>A ranking is not a complete verdict</h2><p>Global Peace, Press Freedom and CPI measure different things. CurioLens shows them together for context but never combines them into a single “democracy score”.</p></article>
    </section>
  </div>;
}
