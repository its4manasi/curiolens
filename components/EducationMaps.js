'use client';

const stateMarkers = [
  { name: 'Bihar', x: 67, y: 38, focus: true },
  { name: 'Punjab', x: 33, y: 19 },
  { name: 'Himachal Pradesh', x: 40, y: 14 },
  { name: 'Maharashtra', x: 42, y: 55 },
  { name: 'Tamil Nadu', x: 49, y: 82 },
  { name: 'Kerala', x: 40, y: 84 },
];

const biharDistrictMarkers = [
  { name: 'Patna', x: 53, y: 52 },
  { name: 'Muzaffarpur', x: 48, y: 32 },
  { name: 'Gaya', x: 50, y: 72 },
];

const worldMarkers = [
  { name: 'India', x: 67, y: 55, focus: true },
  { name: 'Vietnam', x: 77, y: 55 },
  { name: 'Bangladesh', x: 70, y: 51 },
  { name: 'Indonesia', x: 79, y: 67 },
  { name: 'Brazil', x: 34, y: 67 },
  { name: 'China', x: 72, y: 40 },
];

function Marker({ item, active }) {
  return (
    <g className={`map-marker ${item.focus ? 'is-focus' : ''} ${active ? 'is-active' : ''}`}>
      <circle cx={item.x} cy={item.y} r={item.focus || active ? 2.8 : 2.15} />
      <circle className="map-marker-ring" cx={item.x} cy={item.y} r={item.focus || active ? 5.1 : 4.2} />
      <text x={item.x + 4} y={item.y - 3}>{item.name}</text>
    </g>
  );
}

export function IndiaBenchmarkMap() {
  return (
    <div className="map-card map-card-india">
      <div className="map-card-heading">
        <div>
          <span className="kicker">Where the benchmarks are</span>
          <h3>Bihar and five comparison states</h3>
        </div>
        <span className="map-chip">India</span>
      </div>
      <svg className="curio-map" viewBox="0 0 100 100" role="img" aria-label="Orientation map of India showing Bihar and five benchmark states">
        <path className="india-outline" d="M34 9 L43 7 L50 10 L58 13 L63 19 L69 20 L73 28 L70 35 L76 40 L72 47 L68 51 L66 59 L60 62 L58 70 L54 76 L50 89 L45 94 L42 87 L39 79 L35 70 L29 66 L25 58 L27 50 L22 43 L25 36 L29 30 L31 22 L29 16 Z" />
        <path className="india-northeast" d="M72 28 L80 26 L87 30 L82 36 L75 35 Z" />
        {stateMarkers.map((item) => <Marker key={item.name} item={item} />)}
      </svg>
      <p className="map-note">Bihar is the focus. Other markers are benchmark states chosen to compare different education strengths. This first map is for visual orientation; official boundary files can replace it later without changing the dashboard.</p>
    </div>
  );
}

export function BiharLocalMap({ district = 'Patna' }) {
  return (
    <div className="map-card map-card-bihar">
      <div className="map-card-heading">
        <div>
          <span className="kicker">Drill down</span>
          <h3>From Bihar to your local area</h3>
        </div>
        <span className="map-chip">{district}</span>
      </div>
      <svg className="curio-map bihar-map" viewBox="0 0 100 100" role="img" aria-label={`Orientation map of Bihar highlighting ${district}`}>
        <path className="bihar-outline" d="M9 39 L17 27 L30 24 L39 17 L54 20 L63 16 L76 23 L89 24 L94 34 L88 46 L92 57 L80 65 L70 63 L61 72 L50 68 L41 78 L30 72 L24 62 L13 58 L7 49 Z" />
        <path className="river-line" d="M16 45 C30 40, 44 48, 58 43 S79 43, 89 39" />
        {biharDistrictMarkers.map((item) => <Marker key={item.name} item={item} active={item.name === district} />)}
      </svg>
      <div className="map-levels" aria-label="Geography drill down">
        <span>Bihar</span><i>→</i><span>{district}</span><i>→</i><span>Urban / Rural</span><i>→</i><span>Local body</span>
      </div>
      <p className="map-note">The same cards and charts stay in place while the geography changes. Where an official source stops at district level, CurioLens will say so instead of guessing a local value.</p>
    </div>
  );
}

export function WorldEducationMap() {
  return (
    <div className="map-card map-card-world">
      <div className="map-card-heading">
        <div>
          <span className="kicker">Way forward</span>
          <h3>Ideas from comparable countries</h3>
        </div>
        <span className="map-chip">World</span>
      </div>
      <svg className="curio-map world-map" viewBox="0 0 100 100" role="img" aria-label="World orientation map showing India and selected education benchmark countries">
        <path className="world-land" d="M6 29 L13 20 L23 18 L31 24 L29 34 L22 39 L18 51 L12 47 L10 38 Z" />
        <path className="world-land" d="M28 53 L37 54 L41 62 L39 75 L33 87 L28 77 L25 66 Z" />
        <path className="world-land" d="M45 25 L54 20 L64 22 L69 18 L83 22 L92 31 L88 40 L80 43 L78 52 L69 57 L63 48 L56 45 L53 36 L47 34 Z" />
        <path className="world-land" d="M77 66 L84 64 L92 70 L90 77 L81 79 L75 73 Z" />
        {worldMarkers.map((item) => <Marker key={item.name} item={item} />)}
      </svg>
      <div className="world-insights">
        <div><strong>Vietnam</strong><span>Learning and completion</span></div>
        <div><strong>Bangladesh</strong><span>Girls' participation</span></div>
        <div><strong>Indonesia</strong><span>Large, diverse system</span></div>
      </div>
      <p className="map-note">Global comparisons should be used as prompts, not copy-paste solutions. CurioLens can use World Bank or UNESCO indicators for country-level context while keeping Bihar comparisons separate from national comparisons.</p>
    </div>
  );
}
