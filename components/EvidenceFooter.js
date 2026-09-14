export default function EvidenceFooter({
  sourceName,
  href,
  period,
  label = 'Check official data',
  status = 'planned',
}) {
  return (
    <div className={`evidence-footer ${status === 'live' ? 'is-live' : ''}`}>
      <div className="evidence-source-copy">
        <span>{status === 'live' ? 'Official source' : 'Planned official source'}</span>
        <strong>{sourceName}</strong>
        {period ? <small>{period}</small> : null}
      </div>
      <a href={href} target="_blank" rel="noreferrer" aria-label={`${label}: ${sourceName}`}>
        {label} ↗
      </a>
    </div>
  );
}
