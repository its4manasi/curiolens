const STATE_SLUGS = {
  'Andaman and Nicobar Islands':'andaman-and-nicobar-islands','Andhra Pradesh':'andhra-pradesh','Arunachal Pradesh':'arunachal-pradesh',Assam:'assam',Bihar:'bihar',Chandigarh:'chandigarh',Chhattisgarh:'chhattisgarh',Delhi:'delhi','Dadra and Nagar Haveli and Daman and Diu':'dnh-and-dd',Goa:'goa',Gujarat:'gujarat',Haryana:'haryana','Himachal Pradesh':'himachal-pradesh','Jammu and Kashmir':'jammu-and-kashmir',Jharkhand:'jharkhand',Karnataka:'karnataka',Kerala:'kerala',Ladakh:'ladakh',Lakshadweep:'lakshadweep','Madhya Pradesh':'madhya-pradesh',Maharashtra:'maharashtra',Manipur:'manipur',Meghalaya:'meghalaya',Mizoram:'mizoram',Nagaland:'nagaland',Odisha:'odisha',Puducherry:'puducherry',Punjab:'punjab',Rajasthan:'rajasthan',Sikkim:'sikkim','Tamil Nadu':'tamil-nadu',Telangana:'telangana',Tripura:'tripura','Uttar Pradesh':'uttar-pradesh',Uttarakhand:'uttarakhand','West Bengal':'west-bengal'
};

const districtName = (feature) => {
  const p = feature?.properties || {};
  const candidates = [
    p.district, p.DISTRICT, p.District, p.district_name, p.DISTRICT_NAME,
    p.dtname, p.DT_NAME, p.dt_name, p.NAME_2, p.name_2, p.NAME, p.name
  ];
  return candidates.find((value) => typeof value === 'string' && value.trim())?.trim() || '';
};

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/geo+json, application/json;q=0.9, */*;q=0.8' },
    cf: { cacheTtl: 86400, cacheEverything: true },
  });
  if (!response.ok) throw new Error(`District source returned ${response.status}`);
  return response.json();
}

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const state = requestUrl.searchParams.get('state') || '';
  const slug = STATE_SLUGS[state];

  if (!slug) {
    return Response.json({ state, districts: [], error: 'Unknown state or Union Territory.' }, { status: 400 });
  }

  const sources = [
    `https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/states/${slug}.geojson`,
    `https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/geojson/states/${slug}.geojson`,
    `https://raw.githubusercontent.com/udit-001/india-maps-data/main/geojson/states/${slug}.geojson`,
  ];

  for (const source of sources) {
    try {
      const json = await fetchJson(source);
      const districts = Array.from(new Set((json.features || []).map(districtName).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b));
      if (districts.length) {
        return Response.json({ state, districts, source }, {
          headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
        });
      }
    } catch {
      // Try the next source. The API keeps the client independent of CORS/CDN issues.
    }
  }

  return Response.json({
    state,
    districts: [],
    error: 'District boundaries could not be loaded from the map source right now.',
  }, {
    status: 502,
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' },
  });
}
