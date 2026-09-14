'use client';

import useLiveTopicData from './useLiveTopicData';

function fmt(value, digits = 1) {
  return value == null ? '—' : Number(value).toFixed(digits);
}

export default function HealthDashboard() {
  const { metrics, status } = useLiveTopicData('health');
  const cards = [
    { key: 'lifeExpectancy', label: 'Life expectancy', value: metrics.lifeExpectancy ? `${fmt(metrics.lifeExpectancy.value)} years` : '—', explain: 'Average years a newborn would live if current mortality patterns continued.' },
    { key: 'maternalMortality', label: 'Maternal mortality', value: metrics.maternalMortality ? `${fmt(metrics.maternalMortality.value, 0)}` : '—', explain: 'Maternal deaths per 100,000 live births.' },
    { key: 'under5', label: 'Under-5 mortality', value: metrics.under5 ? `${fmt(metrics.under5.value)} / 1,000` : '—', explain: 'Deaths before age five per 1,000 live births.' },
    { key: 'infantMortality', label: 'Infant mortality', value: metrics.infantMortality ? `${fmt(metrics.infantMortality.value)} / 1,000` : '—', explain: 'Deaths before age one per 1,000 live births.' },
  ];

  return <div className="health-live-dashboard">
    <div className="live-index-head"><div><span className="section-tag">India · latest available</span><h2>Health indicators with their actual publication year.</h2><p>No fixed year is requested. CurioLens uses the newest non-null observation returned by the source.</p></div><span className={`live-status ${status}`}>{status === 'ready' ? 'Latest series checked' : status === 'loading' ? 'Checking latest data…' : 'Source temporarily unavailable'}</span></div>
    <section className="live-index-grid">
      {cards.map((card) => {
        const m = metrics[card.key];
        return <article key={card.key}><span>{card.label}</span><strong>{card.value}</strong><small>{m?.period || 'Latest available'}</small><p>{card.explain}</p>{m?.sourceUrl && <a className="evidence-link" href={m.sourceUrl} target="_blank" rel="noreferrer">{m.source} ↗</a>}</article>;
      })}
    </section>
  </div>;
}
