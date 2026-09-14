const UDISE_2023_24 = {
  'Andaman and Nicobar Islands': { schools: 412, students: 72119, teachers: 5750, ptr: 13, avgTeachersPerSchool: 14, avgStudentsPerSchool: 175 },
  'Andhra Pradesh': { schools: 61373, students: 8741885, teachers: 338293, ptr: 26, avgTeachersPerSchool: 6, avgStudentsPerSchool: 142 },
  'Arunachal Pradesh': { schools: 3490, students: 323717, teachers: 24700, ptr: 13, avgTeachersPerSchool: 7, avgStudentsPerSchool: 93 },
  'Assam': { schools: 56630, students: 6922533, teachers: 342199, ptr: 20, avgTeachersPerSchool: 6, avgStudentsPerSchool: 122 },
  'Bihar': { schools: 94686, students: 21348149, teachers: 657063, ptr: 32, avgTeachersPerSchool: 7, avgStudentsPerSchool: 225 },
  'Chandigarh': { schools: 230, students: 265706, teachers: 10237, ptr: 26, avgTeachersPerSchool: 45, avgStudentsPerSchool: 1155 },
  'Chhattisgarh': { schools: 56615, students: 5776548, teachers: 278798, ptr: 21, avgTeachersPerSchool: 5, avgStudentsPerSchool: 102 },
  'Dadra and Nagar Haveli and Daman and Diu': { schools: 432, students: 141282, teachers: 4995, ptr: 28, avgTeachersPerSchool: 12, avgStudentsPerSchool: 327 },
  'Delhi': { schools: 5497, students: 4506578, teachers: 160479, ptr: 28, avgTeachersPerSchool: 29, avgStudentsPerSchool: 820 },
  'Goa': { schools: 1487, students: 304735, teachers: 14594, ptr: 21, avgTeachersPerSchool: 10, avgStudentsPerSchool: 205 },
  'Gujarat': { schools: 53626, students: 11496709, teachers: 394053, ptr: 29, avgTeachersPerSchool: 7, avgStudentsPerSchool: 214 },
  'Haryana': { schools: 23517, students: 5599742, teachers: 250909, ptr: 22, avgTeachersPerSchool: 11, avgStudentsPerSchool: 238 },
  'Himachal Pradesh': { schools: 17826, students: 1426412, teachers: 101131, ptr: 14, avgTeachersPerSchool: 6, avgStudentsPerSchool: 80 },
  'Jammu and Kashmir': { schools: 24296, students: 2629949, teachers: 167046, ptr: 16, avgTeachersPerSchool: 7, avgStudentsPerSchool: 108 },
  'Jharkhand': { schools: 44475, students: 7143255, teachers: 206591, ptr: 35, avgTeachersPerSchool: 5, avgStudentsPerSchool: 161 },
  'Karnataka': { schools: 75869, students: 11926303, teachers: 433942, ptr: 27, avgTeachersPerSchool: 6, avgStudentsPerSchool: 157 },
  'Kerala': { schools: 15864, students: 6281704, teachers: 291096, ptr: 22, avgTeachersPerSchool: 18, avgStudentsPerSchool: 396 },
  'Ladakh': { schools: 995, students: 56642, teachers: 6432, ptr: 9, avgTeachersPerSchool: 6, avgStudentsPerSchool: 57 },
  'Lakshadweep': { schools: 37, students: 12591, teachers: 911, ptr: 14, avgTeachersPerSchool: 25, avgStudentsPerSchool: 340 },
  'Madhya Pradesh': { schools: 123412, students: 15361543, teachers: 639525, ptr: 24, avgTeachersPerSchool: 5, avgStudentsPerSchool: 124 },
  'Maharashtra': { schools: 108237, students: 21375970, teachers: 738114, ptr: 29, avgTeachersPerSchool: 7, avgStudentsPerSchool: 197 },
  'Manipur': { schools: 4646, students: 647434, teachers: 40921, ptr: 16, avgTeachersPerSchool: 9, avgStudentsPerSchool: 139 },
  'Meghalaya': { schools: 14601, students: 1052884, teachers: 55726, ptr: 19, avgTeachersPerSchool: 4, avgStudentsPerSchool: 72 },
  'Mizoram': { schools: 3941, students: 293763, teachers: 23013, ptr: 13, avgTeachersPerSchool: 6, avgStudentsPerSchool: 75 },
  'Nagaland': { schools: 2725, students: 412975, teachers: 32602, ptr: 13, avgTeachersPerSchool: 12, avgStudentsPerSchool: 152 },
  'Odisha': { schools: 61693, students: 7756910, teachers: 335496, ptr: 23, avgTeachersPerSchool: 5, avgStudentsPerSchool: 126 },
  'Puducherry': { schools: 735, students: 244828, teachers: 13202, ptr: 19, avgTeachersPerSchool: 18, avgStudentsPerSchool: 333 },
  'Punjab': { schools: 27404, students: 5988681, teachers: 273092, ptr: 22, avgTeachersPerSchool: 10, avgStudentsPerSchool: 219 },
  'Rajasthan': { schools: 107757, students: 16786065, teachers: 775745, ptr: 22, avgTeachersPerSchool: 7, avgStudentsPerSchool: 156 },
  'Sikkim': { schools: 1254, students: 121395, teachers: 15489, ptr: 8, avgTeachersPerSchool: 12, avgStudentsPerSchool: 97 },
  'Tamil Nadu': { schools: 58722, students: 12993050, teachers: 550558, ptr: 24, avgTeachersPerSchool: 9, avgStudentsPerSchool: 221 },
  'Telangana': { schools: 42901, students: 7293644, teachers: 341460, ptr: 21, avgTeachersPerSchool: 8, avgStudentsPerSchool: 170 },
  'Tripura': { schools: 4923, students: 689408, teachers: 37661, ptr: 18, avgTeachersPerSchool: 8, avgStudentsPerSchool: 140 },
  'Uttar Pradesh': { schools: 255087, students: 41662794, teachers: 1538479, ptr: 27, avgTeachersPerSchool: 6, avgStudentsPerSchool: 163 },
  'Uttarakhand': { schools: 22551, students: 2372400, teachers: 130741, ptr: 18, avgTeachersPerSchool: 6, avgStudentsPerSchool: 105 },
  'West Bengal': { schools: 93945, students: 18015525, teachers: 576557, ptr: 31, avgTeachersPerSchool: 6, avgStudentsPerSchool: 192 },
};

const normalize = (value = '') => String(value).trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
const numeric = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (value === null || value === undefined) return undefined;
  const match = String(value).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  if (!match) return undefined;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const fieldValue = (record, candidates) => {
  const entries = Object.entries(record || {});
  for (const candidate of candidates) {
    const key = entries.find(([name]) => candidate.test(normalize(name)))?.[0];
    if (key) return record[key];
  }
  return undefined;
};
const textValue = (record, candidates) => {
  const value = fieldValue(record, candidates);
  return value === undefined || value === null ? '' : String(value).trim();
};

function normaliseRecord(record) {
  if (!record || typeof record !== 'object') return {};
  const schools = numeric(fieldValue(record, [/totalnumberofschools/, /numberofschools/, /totalschools/, /^schools$/]));
  const students = numeric(fieldValue(record, [/totalnumberofenrolments/, /enrolments?$/, /totalenrol/, /students?$/]));
  const teachers = numeric(fieldValue(record, [/totalnumberofteachers/, /numberofteachers/, /totalteachers/, /^teachers$/]));
  const ptr = numeric(fieldValue(record, [/pupilteacherratio/, /^ptr$/]));
  const girls = numeric(fieldValue(record, [/girl.*share/, /female.*enrol/, /girls/ ]));
  const literacy = numeric(fieldValue(record, [/literacyrate/, /^literacy$/]));
  const secondary = numeric(fieldValue(record, [/secondarycompletion/, /completionsecondary/]));
  const higherEd = numeric(fieldValue(record, [/higher.*ger/, /grossenrolmentratio/]));
  return {
    ...(schools !== undefined ? { schools } : {}),
    ...(students !== undefined ? { students } : {}),
    ...(teachers !== undefined ? { teachers } : {}),
    ...(ptr !== undefined ? { ptr } : {}),
    ...(girls !== undefined ? { girls } : {}),
    ...(literacy !== undefined ? { literacy } : {}),
    ...(secondary !== undefined ? { secondary } : {}),
    ...(higherEd !== undefined ? { higherEd } : {}),
  };
}

function samePlace(value, target) {
  return normalize(value) === normalize(target);
}

function filterRecords(records, state, district) {
  return (records || []).filter((record) => {
    const stateValue = textValue(record, [/^statename$/, /^state$/, /^stname$/, /^statet?ut$/, /^india?state?ut$/]);
    const districtValue = textValue(record, [/^districtname$/, /^district$/, /^dtname$/, /^districtnm$/]);
    const stateMatch = !state || !stateValue || samePlace(stateValue, state);
    const districtMatch = !district || !districtValue || samePlace(districtValue, district);
    return stateMatch && districtMatch;
  });
}

async function fetchKnownDistrictData(context, state, district) {
  // v13.6 deliberately removes the single DATA_GOV_EDUCATION_RESOURCE_ID dependency.
  // District metrics will be added source-by-source as stable official machine-readable
  // resources are verified. Until then we return no fabricated district value.
  return null;
}

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const state = requestUrl.searchParams.get('state') || 'Bihar';
  const division = requestUrl.searchParams.get('division') || '';
  const district = requestUrl.searchParams.get('district') || '';
  const stateMetrics = UDISE_2023_24[state] || {};
  const live = district && district !== 'All districts' ? await fetchKnownDistrictData(context, state, district) : null;

  const districtRequested = Boolean(district && district !== 'All districts');
  const divisionRequested = Boolean(division && division !== 'All divisions');
  const finerGeographyRequested = districtRequested || divisionRequested;
  const metrics = districtRequested ? (live?.metrics || {}) : (divisionRequested ? {} : { ...stateMetrics, ...(live?.metrics || {}) });

  return Response.json({
    state,
    division: divisionRequested ? division : null,
    district: districtRequested ? district : null,
    geographyLevel: districtRequested ? (live ? 'district' : 'district-unavailable') : (divisionRequested ? 'division-unavailable' : 'state'),
    metrics,
    stateFallback: finerGeographyRequested && !live ? stateMetrics : undefined,
    sources: {
      stateEducation: {
        name: 'UDISE+ 2023-24',
        url: 'https://www.education.gov.in/sites/upload_files/mhrd/files/statistics-new/udise_report_nep_23_24.pdf',
        note: 'Table 2.2: State-wise schools, enrolments, teachers and pupil-teacher ratio.',
      },
      districtEducation: live ? {
        name: 'Verified district education source',
        url: 'https://www.data.gov.in/dataset-group-name/Unified%20district%20information%20system%20for%20education',
        note: 'District values are returned only from a verified source mapping for that metric.',
      } : null,
    },
    message: districtRequested && !live
      ? 'District selected. A district-specific value is not yet connected for this metric, so the response also includes state-level UDISE+ context.'
      : (divisionRequested ? 'Division selected. Division-level education metrics are not connected yet, so the response includes clearly labelled state-level UDISE+ context.' : undefined),
  }, {
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=21600' },
  });
}
