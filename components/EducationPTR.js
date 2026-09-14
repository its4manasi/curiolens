'use client';

import { useEffect, useMemo, useState } from 'react';

function pickField(record, patterns) {
  const entries = Object.entries(record || {});
  for (const pattern of patterns) {
    const found = entries.find(([key]) => key.toLowerCase().replace(/[^a-z0-9]+/g, ' ').includes(pattern));
    if (found) return found[1];
  }
  return null;
}

function normalizeRow(record) {
  return {
    state: pickField(record, ['india state ut', 'state ut', 'state name', 'state']),
    primary: pickField(record, ['pupil teacher ratio ptr primary', 'ptr primary', 'primary 1 to 5']),
    upperPrimary: pickField(record, ['pupil teacher ratio ptr upper primary', 'ptr upper primary', 'upper primary 6 8']),
    secondary: pickField(record, ['pupil teacher ratio ptr secondary', 'ptr secondary', 'secondary 9 10']),
    higherSecondary: pickField(record, ['pupil teacher ratio ptr higher secondary', 'ptr higher secondary', 'higher secondary 11 12']),
  };
}

function numberOrDash(value) {
  if (value === null || value === undefined || value === '') return '—';
  const number = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(number) ? number : value;
}

export default function EducationPTR() {
  const [status, setStatus] = useState('loading');
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState('');

  useEffect(() => {
    let active = true;

    fetch('/api/education')
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body?.message || 'Education data request failed');
        return body;
      })
      .then((body) => {
        if (!active) return;
        const normalized = (body.records || [])
          .map(normalizeRow)
          .filter((row) => row.state);
        setRows(normalized);
        setSelected(normalized.find((row) => /india/i.test(row.state))?.state || normalized[0]?.state || '');
        setStatus(normalized.length ? 'ready' : 'empty');
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message);
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  const current = useMemo(
    () => rows.find((row) => row.state === selected) || rows[0],
    [rows, selected]
  );

  return (
    <section className="education-panel" aria-live="polite">
      <div className="data-card-topline">
        <div>
          <span className="kicker">Government of India data</span>
          <h2>Pupil–teacher ratio</h2>
        </div>
        <span className="live-badge">Live via data.gov.in</span>
      </div>

      {status === 'loading' && <p className="data-status">Connecting to the education data source…</p>}

      {status === 'error' && (
        <div className="connection-note">
          <strong>Connector is ready, but it still needs your data.gov.in API settings.</strong>
          <p>{message}</p>
          <p>Once the Cloudflare environment variables are added, this card will populate automatically without storing the government dataset in CurioLens.</p>
        </div>
      )}

      {status === 'empty' && <p className="data-status">The source returned no rows.</p>}

      {status === 'ready' && current && (
        <>
          <label className="state-picker">
            <span>Choose India / State / UT</span>
            <select value={selected} onChange={(event) => setSelected(event.target.value)}>
              {rows.map((row) => <option key={row.state} value={row.state}>{row.state}</option>)}
            </select>
          </label>

          <div className="metric-grid">
            <div className="metric-card"><span>Primary</span><strong>{numberOrDash(current.primary)}</strong><small>students per teacher</small></div>
            <div className="metric-card"><span>Upper primary</span><strong>{numberOrDash(current.upperPrimary)}</strong><small>students per teacher</small></div>
            <div className="metric-card"><span>Secondary</span><strong>{numberOrDash(current.secondary)}</strong><small>students per teacher</small></div>
            <div className="metric-card"><span>Higher secondary</span><strong>{numberOrDash(current.higherSecondary)}</strong><small>students per teacher</small></div>
          </div>

          <p className="source-line">Source: Ministry of Education / UDISE+ via Open Government Data Platform India. Values are requested when the page is opened.</p>
        </>
      )}
    </section>
  );
}
