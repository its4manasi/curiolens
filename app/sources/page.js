const groups = [
  {
    title: 'Government of India',
    note: 'Primary public sources for national and state-level statistics.',
    sources: [
      ['Open Government Data Platform India', 'https://data.gov.in/', 'Cross-government datasets and APIs'],
      ['Ministry of Statistics & Programme Implementation', 'https://www.mospi.gov.in/', 'Official statistics, surveys and national accounts'],
      ['Census of India', 'https://censusindia.gov.in/', 'Population, literacy, households and geography'],
      ['NITI Aayog SDG India Index', 'https://sdgindiaindex.niti.gov.in/', 'State and UT development indicators'],
      ['Election Commission of India', 'https://www.eci.gov.in/', 'Elections, turnout, results and representation'],
    ],
  },
  {
    title: 'Education & people',
    note: 'Sources CurioLens can use for school, higher-education and social indicators.',
    sources: [
      ['UDISE+ · Ministry of Education', 'https://www.education.gov.in/udise-plus', 'Schools, enrolment, teachers and infrastructure'],
      ['AISHE', 'https://aishe.gov.in/', 'Higher education institutions and participation'],
      ['Ministry of Women & Child Development', 'https://wcd.gov.in/', 'Women and child development programmes and reports'],
    ],
  },
  {
    title: 'Economy, climate & global comparison',
    note: 'Official and multilateral sources for comparisons beyond one state or country.',
    sources: [
      ['Reserve Bank of India', 'https://www.rbi.org.in/', 'Banking, prices, credit and macroeconomic information'],
      ['India Meteorological Department', 'https://mausam.imd.gov.in/', 'Weather, climate and warnings'],
      ['World Bank Data', 'https://data.worldbank.org/', 'Comparable development indicators across countries'],
      ['UNDP Human Development Reports', 'https://hdr.undp.org/data-center', 'HDI and human-development indicators'],
      ['WHO Global Health Observatory', 'https://www.who.int/data/gho', 'Comparable global health indicators'],
      ['NASA Earthdata', 'https://www.earthdata.nasa.gov/', 'Earth observation and climate datasets'],
    ],
  },
];

export const metadata = {
  title: 'Sources',
  description: 'Official and credible data sources used to verify CurioLens charts, explainers and comparisons.',
};

export default function SourcesPage() {
  return (
    <div className="sources-page">
      <section className="sources-hero">
        <span className="section-tag">Verify the evidence</span>
        <h1>Don’t just trust the chart. Check the source.</h1>
        <p>CurioLens should make every important number traceable. These are the primary government and institutional portals we use or plan to use for public-interest data.</p>
      </section>

      <section className="sources-grid-wrap">
        {groups.map(group => (
          <article className="source-group" key={group.title}>
            <div className="source-group-head">
              <h2>{group.title}</h2>
              <p>{group.note}</p>
            </div>
            <div className="source-link-grid">
              {group.sources.map(([name, href, desc]) => (
                <a className="source-link-card" href={href} target="_blank" rel="noreferrer" key={href}>
                  <div><strong>{name}</strong><span>{desc}</span></div>
                  <b>Open official source ↗</b>
                </a>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="source-rule-card">
        <div><span className="section-tag">CurioLens rule</span><h2>Explain it simply. Then show exactly where it came from.</h2></div>
        <p>A reader should not need to understand dataset codes or technical terms first. Each data card should explain the number in plain language, then show the source name, reference period and a direct “Check official data” link.</p>
      </section>
    </div>
  );
}
