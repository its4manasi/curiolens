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
  return Promise.all(definitions.map(async (definition) => {
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

function allStateMetricRows(datasets, metricKey) {
  const byState = new Map();
  for (const { definition, records } of datasets) {
    if (definition.geographyLevel !== 'state') continue;
    const metricKeys = definition.metricKeys?.length ? definition.metricKeys : DEFAULT_METRIC_KEYS;
    if (!metricKeys.includes(metricKey)) continue;
    for (const record of records || []) {
      const state = record.state;
      const values = record.metrics || record;
      if (!state || !isPresent(values?.[metricKey]) || byState.has(normalize(state))) continue;
      byState.set(normalize(state), {
        state,
        value: values[metricKey],
        source: definition.source,
        sourceUrl: definition.sourceUrl,
        period: definition.period,
        releaseDate: definition.releaseDate || null
      });
    }
  }
  return Array.from(byState.values());
}

function messageFor(level, exactCount) {
  if (level === 'state') return exactCount
    ? 'Latest available official state values loaded.'
    : 'No source-backed state metric is available for this selection yet.';
  if (exactCount) return `Latest available official ${level} values loaded for this selection.`;
  return `No verified ${level}-level education metric is connected for this selection yet. State figures are kept separate as context rather than shown as ${level} values.`;
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

    if (requestUrl.searchParams.get('benchmark') === '1') {
      const metric = requestUrl.searchParams.get('metric') || 'ptr';
      const rows = allStateMetricRows(datasets, metric);
      return Response.json({ metric, rows, count: rows.length }, {
        headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' }
      });
    }

    const stateLevel = candidateMetrics(datasets, 'state', state, '', '');
    const exact = requestedLevel === 'state'
      ? stateLevel
      : candidateMetrics(datasets, requestedLevel, state, division, district);

    // Important: do not substitute a state value into a district/division metric slot.
    // Finer-geography views return exact values only; state context travels separately.
    const metrics = exact.metrics;
    const metricMeta = exact.meta;
    const exactCount = Object.keys(metrics).length;

    return Response.json({
      state,
      division: divisionRequested ? division : null,
      district: districtRequested ? district : null,
      requestedGeographyLevel: requestedLevel,
      geographyLevel: requestedLevel === 'state' ? 'state' : (exactCount ? requestedLevel : `${requestedLevel}-unavailable`),
      metrics,
      metricMeta,
      stateContext: requestedLevel === 'state' ? null : {
        metrics: stateLevel.metrics,
        metricMeta: stateLevel.meta,
        label: `${state} state context`
      },
      dataPolicy: manifest.policy || null,
      manifestUpdated: manifest.updated || null,
      message: messageFor(requestedLevel, exactCount)
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
      stateContext: null,
      message: 'The education data manifest could not be loaded. No value was substituted or guessed.',
      error: error instanceof Error ? error.message : 'Unknown data error'
    }, { status: 503 });
  }
}
