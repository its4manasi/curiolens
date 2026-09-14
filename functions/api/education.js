const DEFAULT_METRIC_KEYS = [
  'population', 'schools', 'students', 'teachers', 'ptr', 'literacy', 'girls',
  'secondary', 'higherEd', 'avgTeachersPerSchool', 'avgStudentsPerSchool'
];

const normalize = (value = '') => String(value)
  .trim()
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]/g, '');

const isPresent = (value) => value !== undefined && value !== null && value !== '';

function samePlace(a, b) {
  return normalize(a) === normalize(b);
}

function releaseRank(dataset) {
  const date = Date.parse(dataset.releaseDate || '');
  if (Number.isFinite(date)) return date;
  const years = String(dataset.period || '').match(/\d{4}/g) || [];
  return years.length ? Number(years[years.length - 1]) * 10000 : 0;
}

function toAbsoluteUrl(value, requestUrl, manifestUrl) {
  if (!value) return null;
  try {
    if (/^https?:\/\//i.test(value)) return value;
    const base = manifestUrl || requestUrl.origin;
    return new URL(value, base).toString();
  } catch {
    return null;
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cf: { cacheEverything: true, cacheTtl: 3600 }
  });
  if (!response.ok) throw new Error(`Data fetch failed: ${response.status}`);
  return response.json();
}

async function loadManifest(context, requestUrl) {
  const configured = context.env?.CURIOLENS_EDUCATION_MANIFEST_URL;
  const manifestUrl = configured
    ? new URL(configured, requestUrl.origin).toString()
    : new URL('/data/education/manifest.json', requestUrl.origin).toString();
  const manifest = await fetchJson(manifestUrl);
  return { manifest, manifestUrl };
}

async function loadDatasets(manifest, manifestUrl, requestUrl) {
  const definitions = [...(manifest.datasets || [])].sort((a, b) => releaseRank(b) - releaseRank(a));
  const loaded = await Promise.all(definitions.map(async (definition) => {
    try {
      if (Array.isArray(definition.records)) return { definition, records: definition.records };
      const dataUrl = toAbsoluteUrl(definition.dataUrl, requestUrl, manifestUrl);
      if (!dataUrl) return { definition, records: [] };
      const payload = await fetchJson(dataUrl);
      return { definition, records: Array.isArray(payload) ? payload : (payload.records || []) };
    } catch {
      return { definition, records: [] };
    }
  }));
  return loaded;
}

function recordMatches(record, level, state, division, district) {
  if (!samePlace(record.state, state)) return false;
  if (level === 'state') return true;
  if (level === 'division') return Boolean(record.division && samePlace(record.division, division));
  if (level === 'district') return Boolean(record.district && samePlace(record.district, district));
  return false;
}

function candidateMetrics(datasets, level, state, division, district) {
  const result = {};
  const meta = {};

  for (const { definition, records } of datasets) {
    if (definition.geographyLevel !== level) continue;
    const record = records.find((item) => recordMatches(item, level, state, division, district));
    if (!record) continue;
    const values = record.metrics || record;
    const metricKeys = definition.metricKeys?.length ? definition.metricKeys : DEFAULT_METRIC_KEYS;

    for (const key of metricKeys) {
      if (isPresent(result[key]) || !isPresent(values[key])) continue;
      result[key] = values[key];
      meta[key] = {
        datasetId: definition.id,
        source: definition.source,
        sourceUrl: definition.sourceUrl,
        period: definition.period,
        releaseDate: definition.releaseDate || null,
        geographyLevel: level,
        latestAvailable: true,
        isFallback: false
      };
    }
  }

  return { metrics: result, meta };
}

function mergeWithStateFallback(exact, stateLevel, requestedLevel) {
  const metrics = { ...exact.metrics };
  const metricMeta = { ...exact.meta };

  for (const [key, value] of Object.entries(stateLevel.metrics)) {
    if (isPresent(metrics[key])) continue;
    metrics[key] = value;
    metricMeta[key] = {
      ...stateLevel.meta[key],
      requestedGeographyLevel: requestedLevel,
      isFallback: requestedLevel !== 'state',
      fallbackReason: requestedLevel === 'state' ? null : `${requestedLevel} value unavailable; using latest state context`
    };
  }

  return { metrics, metricMeta };
}

function messageFor(level, metricMeta) {
  const values = Object.values(metricMeta || {});
  if (!values.length) return 'No source-backed metric is available for this selection yet.';
  if (level === 'state') return 'Latest available official value is selected independently for each metric.';
  const exactCount = values.filter((item) => item.geographyLevel === level && !item.isFallback).length;
  const fallbackCount = values.filter((item) => item.isFallback).length;
  if (exactCount && fallbackCount) return `Using latest available ${level} values where connected; missing metrics use clearly labelled state context.`;
  if (exactCount) return `Latest available official ${level} values loaded for this selection.`;
  return `${level[0].toUpperCase() + level.slice(1)} selected. District/division-specific values are not connected for these metrics yet, so the latest state figures are shown only as labelled context.`;
}

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const state = requestUrl.searchParams.get('state') || 'Bihar';
  const division = requestUrl.searchParams.get('division') || '';
  const district = requestUrl.searchParams.get('district') || '';
  const districtRequested = Boolean(district && district !== 'All districts');
  const divisionRequested = Boolean(!districtRequested && division && division !== 'All divisions');
  const requestedLevel = districtRequested ? 'district' : (divisionRequested ? 'division' : 'state');

  try {
    const { manifest, manifestUrl } = await loadManifest(context, requestUrl);
    const datasets = await loadDatasets(manifest, manifestUrl, requestUrl);
    const stateLevel = candidateMetrics(datasets, 'state', state, '', '');
    const exact = requestedLevel === 'state'
      ? stateLevel
      : candidateMetrics(datasets, requestedLevel, state, division, district);
    const resolved = mergeWithStateFallback(exact, stateLevel, requestedLevel);

    const hasExact = Object.values(resolved.metricMeta).some((item) => item.geographyLevel === requestedLevel && !item.isFallback);
    const hasFallback = Object.values(resolved.metricMeta).some((item) => item.isFallback);

    return Response.json({
      state,
      division: divisionRequested ? division : null,
      district: districtRequested ? district : null,
      requestedGeographyLevel: requestedLevel,
      geographyLevel: requestedLevel === 'state'
        ? 'state'
        : (hasExact ? (hasFallback ? `${requestedLevel}-partial` : requestedLevel) : `${requestedLevel}-state-context`),
      metrics: resolved.metrics,
      metricMeta: resolved.metricMeta,
      dataPolicy: manifest.policy || null,
      manifestUpdated: manifest.updated || null,
      message: messageFor(requestedLevel, resolved.metricMeta)
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    return Response.json({
      state,
      division: divisionRequested ? division : null,
      district: districtRequested ? district : null,
      requestedGeographyLevel: requestedLevel,
      geographyLevel: 'unavailable',
      metrics: {},
      metricMeta: {},
      message: 'The education data manifest could not be loaded. No value was substituted or guessed.',
      error: error instanceof Error ? error.message : 'Unknown data error'
    }, { status: 503 });
  }
}
