const sourceLinks = {
  gdp: 'https://www.mospi.gov.in/uploads/latestreleasesfiles/1767782498513-GDP%20Press%20Note%20on%20FAE%202025-26.pdf',
  plfs: 'https://www.mospi.gov.in/uploads/publications_reports/publications_reports1780040415321_0624fb13-fb47-40bc-b470-7c7e9635c3ef_PLFS_2025_F_REV_29052026.pdf',
  hces: 'https://mospi.gov.in/sites/default/files/publication_reports/HCES%20FactSheet%202023-24.pdf',
  hcesReport: 'https://mospi.gov.in/sites/default/files/publication_reports/Final_Report_HCES_2023-24L.pdf',
  rbi: 'https://systemhealth.rbi.org.in/Scripts/PublicationsView.aspx?id=22484',
  worldBank: 'https://data.worldbank.org/?locations=IN-1W'
};

const stateIncome = [
  ['Karnataka', 186038],
  ['Tamil Nadu', 179732],
  ['Maharashtra', 163820],
  ['Kerala', 161957],
  ['Punjab', 130002],
  ['India', 106744],
  ['Bihar', 32174]
];

function SourceLink({ href, children = 'Check official data' }) {
  return <a className="econ-source-link" href={href} target="_blank" rel="noreferrer">{children} ↗</a>;
}

function MetricCard({ eyebrow, value, title, text, source, tone = 'mint' }) {
  return <article className={`econ-metric-card econ-${tone}`}>
    <span className="econ-card-eyebrow">{eyebrow}</span>
    <strong>{value}</strong>
    <h3>{title}</h3>
    <p>{text}</p>
    <SourceLink href={source}/>
  </article>;
}

export default function EconomyDashboard() {
  const maxIncome = Math.max(...stateIncome.map(([,v]) => v));

  return <div className="economy-dashboard">
    <section className="econ-question-strip">
      <div><span>1</span><b>Is the economy growing?</b><small>GDP and output</small></div>
      <div><span>2</span><b>Are people finding work?</b><small>PLFS jobs data</small></div>
      <div><span>3</span><b>What reaches households?</b><small>Consumption and wages</small></div>
      <div><span>4</span><b>Who is being left behind?</b><small>Gaps across states and groups</small></div>
    </section>

    <section className="econ-headline-grid">
      <MetricCard eyebrow="Headline economy" value="7.4%" title="Real GDP growth" text="India's first advance estimate for FY 2025–26. GDP tells us how fast total economic output is growing — not what a typical household earns." source={sourceLinks.gdp} tone="blue"/>
      <MetricCard eyebrow="Work" value="3.1%" title="Unemployment rate" text="PLFS 2025 usual-status unemployment rate for people aged 15+. A low unemployment rate can still coexist with low pay, informal work or too little work." source={sourceLinks.plfs} tone="mint"/>
      <MetricCard eyebrow="Household spending" value="₹4,122" title="Rural monthly spending per person" text="Average monthly per-capita consumption expenditure in rural India in 2023–24. Urban India was ₹6,996." source={sourceLinks.hces} tone="sand"/>
      <MetricCard eyebrow="Casual work" value="₹453/day" title="Average casual-labour earnings" text="PLFS 2025 all-India average for casual labour outside public works. Men averaged ₹489 and women ₹324 per day." source={sourceLinks.plfs} tone="violet"/>
    </section>

    <section className="econ-reality-panel">
      <div className="econ-reality-copy">
        <span className="section-kicker">Why GDP can feel different on the ground</span>
        <h2>One economy. Different lenses.</h2>
        <p>GDP measures the value of goods and services produced. It does <b>not</b> tell us how income is distributed, whether jobs are secure, what households can buy, or whether one state is keeping pace with another.</p>
        <div className="econ-lens-grid">
          <div><b>GDP</b><span>How much the economy produces</span></div>
          <div><b>PLFS</b><span>Who is working, unemployed or self-employed</span></div>
          <div><b>HCES</b><span>What households are actually able to consume</span></div>
          <div><b>State income</b><span>How output per person differs across states</span></div>
        </div>
      </div>
      <aside className="econ-plain-card">
        <span>Read it simply</span>
        <strong>Fast GDP growth does not automatically mean every family feels richer.</strong>
        <p>To understand living standards, look at jobs, wages, household consumption and distribution alongside GDP.</p>
      </aside>
    </section>

    <section className="econ-two-col">
      <article className="econ-panel">
        <div className="econ-panel-head">
          <div><span className="section-kicker">State gap</span><h2>Per-person state output</h2><p>Per-capita NSDP at constant 2011–12 prices, 2023–24. This is not take-home salary; it is state economic output per person.</p></div>
          <SourceLink href={sourceLinks.rbi} children="RBI table"/>
        </div>
        <div className="econ-bars">
          {stateIncome.map(([name,value]) => <div className={`econ-bar-row ${name === 'Bihar' ? 'is-focus' : ''}`} key={name}>
            <span className="econ-bar-label">{name}</span>
            <div className="econ-bar-track"><span style={{width:`${Math.max(8,(value/maxIncome)*100)}%`}}/></div>
            <b>₹{Math.round(value/1000)}k</b>
          </div>)}
        </div>
        <p className="econ-note">Bihar: ₹32,174 versus all-India per-capita NNI of ₹106,744 in the same constant-price table. Comparisons should be read with source year and price basis intact.</p>
      </article>

      <article className="econ-panel">
        <div className="econ-panel-head"><div><span className="section-kicker">Household reality</span><h2>Consumption differs sharply</h2><p>HCES 2023–24 shows how much people actually consume each month.</p></div><SourceLink href={sourceLinks.hces}/></div>
        <div className="econ-consumption-pairs">
          <div className="econ-consumption-card"><small>Rural India</small><strong>₹4,122</strong><span>average MPCE</span><p><b>Bottom 5%:</b> ₹1,677<br/><b>Top 5%:</b> ₹10,137</p><em>Top group spends about 6× the bottom group.</em></div>
          <div className="econ-consumption-card"><small>Urban India</small><strong>₹6,996</strong><span>average MPCE</span><p><b>Bottom 5%:</b> ₹2,376<br/><b>Top 5%:</b> ₹20,310</p><em>Top group spends about 8.5× the bottom group.</em></div>
        </div>
        <div className="econ-gini"><b>Consumption inequality</b><span>HCES Gini: rural 0.237 · urban 0.284</span><small>Higher Gini means consumption is distributed less equally.</small></div>
      </article>
    </section>

    <section className="econ-two-col">
      <article className="econ-panel">
        <div className="econ-panel-head"><div><span className="section-kicker">Jobs beneath the headline</span><h2>Employment quality matters</h2></div><SourceLink href={sourceLinks.plfs} children="PLFS 2025"/></div>
        <div className="econ-job-grid">
          <div><strong>70.7%</strong><span>of rural female workers were self-employed</span></div>
          <div><strong>57.4%</strong><span>of rural male workers were self-employed</span></div>
          <div><strong>6.4%</strong><span>urban female unemployment rate</span></div>
          <div><strong>4.2%</strong><span>urban male unemployment rate</span></div>
        </div>
        <p className="econ-note">The PLFS methodology was revamped from January 2025. CurioLens should always show the status definition and reference period when comparing labour-market numbers across years.</p>
      </article>

      <article className="econ-panel econ-world-panel">
        <div className="econ-panel-head"><div><span className="section-kicker">Global context</span><h2>Per-capita GDP is useful — but incomplete</h2></div><SourceLink href={sourceLinks.worldBank} children="World Bank"/></div>
        <div className="econ-world-compare"><div><span>India</span><strong>$2,703</strong><small>2025, current US$</small></div><div><span>World</span><strong>$14,406</strong><small>2025, current US$</small></div></div>
        <p>Useful for comparing the scale of average economic output internationally, but not a substitute for household income, median consumption, inequality or public services.</p>
      </article>
    </section>

    <section className="econ-way-forward">
      <div><span className="section-kicker">What CurioLens should ask next</span><h2>Growth for whom?</h2></div>
      <div className="econ-forward-grid">
        <div><b>Jobs</b><span>Are new jobs regular, casual or self-employed?</span></div>
        <div><b>Pay</b><span>Are wages rising faster than the cost of living?</span></div>
        <div><b>Consumption</b><span>Can ordinary households buy more than before?</span></div>
        <div><b>States</b><span>Which states are closing the per-person income gap?</span></div>
        <div><b>Women</b><span>Are women participating in paid work and earning equally?</span></div>
        <div><b>Distribution</b><span>Who receives the gains from economic growth?</span></div>
      </div>
    </section>
  </div>;
}
