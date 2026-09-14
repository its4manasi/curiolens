'use client';

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
  return <div className="public-data-dashboard development-data-dashboard">
    <section className="public-metric-grid compact-four">
      <article className="public-metric-card coral"><span>Global Hunger Index</span><strong>25.8</strong><b>India: rank 102 / 123</b><p>The 2025 GHI classifies India’s hunger level as serious.</p><Source href="https://www.globalhungerindex.org/india.html">GHI 2025</Source></article>
      <article className="public-metric-card amber"><span>Child wasting</span><strong>18.7%</strong><b>India, GHI 2025 inputs</b><p>Wasting means a child has low weight for height — a sign of acute undernutrition.</p><Source href="https://www.globalhungerindex.org/india.html">Check indicator</Source></article>
      <article className="public-metric-card mint"><span>Consumption inequality</span><strong>25.5</strong><b>Gini index, 2022</b><p>A lower Gini means consumption is more evenly distributed. This measure does not fully capture wealth inequality at the top.</p><Source href="https://pip.worldbank.org/country-profiles/IND">World Bank PIP</Source></article>
      <article className="public-metric-card blue"><span>Multidimensional poverty</span><strong>17.74%</strong><b>Headcount, 2022</b><p>This asks whether households face overlapping deprivations, not only low income.</p><Source href="https://pip.worldbank.org/country-profiles/IND">World Bank</Source></article>
    </section>

    <section className="ranking-panel"><div className="panel-title-row"><div><span className="section-tag">Hunger in context</span><h2>India compared with selected countries and the world</h2><p>Lower GHI scores are better. Countries below 5 are grouped rather than individually ranked.</p></div><Source href="https://www.globalhungerindex.org/ranking.html">2025 GHI ranking</Source></div><div className="rank-bars hunger-bars">{hunger.map(x=><div className={x.country==='India'?'rank-row focus':'rank-row'} key={x.country}><b>{x.country}</b><i><span style={{width:`${Math.min(100,(x.score/30)*100)}%`}}/></i><strong>{x.label}</strong></div>)}</div></section>

    <section className="split-story-grid">
      <article className="story-panel"><span className="section-tag">Inequality</span><h2>Income, consumption and wealth are not the same thing</h2><p>India’s World Bank Gini value here is based on household consumption. It can look much more equal than income or wealth measures because high-income households are harder to capture in surveys and wealth is more concentrated.</p><Source href="https://documents1.worldbank.org/curated/en/099060325033540333/pdf/P180633-e1a59178-dc78-4b14-8928-1c88d02240f3.pdf">Read World Bank methodology note</Source></article>
      <article className="story-panel"><span className="section-tag">Nutrition</span><h2>Hunger is more than not having enough food</h2><p>The Global Hunger Index combines undernourishment, child wasting, child stunting and child mortality. CurioLens should show all four so a single rank does not hide the underlying problem.</p><div className="simple-callout"><b>India, 2025 GHI components</b><span>12.0% undernourished · 18.7% wasting · 32.9% stunting · 2.8% under-five mortality</span></div><Source href="https://www.globalhungerindex.org/india.html">Verify India data</Source></article>
    </section>
  </div>;
}
