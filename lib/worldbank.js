export async function getWorldBankLatest({ country = 'IND', indicator = 'SP.POP.TOTL' } = {}) {
  const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&per_page=10`;
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) throw new Error('World Bank request failed');
  const json = await response.json();
  const rows = Array.isArray(json?.[1]) ? json[1] : [];
  const latest = rows.find((row) => row.value !== null);
  if (!latest) return null;
  return {
    country: latest.country?.value,
    year: latest.date,
    value: latest.value,
    indicator: latest.indicator?.value,
  };
}
