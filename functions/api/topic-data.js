const INDIA = 'IND';
const CACHE_SECONDS = 21600;

function cleanText(html = '') {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchText(url, accept = 'text/html,text/plain;q=0.9,*/*;q=0.8') {
  const response = await fetch(url, {
    headers: { Accept: accept, 'User-Agent': 'CurioLens/1.0 (+https://curiolens.pages.dev)' },
    cf: { cacheEverything: true, cacheTtl: CACHE_SECONDS }
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cf: { cacheEverything: true, cacheTtl: CACHE_SECONDS }
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

function metric(value, period, source, sourceUrl, extra = {}) {
  return {
    value,
    period: period || null,
    source,
    sourceUrl,
    latestAvailable: true,
    fetchedAt: new Date().toISOString(),
    ...extra
  };
}

async function worldBank(indicator, label = 'World Bank') {
  const url = `https://api.worldbank.org/v2/country/${INDIA}/indicator/${indicator}?format=json&per_page=80&date=2000:2035`;
  const payload = await fetchJson(url);
  const rows = Array.isArray(payload) ? payload[1] : [];
  const row = (rows || []).find((item) => item && item.value !== null && item.value !== undefined);
  if (!row) return null;
  return metric(row.value, row.date, label, `https://data.worldbank.org/indicator/${indicator}?locations=IN`, {
    indicator,
    geography: 'India'
  });
}

async function nasaTemperature() {
  const url = 'https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv';
  const csv = await fetchText(url, 'text/csv,text/plain;q=0.9,*/*;q=0.8');
  const lines = csv.split(/\r?\n/).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const cols = lines[i].split(',');
    if (!/^\d{4}$/.test((cols[0] || '').trim())) continue;
    const annual = Number(cols[13] || cols[1]);
    if (!Number.isFinite(annual)) continue;
    return metric(annual, cols[0].trim(), 'NASA GISS', 'https://data.giss.nasa.gov/gistemp/', {
      unit: '°C anomaly vs 1951–1980'
    });
  }
  return null;
}

async function noaaTrend(kind) {
  const isMethane = kind === 'methane';
  const url = isMethane ? 'https://gml.noaa.gov/ccgg/trends_ch4/' : 'https://gml.noaa.gov/ccgg/trends/global.html';
  const text = cleanText(await fetchText(url));
  const unit = isMethane ? 'ppb' : 'ppm';
  const monthNames = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*';
  const regex = new RegExp(`(${monthNames})\\s+(20\\d{2})[^0-9]{0,20}([0-9]{3,4}(?:\\.[0-9]+)?)\\s*${unit}`, 'i');
  const match = text.match(regex);
  if (!match) return null;
  return metric(Number(match[3]), `${match[1]} ${match[2]}`, 'NOAA GML', url, { unit });
}

async function ccpiIndia() {
  const url = 'https://ccpi.org/country/ind/';
  const text = cleanText(await fetchText(url));
  const rank = text.match(/India ranks\s+(\d+)(?:st|nd|rd|th)/i);
  const edition = text.match(/CCPI\s+(20\d{2})/i);
  if (!rank) return null;
  return metric(Number(rank[1]), edition?.[1] || null, 'Climate Change Performance Index', url, {
    unit: 'rank',
    note: 'Overall CCPI rank; lower rank is better.'
  });
}

async function epiIndia() {
  const discoveryUrls = ['https://epi.yale.edu/', 'https://epi.yale.edu/epi-results'];
  let year = null;
  for (const discovery of discoveryUrls) {
    try {
      const html = await fetchText(discovery);
      const years = [...html.matchAll(/(?:country|measure)\/(20\d{2})\//g)].map((m) => Number(m[1]));
      if (years.length) year = Math.max(...years);
      if (year) break;
    } catch {}
  }
  if (!year) return null;
  const url = `https://epi.yale.edu/country/${year}/IND`;
  const text = cleanText(await fetchText(url));
  const read = (label) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = text.match(new RegExp(`${escaped}\\s+(\\d+)\\s+([0-9.]+)`, 'i'));
    return match ? { rank: Number(match[1]), score: Number(match[2]) } : null;
  };
  const overall = read('Environmental Performance Index');
  const biodiversity = read('Biodiversity & Habitat');
  const air = read('Air Quality');
  const forests = read('Forests');
  return { year, url, overall, biodiversity, air, forests };
}


async function genderPortalIndicator(slug, label) {
  const url = `https://genderdata.worldbank.org/en/indicator/${slug}`;
  const text = cleanText(await fetchText(url));
  // The Gender Data Portal renders the newest available year in its India table.
  // Read the India row instead of assuming a reporting year in CurioLens code.
  const match = text.match(/India\s+(20\d{2})\s+([0-9.]+)/i);
  if (!match) return null;
  return metric(Number(match[2]), match[1], label, url, { unit: '0–100' });
}

async function wefGenderGap() {
  const seriesUrl = 'https://www.weforum.org/publications/series/global-gender-gap-report/';
  const seriesHtml = await fetchText(seriesUrl);
  const years = [...seriesHtml.matchAll(/Global Gender Gap Report\s+(20\d{2})/gi)].map((m) => Number(m[1]));
  if (!years.length) return null;
  const year = Math.max(...years);
  const candidates = [
    `https://www.weforum.org/publications/global-gender-gap-report-${year}/in-full/benchmarking-gender-gaps-${year}/`,
    `https://www.weforum.org/publications/global-gender-gap-report-${year}/`
  ];
  for (const url of candidates) {
    try {
      const text = cleanText(await fetchText(url));
      const rank = text.match(/India ranks\s+(\d+)(?:st|nd|rd|th)/i);
      const score = text.match(/India ranks[\s\S]{0,180}?score of\s+([0-9.]+)%/i);
      if (rank) return {
        rank: metric(Number(rank[1]), String(year), 'World Economic Forum', url, { unit: 'rank' }),
        parity: score ? metric(Number(score[1]), String(year), 'World Economic Forum', url, { unit: '%' }) : null
      };
    } catch {}
  }
  return null;
}

async function ipuWomen() {
  const url = 'https://www.ipu.org/parlement/IN';
  const text = cleanText(await fetchText(url));
  const match = text.match(/Women in parliament\s+([0-9.]+)%/i);
  if (!match) return null;
  return metric(Number(match[1]), null, 'Inter-Parliamentary Union', url, { unit: '% of lower-house MPs' });
}

async function wpsIndia() {
  const url = 'https://giwps.georgetown.edu/the-index/country/india/';
  try {
    const text = cleanText(await fetchText(url));
    const rank = text.match(/Global Rank\s+(\d+)\s+of\s+(\d+)/i);
    const score = text.match(/Index Score\s+([0-9.]+)\s+of\s+1/i);
    if (!rank && !score) return null;
    return {
      rank: rank ? metric(Number(rank[1]), null, 'Women, Peace and Security Index', url, { outOf: Number(rank[2]), unit: 'rank' }) : null,
      score: score ? metric(Number(score[1]), null, 'Women, Peace and Security Index', url, { unit: '0–1 index' }) : null
    };
  } catch {
    return null;
  }
}


async function transparencyIndia() {
  const url = 'https://www.transparency.org/en/countries/india';
  const text = cleanText(await fetchText(url));
  const score = text.match(/India has a score of\s+(\d+(?:\.\d+)?)\s+this year/i) || text.match(/Score\s+(\d+(?:\.\d+)?)\s*\/\s*100/i);
  const rank = text.match(/ranks\s+(\d+)\s+out of\s+(\d+)\s+countries/i) || text.match(/Rank\s+(\d+)\s*\/\s*(\d+)/i);
  if (!score && !rank) return null;
  return {
    score: score ? metric(Number(score[1]), null, 'Transparency International', url, { unit: '0–100' }) : null,
    rank: rank ? metric(Number(rank[1]), null, 'Transparency International', url, { unit: 'rank', outOf: Number(rank[2]) }) : null
  };
}

async function globalHungerIndia() {
  const url = 'https://www.globalhungerindex.org/india.html';
  const text = cleanText(await fetchText(url));
  const yearMatch = text.match(/India[’']s\s+(20\d{2})\s+GHI score is\s+([0-9.]+)/i);
  const rank = text.match(/India is ranked\s+(\d+)(?:st|nd|rd|th)\s+out of\s+(\d+)/i);
  const wasting = text.match(/child wasting rate,?\s+at\s+([0-9.]+)\s*percent/i);
  const stunting = text.match(/child stunting rate is\s+([0-9.]+)\s*percent/i);
  if (!yearMatch && !rank) return null;
  const year = yearMatch?.[1] || null;
  return {
    score: yearMatch ? metric(Number(yearMatch[2]), year, 'Global Hunger Index', url, { unit: 'GHI score' }) : null,
    rank: rank ? metric(Number(rank[1]), year, 'Global Hunger Index', url, { unit: 'rank', outOf: Number(rank[2]) }) : null,
    wasting: wasting ? metric(Number(wasting[1]), year, 'Global Hunger Index', url, { unit: '%' }) : null,
    stunting: stunting ? metric(Number(stunting[1]), year, 'Global Hunger Index', url, { unit: '%' }) : null
  };
}

async function topicClimate() {
  const [temperature, co2, methane, co2pc, forestShare, renewableElectricity, ccpi, epi] = await Promise.all([
    nasaTemperature().catch(() => null),
    noaaTrend('co2').catch(() => null),
    noaaTrend('methane').catch(() => null),
    worldBank('EN.ATM.CO2E.PC').catch(() => null),
    worldBank('AG.LND.FRST.ZS').catch(() => null),
    worldBank('EG.ELC.RNEW.ZS').catch(() => null),
    ccpiIndia().catch(() => null),
    epiIndia().catch(() => null)
  ]);
  const metrics = { temperature, co2, methane, co2pc, forestShare, renewableElectricity, ccpi };
  if (epi) {
    metrics.epiOverall = epi.overall ? metric(epi.overall.rank, String(epi.year), 'Yale Environmental Performance Index', epi.url, { score: epi.overall.score, unit: 'rank' }) : null;
    metrics.epiBiodiversity = epi.biodiversity ? metric(epi.biodiversity.rank, String(epi.year), 'Yale Environmental Performance Index', epi.url, { score: epi.biodiversity.score, unit: 'rank' }) : null;
    metrics.epiAir = epi.air ? metric(epi.air.rank, String(epi.year), 'Yale Environmental Performance Index', epi.url, { score: epi.air.score, unit: 'rank' }) : null;
    metrics.epiForests = epi.forests ? metric(epi.forests.rank, String(epi.year), 'Yale Environmental Performance Index', epi.url, { score: epi.forests.score, unit: 'rank' }) : null;
  }
  return metrics;
}

async function topicWomen() {
  const [femaleLfpr, femaleUnemployment, femaleAccount, ipu, wef, wps, wblLaw, wblSupport, wblEnforcement] = await Promise.all([
    worldBank('SL.TLF.CACT.FE.ZS').catch(() => null),
    worldBank('SL.UEM.TOTL.FE.ZS').catch(() => null),
    worldBank('FX.OWN.TOTL.FE.ZS').catch(() => null),
    ipuWomen().catch(() => null),
    wefGenderGap().catch(() => null),
    wpsIndia().catch(() => null),
    genderPortalIndicator('gd_wbl_ovl_law', 'World Bank Women, Business and the Law — legal frameworks').catch(() => null),
    genderPortalIndicator('gd_wbl_ovl_sfr', 'World Bank Women, Business and the Law — supportive frameworks').catch(() => null),
    genderPortalIndicator('gd_wbl_ovl_enf', 'World Bank Women, Business and the Law — enforcement perceptions').catch(() => null)
  ]);
  return {
    femaleLfpr,
    femaleUnemployment,
    femaleAccount,
    womenParliament: ipu,
    globalGenderGapRank: wef?.rank || null,
    globalGenderGapParity: wef?.parity || null,
    wpsRank: wps?.rank || null,
    wpsScore: wps?.score || null,
    wblLaw,
    wblSupport,
    wblEnforcement
  };
}


const NITI_FHI_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya',
  'Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal'
];

function absoluteNitiUrl(href) {
  if (!href) return null;
  if (/^https?:\/\//i.test(href)) return href;
  return `https://www.niti.gov.in${href.startsWith('/') ? '' : '/'}${href}`;
}

function anchorCandidates(html = '') {
  const out = [];
  for (const m of String(html).matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    out.push({ href: m[1], text: cleanText(m[2]) });
  }
  return out;
}

async function latestNitiFiscalHealth() {
  // Discover the current edition from NITI's own publication listings. No edition year is hard-coded.
  const discoveryPages = [
    'https://www.niti.gov.in/node/13',
    'https://www.niti.gov.in/publications/division-reports',
    'https://www.niti.gov.in/publications/division-reports?page=1',
    'https://www.niti.gov.in/publications/division-reports?page=2',
    'https://www.niti.gov.in/publications/division-reports?page=3'
  ];
  let best = null;
  for (const page of discoveryPages) {
    try {
      const html = await fetchText(page);
      for (const a of anchorCandidates(html)) {
        const m = a.text.match(/Fiscal\s+Health\s+Index\s*-?\s*(20\d{2})/i);
        if (!m) continue;
        const edition = Number(m[1]);
        if (!best || edition > best.edition) best = { edition, pageUrl: absoluteNitiUrl(a.href) };
      }
      if (!best) {
        const text = cleanText(html);
        for (const m of text.matchAll(/Fiscal\s+Health\s+Index\s*-?\s*(20\d{2})/gi)) {
          const edition = Number(m[1]);
          if (!best || edition > best.edition) best = { edition, pageUrl: page };
        }
      }
    } catch {}
  }
  if (!best) return null;

  // If discovery only found a listing page, try the current-edition 'what's new' slug, then fall back to listing text.
  const candidates = [
    best.pageUrl,
    `https://www.niti.gov.in/whats-new/fiscal-health-index-${best.edition}`
  ].filter(Boolean);
  let reportUrl = null;
  let text = '';
  let sourceUrl = candidates[0];
  for (const candidate of candidates) {
    try {
      const html = await fetchText(candidate);
      const anchors = anchorCandidates(html);
      const pdf = anchors.find((a) => /fiscal.*health.*index/i.test(a.href) && /\.pdf(?:$|\?)/i.test(a.href)) || anchors.find((a) => /\.pdf(?:$|\?)/i.test(a.href));
      if (pdf) reportUrl = absoluteNitiUrl(pdf.href);
      text = cleanText(html);
      sourceUrl = candidate;
      if (/States\s+FHI\s+Score|Final Ranking of States/i.test(text)) break;
    } catch {}
  }

  // NITI publication pages expose extracted report text in HTML. Parse the newest table when available.
  const fiscalYear = (text.match(/Financial\s+Year\s+(20\d{2}[-–]\d{2})/i) || [])[1] || null;
  const rows = [];
  const normalized = text.replace(/–/g, '-');
  const sortedStates = [...NITI_FHI_STATES].sort((a,b) => b.length - a.length);
  for (const state of sortedStates) {
    const esc = state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const re = new RegExp(`${esc}\s+(\d{1,3}(?:\.\d+)?)\s+(\d{1,2})\s+(\d{1,3}(?:\.\d+)?)\s+(\d{1,3}(?:\.\d+)?)\s+(\d{1,3}(?:\.\d+)?)\s+(\d{1,3}(?:\.\d+)?)\s+(\d{1,3}(?:\.\d+)?)`, 'i');
    const m = normalized.match(re);
    if (!m) continue;
    rows.push({
      state, score: Number(m[1]), rank: Number(m[2]),
      qualityOfExpenditure: Number(m[3]), revenueMobilisation: Number(m[4]),
      fiscalPrudence: Number(m[5]), debtIndex: Number(m[6]), debtSustainability: Number(m[7])
    });
  }
  rows.sort((a,b) => a.rank - b.rank);

  return {
    edition: best.edition,
    fiscalYear,
    source: 'NITI Aayog Fiscal Health Index',
    sourceUrl,
    reportUrl: reportUrl || sourceUrl,
    states: rows,
    dimensions: ['Quality of expenditure','Revenue mobilisation','Fiscal prudence','Debt index','Debt sustainability'],
    latestAvailable: true,
    fetchedAt: new Date().toISOString()
  };
}

async function topicEconomy() {
  const [gdpGrowth, gdpPerCapita, unemployment, inflation, fiscalHealth] = await Promise.all([
    worldBank('NY.GDP.MKTP.KD.ZG').catch(() => null),
    worldBank('NY.GDP.PCAP.CD').catch(() => null),
    worldBank('SL.UEM.TOTL.ZS').catch(() => null),
    worldBank('FP.CPI.TOTL.ZG').catch(() => null),
    latestNitiFiscalHealth().catch(() => null)
  ]);
  return { gdpGrowth, gdpPerCapita, unemployment, inflation, fiscalHealth };
}

async function topicDevelopment() {
  const [gini, poverty, lifeExpectancy, under5, ghi] = await Promise.all([
    worldBank('SI.POV.GINI').catch(() => null),
    worldBank('SI.POV.LMIC.GP').catch(() => null),
    worldBank('SP.DYN.LE00.IN').catch(() => null),
    worldBank('SH.DYN.MORT').catch(() => null),
    globalHungerIndia().catch(() => null)
  ]);
  return { gini, poverty, lifeExpectancy, under5, ghiScore: ghi?.score || null, ghiRank: ghi?.rank || null, childWasting: ghi?.wasting || null, childStunting: ghi?.stunting || null };
}

async function topicDemocracy() {
  const [voice, corruptionControl, governmentEffectiveness, ruleOfLaw, cpi] = await Promise.all([
    worldBank('VA.EST', 'Worldwide Governance Indicators').catch(() => null),
    worldBank('CC.EST', 'Worldwide Governance Indicators').catch(() => null),
    worldBank('GE.EST', 'Worldwide Governance Indicators').catch(() => null),
    worldBank('RL.EST', 'Worldwide Governance Indicators').catch(() => null),
    transparencyIndia().catch(() => null)
  ]);
  return { voice, corruptionControl, governmentEffectiveness, ruleOfLaw, cpiScore: cpi?.score || null, cpiRank: cpi?.rank || null };
}

async function topicHealth() {
  const [lifeExpectancy, maternalMortality, under5, infantMortality] = await Promise.all([
    worldBank('SP.DYN.LE00.IN').catch(() => null),
    worldBank('SH.STA.MMRT').catch(() => null),
    worldBank('SH.DYN.MORT').catch(() => null),
    worldBank('SP.DYN.IMRT.IN').catch(() => null)
  ]);
  return { lifeExpectancy, maternalMortality, under5, infantMortality };
}

const handlers = {
  climate: topicClimate,
  women: topicWomen,
  economy: topicEconomy,
  development: topicDevelopment,
  democracy: topicDemocracy,
  health: topicHealth
};

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const topic = (url.searchParams.get('topic') || '').toLowerCase();
  const handler = handlers[topic];
  if (!handler) return Response.json({ error: 'Unsupported topic' }, { status: 400 });

  try {
    const metrics = await handler();
    return Response.json({
      topic,
      policy: 'Live official source first. Each provider returns its newest non-null/current published value. Existing page values remain a labelled fallback if a source is temporarily unavailable.',
      metrics,
      generatedAt: new Date().toISOString()
    }, {
      headers: { 'Cache-Control': `public, max-age=300, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400` }
    });
  } catch (error) {
    return Response.json({ topic, metrics: {}, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 503 });
  }
}
