'use client';

import { useEffect, useState } from 'react';

export default function WorldBankStat({ country = 'IND', indicator = 'SP.POP.TOTL' }) {
  const [state, setState] = useState({ status: 'loading', data: null });

  useEffect(() => {
    let active = true;
    const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&per_page=10`;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error('Public data request failed');
        return response.json();
      })
      .then((json) => {
        const rows = Array.isArray(json?.[1]) ? json[1] : [];
        const latest = rows.find((row) => row.value !== null);
        if (!active) return;
        if (!latest) {
          setState({ status: 'empty', data: null });
          return;
        }
        setState({
          status: 'ready',
          data: {
            country: latest.country?.value,
            year: latest.date,
            value: latest.value,
            indicator: latest.indicator?.value,
          },
        });
      })
      .catch(() => active && setState({ status: 'error', data: null }));

    return () => {
      active = false;
    };
  }, [country, indicator]);

  return (
    <section className="data-card" aria-live="polite">
      <div className="data-card-topline">
        <span className="kicker">Public data</span>
        <span className="live-badge">Live API</span>
      </div>
      {state.status === 'loading' && <p className="data-status">Loading latest World Bank value…</p>}
      {state.status === 'error' && <p className="data-status">The public data source is temporarily unavailable.</p>}
      {state.status === 'empty' && <p className="data-status">No current value was returned by the source.</p>}
      {state.status === 'ready' && (
        <>
          <strong>{state.data.indicator}</strong>
          <div className="value">{new Intl.NumberFormat('en-IN').format(state.data.value)}</div>
          <div>{state.data.country} · {state.data.year}</div>
          <div className="source">Source: World Bank Indicators API · fetched when this page is opened</div>
        </>
      )}
    </section>
  );
}
