const STATE_SLUGS = {
  'Andaman and Nicobar Islands':'andaman-and-nicobar-islands','Andhra Pradesh':'andhra-pradesh','Arunachal Pradesh':'arunachal-pradesh',Assam:'assam',Bihar:'bihar',Chandigarh:'chandigarh',Chhattisgarh:'chhattisgarh',Delhi:'delhi','Dadra and Nagar Haveli and Daman and Diu':'dnh-and-dd',Goa:'goa',Gujarat:'gujarat',Haryana:'haryana','Himachal Pradesh':'himachal-pradesh','Jammu and Kashmir':'jammu-and-kashmir',Jharkhand:'jharkhand',Karnataka:'karnataka',Kerala:'kerala',Ladakh:'ladakh',Lakshadweep:'lakshadweep','Madhya Pradesh':'madhya-pradesh',Maharashtra:'maharashtra',Manipur:'manipur',Meghalaya:'meghalaya',Mizoram:'mizoram',Nagaland:'nagaland',Odisha:'odisha',Puducherry:'puducherry',Punjab:'punjab',Rajasthan:'rajasthan',Sikkim:'sikkim','Tamil Nadu':'tamil-nadu',Telangana:'telangana',Tripura:'tripura','Uttar Pradesh':'uttar-pradesh',Uttarakhand:'uttarakhand','West Bengal':'west-bengal'
};

// Administrative divisions are not a uniform layer across India. This mapping is used only
// where a stable, commonly-used division structure is available. State and district remain
// the nationwide core, and districts are always read from the live map source below.
const DIVISION_DISTRICTS = {
  Bihar: {
    'Bhagalpur Division': ['Banka','Bhagalpur'],
    'Darbhanga Division': ['Darbhanga','Madhubani','Samastipur'],
    'Kosi Division': ['Madhepura','Saharsa','Supaul'],
    'Magadh Division': ['Arwal','Aurangabad','Gaya','Jehanabad','Nawada'],
    'Munger Division': ['Begusarai','Jamui','Khagaria','Lakhisarai','Munger','Sheikhpura'],
    'Patna Division': ['Bhojpur','Buxar','Kaimur','Nalanda','Patna','Rohtas'],
    'Purnia Division': ['Araria','Katihar','Kishanganj','Purnia'],
    'Saran Division': ['Gopalganj','Saran','Siwan'],
    'Tirhut Division': ['East Champaran','Muzaffarpur','Sheohar','Sitamarhi','Vaishali','West Champaran'],
  },
  'Uttar Pradesh': {
    'Agra Division': ['Agra','Firozabad','Mainpuri','Mathura'],
    'Aligarh Division': ['Aligarh','Etah','Hathras','Kasganj'],
    'Ayodhya Division': ['Ambedkar Nagar','Amethi','Ayodhya','Barabanki','Sultanpur'],
    'Azamgarh Division': ['Azamgarh','Ballia','Mau'],
    'Bareilly Division': ['Bareilly','Badaun','Pilibhit','Shahjahanpur'],
    'Basti Division': ['Basti','Sant Kabir Nagar','Siddharthnagar'],
    'Chitrakoot Division': ['Banda','Chitrakoot','Hamirpur','Mahoba'],
    'Devipatan Division': ['Bahraich','Balrampur','Gonda','Shravasti'],
    'Gorakhpur Division': ['Deoria','Gorakhpur','Kushinagar','Maharajganj'],
    'Jhansi Division': ['Jalaun','Jhansi','Lalitpur'],
    'Kanpur Division': ['Auraiya','Etawah','Farrukhabad','Kannauj','Kanpur Dehat','Kanpur Nagar'],
    'Lucknow Division': ['Hardoi','Lakhimpur Kheri','Lucknow','Raebareli','Sitapur','Unnao'],
    'Meerut Division': ['Baghpat','Bulandshahr','Gautam Buddha Nagar','Ghaziabad','Hapur','Meerut'],
    'Mirzapur Division': ['Mirzapur','Sant Ravidas Nagar','Sonbhadra'],
    'Moradabad Division': ['Amroha','Bijnor','Moradabad','Rampur','Sambhal'],
    'Prayagraj Division': ['Fatehpur','Kaushambi','Pratapgarh','Prayagraj'],
    'Saharanpur Division': ['Muzaffarnagar','Saharanpur','Shamli'],
    'Varanasi Division': ['Chandauli','Ghazipur','Jaunpur','Varanasi'],
  },
  Rajasthan: {
    'Ajmer Division': ['Ajmer','Beawar','Bhilwara','Didwana-Kuchaman','Nagaur','Tonk'],
    'Bharatpur Division': ['Bharatpur','Deeg','Dholpur','Karauli','Sawai Madhopur'],
    'Bikaner Division': ['Anupgarh','Bikaner','Hanumangarh','Sri Ganganagar'],
    'Jaipur Division': ['Alwar','Dausa','Jaipur','Jaipur Rural','Khairthal-Tijara','Kotputli-Behror'],
    'Jodhpur Division': ['Balotra','Barmer','Jaisalmer','Jalore','Jodhpur','Jodhpur Rural','Pali','Phalodi','Sanchore'],
    'Kota Division': ['Baran','Bundi','Jhalawar','Kota'],
    'Udaipur Division': ['Banswara','Chittorgarh','Dungarpur','Pratapgarh','Rajsamand','Salumbar','Udaipur'],
  },
  'Madhya Pradesh': {
    'Bhopal Division': ['Bhopal','Raisen','Rajgarh','Sehore','Vidisha'],
    'Chambal Division': ['Morena','Sheopur','Bhind'],
    'Gwalior Division': ['Ashoknagar','Datia','Guna','Gwalior','Shivpuri'],
    'Indore Division': ['Alirajpur','Barwani','Burhanpur','Dhar','Indore','Jhabua','Khandwa','Khargone'],
    'Jabalpur Division': ['Balaghat','Chhindwara','Dindori','Jabalpur','Katni','Mandla','Narsinghpur','Pandhurna','Seoni'],
    'Narmadapuram Division': ['Betul','Harda','Narmadapuram'],
    'Rewa Division': ['Mauganj','Rewa','Satna','Sidhi','Singrauli'],
    'Sagar Division': ['Chhatarpur','Damoh','Niwari','Panna','Sagar','Tikamgarh'],
    'Shahdol Division': ['Anuppur','Shahdol','Umaria'],
    'Ujjain Division': ['Agar Malwa','Dewas','Mandsaur','Neemuch','Ratlam','Shajapur','Ujjain'],
  },
  Jharkhand: {
    'Kolhan Division': ['East Singhbhum','Seraikela Kharsawan','West Singhbhum'],
    'North Chotanagpur Division': ['Bokaro','Chatra','Dhanbad','Giridih','Hazaribagh','Koderma','Ramgarh'],
    'Palamu Division': ['Garhwa','Latehar','Palamu'],
    'Santhal Pargana Division': ['Deoghar','Dumka','Godda','Jamtara','Pakur','Sahibganj'],
    'South Chotanagpur Division': ['Gumla','Khunti','Lohardaga','Ranchi','Simdega'],
  },
  Chhattisgarh: {
    'Bastar Division': ['Bastar','Bijapur','Dantewada','Kanker','Kondagaon','Narayanpur','Sukma'],
    'Bilaspur Division': ['Bilaspur','Gaurela-Pendra-Marwahi','Janjgir-Champa','Korba','Mungeli','Sakti','Sarangarh-Bilaigarh'],
    'Durg Division': ['Balod','Bemetara','Durg','Kabirdham','Khairagarh-Chhuikhadan-Gandai','Manpur-Mohla-Ambagarh Chowki','Rajnandgaon'],
    'Raipur Division': ['Baloda Bazar','Dhamtari','Gariaband','Mahasamund','Raipur'],
    'Surguja Division': ['Balrampur','Jashpur','Koriya','Manendragarh-Chirmiri-Bharatpur','Surajpur','Surguja'],
  },
  Maharashtra: {
    'Amravati Division': ['Akola','Amravati','Buldhana','Washim','Yavatmal'],
    'Chhatrapati Sambhajinagar Division': ['Beed','Chhatrapati Sambhajinagar','Dharashiv','Hingoli','Jalna','Latur','Nanded','Parbhani'],
    'Konkan Division': ['Mumbai City','Mumbai Suburban','Palghar','Raigad','Ratnagiri','Sindhudurg','Thane'],
    'Nagpur Division': ['Bhandara','Chandrapur','Gadchiroli','Gondia','Nagpur','Wardha'],
    'Nashik Division': ['Ahmednagar','Dhule','Jalgaon','Nandurbar','Nashik'],
    'Pune Division': ['Kolhapur','Pune','Sangli','Satara','Solapur'],
  },
  Karnataka: {
    'Bengaluru Division': ['Bengaluru Rural','Bengaluru Urban','Chikkaballapura','Chitradurga','Davanagere','Kolar','Ramanagara','Shivamogga','Tumakuru'],
    'Belagavi Division': ['Bagalkot','Belagavi','Dharwad','Gadag','Haveri','Uttara Kannada','Vijayapura'],
    'Kalaburagi Division': ['Ballari','Bidar','Kalaburagi','Koppal','Raichur','Vijayanagara','Yadgir'],
    'Mysuru Division': ['Chamarajanagar','Chikkamagaluru','Dakshina Kannada','Hassan','Kodagu','Mandya','Mysuru','Udupi'],
  },
  'West Bengal': {
    'Burdwan Division': ['Bankura','Birbhum','East Bardhaman','Hooghly','Paschim Bardhaman','Purulia'],
    'Jalpaiguri Division': ['Alipurduar','Cooch Behar','Darjeeling','Jalpaiguri','Kalimpong'],
    'Malda Division': ['Dakshin Dinajpur','Malda','Murshidabad','Uttar Dinajpur'],
    'Medinipur Division': ['Jhargram','Paschim Medinipur','Purba Medinipur'],
    'Presidency Division': ['Howrah','Kolkata','Nadia','North 24 Parganas','South 24 Parganas'],
  },
  Uttarakhand: {
    'Garhwal Division': ['Chamoli','Dehradun','Haridwar','Pauri Garhwal','Rudraprayag','Tehri Garhwal','Uttarkashi'],
    'Kumaon Division': ['Almora','Bageshwar','Champawat','Nainital','Pithoragarh','Udham Singh Nagar'],
  },
  'Himachal Pradesh': {
    'Kangra Division': ['Chamba','Kangra','Una'],
    'Mandi Division': ['Hamirpur','Kullu','Lahaul and Spiti','Mandi'],
    'Shimla Division': ['Bilaspur','Kinnaur','Shimla','Sirmaur','Solan'],
  },
  'Jammu and Kashmir': {
    'Jammu Division': ['Doda','Jammu','Kathua','Kishtwar','Poonch','Rajouri','Ramban','Reasi','Samba','Udhampur'],
    'Kashmir Division': ['Anantnag','Bandipora','Baramulla','Budgam','Ganderbal','Kulgam','Kupwara','Pulwama','Shopian','Srinagar'],
  },
};

const districtName = (feature) => {
  const p = feature?.properties || {};
  const candidates = [p.district,p.DISTRICT,p.District,p.district_name,p.DISTRICT_NAME,p.dtname,p.DT_NAME,p.dt_name,p.NAME_2,p.name_2,p.NAME,p.name];
  return candidates.find((value) => typeof value === 'string' && value.trim())?.trim() || '';
};

const normalize = (value = '') => String(value).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'');

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/geo+json, application/json;q=0.9, */*;q=0.8' }, cf: { cacheTtl: 86400, cacheEverything: true } });
  if (!response.ok) throw new Error(`Geography source returned ${response.status}`);
  return response.json();
}

async function getDistricts(state) {
  const slug = STATE_SLUGS[state];
  if (!slug) return { districts: [], source: null };
  const sources = [
    `https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/states/${slug}.geojson`,
    `https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/geojson/states/${slug}.geojson`,
    `https://raw.githubusercontent.com/udit-001/india-maps-data/main/geojson/states/${slug}.geojson`,
  ];
  for (const source of sources) {
    try {
      const json = await fetchJson(source);
      const districts = Array.from(new Set((json.features || []).map(districtName).filter(Boolean))).sort((a,b) => a.localeCompare(b));
      if (districts.length) return { districts, source };
    } catch {}
  }
  return { districts: [], source: null };
}

function buildDivisions(state, liveDistricts) {
  const configured = DIVISION_DISTRICTS[state];
  if (!configured) return [];
  const liveByKey = new Map(liveDistricts.map((name) => [normalize(name), name]));
  return Object.entries(configured).map(([name, expected]) => {
    const districts = expected.map((item) => liveByKey.get(normalize(item))).filter(Boolean).sort((a,b) => a.localeCompare(b));
    return { name, districts };
  }).filter((division) => division.districts.length);
}

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const state = requestUrl.searchParams.get('state') || '';
  const requestedDivision = requestUrl.searchParams.get('division') || '';
  if (!STATE_SLUGS[state]) return Response.json({ state, divisions: [], districts: [], error: 'Unknown state or Union Territory.' }, { status: 400 });

  const { districts: liveDistricts, source } = await getDistricts(state);
  if (!liveDistricts.length) return Response.json({ state, divisions: [], districts: [], error: 'District boundaries could not be loaded right now.' }, { status: 502, headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } });

  const divisions = buildDivisions(state, liveDistricts);
  const selected = divisions.find((item) => item.name === requestedDivision);
  const districts = selected ? selected.districts : liveDistricts;
  return Response.json({
    state,
    division: selected?.name || null,
    divisionSupported: divisions.length > 0,
    divisions,
    districts,
    source,
    note: divisions.length ? 'Division is an optional navigation layer. Districts come from the live state GeoJSON source.' : 'No stable division layer is configured for this State/UT; use State → District.',
  }, { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } });
}
