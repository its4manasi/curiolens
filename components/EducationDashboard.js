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
  { key: 'literacy', label: 'Can read and write', selectLabel: 'Literacy rate', formal: 'Literacy rate', suffix: '%', plain: 'Out of every 100 people, about how many can read and write.', max: 100, better: 'higher', source: SOURCES.census },
  { key: 'ptr', label: 'Students per teacher', selectLabel: 'Students per teacher', formal: 'Pupil–teacher ratio', suffix: '', plain: 'About how many students share one teacher. Lower usually means more teacher time per student.', max: 40, better: 'lower', source: SOURCES.udise },
  { key: 'girls', label: 'Girls among students', selectLabel: 'Girls’ participation', formal: 'Share of girls enrolled', suffix: '%', plain: 'Out of every 100 enrolled students, about how many are girls.', max: 100, better: 'higher', source: SOURCES.udise },
  { key: 'secondary', label: 'Finish secondary school', selectLabel: 'Secondary completion', formal: 'Secondary completion', suffix: '%', plain: 'About how many students reach the end of secondary school.', max: 100, better: 'higher', source: SOURCES.udise },
  { key: 'higherEd', label: 'Continue to college', selectLabel: 'Higher education participation', formal: 'Higher-education GER', suffix: '%', plain: 'How many young people in the college-age group are enrolled in higher education.', max: 50, better: 'higher', source: SOURCES.aishe },
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

const DEFAULT_WORLD_INSIGHT = {
  metric: 'Country selected',
  copy: 'CurioLens does not yet have a curated education case study for this country. Keep the selection visible and use the linked global sources for verified country-level indicators.',
  source: SOURCES.worldBank
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

function sourceFromMeta(meta, fallback) {
  if (!meta) return fallback;
  return {
    name: meta.source || fallback?.name || 'Official source',
    href: meta.sourceUrl || fallback?.href || '#',
    period: meta.period || fallback?.period || ''
  };
}

function CompactSource({ source, live, meta }) {
  const resolved = sourceFromMeta(meta, source);
  const label = live
    ? [resolved.name, meta?.period || resolved.period, meta?.latestAvailable ? 'latest available' : null].filter(Boolean).join(' · ')
    : `Planned: ${resolved.name}`;
  return <div className="compact-source"><span>{label}</span><a href={resolved.href} target="_blank" rel="noreferrer">Verify ↗</a></div>;
}

function CompactMetricCard({ item, data, live, meta, focusState }) {
  const contextLabel = meta?.isFallback ? `${focusState} state context · district/division figure unavailable` : item.note;
  return <article className="compact-metric-card"><div className="compact-metric-top"><span>{item.label}</span><strong>{formatValue(item.key, data?.[item.key], item.suffix || '')}</strong><p>{contextLabel}</p></div><CompactSource source={item.source} live={live && data?.[item.key] !== undefined} meta={meta}/></article>;
}

function StateComparisonChart({ metricKey, focusState, focusData, benchmarkRows = [] }) {
  const metric = METRICS.find((m) => m.key === metricKey) || METRICS[0];
  const liveRows = benchmarkRows
    .map((row) => ({ name: row.state || row.name, value: numeric(row.value) }))
    .filter((row) => row.name && row.value !== undefined);
  const fallbackRows = Object.entries(STATE_DATA)
    .map(([name, values]) => ({ name, value: values?.[metric.key] }))
    .filter((row) => row.value !== undefined);
  const sourceRows = liveRows.length ? liveRows : fallbackRows;
  const deduped = new Map(sourceRows.map((row) => [row.name, row]));
  if (focusData?.[metric.key] !== undefined) deduped.set(focusState, { name: focusState, value: focusData[metric.key] });
  const allRows = Array.from(deduped.values());
  if (!allRows.length) return <div className="comparison-empty">No comparable state values are connected for this indicator yet.</div>;
  const sortedAll = [...allRows].sort((a,b) => metric.better === 'lower' ? a.value - b.value : b.value - a.value);
  const topFive = sortedAll.slice(0, 5);
  const focus = allRows.find((row) => row.name === focusState);
  const visible = focus && !topFive.some((row) => row.name === focusState) ? [...topFive, focus] : topFive;
  const topFiveAvg = topFive.length ? Math.round((topFive.reduce((sum,row) => sum + row.value,0) / topFive.length) * 10) / 10 : undefined;
  const best = sortedAll[0];
  const maxValue = Math.max(...visible.map((row) => row.value), metric.max || 0);
  const gap = focus && topFiveAvg !== undefined ? (metric.better === 'lower' ? focus.value - topFiveAvg : topFiveAvg - focus.value) : undefined;
  return <div className="comparison-modern" role="img" aria-label={`${metric.formal} comparison`}>
    <div className="comparison-summary compact-comparison-summary">
      <div className="comparison-summary-card focus"><span>{focusState}</span><strong>{focus ? `${focus.value}${metric.suffix}` : '—'}</strong><small>Selected state</small></div>
      <div className="comparison-summary-card"><span>Top-5 average</span><strong>{topFiveAvg !== undefined ? `${topFiveAvg}${metric.suffix}` : '—'}</strong><small>Best five available states</small></div>
      <div className="comparison-summary-card"><span>Best available</span><strong>{best?.name || '—'}</strong><small>{best ? `${best.value}${metric.suffix}` : ''}</small></div>
      <div className="comparison-summary-card"><span>Gap</span><strong>{gap === undefined ? '—' : `${gap > 0 ? '+' : ''}${Math.round(gap * 10) / 10}${metric.key === 'ptr' ? '' : ' pp'}`}</strong><small>To top-5 average</small></div>
    </div>
    <div className="state-rank-list compact-rank-list">{visible.map((row,index) => <div className={`state-rank-row ${row.name === focusState ? 'is-focus' : ''}`} key={row.name}><div className="state-rank-meta"><span className="rank-no">{sortedAll.findIndex((item) => item.name === row.name) + 1}</span><strong>{row.name}</strong><span className="rank-value">{row.value}{metric.suffix}</span></div><div className="state-rank-track"><i style={{width:`${Math.max(8,(row.value/maxValue)*100)}%`}}/></div></div>)}</div>
    <p className="benchmark-footnote">Top five is calculated from every state value currently available for this metric. The selected state is also shown even when it is outside the top five.</p>
  </div>;
}

export default function EducationDashboard() {
  const [focusState, setFocusState] = useState('Bihar');
  const [district, setDistrict] = useState('All districts');
  const [districts, setDistricts] = useState(['All districts']);
  const [districtStatus, setDistrictStatus] = useState('loading');
  const [metricKey, setMetricKey] = useState('ptr');
  const [country, setCountry] = useState('Vietnam');
  const [liveMetrics, setLiveMetrics] = useState({});
  const [dataStatus, setDataStatus] = useState('idle');
  const [apiMeta, setApiMeta] = useState({});
  const [benchmarkRows, setBenchmarkRows] = useState([]);
  const [localBodyLens, setLocalBodyLens] = useState('District evidence');

  useEffect(() => {
    let alive = true;
    setDistrict('All districts');
    setDistricts(['All districts']);
    setDistrictStatus('loading');
    fetch(`/api/geography?state=${encodeURIComponent(focusState)}`).then(async (r) => {
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
  }, [focusState]);


  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams({ state: focusState });
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
      setApiMeta({ geographyLevel: body.geographyLevel, requestedGeographyLevel: body.requestedGeographyLevel, metricMeta: body.metricMeta || {}, stateContext: body.stateContext || null, message: body.message, dataPolicy: body.dataPolicy, manifestUpdated: body.manifestUpdated });
      setLiveMetrics(Object.fromEntries(Object.entries(metrics).filter(([,value]) => value !== undefined)));
      setDataStatus(Object.values(metrics).some((value) => value !== undefined) ? 'ready' : 'empty');
    }).catch(() => alive && setDataStatus('empty'));
    return () => { alive = false; };
  }, [focusState]);


  useEffect(() => {
    let alive = true;
    fetch(`/api/education?benchmark=1&metric=${encodeURIComponent(metricKey)}`)
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw body;
        return body;
      })
      .then((body) => { if (alive) setBenchmarkRows(Array.isArray(body.rows) ? body.rows : []); })
      .catch(() => alive && setBenchmarkRows([]));
    return () => { alive = false; };
  }, [metricKey]);

  const metricMeta = apiMeta.metricMeta || {};
  const displayData = { ...liveMetrics };
  const hasLive = Object.keys(liveMetrics).length > 0;
  const metric = METRICS.find((m) => m.key === metricKey) || METRICS[0];
  const worldInsight = WORLD_INSIGHTS[country] || DEFAULT_WORLD_INSIGHT;
  const locationLabel = `${focusState} · state overview`;
  const localSelection = district !== 'All districts' ? `${district}, ${focusState}` : focusState;


  return <div className="education-dashboard-full education-v132">
    <section className="edu-toolbar edu-toolbar-simple">
      <div className="toolbar-intro"><span className="section-tag">Explore education</span><h2>Choose a state</h2><p>The main education dashboard stays at state level because that is where the connected UDISE+ metrics are consistently comparable. District and local-body exploration lives further down the page.</p></div>
      <div className="toolbar-controls toolbar-controls-state-only">
        <SmartSelect label="State / UT" value={focusState} options={ALL_STATES} onChange={setFocusState}/>
      </div>
      <div className="education-location-status"><strong>{locationLabel}</strong><span>{dataStatus === 'loading' ? 'Checking the latest available official releases…' : (apiMeta.message || (hasLive ? 'Latest available official state data loaded.' : 'No source-backed metric returned yet. CurioLens will not guess a value.'))}</span></div>
    </section>

    <section className="snapshot-section-v132">
      <div className="snapshot-section-head"><div><span className="section-tag">At a glance</span><h2>{focusState}</h2></div><span>State view</span></div>
      <div className="compact-metric-grid">{SNAPSHOTS.map((item) => <CompactMetricCard key={item.key} item={item} data={displayData} live={hasLive} meta={metricMeta[item.key]} focusState={focusState}/>)}</div>
    </section>

    <section className="primary-data-grid" id="compare">
      <article className="data-visual-panel comparison-panel"><div className="panel-topline"><div><span className="section-tag">Compare simply</span><h2>{focusState} vs top states</h2><p>One indicator at a time. Top five is calculated from all currently available state values for that metric.</p></div><SmartSelect className="inline-select" label="Question" value={metricKey} options={METRICS.map((m) => ({value:m.key,label:m.selectLabel || m.label}))} onChange={setMetricKey}/></div><StateComparisonChart metricKey={metricKey} focusState={focusState} focusData={displayData} benchmarkRows={benchmarkRows}/><CompactSource source={metric.source} live={hasLive && displayData[metric.key] !== undefined} meta={metricMeta[metric.key]}/></article>
      <article className="data-visual-panel meaning-panel"><span className="section-tag">What does this mean?</span><h2>{metric.label}</h2><div className="meaning-number">{formatValue(metric.key,displayData[metric.key],metric.suffix)}</div><p>{metric.plain}</p><div className="meaning-rule"><span>For {locationLabel}</span><strong>{displayData[metric.key] === undefined ? 'This metric is not connected for this state yet.' : 'Use this number with the comparison and source year before drawing a conclusion.'}</strong></div><details className="learn-term"><summary>Learn the official term</summary><p><b>{metric.formal}</b> is the technical label used in many official datasets.</p></details><CompactSource source={metric.source} live={hasLive && displayData[metric.key] !== undefined} meta={metricMeta[metric.key]}/></article>
    </section>

    <section className="map-layout-grid map-layout-single" id="maps"><IndiaBenchmarkMap focusState={focusState} onStateSelect={setFocusState} benchmarkStates={BENCHMARKS}/></section>

    <section className="world-section-grid"><WorldEducationMap activeCountry={country} onCountrySelect={setCountry} countries={Object.keys(WORLD_INSIGHTS)} insight={worldInsight}/><aside className="world-insight-panel"><span className="section-tag">Ideas worth studying</span><h2>{country}</h2><strong>{worldInsight.metric}</strong><p>{worldInsight.copy}</p><div className="policy-note"><b>Could India use this?</b><span>Study the mechanism and evidence first, then test it in Indian state and district conditions.</span></div><div className="country-buttons">{Object.keys(WORLD_INSIGHTS).filter((c) => c !== 'India').map((c) => <button className={country === c ? 'active' : ''} key={c} onClick={() => setCountry(c)}>{c}</button>)}</div><CompactSource source={worldInsight.source || SOURCES.worldBank} live/></aside></section>

    <section className="bottom-insight-grid bottom-insight-single"><article className="insight-card"><span className="section-tag">What could help?</span><h2>Questions worth investigating</h2><ol className="way-forward-list"><li><b>Teacher availability</b><span>Where are classrooms most crowded?</span></li><li><b>Secondary transition</b><span>Where are students leaving before Classes 10–12?</span></li><li><b>Girls’ participation</b><span>Where do persistent participation gaps remain?</span></li><li><b>Learning outcomes</b><span>Are students learning what their grade expects?</span></li></ol></article></section>

    <section className="local-explorer-panel" id="local">
      <div className="local-explorer-copy"><span className="section-tag">Explore locally</span><h2>District context first</h2><p>Choose a district directly. NITI Aayog publishes district-level development evidence for selected indicators, while panchayat and urban-local-body coverage varies by programme and source. CurioLens keeps the state education dashboard separate and only shows finer-geography evidence where an official source supports it.</p></div>
      <div className="local-explorer-controls">
        <SmartSelect label="District" value={district} options={districts} onChange={setDistrict} disabled={districtStatus === 'loading'}/>
        {district !== 'All districts' && <SmartSelect label="Local body lens" value={localBodyLens} options={['District evidence','Urban local bodies (ULB)','Rural local bodies (RLB)']} onChange={setLocalBodyLens}/>}

      </div>
      <div className="local-explorer-grid">
        <div className="local-map-wrap"><StateDistrictMap state={focusState} district={district} onDistrictSelect={(name) => districts.includes(name) && setDistrict(name)}/></div>
        <div className="local-evidence-card"><span className="section-tag">Selected local context</span><h3>{localSelection}</h3><strong>{district === 'All districts' ? 'Choose a district to explore local evidence' : localBodyLens}</strong><p>NITI Aayog provides district-level evidence for selected programmes and indices, including national MPI district context and district SDG coverage in the North-East. Panchayat and ULB-level data is not uniformly available nationwide, so CurioLens treats it as an optional local lens rather than inheriting state values.</p><div className="district-evidence-links"><a href="https://www.niti.gov.in/competitive-federalism/overview-sustainable-development-goals" target="_blank" rel="noreferrer"><strong>NITI district context</strong><span>Open the official district-level development evidence ↗</span></a><a href="https://www.niti.gov.in/divisions/division/sustainable-development-goal" target="_blank" rel="noreferrer"><strong>NITI SDG data</strong><span>State/UT and officially covered district SDG sources ↗</span></a></div></div>
      </div>
    </section>

    <div className="data-integrity-note"><strong>Data integrity first.</strong> CurioLens selects the latest available official release independently for each metric. State education data stays at state level. District and local-body context is shown separately and only uses finer-geography values when an official source actually publishes them.</div>
  </div>;
}
