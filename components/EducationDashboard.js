'use client';

import { useEffect, useMemo, useState } from 'react';
import { IndiaBenchmarkMap, StateDistrictMap, WorldEducationMap, STATE_SLUGS } from './EducationMaps';
import SmartSelect from './SmartSelect';

const ALL_STATES = Object.keys(STATE_SLUGS);
const BENCHMARKS = ['Punjab','Kerala','Himachal Pradesh','Tamil Nadu','Maharashtra'];

const SOURCES = {
  census: { name: 'Census of India', href: 'https://censusindia.gov.in/', period: 'Population & literacy' },
  udise: { name: 'UDISE+ 2023-24', href: 'https://www.education.gov.in/sites/upload_files/mhrd/files/statistics-new/udise_report_nep_23_24.pdf', period: 'School education' },
  aishe: { name: 'AISHE', href: 'https://aishe.gov.in/', period: 'Higher education' },
  worldBank: { name: 'World Bank', href: 'https://data.worldbank.org/topic/education', period: 'Global comparison' },
};

// Benchmark-only context for indicators that are not yet available nationwide from the connected API.
const STATE_DATA = {
  Bihar: { literacy: 62, girls: 49, secondary: 52, higherEd: 14 },
  Punjab: { literacy: 77, girls: 52, secondary: 78, higherEd: 28 },
  Kerala: { literacy: 96, girls: 49, secondary: 83, higherEd: 32 },
  'Himachal Pradesh': { literacy: 84, girls: 48, secondary: 74, higherEd: 26 },
  'Tamil Nadu': { literacy: 80, girls: 51, secondary: 77, higherEd: 27 },
  Maharashtra: { literacy: 82, girls: 48, secondary: 73, higherEd: 24 },
};

const METRICS = [
  { key: 'literacy', label: 'Can read and write', formal: 'Literacy rate', suffix: '%', plain: 'Out of every 100 people, about how many can read and write.', max: 100, better: 'higher', source: SOURCES.census },
  { key: 'ptr', label: 'Students per teacher', formal: 'Pupil–teacher ratio', suffix: '', plain: 'About how many students share one teacher. Lower usually means more teacher time per student.', max: 40, better: 'lower', source: SOURCES.udise },
  { key: 'girls', label: 'Girls among students', formal: 'Share of girls enrolled', suffix: '%', plain: 'Out of every 100 enrolled students, about how many are girls.', max: 100, better: 'higher', source: SOURCES.udise },
  { key: 'secondary', label: 'Finish secondary school', formal: 'Secondary completion', suffix: '%', plain: 'About how many students reach the end of secondary school.', max: 100, better: 'higher', source: SOURCES.udise },
  { key: 'higherEd', label: 'Continue to college', formal: 'Higher-education GER', suffix: '%', plain: 'How many young people in the college-age group are enrolled in higher education.', max: 50, better: 'higher', source: SOURCES.aishe },
];

const SNAPSHOTS = [
  { key: 'schools', label: 'Schools', note: 'Recognised schools', source: SOURCES.udise },
  { key: 'students', label: 'Students', note: 'Children enrolled', source: SOURCES.udise },
  { key: 'teachers', label: 'Teachers', note: 'Teachers in schools', source: SOURCES.udise },
  { key: 'ptr', label: 'Students per teacher', note: 'Pupil-teacher ratio', source: SOURCES.udise },
  { key: 'avgStudentsPerSchool', label: 'Students per school', note: 'Average enrolment per school', source: SOURCES.udise },
  { key: 'avgTeachersPerSchool', label: 'Teachers per school', note: 'Average teachers per school', source: SOURCES.udise },
];

const WORLD_INSIGHTS = {
  Estonia: {
    metric: '85% reached baseline maths proficiency in PISA 2022',
    copy: 'Estonia combines strong learning outcomes with substantial school-level responsibility. India could study teacher support, school autonomy and early identification of learning gaps rather than copy a single policy.',
    source: { name: 'OECD · PISA 2022 Estonia', href: 'https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/estonia_dafed886-en.html', period: '2022' }
  },
  Finland: {
    metric: 'Master’s-level preparation is the standard for most teachers',
    copy: 'Finland treats teaching as a highly trained profession with strong pedagogical and research preparation. India could study deeper pre-service training, mentoring and continuing professional learning.',
    source: { name: 'OECD · Teacher Professional Learning', href: 'https://www.oecd.org/en/publications/teacher-professional-learning_0cceeddf-en/full-report/summary-of-education-systems_0d050321.html', period: 'Finland profile' }
  },
  Switzerland: {
    metric: 'About 9 in 10 upper-secondary VET students are apprentices',
    copy: 'Switzerland connects vocational education closely with employers and paid workplace learning. India could study stronger school-to-work pathways, employer partnerships and recognised apprenticeships.',
    source: { name: 'OECD · VET in Switzerland', href: 'https://www.oecd.org/en/publications/vocational-education-and-training-systems-in-nine-countries_1a86eb6c-en/full-report/vocational-education-and-training-in-switzerland_051e4a43.html', period: '2025 review' }
  },
  Vietnam: {
    metric: 'Strong learning despite lower income per person',
    copy: 'Vietnam is useful for studying learning expectations, teacher support and system focus in a large lower-middle-income context.',
    source: SOURCES.worldBank
  },
  India: { metric: 'National baseline', copy: 'Use India as context before comparing internationally. Country examples are prompts for investigation, not copy-and-paste policy prescriptions.', source: SOURCES.worldBank },
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

function CompactMetricCard({ item, data, live, contextLabel }) {
  return <article className="compact-metric-card"><div className="compact-metric-top"><span>{item.label}</span><strong>{formatValue(item.key, data?.[item.key], item.suffix || '')}</strong><p>{contextLabel || item.note}</p></div><CompactSource source={item.source} live={live && data?.[item.key] !== undefined}/></article>;
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
  const [division, setDivision] = useState('All divisions');
  const [divisions, setDivisions] = useState([]);
  const [district, setDistrict] = useState('All districts');
  const [districts, setDistricts] = useState(['All districts']);
  const [districtStatus, setDistrictStatus] = useState('loading');
  const [metricKey, setMetricKey] = useState('ptr');
  const [country, setCountry] = useState('Vietnam');
  const [liveMetrics, setLiveMetrics] = useState({});
  const [dataStatus, setDataStatus] = useState('idle');
  const [apiMeta, setApiMeta] = useState({});

  useEffect(() => {
    let alive = true;
    setDivision('All divisions');
    setDivisions([]);
    setDistrict('All districts');
    setDistricts(['All districts']);
    setDistrictStatus('loading');
    fetch(`/api/geography?state=${encodeURIComponent(focusState)}`).then(async (r) => {
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw body;
      return body;
    }).then((body) => {
      if (!alive) return;
      const divisionNames = (body.divisions || []).map((item) => item.name).filter(Boolean);
      const names = Array.from(new Set((body.districts || []).filter(Boolean))).sort((a,b) => a.localeCompare(b));
      setDivisions(divisionNames);
      setDistricts(['All districts', ...names]);
      setDistrictStatus(names.length ? 'ready' : 'error');
    }).catch(() => alive && setDistrictStatus('error'));
    return () => { alive = false; };
  }, [focusState]);

  useEffect(() => {
    if (division === 'All divisions') return;
    let alive = true;
    setDistrict('All districts');
    setDistricts(['All districts']);
    setDistrictStatus('loading');
    fetch(`/api/geography?state=${encodeURIComponent(focusState)}&division=${encodeURIComponent(division)}`).then(async (r) => {
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw body;
      return body;
    }).then((body) => {
      if (!alive) return;
      const names = Array.from(new Set((body.districts || []).filter(Boolean))).sort((a,b) => a.localeCompare(b));
      setDistricts(['All districts', ...names]);
      setDistrictStatus(names.length ? 'ready' : 'error');
    }).catch(() => alive && setDistrictStatus('error'));
    return () => { alive = false; };
  }, [focusState, division]);

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams({ state: focusState });
    if (division !== 'All divisions') params.set('division', division);
    if (district !== 'All districts') params.set('district', district);
    setDataStatus('loading');
    setLiveMetrics({});
    setApiMeta({});
    fetch(`/api/education?${params.toString()}`).then(async (r) => {
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw body;
      return body;
    }).then((body) => {
      if (!alive) return;
      const metrics = normaliseApiPayload(body);
      setApiMeta({ geographyLevel: body.geographyLevel, stateFallback: body.stateFallback, message: body.message });
      setLiveMetrics(Object.fromEntries(Object.entries(metrics).filter(([,value]) => value !== undefined)));
      setDataStatus(Object.values(metrics).some((value) => value !== undefined) ? 'ready' : 'empty');
    }).catch(() => alive && setDataStatus('empty'));
    return () => { alive = false; };
  }, [focusState, division, district]);

  const isStateView = division === 'All divisions' && district === 'All districts';
  const isDivisionView = division !== 'All divisions' && district === 'All districts';
  const stateFallback = apiMeta.stateFallback || {};
  const usesStateContext = !isStateView && Object.keys(liveMetrics).length === 0 && Object.keys(stateFallback).length > 0;
  const displayData = usesStateContext ? { ...stateFallback } : { ...liveMetrics };
  const hasLive = Object.keys(liveMetrics).length > 0;
  const metric = METRICS.find((m) => m.key === metricKey) || METRICS[0];
  const worldInsight = WORLD_INSIGHTS[country] || WORLD_INSIGHTS.India;
  const locationLabel = isStateView ? `${focusState} · state overview` : isDivisionView ? `${division}, ${focusState}` : `${district}, ${focusState}`;

  const gapRows = useMemo(() => METRICS.map((m) => {
    const value = displayData[m.key];
    const peers = BENCHMARKS.map((name) => STATE_DATA[name]?.[m.key]).filter((v) => v !== undefined);
    if (value === undefined || !peers.length) return { ...m, gap: undefined };
    const avg = Math.round(peers.reduce((sum,v) => sum + v,0) / peers.length);
    return { ...m, gap: m.better === 'lower' ? value - avg : avg - value };
  }), [displayData]);

  return <div className="education-dashboard-full education-v132">
    <section className="edu-toolbar edu-toolbar-simple">
      <div className="toolbar-intro"><span className="section-tag">Explore education</span><h2>Choose a place</h2><p>Start with a state. Where a stable division layer exists, you can narrow by division before choosing a district.</p></div>
      <div className="toolbar-controls toolbar-controls-simple">
        <SmartSelect label="State" value={focusState} options={ALL_STATES} onChange={setFocusState}/>
        {divisions.length > 0 && <SmartSelect label="Division" value={division} options={['All divisions', ...divisions]} onChange={setDivision}/>}
        <SmartSelect label="District" value={district} options={districts} onChange={setDistrict} disabled={districtStatus === 'loading'}/>
      </div>
      <div className="education-location-status"><strong>{locationLabel}</strong><span>{dataStatus === 'loading' ? 'Checking official education data…' : hasLive ? (apiMeta.geographyLevel === 'district' ? 'District-level source data returned for this selection.' : 'Official UDISE+ state data loaded for this selection.') : (!isStateView && Object.keys(stateFallback).length ? 'District-specific values are not available for this metric yet. Showing clearly labelled state-level UDISE+ context instead.' : 'No source-backed metric returned yet. CurioLens will not substitute another state’s value.')}</span></div>
    </section>

    <section className="snapshot-section-v132">
      <div className="snapshot-section-head"><div><span className="section-tag">At a glance</span><h2>{isStateView ? focusState : isDivisionView ? division : district}</h2></div><span>{isStateView ? 'State view' : isDivisionView ? `${focusState} · Division view` : `${focusState} · District view`}</span></div>
      <div className="compact-metric-grid">{SNAPSHOTS.map((item) => <CompactMetricCard key={item.key} item={item} data={displayData} live={hasLive || usesStateContext} contextLabel={usesStateContext ? `${focusState} state context · district figure unavailable` : undefined}/>)}</div>
    </section>

    <section className="primary-data-grid" id="compare">
      <article className="data-visual-panel comparison-panel"><div className="panel-topline"><div><span className="section-tag">Compare simply</span><h2>{focusState} vs benchmark states</h2><p>One indicator at a time. Missing official values stay blank instead of being guessed.</p></div><SmartSelect className="inline-select" label="Question" value={metricKey} options={METRICS.map((m) => ({value:m.key,label:m.label}))} onChange={setMetricKey}/></div><StateComparisonChart metricKey={metricKey} focusState={focusState} focusData={displayData}/><CompactSource source={metric.source} live={hasLive && displayData[metric.key] !== undefined}/></article>
      <article className="data-visual-panel meaning-panel"><span className="section-tag">What does this mean?</span><h2>{metric.label}</h2><div className="meaning-number">{formatValue(metric.key,displayData[metric.key],metric.suffix)}</div><p>{metric.plain}</p><div className="meaning-rule"><span>For {locationLabel}</span><strong>{displayData[metric.key] === undefined ? 'This metric is not connected for the selected geography yet.' : 'Use this number with the comparison and source year before drawing a conclusion.'}</strong></div><details className="learn-term"><summary>Learn the official term</summary><p><b>{metric.formal}</b> is the technical label used in many official datasets.</p></details><CompactSource source={metric.source} live={hasLive && displayData[metric.key] !== undefined}/></article>
    </section>

    <section className="map-layout-grid" id="maps"><IndiaBenchmarkMap focusState={focusState} onStateSelect={setFocusState} benchmarkStates={BENCHMARKS}/><StateDistrictMap state={focusState} district={district} onDistrictSelect={(name) => districts.includes(name) && setDistrict(name)}/></section>

    <section className="world-section-grid"><WorldEducationMap activeCountry={country} onCountrySelect={(name) => WORLD_INSIGHTS[name] && setCountry(name)} countries={Object.keys(WORLD_INSIGHTS)}/><aside className="world-insight-panel"><span className="section-tag">Ideas worth studying</span><h2>{country}</h2><strong>{worldInsight.metric}</strong><p>{worldInsight.copy}</p><div className="policy-note"><b>Could India use this?</b><span>Study the mechanism and evidence first, then test it in Indian state and district conditions.</span></div><div className="country-buttons">{Object.keys(WORLD_INSIGHTS).filter((c) => c !== 'India').map((c) => <button className={country === c ? 'active' : ''} key={c} onClick={() => setCountry(c)}>{c}</button>)}</div><CompactSource source={worldInsight.source || SOURCES.worldBank} live/></aside></section>

    <section className="bottom-insight-grid"><article className="insight-card"><span className="section-tag">Where are the gaps?</span><h2>{focusState} vs available benchmarks</h2><div className="gap-list-modern">{gapRows.map((g) => <div key={g.key}><div><span>{g.label}</span><strong>{g.gap === undefined ? '—' : `${g.gap > 0 ? '+' : ''}${g.gap}${g.key === 'ptr' ? '' : ' pp'}`}</strong></div><div className="gap-rail"><i style={{width:g.gap === undefined ? '0%' : `${Math.min(100,Math.abs(g.gap)*3)}%`}}/></div></div>)}</div></article><article className="insight-card"><span className="section-tag">What could help?</span><h2>Questions worth investigating</h2><ol className="way-forward-list"><li><b>Teacher availability</b><span>Where are classrooms most crowded?</span></li><li><b>Secondary transition</b><span>Where are students leaving before Classes 10–12?</span></li><li><b>Girls’ participation</b><span>Where do persistent participation gaps remain?</span></li><li><b>Learning outcomes</b><span>Are students learning what their grade expects?</span></li></ol></article></section>

    <div className="data-integrity-note"><strong>Data integrity first.</strong> Every State/UT loads its districts through the CurioLens geography API. Division is optional because India does not use one uniform division layer nationwide. Official UDISE+ 2023-24 state data is shown for every State/UT; when a finer geography has no verified metric, CurioLens shows the state figure only as clearly labelled state context.</div>
  </div>;
}
