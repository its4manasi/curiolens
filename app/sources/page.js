const groups = [
  {
    title: 'Education',
    note: 'Schools, learning, literacy and higher education.',
    india: [
      ['UDISE+ · Ministry of Education', 'https://www.education.gov.in/udise-plus', 'Schools, enrolment, teachers, PTR and infrastructure'],
      ['AISHE', 'https://aishe.gov.in/', 'Higher education institutions and participation'],
      ['Census of India', 'https://censusindia.gov.in/', 'Population and literacy baseline'],
      ['NITI Aayog', 'https://www.niti.gov.in/', 'State and selected district development context'],
    ],
    global: [
      ['UNESCO Institute for Statistics', 'https://uis.unesco.org/', 'Comparable education indicators'],
      ['World Bank Education', 'https://data.worldbank.org/topic/education', 'Cross-country education data'],
      ['OECD PISA', 'https://www.oecd.org/pisa/', 'Learning outcomes for participating systems'],
    ],
  },
  {
    title: 'Health',
    note: 'Health outcomes, nutrition, services and population health.',
    india: [
      ['Ministry of Health & Family Welfare', 'https://www.mohfw.gov.in/', 'Health policy, surveys and programme data'],
      ['NFHS', 'https://rchiips.org/nfhs/', 'Health, nutrition, fertility and household indicators'],
      ['HMIS', 'https://hmis.nhp.gov.in/', 'Health-service reporting'],
    ],
    global: [
      ['WHO Global Health Observatory', 'https://www.who.int/data/gho', 'Comparable global health indicators'],
      ['World Bank Health', 'https://data.worldbank.org/topic/health', 'Cross-country health measures'],
    ],
  },
  {
    title: 'Women & Society',
    note: 'Participation, work, safety, finance, representation and gender equality.',
    india: [
      ['NFHS', 'https://rchiips.org/nfhs/', 'Women’s health, digital access and household indicators'],
      ['PLFS · MoSPI', 'https://www.mospi.gov.in/', 'Labour-force participation and earnings'],
      ['Election Commission of India', 'https://www.eci.gov.in/', 'Political participation and representation'],
    ],
    global: [
      ['World Bank Gender Data Portal', 'https://genderdata.worldbank.org/', 'Gender indicators and Women, Business & the Law measures'],
      ['World Economic Forum', 'https://www.weforum.org/publications/global-gender-gap-report-2025/', 'Global Gender Gap Index'],
      ['Women, Peace and Security Index', 'https://giwps.georgetown.edu/the-index/', 'Women’s inclusion, justice and security'],
      ['Inter-Parliamentary Union', 'https://data.ipu.org/women-ranking/', 'Women in national parliaments'],
    ],
  },
  {
    title: 'Economy & Development',
    note: 'Growth, jobs, household conditions, fiscal health, poverty and SDGs.',
    india: [
      ['MoSPI', 'https://www.mospi.gov.in/', 'GDP, PLFS, HCES and official economic statistics'],
      ['Reserve Bank of India', 'https://www.rbi.org.in/', 'State finances, banking, prices and macroeconomic data'],
      ['NITI Aayog', 'https://www.niti.gov.in/', 'SDG India Index, Fiscal Health Index and multidimensional poverty'],
      ['Open Government Data India', 'https://data.gov.in/', 'Cross-government datasets and APIs'],
    ],
    global: [
      ['World Bank Data', 'https://data.worldbank.org/', 'GDP, poverty, employment and development indicators'],
      ['UNDP Human Development Reports', 'https://hdr.undp.org/data-center', 'Human Development Index and related measures'],
      ['Sustainable Development Report', 'https://dashboards.sdgindex.org/', 'Global SDG Index and country profiles'],
      ['Global Hunger Index', 'https://www.globalhungerindex.org/', 'Hunger and child nutrition index'],
      ['World Happiness Report', 'https://worldhappiness.report/', 'Life-evaluation rankings and analysis'],
    ],
  },
  {
    title: 'Democracy & Governance',
    note: 'Elections, institutions, corruption, press freedom and peace.',
    india: [
      ['Election Commission of India', 'https://www.eci.gov.in/', 'Elections, turnout, results and representation'],
      ['NITI Aayog', 'https://www.niti.gov.in/', 'Governance and development benchmarking'],
    ],
    global: [
      ['Transparency International', 'https://www.transparency.org/en/cpi', 'Corruption Perceptions Index'],
      ['Reporters Without Borders', 'https://rsf.org/en/index', 'World Press Freedom Index'],
      ['Institute for Economics & Peace', 'https://www.visionofhumanity.org/maps/', 'Global Peace Index'],
      ['World Bank Worldwide Governance Indicators', 'https://www.worldbank.org/en/publication/worldwide-governance-indicators', 'Voice, accountability and governance measures'],
    ],
  },
  {
    title: 'Climate & Environment',
    note: 'Temperature, emissions, air, forests, biodiversity and transition.',
    india: [
      ['India Meteorological Department', 'https://mausam.imd.gov.in/', 'Weather, rainfall, heat and climate observations'],
      ['Ministry of Environment, Forest and Climate Change', 'https://moef.gov.in/', 'Climate, forests, biodiversity and environmental policy'],
      ['Forest Survey of India', 'https://fsi.nic.in/', 'Forest and tree-cover assessments'],
    ],
    global: [
      ['NASA Earth Indicators', 'https://science.nasa.gov/earth/explore/earth-indicators/', 'Global temperature and Earth-system indicators'],
      ['NOAA Global Monitoring Laboratory', 'https://gml.noaa.gov/', 'Atmospheric CO₂, methane and climate observations'],
      ['Yale Environmental Performance Index', 'https://epi.yale.edu/', 'Environment, biodiversity, air quality and related rankings'],
      ['Climate Change Performance Index', 'https://ccpi.org/', 'Climate-policy and emissions performance'],
      ['FAO Global Forest Resources Assessment', 'https://www.fao.org/forest-resources-assessment/en/', 'Forest area and forest trends'],
      ['World Economic Forum Energy Transition Index', 'https://www.weforum.org/publications/fostering-effective-energy-transition-2025/', 'Energy-transition benchmarking'],
    ],
  },
];

export const metadata = {
  title: 'Sources',
  description: 'Indian and global sources used by CurioLens, organised by topic and institution.',
};

function SourceColumn({ title, items }) {
  return <div className="source-region-column">
    <h3>{title}</h3>
    <div className="source-link-grid">
      {items.map(([name, href, desc]) => <a className="source-link-card" href={href} target="_blank" rel="noreferrer" key={`${title}-${href}`}>
        <div><strong>{name}</strong><span>{desc}</span></div><b>Open source ↗</b>
      </a>)}
    </div>
  </div>;
}

export default function SourcesPage() {
  return <div className="sources-page">
    <section className="sources-hero">
      <span className="section-tag">Verify the evidence</span>
      <h1>Sources, organised by topic.</h1>
      <p>See which Indian and global institutions sit behind CurioLens data. Individual charts still show their exact source and reference period.</p>
    </section>

    <section className="sources-grid-wrap topic-source-groups">
      {groups.map((group) => <article className="source-group topic-source-group" key={group.title}>
        <div className="source-group-head"><h2>{group.title}</h2><p>{group.note}</p></div>
        <div className="source-region-grid"><SourceColumn title="India" items={group.india}/><SourceColumn title="Global" items={group.global}/></div>
      </article>)}
    </section>

    <section className="source-rule-card">
      <div><span className="section-tag">CurioLens rule</span><h2>Use the newest credible value, but always show its actual period.</h2></div>
      <p>CurioLens prefers live or latest published official data. When a source does not cover a selected place or metric, the interface keeps that limitation visible rather than substituting an unrelated geography.</p>
    </section>
  </div>;
}
