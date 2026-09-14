'use client';

import useLiveTopicData from './useLiveTopicData';

function fmt(value, digits = 1) {
  return value == null ? '—' : Number(value).toFixed(digits);
}

export default function HealthDashboard() {
  const { metrics, status, countryName } = useLiveTopicData('health');
  const cards = [
    { key: 'lifeExpectancy', label: 'Life expectancy', value: metrics.lifeExpectancy ? `${fmt(metrics.lifeExpectancy.value)} years` : '—', explain: 'Average years a newborn would live if current mortality patterns continued.' },
    { key: 'uhcCoverage', label: 'UHC service coverage', value: metrics.uhcCoverage ? `${fmt(metrics.uhcCoverage.value, 0)} / 100` : '—', explain: 'Coverage of essential health services. Higher is better.' },
    { key: 'maternalMortality', label: 'Maternal mortality', value: metrics.maternalMortality ? `${fmt(metrics.maternalMortality.value, 0)} / 100k` : '—', explain: 'Maternal deaths per 100,000 live births.' },
    { key: 'under5', label: 'Under-5 mortality', value: metrics.under5 ? `${fmt(metrics.under5.value)} / 1,000` : '—', explain: 'Deaths before age five per 1,000 live births.' },
    { key: 'infantMortality', label: 'Infant mortality', value: metrics.infantMortality ? `${fmt(metrics.infantMortality.value)} / 1,000` : '—', explain: 'Deaths before age one per 1,000 live births.' },
    { key: 'tbIncidence', label: 'TB incidence', value: metrics.tbIncidence ? `${fmt(metrics.tbIncidence.value, 0)} / 100k` : '—', explain: 'Estimated new and relapse tuberculosis cases per 100,000 people.' },
    { key: 'outOfPocket', label: 'Out-of-pocket burden', value: metrics.outOfPocket ? `${fmt(metrics.outOfPocket.value)}%` : '—', explain: 'Share of current health spending paid directly by households.' },
    { key: 'healthSpend', label: 'Health spending', value: metrics.healthSpend ? `${fmt(metrics.healthSpend.value)}% GDP` : '—', explain: 'Current health expenditure as a share of the economy.' },
  ];

  return <div className="health-live-dashboard health-v22">
    <div className="live-index-head"><div><span className="section-tag">{countryName} · latest available</span><h2>Health coverage, outcomes and disease burden.</h2><p>CurioLens requests the newest non-null observation exposed by the source, then shows its actual reference year.</p></div><span className={`live-status ${status}`}>{status === 'ready' ? 'Latest series checked' : status === 'loading' ? 'Checking latest data…' : 'Source temporarily unavailable'}</span></div>
    <section className="live-index-grid health-index-grid">
      {cards.map((card) => {
        const m = metrics[card.key];
        return <article key={card.key}><span>{card.label}</span><strong>{card.value}</strong><small>{m?.period || 'Latest available'}</small><p>{card.explain}</p>{m?.sourceUrl && <a className="evidence-link" href={m.sourceUrl} target="_blank" rel="noreferrer">{m.source} ↗</a>}</article>;
      })}
    </section>
  </div>;
}
