'use client';

const cpi = [
  {country:'Denmark', score:89, rank:1},
  {country:'Singapore', score:84, rank:3},
  {country:'China', score:43, rank:76},
  {country:'Vietnam', score:41, rank:81},
  {country:'India', score:39, rank:91},
  {country:'Brazil', score:35, rank:107},
  {country:'Bangladesh', score:24, rank:150},
];
const cpiLink='https://www.transparency.org/en/cpi/2025/index/rou';
function Source({href, children}){return <a className="evidence-link" href={href} target="_blank" rel="noreferrer">{children} ↗</a>}
export default function DemocracyDashboard(){
  return <div className="public-data-dashboard democracy-data-dashboard">
    <section className="public-metric-grid compact-four">
      <article className="public-metric-card mint"><span>Corruption perception score</span><strong>39 / 100</strong><b>India, 2025</b><p>Higher scores mean the public sector is perceived as cleaner.</p><Source href={cpiLink}>Transparency International</Source></article>
      <article className="public-metric-card coral"><span>Global rank</span><strong>91 / 182</strong><b>India, 2025</b><p>Rank is useful for comparison, but the score itself is better for tracking change.</p><Source href={cpiLink}>Check CPI ranking</Source></article>
      <article className="public-metric-card blue"><span>Global average</span><strong>42</strong><b>CPI 2025</b><p>India’s score is below the global average reported by Transparency International.</p><Source href="https://www.transparency.org/en/news/cpi-2025-findings-insights-corruption">CPI findings</Source></article>
      <article className="public-metric-card amber"><span>What CPI measures</span><strong>13</strong><b>Independent data sources</b><p>It measures perceived public-sector corruption, not every form of corruption.</p><Source href="https://www.transparency.org/en/publications/corruption-perceptions-index-2025">Methodology</Source></article>
    </section>

    <section className="ranking-panel"><div className="panel-title-row"><div><span className="section-tag">India in context</span><h2>How does India compare on corruption perception?</h2><p>0 means highly corrupt; 100 means very clean.</p></div><Source href={cpiLink}>Official CPI table</Source></div><div className="rank-bars">{cpi.map(x=><div className={x.country==='India'?'rank-row focus':'rank-row'} key={x.country}><span className="rank-num">#{x.rank}</span><b>{x.country}</b><i><span style={{width:`${x.score}%`}}/></i><strong>{x.score}</strong></div>)}</div></section>

    <section className="split-story-grid">
      <article className="story-panel"><span className="section-tag">Democracy is broader than elections</span><h2>Participation, accountability and clean institutions</h2><p>A democracy dashboard should eventually combine voter turnout, representation, local-government participation, public spending, transparency and corruption indicators — each with its own source and year.</p><div className="simple-callout"><b>What to ask</b><span>Who votes? · Who represents? · Who decides? · Who checks power?</span></div></article>
      <article className="story-panel"><span className="section-tag">Important caution</span><h2>A ranking is not a complete verdict</h2><p>The CPI reflects expert and business perceptions of public-sector corruption. It does not directly measure household bribery, political finance, judicial independence or every democratic institution.</p><Source href="https://www.transparency.org/en/publications/corruption-perceptions-index-2025">Read the CPI methodology</Source></article>
    </section>
  </div>;
}
