'use client';

import { useEffect, useMemo, useState } from 'react';

const MAP_VERSION = '2884453';
const INDIA_GEOJSON = `https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@${MAP_VERSION}/geojson/india.geojson`;
const WORLD_GEOJSON = 'https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json';

export const STATE_SLUGS = {
  'Andaman and Nicobar Islands':'andaman-and-nicobar-islands','Andhra Pradesh':'andhra-pradesh','Arunachal Pradesh':'arunachal-pradesh',Assam:'assam',Bihar:'bihar',Chandigarh:'chandigarh',Chhattisgarh:'chhattisgarh',Delhi:'delhi','Dadra and Nagar Haveli and Daman and Diu':'dnh-and-dd',Goa:'goa',Gujarat:'gujarat',Haryana:'haryana','Himachal Pradesh':'himachal-pradesh','Jammu and Kashmir':'jammu-and-kashmir',Jharkhand:'jharkhand',Karnataka:'karnataka',Kerala:'kerala',Ladakh:'ladakh',Lakshadweep:'lakshadweep','Madhya Pradesh':'madhya-pradesh',Maharashtra:'maharashtra',Manipur:'manipur',Meghalaya:'meghalaya',Mizoram:'mizoram',Nagaland:'nagaland',Odisha:'odisha',Puducherry:'puducherry',Punjab:'punjab',Rajasthan:'rajasthan',Sikkim:'sikkim','Tamil Nadu':'tamil-nadu',Telangana:'telangana',Tripura:'tripura','Uttar Pradesh':'uttar-pradesh',Uttarakhand:'uttarakhand','West Bengal':'west-bengal'
};

export function stateDistrictGeoJsonUrl(state) {
  const slug = STATE_SLUGS[state];
  return slug ? `https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@${MAP_VERSION}/geojson/states/${slug}.geojson` : null;
}

const norm = (value = '') => value.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
export const featureName = (feature) => {
  const p = feature?.properties || {};
  return p.st_nm || p.ST_NM || p.State_Name || p.state || p.STATE || p.NAME_1 || p.name || p.NAME || p.district || p.DISTRICT || p.District || p.dtname || p.DT_NAME || p.NAME_2 || 'Unknown';
};

function allPoints(geometry) {
  if (!geometry) return [];
  const coords = geometry.coordinates || [];
  if (geometry.type === 'Polygon') return coords.flat();
  if (geometry.type === 'MultiPolygon') return coords.flat(2);
  return [];
}

function boundsFor(features) {
  const pts = features.flatMap((f) => allPoints(f.geometry));
  if (!pts.length) return [0, 0, 100, 100];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function pathForGeometry(geometry, bounds, width, height, pad = 8) {
  const [minX, minY, maxX, maxY] = bounds;
  const xRange = Math.max(maxX - minX, 0.0001);
  const yRange = Math.max(maxY - minY, 0.0001);
  const scale = Math.min((width - pad * 2) / xRange, (height - pad * 2) / yRange);
  const dx = (width - xRange * scale) / 2;
  const dy = (height - yRange * scale) / 2;
  const point = ([x, y]) => [dx + (x - minX) * scale, height - (dy + (y - minY) * scale)];
  const ringPath = (ring) => ring.map((p, i) => `${i ? 'L' : 'M'}${point(p)[0].toFixed(2)},${point(p)[1].toFixed(2)}`).join(' ') + ' Z';
  if (geometry.type === 'Polygon') return geometry.coordinates.map(ringPath).join(' ');
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flatMap((poly) => poly.map(ringPath)).join(' ');
  return '';
}

function GeoMap({ url, ariaLabel, selected = [], focus = '', active = '', onSelect, world = false }) {
  const [features, setFeatures] = useState([]);
  const [hover, setHover] = useState('');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let alive = true;
    if (!url) { setStatus('error'); return () => {}; }
    setStatus('loading');
    fetch(url).then((r) => {
      if (!r.ok) throw new Error('Map request failed');
      return r.json();
    }).then((json) => {
      if (!alive) return;
      setFeatures(json.features || []);
      setStatus('ready');
    }).catch(() => alive && setStatus('error'));
    return () => { alive = false; };
  }, [url]);

  const width = world ? 760 : 620;
  const height = world ? 330 : 420;
  const bounds = useMemo(() => boundsFor(features), [features]);
  const selectedNorm = new Set(selected.map(norm));

  if (status === 'loading') return <div className="map-loading">Loading map…</div>;
  if (status === 'error') return <div className="map-loading map-error">Map could not load. The rest of the dashboard still works.</div>;

  return (
    <div className="geo-map-wrap">
      <svg className={`geo-map-svg ${world ? 'is-world' : ''}`} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
        {features.map((feature, index) => {
          const name = featureName(feature);
          const key = norm(name);
          const isFocus = key === norm(focus);
          const isActive = key === norm(active);
          const isSelected = selectedNorm.has(key);
          const classNames = ['geo-shape', isSelected ? 'is-benchmark' : '', isFocus ? 'is-focus' : '', isActive ? 'is-active' : ''].filter(Boolean).join(' ');
          return <path key={`${key}-${index}`} d={pathForGeometry(feature.geometry, bounds, width, height, world ? 4 : 10)} className={classNames} onMouseEnter={() => setHover(name)} onMouseLeave={() => setHover('')} onClick={() => onSelect?.(name)} tabIndex={onSelect ? 0 : -1} onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onSelect) onSelect(name); }}><title>{name}</title></path>;
        })}
      </svg>
      <div className={`map-tooltip ${hover ? 'is-visible' : ''}`}>{hover || 'Hover over the map'}</div>
    </div>
  );
}

export function IndiaBenchmarkMap({ focusState, onStateSelect, benchmarkStates }) {
  return <section className="visual-card india-map-card"><div className="visual-card-head"><div><span className="section-tag">India comparison</span><h3>{focusState} and benchmark states</h3></div><span className="tiny-pill">Click a state</span></div><GeoMap url={INDIA_GEOJSON} ariaLabel="Interactive map of Indian states" selected={benchmarkStates} focus={focusState} active={focusState} onSelect={onStateSelect}/><div className="map-legend"><span><i className="legend-dot focus"/> Selected state</span><span><i className="legend-dot benchmark"/> Benchmark</span><span><i className="legend-dot neutral"/> Other states</span></div></section>;
}

export function StateDistrictMap({ state, district, onDistrictSelect }) {
  const url = stateDistrictGeoJsonUrl(state);
  return <section className="visual-card state-district-map-card"><div className="visual-card-head"><div><span className="section-tag">District view</span><h3>{state} districts</h3></div><span className="tiny-pill">{district === 'All districts' ? 'State overview' : district}</span></div><GeoMap url={url} ariaLabel={`Interactive map of ${state} districts`} active={district === 'All districts' ? '' : district} onSelect={onDistrictSelect}/><p className="micro-copy">Choose a district on the map or from the selector. CurioLens only presents district-level values when the official source supports that geography.</p></section>;
}

export function WorldEducationMap({ activeCountry, onCountrySelect, countries }) {
  return <section className="visual-card world-map-card"><div className="visual-card-head"><div><span className="section-tag">World context</span><h3>India and comparable countries</h3></div><span className="tiny-pill">Click a country</span></div><GeoMap url={WORLD_GEOJSON} ariaLabel="Interactive world map" selected={countries} focus="India" active={activeCountry} onSelect={onCountrySelect} world/><p className="micro-copy">Country comparisons are kept separate from state comparisons. They are prompts for learning, not proof that one place can simply copy another.</p></section>;
}
