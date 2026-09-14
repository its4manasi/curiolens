import { countryByCode, slugifyCountry } from '../../lib/countries.js';
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

function regexEscape(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function worldBank(indicator, label = 'World Bank', country = countryByCode('IND')) {
  const url = `https://api.worldbank.org/v2/country/${country.code}/indicator/${indicator}?format=json&per_page=80&date=2000:2035`;
  const payload = await fetchJson(url);
  const rows = Array.isArray(payload) ? payload[1] : [];
  const row = (rows || []).find((item) => item && item.value !== null && item.value !== undefined);
  if (!row) return null;
  return metric(row.value, row.date, label, `https://data.worldbank.org/indicator/${indicator}?locations=${country.alpha2 || country.code}`, {
    indicator,
    geography: country.name,
    countryCode: country.code
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

async function ccpiCountry(country) {
  const url = `https://ccpi.org/country/${country.code.toLowerCase()}/`;
  const text = cleanText(await fetchText(url));
  const name = regexEscape(country.name);
  const rank = text.match(new RegExp(`${name} ranks\s+(\d+)(?:st|nd|rd|th)`, 'i')) || text.match(/Rank\s+(\d+)/i);
  const edition = text.match(/CCPI\s+(20\d{2})/i);
  if (!rank) return null;
  return metric(Number(rank[1]), edition?.[1] || null, 'Climate Change Performance Index', url, {
    unit: 'rank', note: 'Overall CCPI rank; lower rank is better.'
  });
}

async function epiCountry(country) {
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
  const url = `https://epi.yale.edu/country/${year}/${country.code}`;
  const text = cleanText(await fetchText(url));
  const read = (label) => {
    const escaped = regexEscape(label);
    const match = text.match(new RegExp(`${escaped}\s+(\d+)\s+([0-9.]+)`, 'i'));
    return match ? { rank: Number(match[1]), score: Number(match[2]) } : null;
  };
  return { year, url, overall: read('Environmental Performance Index'), biodiversity: read('Biodiversity & Habitat'), air: read('Air Quality'), forests: read('Forests') };
}


async function genderPortalIndicator(slug, label, country) {
  const url = `https://genderdata.worldbank.org/en/indicator/${slug}`;
  const text = cleanText(await fetchText(url));
  const name = regexEscape(country.name);
  const match = text.match(new RegExp(`${name}\s+(20\d{2})\s+([0-9.]+)`, 'i'));
  if (!match) return null;
  return metric(Number(match[2]), match[1], label, url, { unit: '0–100', geography: country.name });
}

async function wefGenderGap(country) {
  const seriesUrl = 'https://www.weforum.org/publications/series/global-gender-gap-report/';
  const seriesHtml = await fetchText(seriesUrl);
  const years = [...seriesHtml.matchAll(/Global Gender Gap Report\s+(20\d{2})/gi)].map((m) => Number(m[1]));
  if (!years.length) return null;
  const year = Math.max(...years);
  const candidates = [
    `https://www.weforum.org/publications/global-gender-gap-report-${year}/in-full/benchmarking-gender-gaps-${year}/`,
    `https://www.weforum.org/publications/global-gender-gap-report-${year}/`
  ];
  const name = regexEscape(country.name);
  for (const url of candidates) {
    try {
      const text = cleanText(await fetchText(url));
      const rank = text.match(new RegExp(`${name}\s+(?:ranks|ranked)\s+(\d+)(?:st|nd|rd|th)?`, 'i')) || text.match(new RegExp(`${name}\s+(\d{1,3})\s+([0-9.]+)`, 'i'));
      const score = text.match(new RegExp(`${name}[\s\S]{0,180}?score of\s+([0-9.]+)%`, 'i'));
      if (rank) return {
        rank: metric(Number(rank[1]), String(year), 'World Economic Forum', url, { unit: 'rank' }),
        parity: score ? metric(Number(score[1]), String(year), 'World Economic Forum', url, { unit: '%' }) : (rank[2] ? metric(Number(rank[2]) * (Number(rank[2]) <= 1 ? 100 : 1), String(year), 'World Economic Forum', url, { unit:'%' }) : null)
      };
    } catch {}
  }
  return null;
}

async function womenParliament(country) {
  return worldBank('SG.GEN.PARL.ZS', 'World Bank / IPU', country);
}

async function wpsCountry(country) {
  const url = `https://giwps.georgetown.edu/the-index/country/${slugifyCountry(country.name)}/`;
  try {
    const text = cleanText(await fetchText(url));
    const rank = text.match(/Global Rank\s+(\d+)\s+of\s+(\d+)/i);
    const score = text.match(/Index Score\s+([0-9.]+)\s+of\s+1/i);
    if (!rank && !score) return null;
    return {
      rank: rank ? metric(Number(rank[1]), null, 'Women, Peace and Security Index', url, { outOf: Number(rank[2]), unit: 'rank' }) : null,
      score: score ? metric(Number(score[1]), null, 'Women, Peace and Security Index', url, { unit: '0–1 index' }) : null
    };
  } catch { return null; }
}


async function transparencyCountry(country) {
  const url = `https://www.transparency.org/en/countries/${slugifyCountry(country.name)}`;
  const text = cleanText(await fetchText(url));
  const name = regexEscape(country.name);
  const score = text.match(new RegExp(`${name} has a score of\s+(\d+(?:\.\d+)?)\s+this year`, 'i')) || text.match(/Score\s+(\d+(?:\.\d+)?)\s*\/\s*100/i);
  const rank = text.match(/ranks\s+(\d+)\s+out of\s+(\d+)\s+countries/i) || text.match(/Rank\s+(\d+)\s*\/\s*(\d+)/i);
  if (!score && !rank) return null;
  return {
    score: score ? metric(Number(score[1]), null, 'Transparency International', url, { unit: '0–100' }) : null,
    rank: rank ? metric(Number(rank[1]), null, 'Transparency International', url, { unit: 'rank', outOf: Number(rank[2]) }) : null
  };
}

async function globalHungerCountry(country) {
  const url = `https://www.globalhungerindex.org/${slugifyCountry(country.name)}.html`;
  const text = cleanText(await fetchText(url));
  const name = regexEscape(country.name);
  const yearMatch = text.match(new RegExp(`${name}[’']s\s+(20\d{2})\s+GHI score is\s+([0-9.]+)`, 'i'));
  const rank = text.match(new RegExp(`${name} is ranked\s+(\d+)(?:st|nd|rd|th)\s+out of\s+(\d+)`, 'i'));
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


const NITI_SDG_LAST_VERIFIED = [
  ['Kerala',79],['Uttarakhand',79],['Tamil Nadu',78],['Chandigarh',77],['Goa',77],['Himachal Pradesh',77],
  ['Punjab',76],['Sikkim',76],['Karnataka',75],['Andhra Pradesh',74],['Gujarat',74],['Jammu and Kashmir',74],
  ['Puducherry',74],['Telangana',74],['Maharashtra',73],['Haryana',72],['Manipur',72],['Mizoram',72],
  ['Tripura',71],['Andaman and Nicobar Islands',70],['Delhi',70],['West Bengal',70],['Chhattisgarh',67],
  ['Madhya Pradesh',67],['Rajasthan',67],['Uttar Pradesh',67],['Dadra and Nagar Haveli and Daman and Diu',66],
  ['Lakshadweep',66],['Odisha',66],['Arunachal Pradesh',65],['Assam',65],['Ladakh',65],['Meghalaya',63],
  ['Nagaland',63],['Jharkhand',62],['Bihar',57]
].map(([state, score]) => ({ state, score }));

function lastVerifiedMetric(value, period, source, sourceUrl, extra = {}) {
  return metric(value, period, source, sourceUrl, { fallback: true, latestAvailable: false, ...extra });
}

async function rsfCountry(country) {
  const rankingUrl = 'https://rsf.org/en/ranking';
  const countryUrl = `https://rsf.org/en/country/${slugifyCountry(country.name)}`;

  // Prefer the country page because RSF exposes the current edition, rank / total,
  // overall score and the five component indicators together there.
  try {
    const text = cleanText(await fetchText(countryUrl));
    const current = text.match(/Index\s+(20\d{2})\s+(\d{1,3})\s*\/\s*(\d{1,3})\s+Score\s*:\s*([0-9.,]+)/i);
    if (current) {
      return metric(Number(current[2]), current[1], 'Reporters Without Borders', countryUrl, {
        unit: 'rank',
        outOf: Number(current[3]),
        score: Number(String(current[4]).replace(',', '.'))
      });
    }
  } catch {}

  // Fall back to the global ranking page if a country page slug changes.
  try {
    const text = cleanText(await fetchText(rankingUrl));
    const name = regexEscape(country.name);
    const m = text.match(new RegExp(`(?:^|\s)(\d{1,3})\s+${name}\s+([0-9.,]+)`, 'i'));
    if (m) return metric(Number(m[1]), null, 'Reporters Without Borders', rankingUrl, { unit: 'rank', outOf: 180, score: Number(String(m[2]).replace(',', '.')) });
  } catch {}
  return null;
}

async function globalSdgCountry(country) {
  const url = `https://dashboards.sdgindex.org/profiles/${slugifyCountry(country.name)}/fact-sheet/`;
  const text = cleanText(await fetchText(url));
  const rank = text.match(/SDG Index Rank\s*#?\s*(\d+)\s*\/\s*(\d+)/i) || text.match(/SDG Index Rank\s+(\d+)\s+\/?\s*(\d+)?/i);
  const score = text.match(/SDG Index Score\s+([0-9.]+)/i);
  const year = text.match(/Sustainable Development Report\s+(20\d{2})/i);
  if (!rank && !score) return null;
  return {
    rank: rank ? metric(Number(rank[1]), year?.[1] || null, 'Sustainable Development Report', url, { unit: 'rank', outOf: rank[2] ? Number(rank[2]) : null }) : null,
    score: score ? metric(Number(score[1]), year?.[1] || null, 'Sustainable Development Report', url, { unit: '0–100' }) : null,
  };
}

async function hdiCountry(country) {
  // UNDP's interactive data centre is the authoritative source, but it does not expose every country row server-side.
  // Try the country-insights page text; if not rendered, return null rather than reuse another country's value.
  const url = 'https://hdr.undp.org/data-center/country-insights#/ranks';
  const text = cleanText(await fetchText(url));
  const name = regexEscape(country.name);
  const rank = text.match(new RegExp(`${name}[^0-9]{0,80}(\d{1,3})\s+(?:out of|of)\s+(\d{2,3})`, 'i'));
  const value = text.match(new RegExp(`${name}[\s\S]{0,120}?(0\.\d{3})`, 'i'));
  const year = text.match(/Human Development Report\s+(20\d{2})/i) || text.match(/HDR\s+(20\d{2})/i);
  if (!rank && !value) return null;
  return {
    rank: rank ? metric(Number(rank[1]), year?.[1] || null, 'UNDP Human Development Report', url, { unit:'rank', outOf:Number(rank[2]) }) : null,
    value: value ? metric(Number(value[1]), year?.[1] || null, 'UNDP Human Development Report', url, { unit:'HDI' }) : null,
  };
}

async function worldHappinessCountry(country) {
  const home = 'https://www.worldhappiness.report/';
  const text = cleanText(await fetchText(home));
  const year = (text.match(/Country Rankings\s+(20\d{2})/i) || text.match(/World Happiness Report\s+(20\d{2})/i) || [])[1] || null;
  const name = regexEscape(country.name);
  const row = text.match(new RegExp(`(?:^|\s)(\d{1,3})\s+${name}\s+([0-9.]+)`, 'i'));
  if (!row) return null;
  return {
    rank: metric(Number(row[1]), year, 'World Happiness Report', home, { unit:'rank' }),
    score: metric(Number(row[2]), year, 'World Happiness Report', home, { unit:'life evaluation' }),
  };
}

async function globalPeaceCountry(country) {
  const url = 'https://www.visionofhumanity.org/resources/global-peace-index/';
  try {
    const text = cleanText(await fetchText(url));
    const year = (text.match(/Global Peace Index\s+(20\d{2})/i) || [])[1] || null;
    const name = regexEscape(country.name);
    const m = text.match(new RegExp(`${name}[\s\S]{0,100}?(?:rank(?:ed)?\s*)?(\d{1,3})(?:st|nd|rd|th)?\s+(?:of|out of)\s+(\d{1,3})`, 'i')) || text.match(new RegExp(`(?:^|\s)(\d{1,3})\s+${name}(?:\s|$)`, 'i'));
    if (m) return metric(Number(m[1]), year, 'Institute for Economics & Peace', url, { unit:'rank', outOf:m[2] ? Number(m[2]) : 163 });
  } catch {}
  return null;
}

async function energyTransitionCountry(country) {
  const seriesUrl = 'https://www.weforum.org/publications/series/fostering-effective-energy-transition/';
  try {
    const html = await fetchText(seriesUrl);
    const years = [...html.matchAll(/Fostering Effective Energy Transition\s+(20\d{2})/gi)].map((m)=>Number(m[1]));
    const year = years.length ? Math.max(...years) : null;
    const urls = [seriesUrl];
    if (year) urls.unshift(`https://www.weforum.org/publications/fostering-effective-energy-transition-${year}/`);
    const name = regexEscape(country.name);
    for (const url of urls) {
      try {
        const text = cleanText(await fetchText(url));
        const rank = text.match(new RegExp(`${name}[\s\S]{0,100}?rank(?:s|ed)?\s+(\d{1,3})(?:st|nd|rd|th)?`, 'i')) || text.match(new RegExp(`${name}\s+(\d{1,3})\s+[0-9.]+`, 'i'));
        const outOf = text.match(/(?:across|among)\s+(\d{2,3})\s+countries/i);
        if (rank) return metric(Number(rank[1]), year ? String(year) : null, 'World Economic Forum Energy Transition Index', url, { unit:'rank', outOf: outOf ? Number(outOf[1]) : null });
      } catch {}
    }
  } catch {}
  return null;
}

function parseNitiStateScores(text) {
  const rows = [];
  for (const { state } of NITI_SDG_LAST_VERIFIED) {
    const esc = state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const re = new RegExp(`${esc}[^0-9]{0,40}(\\d{2,3})(?=\\s|$)`, 'i');
    const m = text.match(re);
    if (!m) continue;
    const score = Number(m[1]);
    if (score >= 0 && score <= 100) rows.push({ state, score });
  }
  const unique = new Map(rows.map((x)=>[x.state,x]));
  return [...unique.values()];
}

async function nitiSdgStates() {
  const urls = [
    'https://www.niti.gov.in/divisions/division/sustainable-development-goal',
    'https://www.niti.gov.in/node/1806',
    'https://sdgindiaindex.niti.gov.in/'
  ];
  let bestText = '';
  let bestUrl = urls[0];
  let period = null;
  for (const url of urls) {
    try {
      const html = await fetchText(url);
      const text = cleanText(html);
      const periods = [...text.matchAll(/SDG India Index\s+(20\d{2}(?:[-–]\d{2})?)/gi)].map((m)=>m[1].replace('–','-'));
      const latest = periods.sort().at(-1) || null;
      if (latest && (!period || latest > period)) { period = latest; bestText = text; bestUrl = url; }
      if (!bestText && text.length > 500) { bestText = text; bestUrl = url; }
    } catch {}
  }
  const parsed = parseNitiStateScores(bestText);
  const indiaScoreMatch = bestText.match(/(?:India(?:’|')?s|country(?:’|')?s|national)\s+(?:composite\s+)?score[^0-9]{0,40}(\d{2,3})/i) || bestText.match(/composite score[^0-9]{0,40}(?:improved[^0-9]{0,20})?(\d{2,3})\s+in\s+2023[-–]24/i);
  const useVerified = parsed.length < 20;
  return {
    period: period || '2023-24',
    source: 'NITI Aayog SDG India Index',
    sourceUrl: bestUrl,
    indiaScore: indiaScoreMatch ? Number(indiaScoreMatch[1]) : 71,
    states: useVerified ? NITI_SDG_LAST_VERIFIED : parsed,
    fallback: useVerified,
    note: useVerified ? 'Latest NITI edition detected; using the last verified State/UT table when the live page does not expose a machine-readable table.' : 'Parsed from the latest NITI source page.'
  };
}

async function topicClimate(country) {
  const isIndia = country.code === 'IND';
  const [temperature, co2, methane, co2pc, forestShare, renewableElectricity, ccpi, epi, energyTransition] = await Promise.all([
    nasaTemperature().catch(() => null),
    noaaTrend('co2').catch(() => null),
    noaaTrend('methane').catch(() => null),
    worldBank('EN.ATM.CO2E.PC', 'World Bank', country).catch(() => null),
    worldBank('AG.LND.FRST.ZS', 'World Bank', country).catch(() => null),
    worldBank('EG.ELC.RNEW.ZS', 'World Bank', country).catch(() => null),
    ccpiCountry(country).catch(() => null),
    epiCountry(country).catch(() => null),
    energyTransitionCountry(country).catch(() => null)
  ]);
  const metrics = {
    temperature, co2, methane, co2pc, forestShare, renewableElectricity,
    ccpi: ccpi || (isIndia ? lastVerifiedMetric(23, '2026', 'Climate Change Performance Index', 'https://ccpi.org/country/ind/', {unit:'rank'}) : null),
    energyTransition: energyTransition || (isIndia ? lastVerifiedMetric(70, '2026', 'World Economic Forum Energy Transition Index', 'https://www.weforum.org/publications/series/fostering-effective-energy-transition/', {unit:'rank', outOf:120}) : null)
  };
  if (epi) {
    metrics.epiOverall = epi.overall ? metric(epi.overall.rank, String(epi.year), 'Yale Environmental Performance Index', epi.url, { score: epi.overall.score, unit: 'rank' }) : null;
    metrics.epiBiodiversity = epi.biodiversity ? metric(epi.biodiversity.rank, String(epi.year), 'Yale Environmental Performance Index', epi.url, { score: epi.biodiversity.score, unit: 'rank' }) : null;
    metrics.epiAir = epi.air ? metric(epi.air.rank, String(epi.year), 'Yale Environmental Performance Index', epi.url, { score: epi.air.score, unit: 'rank' }) : null;
    metrics.epiForests = epi.forests ? metric(epi.forests.rank, String(epi.year), 'Yale Environmental Performance Index', epi.url, { score: epi.forests.score, unit: 'rank' }) : null;
  } else if (isIndia) {
    metrics.epiOverall = lastVerifiedMetric(176, '2024', 'Yale Environmental Performance Index', 'https://epi.yale.edu/country/2024/IND', {score:27.6, unit:'rank'});
    metrics.epiBiodiversity = lastVerifiedMetric(178, '2024', 'Yale Environmental Performance Index', 'https://epi.yale.edu/country/2024/IND', {unit:'rank'});
  }
  return metrics;
}

async function topicWomen(country) {
  const [femaleLfpr, femaleUnemployment, femaleAccount, parliament, wef, wps, wblLaw, wblSupport, wblEnforcement] = await Promise.all([
    worldBank('SL.TLF.CACT.FE.ZS', 'World Bank / ILO', country).catch(() => null),
    worldBank('SL.UEM.TOTL.FE.ZS', 'World Bank / ILO', country).catch(() => null),
    worldBank('FX.OWN.TOTL.FE.ZS', 'World Bank Global Findex', country).catch(() => null),
    womenParliament(country).catch(() => null),
    wefGenderGap(country).catch(() => null),
    wpsCountry(country).catch(() => null),
    genderPortalIndicator('gd_wbl_ovl_law', 'World Bank Women, Business and the Law — legal frameworks', country).catch(() => null),
    genderPortalIndicator('gd_wbl_ovl_sfr', 'World Bank Women, Business and the Law — supportive frameworks', country).catch(() => null),
    genderPortalIndicator('gd_wbl_ovl_enf', 'World Bank Women, Business and the Law — enforcement perceptions', country).catch(() => null)
  ]);
  return {
    femaleLfpr,
    femaleUnemployment,
    femaleAccount,
    womenParliament: parliament,
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

async function topicEconomy(country) {
  const isIndia = country.code === 'IND';
  const [gdpGrowth, gdpPerCapita, unemployment, inflation, fiscalHealth] = await Promise.all([
    worldBank('NY.GDP.MKTP.KD.ZG', 'World Bank', country).catch(() => null),
    worldBank('NY.GDP.PCAP.CD', 'World Bank', country).catch(() => null),
    worldBank('SL.UEM.TOTL.ZS', 'World Bank / ILO', country).catch(() => null),
    worldBank('FP.CPI.TOTL.ZG', 'World Bank', country).catch(() => null),
    isIndia ? latestNitiFiscalHealth().catch(() => null) : Promise.resolve(null)
  ]);
  return { gdpGrowth, gdpPerCapita, unemployment, inflation, fiscalHealth };
}

async function topicDevelopment(country) {
  const isIndia = country.code === 'IND';
  const [gini, poverty, lifeExpectancy, under5, ghi, globalSdg, hdi, happiness, nitiSdg] = await Promise.all([
    worldBank('SI.POV.GINI', 'World Bank', country).catch(() => null),
    worldBank('SI.POV.LMIC.GP', 'World Bank', country).catch(() => null),
    worldBank('SP.DYN.LE00.IN', 'World Bank', country).catch(() => null),
    worldBank('SH.DYN.MORT', 'World Bank', country).catch(() => null),
    globalHungerCountry(country).catch(() => null),
    globalSdgCountry(country).catch(() => null),
    hdiCountry(country).catch(() => null),
    worldHappinessCountry(country).catch(() => null),
    isIndia ? nitiSdgStates().catch(() => null) : Promise.resolve(null)
  ]);
  return {
    gini, poverty, lifeExpectancy, under5,
    ghiScore: ghi?.score || (isIndia ? lastVerifiedMetric(25.8, '2025', 'Global Hunger Index', 'https://www.globalhungerindex.org/india.html', {unit:'GHI score'}) : null),
    ghiRank: ghi?.rank || (isIndia ? lastVerifiedMetric(102, '2025', 'Global Hunger Index', 'https://www.globalhungerindex.org/india.html', {unit:'rank', outOf:123}) : null),
    childWasting: ghi?.wasting || null,
    childStunting: ghi?.stunting || null,
    globalSdgRank: globalSdg?.rank || (isIndia ? lastVerifiedMetric(94, '2026', 'Sustainable Development Report', 'https://dashboards.sdgindex.org/profiles/india/fact-sheet/', {unit:'rank', outOf:169}) : null),
    globalSdgScore: globalSdg?.score || (isIndia ? lastVerifiedMetric(68.3, '2026', 'Sustainable Development Report', 'https://dashboards.sdgindex.org/profiles/india/fact-sheet/', {unit:'0–100'}) : null),
    hdiRank: hdi?.rank || (isIndia ? lastVerifiedMetric(130, '2025', 'UNDP Human Development Report', 'https://hdr.undp.org/data-center/country-insights#/ranks', {unit:'rank', outOf:193}) : null),
    hdiValue: hdi?.value || (isIndia ? lastVerifiedMetric(0.685, '2025', 'UNDP Human Development Report', 'https://hdr.undp.org/data-center/country-insights#/ranks', {unit:'HDI'}) : null),
    happinessRank: happiness?.rank || (isIndia ? lastVerifiedMetric(116, '2026', 'World Happiness Report', 'https://www.worldhappiness.report/', {unit:'rank', outOf:147}) : null),
    happinessScore: happiness?.score || (isIndia ? lastVerifiedMetric(4.536, '2026', 'World Happiness Report', 'https://www.worldhappiness.report/', {unit:'life evaluation'}) : null),
    nitiSdg
  };
}

async function topicDemocracy(country) {
  const isIndia = country.code === 'IND';
  const [voice, corruptionControl, governmentEffectiveness, ruleOfLaw, cpi, pressFreedom, peace] = await Promise.all([
    worldBank('VA.EST', 'Worldwide Governance Indicators', country).catch(() => null),
    worldBank('CC.EST', 'Worldwide Governance Indicators', country).catch(() => null),
    worldBank('GE.EST', 'Worldwide Governance Indicators', country).catch(() => null),
    worldBank('RL.EST', 'Worldwide Governance Indicators', country).catch(() => null),
    transparencyCountry(country).catch(() => null),
    rsfCountry(country).catch(() => null),
    globalPeaceCountry(country).catch(() => null)
  ]);
  return {
    voice, corruptionControl, governmentEffectiveness, ruleOfLaw,
    cpiScore: cpi?.score || (isIndia ? lastVerifiedMetric(39, '2025', 'Transparency International', 'https://www.transparency.org/en/countries/india', {unit:'0–100'}) : null),
    cpiRank: cpi?.rank || (isIndia ? lastVerifiedMetric(91, '2025', 'Transparency International', 'https://www.transparency.org/en/countries/india', {unit:'rank', outOf:182}) : null),
    pressFreedomRank: pressFreedom || (isIndia ? lastVerifiedMetric(157, '2026', 'Reporters Without Borders', 'https://rsf.org/en/country/india', {unit:'rank', outOf:180, score:31.96}) : null),
    peaceRank: peace || (isIndia ? lastVerifiedMetric(127, '2026', 'Institute for Economics & Peace', 'https://www.visionofhumanity.org/resources/global-peace-index/', {unit:'rank', outOf:163}) : null)
  };
}

async function topicHealth(country) {
  const [lifeExpectancy, maternalMortality, under5, infantMortality, uhcCoverage, tbIncidence, outOfPocket, healthSpend] = await Promise.all([
    worldBank('SP.DYN.LE00.IN', 'World Bank', country).catch(() => null),
    worldBank('SH.STA.MMRT', 'World Bank', country).catch(() => null),
    worldBank('SH.DYN.MORT', 'World Bank', country).catch(() => null),
    worldBank('SP.DYN.IMRT.IN', 'World Bank', country).catch(() => null),
    worldBank('SH.UHC.SRVS.CV.XD', 'World Bank / WHO', country).catch(() => null),
    worldBank('SH.TBS.INCD', 'World Bank / WHO', country).catch(() => null),
    worldBank('SH.XPD.OOPC.CH.ZS', 'World Bank / WHO', country).catch(() => null),
    worldBank('SH.XPD.CHEX.GD.ZS', 'World Bank / WHO', country).catch(() => null)
  ]);
  return { lifeExpectancy, maternalMortality, under5, infantMortality, uhcCoverage, tbIncidence, outOfPocket, healthSpend };
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
  const country = countryByCode(url.searchParams.get('country') || 'IND');
  const handler = handlers[topic];
  if (!handler) return Response.json({ error: 'Unsupported topic' }, { status: 400 });

  try {
    const metrics = await handler(country);
    return Response.json({
      topic,
      country,
      policy: 'Live official source first. Each provider returns its newest non-null/current published value. Existing page values remain a labelled fallback if a source is temporarily unavailable.',
      metrics,
      generatedAt: new Date().toISOString()
    }, {
      headers: { 'Cache-Control': `public, max-age=300, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400` }
    });
  } catch (error) {
    return Response.json({ topic, country, metrics: {}, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 503 });
  }
}
