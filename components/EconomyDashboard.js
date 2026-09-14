'use client';

import useLiveTopicData from './useLiveTopicData';

const sourceLinks = {
  gdp: 'https://www.mospi.gov.in/uploads/latestreleasesfiles/1767782498513-GDP%20Press%20Note%20on%20FAE%202025-26.pdf',
  plfs: 'https://www.mospi.gov.in/uploads/publications_reports/publications_reports1780040415321_0624fb13-fb47-40bc-b470-7c7e9635c3ef_PLFS_2025_F_REV_29052026.pdf',
  hces: 'https://mospi.gov.in/sites/default/files/publication_reports/HCES%20FactSheet%202023-24.pdf',
  rbi: 'https://systemhealth.rbi.org.in/Scripts/PublicationsView.aspx?id=22484',
  worldBank: 'https://data.worldbank.org/',
  nitiFiscal: 'https://www.niti.gov.in/divisions/division/states-coordination-development-planning'
};

const stateIncome = [
  ['Karnataka', 186038], ['Tamil Nadu', 179732], ['Maharashtra', 163820], ['Kerala', 161957],
  ['Punjab', 130002], ['India', 106744], ['Bihar', 32174]
];

function SourceLink({ href, children = 'Check official data' }) {
  return <a className="econ-source-link" href={href} target="_blank" rel="noreferrer">{children} ↗</a>;
}

function MetricCard({ eyebrow, value, title, text, source, tone = 'mint' }) {
  return <article className={`econ-metric-card econ-${tone}`}>
    <span className="econ-card-eyebrow">{eyebrow}</span><strong>{value}</strong><h3>{title}</h3><p>{text}</p><SourceLink href={source}/>
  </article>;
}

export default function EconomyDashboard() {
  const { metrics: live, status: liveStatus, countryName, isIndia } = useLiveTopicData('economy');
  const maxIncome = Math.max(...stateIncome.map(([,v]) => v));
  const fiscal = live.fiscalHealth;
  const fiscalStates = Array.isArray(fiscal?.states) ? fiscal.states : [];
  const fiscalTop = fiscalStates.slice(0, 6);
  const fiscalMax = Math.max(1, ...fiscalTop.map((row) => Number(row.score) || 0));

  return <div className="economy-dashboard">
    <section className="econ-question-strip">
      <div><span>1</span><b>Is the economy growing?</b><small>GDP and output</small></div>
      <div><span>2</span><b>Are people finding work?</b><small>Jobs data</small></div>
      <div><span>3</span><b>What reaches households?</b><small>Income and prices</small></div>
      <div><span>4</span><b>Who is being left behind?</b><small>Distribution and gaps</small></div>
    </section>

    <section className="econ-live-note"><span className={`live-status ${liveStatus}`}>{liveStatus === 'ready' ? `Latest ${countryName} series checked` : liveStatus === 'loading' ? 'Checking latest data…' : 'Using verified fallback where live data is unavailable'}</span></section>

    <section className="econ-headline-grid">
      <MetricCard eyebrow={`Growth · ${live.gdpGrowth?.period || 'latest'}`} value={live.gdpGrowth?.value != null ? `${Number(live.gdpGrowth.value).toFixed(1)}%` : (isIndia ? '7.4%' : '—')} title="Real GDP growth" text={`Latest comparable annual GDP growth for ${countryName}.`} source={live.gdpGrowth?.sourceUrl || (isIndia ? sourceLinks.gdp : 'https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG')} tone="blue"/>
      <MetricCard eyebrow={`Work · ${live.unemployment?.period || 'latest'}`} value={live.unemployment?.value != null ? `${Number(live.unemployment.value).toFixed(1)}%` : (isIndia ? '3.1%' : '—')} title="Unemployment rate" text="Latest comparable unemployment series. National labour surveys may use different definitions and reference periods." source={live.unemployment?.sourceUrl || (isIndia ? sourceLinks.plfs : 'https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS')} tone="mint"/>
      {isIndia ? <>
        <MetricCard eyebrow="Household spending" value="₹4,122" title="Rural monthly spending per person" text="Average monthly per-capita consumption expenditure in rural India in 2023–24. Urban India was ₹6,996." source={sourceLinks.hces} tone="sand"/>
        <MetricCard eyebrow="Casual work" value="₹453/day" title="Average casual-labour earnings" text="PLFS 2025 all-India average for casual labour outside public works. Men averaged ₹489 and women ₹324 per day." source={sourceLinks.plfs} tone="violet"/>
      </> : <>
        <MetricCard eyebrow={`Income per person · ${live.gdpPerCapita?.period || 'latest'}`} value={live.gdpPerCapita?.value != null ? `$${Math.round(Number(live.gdpPerCapita.value)).toLocaleString()}` : '—'} title="GDP per capita" text={`Latest comparable GDP-per-person value for ${countryName}.`} source={live.gdpPerCapita?.sourceUrl || 'https://data.worldbank.org/indicator/NY.GDP.PCAP.CD'} tone="sand"/>
        <MetricCard eyebrow={`Prices · ${live.inflation?.period || 'latest'}`} value={live.inflation?.value != null ? `${Number(live.inflation.value).toFixed(1)}%` : '—'} title="Consumer-price inflation" text={`Latest comparable annual inflation value for ${countryName}.`} source={live.inflation?.sourceUrl || 'https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG'} tone="violet"/>
      </>}
    </section>

    {isIndia ? <>
      <section className="econ-reality-panel">
        <div className="econ-reality-copy"><span className="section-kicker">Why GDP can feel different on the ground</span><h2>One economy. Different lenses.</h2><p>GDP measures production. It does <b>not</b> tell us how income is distributed, whether jobs are secure, what households can buy, or whether one state is keeping pace with another.</p><div className="econ-lens-grid"><div><b>GDP</b><span>How much the economy produces</span></div><div><b>PLFS</b><span>Who is working or unemployed</span></div><div><b>HCES</b><span>What households can consume</span></div><div><b>State income</b><span>How output per person differs</span></div></div></div>
        <aside className="econ-plain-card"><span>Read it simply</span><strong>Fast GDP growth does not automatically mean every family feels richer.</strong><p>Look at jobs, wages, household consumption and distribution alongside GDP.</p></aside>
      </section>

      <section className="econ-two-col">
        <article className="econ-panel"><div className="econ-panel-head"><div><span className="section-kicker">State gap</span><h2>Per-person state output</h2><p>Per-capita NSDP at constant 2011–12 prices, 2023–24.</p></div><SourceLink href={sourceLinks.rbi}>RBI table</SourceLink></div><div className="econ-bars">{stateIncome.map(([name,value]) => <div className={`econ-bar-row ${name === 'Bihar' ? 'is-focus' : ''}`} key={name}><span className="econ-bar-label">{name}</span><div className="econ-bar-track"><span style={{width:`${Math.max(8,(value/maxIncome)*100)}%`}}/></div><b>₹{Math.round(value/1000)}k</b></div>)}</div></article>
        <article className="econ-panel"><div className="econ-panel-head"><div><span className="section-kicker">Household reality</span><h2>Consumption differs sharply</h2><p>HCES 2023–24 shows how much people consume each month.</p></div><SourceLink href={sourceLinks.hces}/></div><div className="econ-consumption-pairs"><div className="econ-consumption-card"><small>Rural India</small><strong>₹4,122</strong><span>average MPCE</span></div><div className="econ-consumption-card"><small>Urban India</small><strong>₹6,996</strong><span>average MPCE</span></div></div></article>
      </section>

      <section className="econ-two-col">
        <article className="econ-panel"><div className="econ-panel-head"><div><span className="section-kicker">Jobs beneath the headline</span><h2>Employment quality matters</h2></div><SourceLink href={sourceLinks.plfs}>PLFS 2025</SourceLink></div><div className="econ-job-grid"><div><strong>70.7%</strong><span>of rural female workers were self-employed</span></div><div><strong>57.4%</strong><span>of rural male workers were self-employed</span></div><div><strong>6.4%</strong><span>urban female unemployment rate</span></div><div><strong>4.2%</strong><span>urban male unemployment rate</span></div></div></article>
        <article className="econ-panel econ-world-panel"><div className="econ-panel-head"><div><span className="section-kicker">Global context</span><h2>Per-capita GDP is useful — but incomplete</h2></div><SourceLink href={live.gdpPerCapita?.sourceUrl || sourceLinks.worldBank}>World Bank</SourceLink></div><div className="econ-world-compare"><div><span>{countryName}</span><strong>{live.gdpPerCapita?.value != null ? `$${Math.round(Number(live.gdpPerCapita.value)).toLocaleString()}` : '$2,703'}</strong><small>{live.gdpPerCapita?.period || 'latest available'} · current US$</small></div><div><span>World</span><strong>$14,406</strong><small>latest verified benchmark</small></div></div></article>
      </section>

      <section className="econ-panel econ-fiscal-panel"><div className="econ-panel-head"><div><span className="section-kicker">State finances · NITI Aayog</span><h2>Fiscal health is more than the deficit</h2><p>CurioLens discovers the newest Fiscal Health Index edition from NITI Aayog.</p></div><SourceLink href={fiscal?.reportUrl || fiscal?.sourceUrl || sourceLinks.nitiFiscal}>Latest NITI report</SourceLink></div><div className="econ-fiscal-meta"><div><small>Latest edition found</small><strong>{fiscal?.edition || 'Checking…'}</strong><span>{fiscal?.fiscalYear ? `uses FY ${fiscal.fiscalYear} data` : 'edition/year read from NITI'}</span></div><div><small>Coverage</small><strong>{fiscalStates.length || '—'}</strong><span>states parsed from the current report</span></div><div><small>Dimensions</small><strong>5</strong><span>spending · revenue · prudence · debt · sustainability</span></div></div>{fiscalTop.length ? <div className="econ-fiscal-ranking">{fiscalTop.map((row) => <div className="econ-fiscal-row" key={row.state}><span className="econ-fiscal-rank">#{row.rank}</span><span className="econ-fiscal-state">{row.state}</span><div className="econ-fiscal-track"><span style={{width:`${Math.max(6,(row.score/fiscalMax)*100)}%`}}/></div><b>{row.score.toFixed(1)}</b></div>)}</div> : <p className="econ-note">The live NITI report could not be parsed right now. No fiscal rank is invented.</p>}</section>
    </> : <>
      <div className="country-scope-note"><b>{countryName} selected.</b> The cards above use globally comparable live series. India-specific HCES, PLFS, RBI state-income and NITI fiscal panels are hidden rather than mixed into another country’s view.</div>
      <section className="econ-panel econ-world-panel"><div className="econ-panel-head"><div><span className="section-kicker">Country context</span><h2>Per-capita GDP is useful — but incomplete</h2></div><SourceLink href={live.gdpPerCapita?.sourceUrl || sourceLinks.worldBank}>World Bank</SourceLink></div><div className="econ-world-compare"><div><span>{countryName}</span><strong>{live.gdpPerCapita?.value != null ? `$${Math.round(Number(live.gdpPerCapita.value)).toLocaleString()}` : '—'}</strong><small>{live.gdpPerCapita?.period || 'latest available'} · current US$</small></div><div><span>Inflation</span><strong>{live.inflation?.value != null ? `${Number(live.inflation.value).toFixed(1)}%` : '—'}</strong><small>{live.inflation?.period || 'latest available'}</small></div></div></section>
    </>}

    <section className="econ-way-forward"><div><span className="section-kicker">What CurioLens should ask next</span><h2>Growth for whom?</h2></div><div className="econ-forward-grid"><div><b>Jobs</b><span>Are new jobs regular, casual or self-employed?</span></div><div><b>Pay</b><span>Are wages rising faster than prices?</span></div><div><b>Consumption</b><span>Can households buy more than before?</span></div><div><b>Regions</b><span>Which places are closing income gaps?</span></div><div><b>Women</b><span>Are women participating in paid work and earning equally?</span></div><div><b>Distribution</b><span>Who receives the gains from growth?</span></div></div></section>
  </div>;
}
