'use client';

import { useMemo, useState } from 'react';
import { IndiaBenchmarkMap, BiharDistrictMap, WorldEducationMap } from './EducationMaps';
import EvidenceFooter from './EvidenceFooter';

const ALL_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry'
];

const BENCHMARKS = ['Punjab','Kerala','Himachal Pradesh','Tamil Nadu','Maharashtra'];

const DIVISIONS = {
  'Patna Division': ['Patna','Nalanda','Bhojpur','Rohtas','Buxar','Kaimur'],
  'Tirhut Division': ['West Champaran','East Champaran','Muzaffarpur','Sitamarhi','Sheohar','Vaishali'],
  'Saran Division': ['Saran','Siwan','Gopalganj'],
  'Darbhanga Division': ['Darbhanga','Madhubani','Samastipur'],
  'Kosi Division': ['Saharsa','Supaul','Madhepura'],
  'Purnia Division': ['Purnia','Katihar','Araria','Kishanganj'],
  'Bhagalpur Division': ['Bhagalpur','Banka'],
  'Munger Division': ['Munger','Jamui','Khagaria','Lakhisarai','Sheikhpura','Begusarai'],
  'Magadh Division': ['Gaya','Nawada','Aurangabad','Jehanabad','Arwal'],
};

const SOURCES = {
  census: { name: 'Census of India', href: 'https://censusindia.gov.in/', period: 'Population & literacy' },
  udise: { name: 'UDISE+ · Ministry of Education', href: 'https://www.education.gov.in/udise-plus', period: 'Schools, students & teachers' },
  aishe: { name: 'AISHE', href: 'https://aishe.gov.in/', period: 'Higher education' },
  worldBank: { name: 'World Bank Data', href: 'https://data.worldbank.org/topic/education', period: 'International comparison' },
};

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
  { key: 'ptr', label: 'Students per teacher', formal: 'Pupil–teacher ratio (PTR)', suffix: '', plain: 'About how many students share one teacher. A lower number usually means more teacher time per student.', max: 40, better: 'lower', source: SOURCES.udise },
  { key: 'girls', label: 'Girls among students', formal: 'Share of girls enrolled', suffix: '%', plain: 'Out of every 100 enrolled students, about how many are girls.', max: 100, better: 'higher', source: SOURCES.udise },
  { key: 'secondary', label: 'Finish secondary school', formal: 'Secondary completion', suffix: '%', plain: 'About how many students reach the end of secondary school.', max: 100, better: 'higher', source: SOURCES.udise },
  { key: 'higherEd', label: 'Continue to college', formal: 'Higher-education GER', suffix: '%', plain: 'About how many young people in the college-age group are enrolled in higher education.', max: 50, better: 'higher', source: SOURCES.aishe },
];

const SNAPSHOTS = [
  { key: 'population', label: 'Population', note: 'How many people live here', source: SOURCES.census },
  { key: 'schools', label: 'Schools', note: 'Recognised schools serving learners', source: SOURCES.udise },
  { key: 'students', label: 'Students', note: 'Children enrolled in school', source: SOURCES.udise },
  { key: 'teachers', label: 'Teachers', note: 'Teachers available in schools', source: SOURCES.udise },
  { key: 'literacy', label: 'Can read and write', note: 'People who can read and write', source: SOURCES.census, suffix: '%' },
  { key: 'girls', label: 'Girls among students', note: 'Share of enrolled students who are girls', source: SOURCES.udise, suffix: '%' },
];

const WORLD_INSIGHTS = {
  Vietnam: { title: 'Vietnam', metric: 'Strong school completion', copy: 'A useful case for studying teacher support, consistent learning expectations and completion.' },
  Bangladesh: { title: 'Bangladesh', metric: 'Girls’ participation', copy: 'Useful for examining how access, incentives and community support can improve participation.' },
  Indonesia: { title: 'Indonesia', metric: 'Large diverse system', copy: 'Useful for understanding how a large, decentralised system manages local variation.' },
  China: { title: 'China', metric: 'System scale', copy: 'Useful for examining teacher deployment, school networks and large-system administration.' },
  Brazil: { title: 'Brazil', metric: 'Local governance', copy: 'Useful for studying local delivery and how outcomes vary across regions.' },
  India: { title: 'India', metric: 'National baseline', copy: 'Use India as the national context before looking at peer countries.' },
};

function findDivision(district) {
  return Object.entries(DIVISIONS).find(([, districts]) => districts.includes(district))?.[0] || 'Patna Division';
}

function localBodyLabel(areaType, district) {
  return areaType === 'Urban' ? `All urban local bodies in ${district}` : `All rural blocks in ${district}`;
}

function StateComparisonChart({ metricKey }) {
  const metric = METRICS.find((m) => m.key === metricKey) || METRICS[0];
  const rows = ['Bihar', ...BENCHMARKS].map((name) => ({ name, value: STATE_DATA[name][metric.key] }));
  const sorted = [...rows].sort((a, b) => metric.better === 'lower' ? a.value - b.value : b.value - a.value);
  const benchmarkRows = rows.filter((row) => row.name !== 'Bihar');
  const benchmarkAvg = Math.round(benchmarkRows.reduce((sum, row) => sum + row.value, 0) / benchmarkRows.length);
  const best = sorted[0];
  const bihar = rows.find((row) => row.name === 'Bihar');
  const gap = metric.better === 'lower' ? bihar.value - benchmarkAvg : benchmarkAvg - bihar.value;
  const maxValue = Math.max(...rows.map((row) => row.value), metric.max || 0);

  return (
    <div className="comparison-modern" role="img" aria-label={`${metric.formal} across Bihar and five benchmark states`}>
      <div className="comparison-summary">
        <div className="comparison-summary-card focus"><span>Bihar</span><strong>{bihar.value}{metric.suffix}</strong><small>Your focus state</small></div>
        <div className="comparison-summary-card"><span>Benchmark average</span><strong>{benchmarkAvg}{metric.suffix}</strong><small>Average of 5 states</small></div>
        <div className="comparison-summary-card"><span>Best benchmark</span><strong>{best.name}</strong><small>{best.value}{metric.suffix}</small></div>
        <div className={`comparison-summary-card ${gap > 0 ? 'gap' : 'ahead'}`}><span>Gap to average</span><strong>{gap > 0 ? '+' : ''}{gap}{metric.key === 'ptr' ? '' : ' pp'}</strong><small>{gap > 0 ? 'Room to close' : 'Ahead of average'}</small></div>
      </div>

      <div className="state-rank-list">
        {sorted.map((row, index) => {
          const width = Math.max(8, (row.value / maxValue) * 100);
          return (
            <div className={`state-rank-row ${row.name === 'Bihar' ? 'is-bihar' : ''}`} key={row.name}>
              <div className="state-rank-meta"><span className="rank-no">{index + 1}</span><strong>{row.name}</strong><span className="rank-value">{row.value}{metric.suffix}</span></div>
              <div className="state-rank-track"><i style={{ width: `${width}%` }} /></div>
            </div>
          );
        })}
      </div>

      <div className="comparison-reading">
        <span className="comparison-reading-icon">↗</span>
        <div><strong>Read it simply</strong><p>{metric.better === 'lower' ? 'A shorter bar is better for this measure.' : 'A longer bar means a higher value.'} Bihar is highlighted so you can see the gap instantly.</p></div>
      </div>
    </div>
  );
}

function SimpleMetricCard({ item, stateData }) {
  let value = '—';
  if (stateData) {
    const raw = stateData[item.key];
    value = raw === undefined ? '—' : `${raw}${item.suffix || ''}`;
  }
  return (
    <article className="snapshot-card simple-metric-card">
      <span>{item.label}</span>
      <strong>{value}</strong>
      <p>{item.note}</p>
      <EvidenceFooter {...item.source} />
    </article>
  );
}

export default function EducationDashboard() {
  const [focusState, setFocusState] = useState('Bihar');
  const [division, setDivision] = useState('Patna Division');
  const [district, setDistrict] = useState('Patna');
  const [areaType, setAreaType] = useState('Urban');
  const [metricKey, setMetricKey] = useState('literacy');
  const [country, setCountry] = useState('Vietnam');

  const districts = DIVISIONS[division];
  const metric = METRICS.find((m) => m.key === metricKey) || METRICS[0];
  const stateData = STATE_DATA[focusState] || null;
  const localEnabled = focusState === 'Bihar';
  const worldInsight = WORLD_INSIGHTS[country] || WORLD_INSIGHTS.India;

  const gapRows = useMemo(() => METRICS.map((m) => {
    const bihar = STATE_DATA.Bihar[m.key];
    const avg = Math.round(BENCHMARKS.reduce((sum, name) => sum + STATE_DATA[name][m.key], 0) / BENCHMARKS.length);
    const gap = m.better === 'lower' ? bihar - avg : avg - bihar;
    return { ...m, gap };
  }), []);

  function chooseState(name) { setFocusState(name); }
  function chooseDivision(value) { setDivision(value); setDistrict(DIVISIONS[value][0]); }
  function chooseDistrict(value) { setDistrict(value); setDivision(findDivision(value)); }

  return (
    <div className="education-dashboard-full">
      <section className="edu-toolbar">
        <div className="toolbar-intro">
          <span className="section-tag">Explore education</span>
          <h2>From state to local body</h2>
          <p>Choose where you live. CurioLens explains the number in simple words first, then shows the official source for anyone who wants to check it.</p>
        </div>
        <div className="toolbar-controls">
          <label><span>State</span><select value={focusState} onChange={(e) => chooseState(e.target.value)}>{ALL_STATES.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className={!localEnabled ? 'is-disabled' : ''}><span>Division</span><select disabled={!localEnabled} value={division} onChange={(e) => chooseDivision(e.target.value)}>{Object.keys(DIVISIONS).map((d) => <option key={d}>{d}</option>)}</select></label>
          <label className={!localEnabled ? 'is-disabled' : ''}><span>District</span><select disabled={!localEnabled} value={district} onChange={(e) => chooseDistrict(e.target.value)}>{districts.map((d) => <option key={d}>{d}</option>)}</select></label>
          <label className={!localEnabled ? 'is-disabled' : ''}><span>Area type</span><select disabled={!localEnabled} value={areaType} onChange={(e) => setAreaType(e.target.value)}><option>Urban</option><option>Rural</option></select></label>
          <label className={!localEnabled ? 'is-disabled' : ''}><span>Local body</span><select disabled={!localEnabled} value={localBodyLabel(areaType, district)} readOnly><option>{localBodyLabel(areaType, district)}</option></select></label>
        </div>
        {!localEnabled && <div className="availability-note">Local-body drill-down is currently being wired for Bihar first. State-level selection is already available for the nationwide architecture.</div>}
      </section>

      <section className="reading-rule-strip">
        <div><b>1</b><span><strong>See the number</strong><small>Big and easy to spot</small></span></div>
        <div><b>2</b><span><strong>Understand it</strong><small>Plain words, no jargon needed</small></span></div>
        <div><b>3</b><span><strong>Compare it</strong><small>Local, state and benchmark context</small></span></div>
        <div><b>4</b><span><strong>Check it</strong><small>One tap to the official source</small></span></div>
      </section>

      <section className="snapshot-strip">
        <div className="snapshot-title"><span className="section-tag">At a glance</span><h2>{focusState}</h2><p>{stateData ? 'Demo values are still being replaced by live source-backed data. The source button shows where each metric should be verified.' : 'This state is selectable, but its metric source mapping is not connected yet.'}</p></div>
        {SNAPSHOTS.map((item) => <SimpleMetricCard key={item.key} item={item} stateData={stateData} />)}
      </section>

      <section className="primary-data-grid">
        <article className="data-visual-panel comparison-panel">
          <div className="panel-topline"><div><span className="section-tag">Compare simply</span><h2>Bihar vs 5 benchmark states</h2><p>Pick one question at a time. The chart keeps the comparison easy to read.</p></div><label className="inline-select"><span>Question</span><select value={metricKey} onChange={(e) => setMetricKey(e.target.value)}>{METRICS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}</select></label></div>
          <StateComparisonChart metricKey={metricKey} />
          <div className="chart-explainer"><strong>{metric.label}</strong><span>{metric.plain} Bihar is coral; benchmark states are sea green.</span></div>
          <EvidenceFooter {...metric.source} />
        </article>
        <article className="data-visual-panel meaning-panel">
          <span className="section-tag">What does this mean?</span>
          <h2>{metric.label}</h2>
          <div className="meaning-number">{STATE_DATA.Bihar[metric.key]}{metric.suffix}</div>
          <p>{metric.plain}</p>
          <div className="meaning-rule"><span>Simple reading</span><strong>{metric.key === 'literacy' ? 'About 62 out of 100 people can read and write in this demo.' : metric.note || 'Use the number as a starting point for a question.'}</strong></div>
          <details className="learn-term"><summary>Learn the official term</summary><p><b>{metric.formal}</b> is the technical name used in many official datasets.</p></details>
          <EvidenceFooter {...metric.source} />
        </article>
      </section>

      <section className="map-layout-grid">
        <IndiaBenchmarkMap focusState={focusState} onStateSelect={chooseState} benchmarkStates={BENCHMARKS} />
        <BiharDistrictMap district={district} onDistrictSelect={chooseDistrict} divisionDistricts={DIVISIONS[division]} />
      </section>

      <section className="local-context-band">
        <div><span className="section-tag">Local view</span><h2>{district} · {areaType}</h2><p>{localBodyLabel(areaType, district)}</p></div>
        <div className="local-path"><span>Bihar</span><b>→</b><span>{division.replace(' Division','')}</span><b>→</b><span>{district}</span><b>→</b><span>{areaType}</span><b>→</b><span>Local body</span></div>
      </section>

      <section className="world-section-grid">
        <WorldEducationMap activeCountry={country} onCountrySelect={(name) => WORLD_INSIGHTS[name] && setCountry(name)} countries={Object.keys(WORLD_INSIGHTS)} />
        <aside className="world-insight-panel"><span className="section-tag">What can Bihar study?</span><h2>{worldInsight.title}</h2><strong>{worldInsight.metric}</strong><p>{worldInsight.copy}</p><div className="country-buttons">{Object.keys(WORLD_INSIGHTS).filter((c) => c !== 'India').map((c) => <button className={country === c ? 'active' : ''} key={c} onClick={() => setCountry(c)}>{c}</button>)}</div><EvidenceFooter {...SOURCES.worldBank} /></aside>
      </section>

      <section className="bottom-insight-grid">
        <article className="insight-card"><span className="section-tag">Where are the gaps?</span><h2>Distance from benchmark states</h2><p className="card-helper">A bigger bar means the selected demo value is farther from the benchmark average. It does not prove the cause.</p><div className="gap-list-modern">{gapRows.map((g) => <div key={g.key}><div><span>{g.label}</span><strong>{g.gap > 0 ? '+' : ''}{g.gap}{g.key === 'ptr' ? '' : ' pp'}</strong></div><div className="gap-rail"><i style={{ width: `${Math.min(100, Math.abs(g.gap) * 3)}%` }}/></div></div>)}</div></article>
        <article className="insight-card"><span className="section-tag">What could help?</span><h2>Questions worth investigating</h2><ol className="way-forward-list"><li><b>Teacher availability</b><span>Where are classrooms most crowded?</span></li><li><b>Secondary transition</b><span>Where are students leaving before Classes 10–12?</span></li><li><b>Girls’ participation</b><span>Which districts still show persistent gaps?</span></li><li><b>Local accountability</b><span>Can families easily understand school conditions nearby?</span></li></ol></article>
      </section>

      <div className="data-integrity-note"><strong>Data integrity first.</strong> The current figures are prototype values used to prove the interaction and layout. Before public claims are treated as factual, each value will be replaced with source-backed data showing source, year, geography and definition.</div>
    </div>
  );
}
