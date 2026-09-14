'use client';

import { useMemo, useState } from 'react';
import { IndiaBenchmarkMap, BiharDistrictMap, WorldEducationMap } from './EducationMaps';

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

const STATE_DATA = {
  Bihar: { literacy: 62, ptr: 30, girls: 49, secondary: 52, higherEd: 14, population: '13.1 cr', schools: '1.2 lakh', students: '2.4 cr', teachers: '8.1 lakh' },
  Punjab: { literacy: 77, ptr: 18, girls: 52, secondary: 78, higherEd: 28 },
  Kerala: { literacy: 96, ptr: 16, girls: 49, secondary: 83, higherEd: 32 },
  'Himachal Pradesh': { literacy: 84, ptr: 17, girls: 48, secondary: 74, higherEd: 26 },
  'Tamil Nadu': { literacy: 80, ptr: 20, girls: 51, secondary: 77, higherEd: 27 },
  Maharashtra: { literacy: 82, ptr: 22, girls: 48, secondary: 73, higherEd: 24 },
};

const METRICS = [
  { key: 'literacy', label: 'Literacy rate', suffix: '%', note: 'People who can read and write', max: 100, better: 'higher' },
  { key: 'ptr', label: 'Students per teacher', suffix: '', note: 'Lower is usually better', max: 40, better: 'lower' },
  { key: 'girls', label: 'Girls enrolled', suffix: '%', note: 'Share of enrolled students', max: 100, better: 'higher' },
  { key: 'secondary', label: 'Secondary completion', suffix: '%', note: 'Reach the end of secondary school', max: 100, better: 'higher' },
  { key: 'higherEd', label: 'Higher education (GER)', suffix: '%', note: 'Participation after school', max: 50, better: 'higher' },
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
  return (
    <div className="comparison-chart" role="img" aria-label={`${metric.label} across Bihar and five benchmark states`}>
      <div className="chart-grid-lines"><i/><i/><i/><i/><i/></div>
      <div className="chart-bars">
        {rows.map((row) => (
          <div className="chart-column" key={row.name}>
            <div className="chart-value">{row.value}{metric.suffix}</div>
            <div className="chart-track"><div className={`chart-fill ${row.name === 'Bihar' ? 'is-bihar' : ''}`} style={{ height: `${Math.min(100, row.value / metric.max * 100)}%` }} /></div>
            <div className="chart-label">{row.name}</div>
          </div>
        ))}
      </div>
    </div>
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

  function chooseState(name) {
    setFocusState(name);
  }

  function chooseDivision(value) {
    setDivision(value);
    setDistrict(DIVISIONS[value][0]);
  }

  function chooseDistrict(value) {
    setDistrict(value);
    setDivision(findDivision(value));
  }

  return (
    <div className="education-dashboard-full">
      <section className="edu-toolbar">
        <div className="toolbar-intro">
          <span className="section-tag">Explore education</span>
          <h2>From state to local body</h2>
          <p>Choose where you live, then compare the same indicators at state, district and local levels wherever official data allows.</p>
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

      <section className="snapshot-strip">
        <div className="snapshot-title"><span className="section-tag">At a glance</span><h2>{focusState}</h2><p>{stateData ? 'Prototype values shown for UI testing; source mapping will replace them.' : 'This state is selectable, but its metric source mapping is not connected yet.'}</p></div>
        {[
          ['Population', stateData?.population || '—', 'People'],
          ['Schools', stateData?.schools || '—', 'Recognised schools'],
          ['Students', stateData?.students || '—', 'Children enrolled'],
          ['Teachers', stateData?.teachers || '—', 'Teachers available'],
          ['Literacy', stateData ? `${stateData.literacy}%` : '—', 'Can read and write'],
          ['Girls enrolled', stateData ? `${stateData.girls}%` : '—', 'Share of students'],
        ].map(([label, value, note]) => <article className="snapshot-card" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}
      </section>

      <section className="primary-data-grid">
        <article className="data-visual-panel comparison-panel">
          <div className="panel-topline"><div><span className="section-tag">Key indicators</span><h2>Bihar vs 5 benchmark states</h2><p>Use one indicator at a time so the comparison stays easy to read.</p></div><label className="inline-select"><span>Indicator</span><select value={metricKey} onChange={(e) => setMetricKey(e.target.value)}>{METRICS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}</select></label></div>
          <StateComparisonChart metricKey={metricKey} />
          <div className="chart-explainer"><strong>{metric.label}</strong><span>{metric.note}. Bihar is shown in coral; benchmark states are sea green.</span></div>
        </article>
        <article className="data-visual-panel meaning-panel">
          <span className="section-tag">What does this mean?</span>
          <h2>Read the number like a story</h2>
          <div className="meaning-number">{STATE_DATA.Bihar[metric.key]}{metric.suffix}</div>
          <p>{metric.key === 'literacy' ? 'About 62 out of every 100 people in Bihar can read and write in this prototype view.' : metric.note + '.'}</p>
          <div className="meaning-rule"><span>Best use</span><strong>Compare the gap, then ask why</strong></div>
          <div className="meaning-rule"><span>Avoid</span><strong>Calling one state “best” on every measure</strong></div>
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
        <aside className="world-insight-panel"><span className="section-tag">What can Bihar study?</span><h2>{worldInsight.title}</h2><strong>{worldInsight.metric}</strong><p>{worldInsight.copy}</p><div className="country-buttons">{Object.keys(WORLD_INSIGHTS).filter((c) => c !== 'India').map((c) => <button className={country === c ? 'active' : ''} key={c} onClick={() => setCountry(c)}>{c}</button>)}</div></aside>
      </section>

      <section className="bottom-insight-grid">
        <article className="insight-card"><span className="section-tag">Where are the gaps?</span><h2>Distance from benchmark states</h2><div className="gap-list-modern">{gapRows.map((g) => <div key={g.key}><div><span>{g.label}</span><strong>{g.gap > 0 ? '+' : ''}{g.gap}{g.key === 'ptr' ? '' : ' pp'}</strong></div><div className="gap-rail"><i style={{ width: `${Math.min(100, Math.abs(g.gap) * 3)}%` }}/></div></div>)}</div></article>
        <article className="insight-card"><span className="section-tag">What could help?</span><h2>Questions worth investigating</h2><ol className="way-forward-list"><li><b>Teacher availability</b><span>Where are classrooms most crowded?</span></li><li><b>Secondary transition</b><span>Where are students leaving before Classes 10–12?</span></li><li><b>Girls’ participation</b><span>Which districts still show persistent gaps?</span></li><li><b>Local accountability</b><span>Can families easily understand school conditions nearby?</span></li></ol></article>
      </section>

      <div className="data-integrity-note"><strong>Data integrity first.</strong> The current figures are prototype values used only to prove the interaction and layout. Public claims will switch to source-backed values with source, year, geography and definition shown beside each metric.</div>
    </div>
  );
}
