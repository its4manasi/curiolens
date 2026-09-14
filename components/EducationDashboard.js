'use client';

import { useMemo, useState } from 'react';
import { IndiaBenchmarkMap, BiharLocalMap, WorldEducationMap } from './EducationMaps';

const benchmarkStates = [
  { name: 'Bihar', literacy: 62, ptr: 30, girls: 49, secondary: 52, higherEd: 14 },
  { name: 'Punjab', literacy: 77, ptr: 18, girls: 52, secondary: 78, higherEd: 28 },
  { name: 'Kerala', literacy: 96, ptr: 16, girls: 49, secondary: 83, higherEd: 32 },
  { name: 'Himachal Pradesh', literacy: 84, ptr: 17, girls: 48, secondary: 74, higherEd: 26 },
  { name: 'Tamil Nadu', literacy: 80, ptr: 20, girls: 51, secondary: 77, higherEd: 27 },
  { name: 'Maharashtra', literacy: 82, ptr: 22, girls: 48, secondary: 73, higherEd: 24 },
];

const localOptions = {
  Patna: {
    Urban: ['Patna Municipal Corporation', 'Phulwari Sharif Nagar Parishad', 'Danapur Nagar Parishad'],
    Rural: ['Bihta Block', 'Masaurhi Block', 'Paliganj Block'],
  },
  Muzaffarpur: {
    Urban: ['Muzaffarpur Municipal Corporation', 'Kanti Nagar Parishad'],
    Rural: ['Mushahari Block', 'Bochaha Block', 'Kurhani Block'],
  },
  Gaya: {
    Urban: ['Gaya Municipal Corporation', 'Bodh Gaya Nagar Parishad'],
    Rural: ['Bodh Gaya Block', 'Manpur Block', 'Tekari Block'],
  },
};

const previewLocal = {
  'Patna Municipal Corporation': { population: '24.6 lakh', schools: '1,020', students: '4.8 lakh', teachers: '15,900', literacy: '78%', girls: '49%', ptr: '30 : 1' },
  'Phulwari Sharif Nagar Parishad': { population: '3.2 lakh', schools: '126', students: '48,000', teachers: '1,420', literacy: '72%', girls: '49%', ptr: '34 : 1' },
  'Danapur Nagar Parishad': { population: '4.0 lakh', schools: '142', students: '57,000', teachers: '1,760', literacy: '75%', girls: '48%', ptr: '32 : 1' },
  'Bihta Block': { population: '3.6 lakh', schools: '146', students: '52,400', teachers: '1,670', literacy: '70%', girls: '49%', ptr: '31 : 1' },
  'Masaurhi Block': { population: '2.9 lakh', schools: '161', students: '55,300', teachers: '1,690', literacy: '67%', girls: '48%', ptr: '33 : 1' },
  'Paliganj Block': { population: '2.7 lakh', schools: '119', students: '43,100', teachers: '1,260', literacy: '65%', girls: '48%', ptr: '34 : 1' },
  'Muzaffarpur Municipal Corporation': { population: '5.1 lakh', schools: '198', students: '72,000', teachers: '2,250', literacy: '74%', girls: '49%', ptr: '32 : 1' },
  'Kanti Nagar Parishad': { population: '1.4 lakh', schools: '61', students: '21,500', teachers: '650', literacy: '69%', girls: '48%', ptr: '33 : 1' },
  'Mushahari Block': { population: '4.2 lakh', schools: '203', students: '79,000', teachers: '2,240', literacy: '65%', girls: '48%', ptr: '35 : 1' },
  'Bochaha Block': { population: '2.8 lakh', schools: '147', students: '49,000', teachers: '1,410', literacy: '63%', girls: '48%', ptr: '35 : 1' },
  'Kurhani Block': { population: '3.3 lakh', schools: '169', students: '58,000', teachers: '1,680', literacy: '64%', girls: '49%', ptr: '35 : 1' },
  'Gaya Municipal Corporation': { population: '5.0 lakh', schools: '212', students: '76,000', teachers: '2,420', literacy: '76%', girls: '49%', ptr: '31 : 1' },
  'Bodh Gaya Nagar Parishad': { population: '1.0 lakh', schools: '49', students: '16,900', teachers: '560', literacy: '71%', girls: '49%', ptr: '30 : 1' },
  'Bodh Gaya Block': { population: '2.6 lakh', schools: '132', students: '45,000', teachers: '1,390', literacy: '66%', girls: '48%', ptr: '32 : 1' },
  'Manpur Block': { population: '2.4 lakh', schools: '127', students: '42,000', teachers: '1,300', literacy: '68%', girls: '49%', ptr: '32 : 1' },
  'Tekari Block': { population: '2.7 lakh', schools: '139', students: '47,000', teachers: '1,420', literacy: '65%', girls: '48%', ptr: '33 : 1' },
};

const metricMeta = [
  { key: 'literacy', label: 'Literacy', suffix: '%', better: 'higher' },
  { key: 'ptr', label: 'Students per teacher', suffix: '', better: 'lower' },
  { key: 'girls', label: 'Girls enrolled', suffix: '%', better: 'higher' },
  { key: 'secondary', label: 'Secondary completion', suffix: '%', better: 'higher' },
  { key: 'higherEd', label: 'Higher education', suffix: '%', better: 'higher' },
];

function benchmarkAverage(key) {
  const others = benchmarkStates.filter((state) => state.name !== 'Bihar');
  return Math.round(others.reduce((sum, state) => sum + state[key], 0) / others.length);
}

function SimpleBars({ metric }) {
  const max = metric.key === 'ptr' ? 40 : 100;
  return (
    <div className="state-bars" role="img" aria-label={`${metric.label} comparison across six states`}>
      {benchmarkStates.map((state) => (
        <div className="state-bar-row" key={state.name}>
          <div className="state-bar-label"><span>{state.name}</span><strong>{state[metric.key]}{metric.suffix}</strong></div>
          <div className="state-bar-track"><span className={state.name === 'Bihar' ? 'is-bihar' : ''} style={{ width: `${Math.min(100, (state[metric.key] / max) * 100)}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export default function EducationDashboard() {
  const [district, setDistrict] = useState('Patna');
  const [areaType, setAreaType] = useState('Urban');
  const [localBody, setLocalBody] = useState(localOptions.Patna.Urban[0]);
  const [metricKey, setMetricKey] = useState('literacy');

  const choices = localOptions[district][areaType];
  const current = previewLocal[localBody] || previewLocal[choices[0]];
  const currentMetric = metricMeta.find((metric) => metric.key === metricKey) || metricMeta[0];

  const gaps = useMemo(() => metricMeta.map((metric) => {
    const bihar = benchmarkStates[0][metric.key];
    const average = benchmarkAverage(metric.key);
    const gap = metric.better === 'lower' ? bihar - average : average - bihar;
    return { ...metric, bihar, average, gap };
  }), []);

  function changeDistrict(next) {
    setDistrict(next);
    setLocalBody(localOptions[next][areaType][0]);
  }

  function changeAreaType(next) {
    setAreaType(next);
    setLocalBody(localOptions[district][next][0]);
  }

  return (
    <div className="edu-dashboard">
      <div className="prototype-banner">
        <strong>Dashboard prototype:</strong> the geography controls and visual system are ready. The figures currently shown are sample values for layout testing and will be replaced by mapped official sources before public-data claims are published.
      </div>

      <section className="edu-control-card">
        <div>
          <span className="kicker">Explore your area</span>
          <h2>Bihar education explorer</h2>
          <p>Use the same dashboard from state level down to urban or rural local areas.</p>
        </div>
        <div className="geo-controls">
          <label><span>State</span><select value="Bihar" disabled><option>Bihar</option></select></label>
          <label><span>District</span><select value={district} onChange={(e) => changeDistrict(e.target.value)}>{Object.keys(localOptions).map((name) => <option key={name}>{name}</option>)}</select></label>
          <label><span>Area type</span><select value={areaType} onChange={(e) => changeAreaType(e.target.value)}><option>Urban</option><option>Rural</option></select></label>
          <label><span>Local body</span><select value={localBody} onChange={(e) => setLocalBody(e.target.value)}>{choices.map((name) => <option key={name}>{name}</option>)}</select></label>
        </div>
      </section>

      <section className="edu-map-grid">
        <IndiaBenchmarkMap />
        <BiharLocalMap district={district} />
      </section>

      <section className="edu-summary-grid">
        {[
          ['Population', current.population, 'People living in this area'],
          ['Schools', current.schools, 'Recognised schools'],
          ['Students', current.students, 'Children enrolled'],
          ['Teachers', current.teachers, 'Teachers available'],
          ['Literacy', current.literacy, 'People who can read and write'],
          ['Girls enrolled', current.girls, 'Share of enrolled students who are girls'],
        ].map(([label, value, note]) => (
          <article className="edu-stat-card" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>
        ))}
      </section>

      <section className="edu-two-col">
        <article className="edu-panel-card">
          <div className="panel-heading">
            <div><span className="kicker">Bihar vs benchmark states</span><h3>{currentMetric.label}</h3></div>
            <select value={metricKey} onChange={(e) => setMetricKey(e.target.value)}>{metricMeta.map((metric) => <option key={metric.key} value={metric.key}>{metric.label}</option>)}</select>
          </div>
          <SimpleBars metric={currentMetric} />
          <p className="plain-note">The chart keeps Bihar visible against Punjab, Kerala, Himachal Pradesh, Tamil Nadu and Maharashtra. Each indicator can have a different leader.</p>
        </article>

        <article className="edu-panel-card local-compare-card">
          <span className="kicker">What does this mean?</span>
          <h3>{localBody}</h3>
          <div className="local-meaning">
            <div><strong>{current.literacy}</strong><span>can read and write</span></div>
            <div><strong>{current.ptr}</strong><span>students for each teacher</span></div>
            <div><strong>{current.girls}</strong><span>of students are girls</span></div>
          </div>
          <p>CurioLens will compare this local body with its district, Bihar and national benchmarks whenever the official source supports the same geography.</p>
        </article>
      </section>

      <section className="edu-world-section">
        <WorldEducationMap />
      </section>

      <section className="edu-three-col">
        <article className="edu-panel-card">
          <span className="kicker">Where Bihar's gaps are</span>
          <h3>Distance from the 5-state benchmark</h3>
          <div className="gap-list">
            {gaps.map((gap) => (
              <div className="gap-row" key={gap.key}>
                <div><span>{gap.label}</span><strong>{gap.key === 'ptr' ? '+' : '-'}{Math.abs(gap.gap)}{gap.key === 'ptr' ? '' : ' pp'}</strong></div>
                <div className="gap-track"><span style={{ width: `${Math.min(100, Math.abs(gap.gap) * 3)}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="edu-panel-card">
          <span className="kicker">Way forward</span>
          <h3>Questions worth investigating</h3>
          <div className="idea-list">
            <p><strong>Teacher availability</strong><span>Where are classrooms most crowded?</span></p>
            <p><strong>Secondary transition</strong><span>Where do children stop continuing to Classes 10–12?</span></p>
            <p><strong>Girls' participation</strong><span>Which districts and local bodies show persistent gaps?</span></p>
            <p><strong>College access</strong><span>How far are young people from higher-education opportunities?</span></p>
          </div>
        </article>

        <article className="edu-panel-card">
          <span className="kicker">Learn from elsewhere</span>
          <h3>Limited-resource ideas</h3>
          <div className="idea-list">
            <p><strong>Early learning support</strong><span>Simple assessment and targeted help in foundational grades.</span></p>
            <p><strong>Community monitoring</strong><span>Make local school information easy for families to understand.</span></p>
            <p><strong>Low-cost digital support</strong><span>Use technology to help teachers, not replace them.</span></p>
            <p><strong>Compare implementation</strong><span>Study what stronger Indian states and peer countries do differently.</span></p>
          </div>
        </article>
      </section>

      <section className="education-journey edu-panel-card">
        <div><span className="kicker">Education journey</span><h3>Follow a child through the system</h3><p>Once we connect the completion and transition datasets, this will show where students are most likely to leave education.</p></div>
        <div className="journey-steps">
          {['Start school', 'Reach Class 5', 'Reach Class 8', 'Reach Class 10', 'Reach Class 12', 'Higher education'].map((label, index) => (
            <div className="journey-step" key={label}><strong>{index + 1}</strong><span>{label}</span>{index < 5 && <i>→</i>}</div>
          ))}
        </div>
      </section>

      <p className="source-line">Planned official sources: UDISE+, Census India, AISHE, NITI Aayog and World Bank/UN sources where definitions are comparable. CurioLens will show source, year and geography beside each published metric.</p>
    </div>
  );
}
