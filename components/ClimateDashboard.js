'use client';

import { useMemo, useState } from 'react';
import UiIcon from './UiIcon';

const sources = {
  nasa: 'https://science.nasa.gov/earth/explore/earth-indicators/global-temperature/',
  noaaCo2: 'https://gml.noaa.gov/ccgg/trends/global.html',
  noaaMethane: 'https://gml.noaa.gov/ccgg/trends_ch4/',
  worldBank: 'https://data.worldbank.org/?locations=IN-1W',
  ipcc: 'https://www.ipcc.ch/report/ar6/wg3/chapter/summary-for-policymakers/',
  glacier: 'https://lib.icimod.org/records/3r7vr-r0x33',
  upState: 'https://moef.gov.in/uploads/2017/09/SAPCC_UP_final_version_0.pdf',
  methaneIndia: 'https://essd.copernicus.org/articles/18/1367/2026/index.html',
  powerStudy: 'https://doi.org/10.1126/science.abh1484',
};

const metricCards = [
  {
    icon: 'climate',
    label: 'Global surface temperature',
    value: '+1.19°C',
    year: '2025',
    explain: 'Earth was about 1.19°C warmer than NASA’s 1951–1980 average.',
    source: 'NASA GISS',
    href: sources.nasa,
    tone: 'warm',
  },
  {
    icon: 'environment',
    label: 'CO₂ in the atmosphere',
    value: '425.6 ppm',
    year: '2025 annual average',
    explain: 'For every million air molecules, about 426 were carbon dioxide.',
    source: 'NOAA State of the Climate',
    href: sources.noaaCo2,
    tone: 'mint',
  },
  {
    icon: 'climate',
    label: 'Methane in the atmosphere',
    value: '1,938 ppb',
    year: 'Mar 2026',
    explain: 'Methane is far less abundant than CO₂, but it traps much more heat molecule-for-molecule.',
    source: 'NOAA GML',
    href: sources.noaaMethane,
    tone: 'blue',
  },
  {
    icon: 'economy',
    label: 'CO₂ per person — India',
    value: '2.2 t',
    year: '2024',
    explain: 'India emits about 2.2 tonnes of CO₂ per person, below the world average of 4.7 tonnes.',
    source: 'World Bank',
    href: sources.worldBank,
    tone: 'purple',
  },
];

const inequality = [
  { group: 'Highest-emitting 10%', low: 34, high: 45, note: 'of household consumption-based GHG emissions' },
  { group: 'Middle 40%', low: 40, high: 53, note: 'of household consumption-based GHG emissions' },
  { group: 'Bottom 50%', low: 13, high: 15, note: 'of household consumption-based GHG emissions' },
];

const stateViews = {
  overall: {
    title: 'Overall GHG — historical state inventory',
    state: 'Uttar Pradesh',
    value: '~14%',
    detail: 'An older state climate inventory describes Uttar Pradesh as India’s highest-emitting state, contributing nearly 14% of national GHG emissions. State-comparable inventories are not updated every year, so the year and definition matter.',
    source: 'UP State Action Plan on Climate Change',
    href: sources.upState,
  },
  methane: {
    title: 'Methane — 2023 inventory',
    state: 'Uttar Pradesh',
    value: '10.8%',
    detail: 'A 2026 scientific inventory estimated Uttar Pradesh contributed the largest state share of India’s methane emissions in 2023.',
    source: 'Earth System Science Data',
    href: sources.methaneIndia,
  },
  power: {
    title: 'Power-sector carbon intensity — study',
    state: 'Jharkhand',
    value: '879 kg CO₂/MWh',
    detail: 'A peer-reviewed study found Jharkhand had the highest consumption-based electricity emission factor among the states modelled. This is intensity, not total emissions.',
    source: 'Science',
    href: sources.powerStudy,
  },
};

function SourceLink({ href, children = 'Check source' }) {
  return <a className="climate-source-link" href={href} target="_blank" rel="noreferrer">{children} ↗</a>;
}

export default function ClimateDashboard() {
  const [stateMetric, setStateMetric] = useState('overall');
  const selectedState = useMemo(() => stateViews[stateMetric], [stateMetric]);

  return (
    <div className="climate-data-dashboard">
      <section className="climate-metric-grid" aria-label="Key climate indicators">
        {metricCards.map((card) => (
          <article className={`climate-metric-card tone-${card.tone}`} key={card.label}>
            <div className="climate-metric-icon"><UiIcon name={card.icon} size={24} /></div>
            <div className="climate-metric-label">{card.label}</div>
            <strong>{card.value}</strong>
            <small>{card.year}</small>
            <p>{card.explain}</p>
            <div className="climate-metric-source"><span>{card.source}</span><SourceLink href={card.href} /></div>
          </article>
        ))}
      </section>

      <section className="climate-compare-row">
        <article className="climate-panel climate-percapita-panel">
          <div className="climate-panel-head">
            <div><span className="section-tag">India and the world</span><h2>How much CO₂ is emitted per person?</h2></div>
            <SourceLink href={sources.worldBank} children="World Bank data" />
          </div>
          <div className="percapita-bars" role="img" aria-label="India 2.2 tonnes CO2 per person, world 4.7 tonnes">
            <div className="percapita-row"><div><b>India</b><span>2.2 t/person</span></div><div className="percapita-track"><i style={{width:'47%'}} /></div></div>
            <div className="percapita-row world"><div><b>World</b><span>4.7 t/person</span></div><div className="percapita-track"><i style={{width:'100%'}} /></div></div>
          </div>
          <p className="climate-simple-note"><b>Read it simply:</b> India’s per-person CO₂ emissions are less than half the global average, while India’s total emissions are large because its population is large.</p>
        </article>

        <article className="climate-panel climate-inequality-panel">
          <div className="climate-panel-head">
            <div><span className="section-tag">Who emits most?</span><h2>Emissions are very unequal</h2></div>
            <SourceLink href={sources.ipcc} children="IPCC evidence" />
          </div>
          <div className="inequality-list">
            {inequality.map((item, i) => (
              <div className="inequality-row" key={item.group}>
                <div className="inequality-number">{i + 1}</div>
                <div className="inequality-copy"><b>{item.group}</b><span>{item.low}–{item.high}% {item.note}</span></div>
                <div className="inequality-range"><i style={{width:`${item.high}%`}} /></div>
              </div>
            ))}
          </div>
          <p className="climate-simple-note"><b>What this means:</b> the highest-emitting 10% of households produce roughly one-third to almost half of consumption-based household emissions globally.</p>
        </article>
      </section>

      <section className="climate-state-section">
        <div className="climate-panel-head climate-state-head">
          <div><span className="section-tag">India state view</span><h2>“Top emitter” depends on what you measure</h2><p>Choose a definition. CurioLens keeps the year and metric visible so unlike-for-like numbers are not mixed.</p></div>
          <div className="climate-segmented" role="group" aria-label="Choose state emissions metric">
            <button className={stateMetric === 'overall' ? 'active' : ''} onClick={() => setStateMetric('overall')}>Overall GHG</button>
            <button className={stateMetric === 'methane' ? 'active' : ''} onClick={() => setStateMetric('methane')}>Methane</button>
            <button className={stateMetric === 'power' ? 'active' : ''} onClick={() => setStateMetric('power')}>Power intensity</button>
          </div>
        </div>
        <div className="climate-state-card">
          <div className="climate-state-map" aria-hidden="true"><span>INDIA</span><i>State comparison</i></div>
          <div className="climate-state-copy">
            <small>{selectedState.title}</small>
            <h3>{selectedState.state}</h3>
            <strong>{selectedState.value}</strong>
            <p>{selectedState.detail}</p>
            <SourceLink href={selectedState.href} children={selectedState.source} />
          </div>
        </div>
      </section>

      <section className="climate-impact-grid">
        <article className="climate-impact-card glacier-card">
          <div className="impact-visual"><span>ICE</span><b>−12%</b></div>
          <div><span className="section-tag">Glaciers</span><h2>Hindu Kush Himalaya glacier area has shrunk</h2><p>A 2026 ICIMOD assessment reports a <b>12% reduction in glacier area from 1990 to 2020</b>. Less glacier ice changes seasonal water supply and can increase mountain hazards.</p><SourceLink href={sources.glacier} children="ICIMOD glacier report" /></div>
        </article>
        <article className="climate-impact-card gas-card">
          <div className="gas-stack"><span><b>CO₂</b><small>long-lived warming</small></span><span><b>CH₄</b><small>stronger near-term warming</small></span></div>
          <div><span className="section-tag">Greenhouse gases</span><h2>CO₂ and methane warm the planet differently</h2><p>CO₂ accumulates for centuries and drives most long-term warming. Methane is shorter-lived but much more powerful per molecule, so cutting methane can slow warming relatively quickly.</p><div className="source-pair"><SourceLink href={sources.noaaCo2} children="CO₂ data" /><SourceLink href={sources.noaaMethane} children="Methane data" /></div></div>
        </article>
      </section>

      <section className="climate-chain">
        <div><span className="section-tag">The CurioLens chain</span><h2>Connect the cause to the consequence</h2></div>
        <div className="climate-chain-steps">
          <span><b>1</b><strong>Emissions</strong><small>CO₂, methane, land use</small></span>
          <i>→</i>
          <span><b>2</b><strong>Warming</strong><small>Air, oceans, extremes</small></span>
          <i>→</i>
          <span><b>3</b><strong>Impacts</strong><small>Heat, glaciers, floods, crops</small></span>
          <i>→</i>
          <span><b>4</b><strong>Response</strong><small>Clean energy + adaptation</small></span>
        </div>
      </section>
    </div>
  );
}
