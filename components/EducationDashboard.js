'use client';

import { useEffect, useMemo, useState } from 'react';
import { IndiaBenchmarkMap, StateDistrictMap, WorldEducationMap, STATE_SLUGS, stateDistrictGeoJsonUrl, featureName } from './EducationMaps';
import SmartSelect from './SmartSelect';

const ALL_STATES = Object.keys(STATE_SLUGS);
const BENCHMARKS = ['Punjab','Kerala','Himachal Pradesh','Tamil Nadu','Maharashtra'];

const SOURCES = {
  census: { name: 'Census of India', href: 'https://censusindia.gov.in/', period: 'Population & literacy' },
  udise: { name: 'UDISE+', href: 'https://www.education.gov.in/udise-plus', period: 'School education' },
  aishe: { name: 'AISHE', href: 'https://aishe.gov.in/', period: 'Higher education' },
  worldBank: { name: 'World Bank', href: 'https://data.worldbank.org/topic/education', period: 'Global comparison' },
};

// Prototype values remain only for the original benchmark set. They are never shown as district values.
const STATE_DATA = {
  Bihar: { literacy: 62, ptr: 30, girls: 49, secondary: 52, higherEd: 14, population: '13.1 cr', schools: '1.2 lakh', students: '2.4 cr', teachers: '8.1 lakh' },
  Punjab: { literacy: 77, ptr: 18, girls: 52, secondary: 78, higherEd: 28 },
  Kerala: { literacy: 96, ptr: 16, girls: 49, secondary: 83, higherEd: 32 },
  'Himachal Pradesh': { literacy: 84, ptr: 17, girls: 48, secondary: 74, higherEd: 26 },
  'Tamil Nadu': { literacy: 80, ptr: 20, girls: 51, secondary: 77, higherEd: 27 },
  Maharashtra: { literacy: 82, ptr: 22, girls: 48, secondary: 73, higherEd: 24 },
};

const METRICS = [
  { key: 'literacy', label: 'Can read and write', formal: 'Literacy rate', suffix: '%', plain: 'Out of every 100 people, about how many can read and write.', max: 100, better: 'higher', source: SOURCES.census },
  { key: 'ptr', label: 'Students per teacher', formal: 'Pupil–teacher ratio', suffix: '', plain: 'About how many students share one teacher. Lower usually means more teacher time per student.', max: 40, better: 'lower', source: SOURCES.udise },
  { key: 'girls', label: 'Girls among students', formal: 'Share of girls enrolled', suffix: '%', plain: 'Out of every 100 enrolled students, about how many are girls.', max: 100, better: 'higher', source: SOURCES.udise },
  { key: 'secondary', label: 'Finish secondary school', formal: 'Secondary completion', suffix: '%', plain: 'About how many students reach the end of secondary school.', max: 100, better: 'higher', source: SOURCES.udise },
  { key: 'higherEd', label: 'Continue to college', formal: 'Higher-education GER', suffix: '%', plain: 'How many young people in the college-age group are enrolled in higher education.', max: 50, better: 'higher', source: SOURCES.aishe },
];

const SNAPSHOTS = [
  { key: 'population', label: 'Population', note: 'People living here', source: SOURCES.census },
  { key: 'schools', label: 'Schools', note: 'Recognised schools', source: SOURCES.udise },
  { key: 'students', label: 'Students', note: 'Children enrolled', source: SOURCES.udise },
  { key: 'teachers', label: 'Teachers', note: 'Teachers in schools', source: SOURCES.udise },
  { key: 'literacy', label: 'Can read and write', note: 'Literacy', source: SOURCES.census, suffix: '%' },
  { key: 'girls', label: 'Girls among students', note: 'Share of students', source: SOURCES.udise, suffix: '%' },
];

const WORLD_INSIGHTS = {
  Vietnam: { metric: 'Strong school completion', copy: 'Study teacher support, learning expectations and completion.' },
  Bangladesh: { metric: 'Girls’ participation', copy: 'Study access, incentives and community support.' },
  Indonesia: { metric: 'Large diverse system', copy: 'Study how a decentralised system manages local variation.' },
  China: { metric: 'System scale', copy: 'Study teacher deployment and school networks at scale.' },
  Brazil: { metric: 'Local governance', copy: 'Study local delivery and regional variation.' },
  India: { metric: 'National baseline', copy: 'Use India as context before comparing internationally.' },
};

const cleanKey = (value = '') => value.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
const numeric = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string') return undefined;
  const parsed = Number(value.replace(/,/g, '').match(/-?\d+(\.\d+)?/)?.[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
};

function extractMetric(record, patterns) {
  if (!record || typeof record !== 'object') return undefined;
  const entries = Object.entries(record);
  for (const pattern of patterns) {
    const found = entries.find(([key]) => pattern.test(cleanKey(key)));
    const value = numeric(found?.[1]);
    if (value !== undefined) return value;
  }
  return undefined;
}

function normaliseApiPayload(payload) {
  if (!payload || typeof payload !== 'object') return {};
  if (payload.metrics && typeof payload.metrics === 'object') return payload.metrics;
  if (payload.data?.metrics && typeof payload.data.metrics === 'object') return payload.data.metrics;
  const record = payload.records?.[0] || payload.data?.records?.[0] || payload.data?.[0] || null;
  if (!record) return {};
  return {
    population: extractMetric(record, [/population/, /totalpopulation/]),
    schools: extractMetric(record, [/numberofschool/, /totalschools/, /schooltotal/]),
    students: extractMetric(record, [/enrolmenttotal/, /totalenrol/, /students/]),
    teachers: extractMetric(record, [/totalteacher/, /numberofteacher/, /teachers/]),
    literacy: extractMetric(record, [/literacyrate/, /literacy/]),
    girls: extractMetric(record, [/girl.*share/, /female.*enrol/, /girls/]),
    ptr: extractMetric(record, [/pupilteacherratio/, /ptr/]),
    secondary: extractMetric(record, [/secondarycompletion/, /completionsecondary/]),
    higherEd: extractMetric(record, [/higher.*ger/, /grossenrolmentratio/]),
  };
}

function formatValue(key, value, suffix = '') {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'string') return value;
  if (['population','schools','students','teachers'].includes(key)) return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value);
  return `${Math.round(value * 10) / 10}${suffix}`;
}

function CompactSource({ source, live }) {
  return <div className="compact-source"><span>{live ? source.name : `Planned: ${source.name}`}</span><a href={source.href} target="_blank" rel="noreferrer">Verify ↗</a></div>;
}

function CompactMetricCard({ item, data, live }) {
  return <article className="compact-metric-card"><div className="compact-metric-top"><span>{item.label}</span><strong>{formatValue(item.key, data?.[item.key], item.suffix || '')}</strong><p>{item.note}</p></div><CompactSource source={item.source} live={live && data?.[item.key] !== undefined}/></article>;
}

function StateComparisonChart({ metricKey, focusState, focusData }) {
  const metric = METRICS.find((m) => m.key === metricKey) || METRICS[0];
  const names = Array.from(new Set([focusState, ...BENCHMARKS, 'Bihar']));
  const rows = names.map((name) => ({ name, value: name === focusState ? focusData?.[metric.key] : STATE_DATA[name]?.[metric.key] })).filter((row) => row.value !== undefined);
  if (!rows.length) return <div className="comparison-empty">No comparable value is connected for this indicator yet.</div>;
  const sorted = [...rows].sort((a,b) => metric.better === 'lower' ? a.value - b.value : b.value - a.value);
  const peers = rows.filter((row) => row.name !== focusState);
  const peerAvg = peers.length ? Math.round(peers.reduce((sum,row) => sum + row.value,0) / peers.length) : undefined;
  const focus = rows.find((row) => row.name === focusState);
  const best = sorted[0];
  const maxValue = Math.max(...rows.map((row) => row.value), metric.max || 0);
  const gap = focus && peerAvg !== undefined ? (metric.better === 'lower' ? focus.value - peerAvg : peerAvg - focus.value) : undefined;
  return <div className="comparison-modern" role="img" aria-label={`${metric.formal} comparison`}>
    <div className="comparison-summary compact-comparison-summary">
      <div className="comparison-summary-card focus"><span>{focusState}</span><strong>{focus ? `${focus.value}${metric.suffix}` : '—'}</strong><small>Selected state</small></div>
      <div className="comparison-summary-card"><span>Peer average</span><strong>{peerAvg !== undefined ? `${peerAvg}${metric.suffix}` : '—'}</strong><small>Available benchmark values</small></div>
      <div className="comparison-summary-card"><span>Best available</span><strong>{best?.name || '—'}</strong><small>{best ? `${best.value}${metric.suffix}` : ''}</small></div>
      <div className="comparison-summary-card"><span>Gap</span><strong>{gap === undefined ? '—' : `${gap > 0 ? '+' : ''}${gap}${metric.key === 'ptr' ? '' : ' pp'}`}</strong><small>To peer average</small></div>
    </div>
    <div className="state-rank-list compact-rank-list">{sorted.map((row,index) => <div className={`state-rank-row ${row.name === focusState ? 'is-bihar' : ''}`} key={row.name}><div className="state-rank-meta"><span className="rank-no">{index + 1}</span><strong>{row.name}</strong><span className="rank-value">{row.value}{metric.suffix}</span></div><div className="state-rank-track"><i style={{width:`${Math.max(8,(row.value/maxValue)*100)}%`}}/></div></div>)}</div>
  </div>;
}

export default function EducationDashboard() {
  const [focusState, setFocusState] = useState('Bihar');
  const [district, setDistrict] = useState('All districts');
  const [districts, setDistricts] = useState(['All districts']);
  const [districtStatus, setDistrictStatus] = useState('loading');
  const [metricKey, setMetricKey] = useState('literacy');
  const [country, setCountry] = useState('Vietnam');
  const [liveMetrics, setLiveMetrics] = useState({});
  const [dataStatus, setDataStatus] = useState('idle');

  useEffect(() => {
    let alive = true;
    const url = stateDistrictGeoJsonUrl(focusState);
    setDistrict('All districts');
    setDistricts(['All districts']);
    if (!url) { setDistrictStatus('error'); return () => {}; }
    setDistrictStatus('loading');
    fetch(url).then((r) => {
      if (!r.ok) throw new Error('District list failed');
      return r.json();
    }).then((json) => {
      if (!alive) return;
      const names = Array.from(new Set((json.features || []).map(featureName).filter((name) => name && name !== 'Unknown'))).sort((a,b) => a.localeCompare(b));
      setDistricts(['All districts', ...names]);
      setDistrictStatus('ready');
    }).catch(() => alive && setDistrictStatus('error'));
    return () => { alive = false; };
  }, [focusState]);

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams({ state: focusState });
    if (district !== 'All districts') params.set('district', district);
    setDataStatus('loading');
    setLiveMetrics({});
    fetch(`/api/education?${params.toString()}`).then(async (r) => {
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw body;
      return body;
    }).then((body) => {
      if (!alive) return;
      const metrics = normaliseApiPayload(body);
      setLiveMetrics(Object.fromEntries(Object.entries(metrics).filter(([,value]) => value !== undefined)));
      setDataStatus(Object.values(metrics).some((value) => value !== undefined) ? 'ready' : 'empty');
    }).catch(() => alive && setDataStatus('empty'));
    return () => { alive = false; };
  }, [focusState, district]);

  const isStateView = district === 'All districts';
  const fallback = isStateView ? (STATE_DATA[focusState] || {}) : {};
  const displayData = { ...fallback, ...liveMetrics };
  const hasLive = Object.keys(liveMetrics).length > 0;
  const metric = METRICS.find((m) => m.key === metricKey) || METRICS[0];
  const worldInsight = WORLD_INSIGHTS[country] || WORLD_INSIGHTS.India;
  const locationLabel = isStateView ? `${focusState} · state overview` : `${district}, ${focusState}`;

  const gapRows = useMemo(() => METRICS.map((m) => {
    const value = displayData[m.key];
    const peers = BENCHMARKS.map((name) => STATE_DATA[name]?.[m.key]).filter((v) => v !== undefined);
    if (value === undefined || !peers.length) return { ...m, gap: undefined };
    const avg = Math.round(peers.reduce((sum,v) => sum + v,0) / peers.length);
    return { ...m, gap: m.better === 'lower' ? value - avg : avg - value };
  }), [displayData]);

  return <div className="education-dashboard-full education-v132">
    <section className="edu-toolbar edu-toolbar-simple">
      <div className="toolbar-intro"><span className="section-tag">Explore education</span><h2>Choose a place</h2><p>Start with a state. Pick a district only when you want a closer view.</p></div>
      <div className="toolbar-controls toolbar-controls-simple">
        <SmartSelect label="State" value={focusState} options={ALL_STATES} onChange={setFocusState}/>
        <SmartSelect label="District" value={district} options={districts} onChange={setDistrict} disabled={districtStatus === 'loading'}/>
      </div>
      <div className="education-location-status"><strong>{locationLabel}</strong><span>{dataStatus === 'loading' ? 'Checking connected official data…' : hasLive ? 'Connected source data returned for this selection.' : isStateView && STATE_DATA[focusState] ? 'Prototype state values shown while official source mapping is completed.' : 'No source-backed metric returned yet. CurioLens will not substitute another state’s value.'}</span></div>
    </section>

    <section className="snapshot-section-v132">
      <div className="snapshot-section-head"><div><span className="section-tag">At a glance</span><h2>{isStateView ? focusState : district}</h2></div><span>{isStateView ? 'State view' : `${focusState} · District view`}</span></div>
      <div className="compact-metric-grid">{SNAPSHOTS.map((item) => <CompactMetricCard key={item.key} item={item} data={displayData} live={hasLive}/>)}</div>
    </section>

    <section className="primary-data-grid" id="compare">
      <article className="data-visual-panel comparison-panel"><div className="panel-topline"><div><span className="section-tag">Compare simply</span><h2>{focusState} vs benchmark states</h2><p>One indicator at a time. Missing official values stay blank instead of being guessed.</p></div><SmartSelect className="inline-select" label="Question" value={metricKey} options={METRICS.map((m) => ({value:m.key,label:m.label}))} onChange={setMetricKey}/></div><StateComparisonChart metricKey={metricKey} focusState={focusState} focusData={displayData}/><CompactSource source={metric.source} live={hasLive && displayData[metric.key] !== undefined}/></article>
      <article className="data-visual-panel meaning-panel"><span className="section-tag">What does this mean?</span><h2>{metric.label}</h2><div className="meaning-number">{formatValue(metric.key,displayData[metric.key],metric.suffix)}</div><p>{metric.plain}</p><div className="meaning-rule"><span>For {locationLabel}</span><strong>{displayData[metric.key] === undefined ? 'This metric is not connected for the selected geography yet.' : 'Use this number with the comparison and source year before drawing a conclusion.'}</strong></div><details className="learn-term"><summary>Learn the official term</summary><p><b>{metric.formal}</b> is the technical label used in many official datasets.</p></details><CompactSource source={metric.source} live={hasLive && displayData[metric.key] !== undefined}/></article>
    </section>

    <section className="map-layout-grid" id="maps"><IndiaBenchmarkMap focusState={focusState} onStateSelect={setFocusState} benchmarkStates={BENCHMARKS}/><StateDistrictMap state={focusState} district={district} onDistrictSelect={(name) => districts.includes(name) && setDistrict(name)}/></section>

    <section className="world-section-grid"><WorldEducationMap activeCountry={country} onCountrySelect={(name) => WORLD_INSIGHTS[name] && setCountry(name)} countries={Object.keys(WORLD_INSIGHTS)}/><aside className="world-insight-panel"><span className="section-tag">Ideas worth studying</span><h2>{country}</h2><strong>{worldInsight.metric}</strong><p>{worldInsight.copy}</p><div className="country-buttons">{Object.keys(WORLD_INSIGHTS).filter((c) => c !== 'India').map((c) => <button className={country === c ? 'active' : ''} key={c} onClick={() => setCountry(c)}>{c}</button>)}</div><CompactSource source={SOURCES.worldBank} live/></aside></section>

    <section className="bottom-insight-grid"><article className="insight-card"><span className="section-tag">Where are the gaps?</span><h2>{focusState} vs available benchmarks</h2><div className="gap-list-modern">{gapRows.map((g) => <div key={g.key}><div><span>{g.label}</span><strong>{g.gap === undefined ? '—' : `${g.gap > 0 ? '+' : ''}${g.gap}${g.key === 'ptr' ? '' : ' pp'}`}</strong></div><div className="gap-rail"><i style={{width:g.gap === undefined ? '0%' : `${Math.min(100,Math.abs(g.gap)*3)}%`}}/></div></div>)}</div></article><article className="insight-card"><span className="section-tag">What could help?</span><h2>Questions worth investigating</h2><ol className="way-forward-list"><li><b>Teacher availability</b><span>Where are classrooms most crowded?</span></li><li><b>Secondary transition</b><span>Where are students leaving before Classes 10–12?</span></li><li><b>Girls’ participation</b><span>Where do persistent participation gaps remain?</span></li><li><b>Learning outcomes</b><span>Are students learning what their grade expects?</span></li></ol></article></section>

    <div className="data-integrity-note"><strong>Data integrity first.</strong> Selection is nationwide, but CurioLens only displays a metric when it has a connected value for that geography. Prototype state values remain visibly marked until replaced by source-backed records.</div>
  </div>;
}
