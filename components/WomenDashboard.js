'use client';

import { useMemo, useState } from 'react';

const sources = {
  education: 'https://www.mohfw-dohfw.gov.in/static/uploads/2026/05/111ff4a13ca36b5cabb7f94aec5bb0ce.pdf',
  health: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2292344&lang=2&reg=48',
  employment: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2300447&lang=1&reg=48',
  employmentRatio: 'https://data.worldbank.org/indicator/SL.TLF.CACT.FM.NE.ZS?most_recent_year_desc=true',
  income: 'https://www.mospi.gov.in/uploads/publications_reports/publications_reports1780040415321_0624fb13-fb47-40bc-b470-7c7e9635c3ef_PLFS_2025_F_REV_29052026.pdf',
  safety: 'https://www.mohfw.gov.in/sites/default/files/Publication%20Health%20and%20Family%20Welfare%20Statistics%20in%20India%202023.pdf',
  politicsIndia: 'https://data.ipu.org/parliament/IN/IN-LC01/data-on-women/',
  politicsWorld: 'https://www.ipu.org/news/press-releases/2026-03/womens-representation-in-parliament-sees-sluggish-gains',
  assets: 'https://genderdata.worldbank.org/en/indicator/sg-own-ld?geos=IND&view=bar',
  accounts: 'https://genderdata.worldbank.org/en/indicator/fx-own-totl-zs?geos=WLD_IND&view=trend',
  digitalIndia: 'https://www.mohfw-dohfw.gov.in/static/uploads/2026/05/111ff4a13ca36b5cabb7f94aec5bb0ce.pdf',
  digitalWorld: 'https://www.itu.int/itu-d/reports/statistics/2024/11/10/ff24-the-gender-digital-divide/',
  welfare: 'https://www.spniwcd.wcd.gov.in/pradhan-mantri-matru-vandana-yojna/faqs',
  gii: 'https://hdr.undp.org/data-center/thematic-composite-indices/gender-inequality-index',
};

const lenses = [
  {
    id: 'education', icon: 'A', title: 'Education', question: 'Who gets enough years of schooling?',
    main: '46.4%', mainLabel: 'women with 10+ years of schooling', compare: '54.6%', compareLabel: 'men',
    gap: '−8.2 pp', tone: 'sky', year: 'NFHS-6 · 2023–24', source: sources.education,
    simple: 'About 46 of every 100 women aged 15–49 had completed at least 10 years of schooling, compared with about 55 men.',
    benchmark: 'Women 46.4%  |  Men 54.6%', max: 60, a: 46.4, b: 54.6,
  },
  {
    id: 'health', icon: '+', title: 'Health', question: 'Is pregnancy becoming safer?',
    main: '87', mainLabel: 'maternal deaths per 100,000 live births', compare: '<70', compareLabel: 'SDG 2030 target',
    gap: '17+ above target', tone: 'rose', year: 'SRS · 2022–24', source: sources.health,
    simple: 'India has improved sharply, but maternal mortality is still above the SDG threshold of fewer than 70 deaths per 100,000 live births.',
    benchmark: 'India 87  |  SDG target <70', max: 100, a: 87, b: 70,
  },
  {
    id: 'employment', icon: 'W', title: 'Employment', question: 'How many women are in the labour force?',
    main: '34.4%', mainLabel: 'female LFPR', compare: '55.4%', compareLabel: 'all adults',
    gap: 'rural 38.8% · urban 25.3%', tone: 'mint', year: 'PLFS · Jul 2026', source: sources.employment,
    simple: 'About one in three women aged 15+ were working or looking for work in the survey week. Rural participation was much higher than urban participation.',
    benchmark: 'Women 34.4%  |  All adults 55.4%', max: 60, a: 34.4, b: 55.4,
  },
  {
    id: 'income', icon: '₹', title: 'Income & earnings', question: 'When women work, what do they earn?',
    main: '₹324', mainLabel: 'women · casual labour/day', compare: '₹489', compareLabel: 'men · casual labour/day',
    gap: '₹165/day gap', tone: 'amber', year: 'PLFS · 2025', source: sources.income,
    simple: 'For casual labour outside public works, women averaged roughly two-thirds of men’s daily earnings in this PLFS measure.',
    benchmark: 'Women ₹324  |  Men ₹489', max: 500, a: 324, b: 489,
  },
  {
    id: 'safety', icon: 'S', title: 'Safety', question: 'How common is spousal violence?',
    main: '29.2%', mainLabel: 'ever-married women reporting spousal violence', compare: '24.5%', compareLabel: 'urban women',
    gap: 'rural 31.2%', tone: 'coral', year: 'NFHS-5 · 2019–21', source: sources.safety,
    simple: 'Nearly 3 in 10 ever-married women reported physical or sexual spousal violence. Survey reporting can still understate violence.',
    benchmark: 'Urban 24.5%  |  Rural 31.2%', max: 40, a: 24.5, b: 31.2,
    inverse: true,
  },
  {
    id: 'representation', icon: 'V', title: 'Political voice', question: 'Who gets a seat at the table?',
    main: '13.8%', mainLabel: 'women in Lok Sabha', compare: '27.5%', compareLabel: 'world parliamentary share',
    gap: 'about half the world share', tone: 'violet', year: 'IPU · 2025/2026', source: sources.politicsIndia,
    secondarySource: sources.politicsWorld,
    simple: 'Women hold about 14 of every 100 seats in India’s lower house, compared with roughly 28 of every 100 parliamentary seats worldwide.',
    benchmark: 'India 13.8%  |  World 27.5%', max: 35, a: 13.8, b: 27.5,
  },
  {
    id: 'assets', icon: 'H', title: 'Property & finance', question: 'Who owns assets and financial accounts?',
    main: '9.5%', mainLabel: 'women owning land alone', compare: '29.7%', compareLabel: 'men owning land alone',
    gap: '3× male advantage', tone: 'sand', year: 'DHS/World Bank · 2021', source: sources.assets,
    secondarySource: sources.accounts,
    simple: 'Bank-account ownership is now near parity, but land ownership alone remains much more unequal: 9.5% of women versus 29.7% of men.',
    benchmark: 'Women land 9.5%  |  Men land 29.7%', max: 35, a: 9.5, b: 29.7,
  },
  {
    id: 'digital', icon: 'D', title: 'Digital access', question: 'Who can participate online?',
    main: '64.3%', mainLabel: 'women who have ever used internet', compare: '80.5%', compareLabel: 'men',
    gap: '−16.2 pp', tone: 'blue', year: 'NFHS-6 · 2023–24', source: sources.digitalIndia,
    secondarySource: sources.digitalWorld,
    simple: 'India’s survey shows a sizeable gender gap. Globally, ITU estimated 65% of women and 70% of men used the internet in 2024; the definitions are not identical.',
    benchmark: 'India women 64.3%  |  India men 80.5%', max: 90, a: 64.3, b: 80.5,
  },
  {
    id: 'welfare', icon: '♥', title: 'Welfare & protection', question: 'What support exists around motherhood?',
    main: '₹5,000', mainLabel: 'PMMVY benefit · first child', compare: '₹6,000', compareLabel: 'second child if girl',
    gap: 'eligibility ≠ coverage', tone: 'pink', year: 'PMMVY · current scheme rules', source: sources.welfare,
    simple: 'PMMVY provides maternity cash support for eligible women. CurioLens treats scheme design and actual beneficiary coverage as separate questions.',
    benchmark: 'First child ₹5,000  |  Second girl child ₹6,000', max: 6000, a: 5000, b: 6000,
  },
];

function SourceLink({ href, children = 'Check official data' }) {
  return <a className="women-v13-source" href={href} target="_blank" rel="noreferrer">{children} ↗</a>;
}

function MiniBars({ lens }) {
  const a = Math.max(4, (lens.a / lens.max) * 100);
  const b = Math.max(4, (lens.b / lens.max) * 100);
  return (
    <div className="women-v13-mini-bars" aria-label={lens.benchmark}>
      <span style={{ width: `${a}%` }} />
      <span style={{ width: `${b}%` }} />
    </div>
  );
}

export default function WomenDashboard() {
  const [selected, setSelected] = useState('education');
  const active = useMemo(() => lenses.find((x) => x.id === selected) || lenses[0], [selected]);

  return (
    <div className="women-v13-dashboard">
      <section className="women-v13-overview">
        <div>
          <span className="women-v13-section-label">Nine lenses</span>
          <h2>Tap any topic to compare the gap.</h2>
          <p>Every card uses the clearest comparison available: women vs men, India vs world, urban vs rural, or India vs a public target.</p>
        </div>
        <div className="women-v13-gii">
          <span>UNDP Gender Inequality Index</span>
          <strong>0.403</strong>
          <b>India · rank 102</b>
          <SourceLink href={sources.gii}>UNDP methodology</SourceLink>
        </div>
      </section>

      <nav className="women-v13-lens-nav" aria-label="Women and gender topics">
        {lenses.map((lens, index) => (
          <button key={lens.id} className={selected === lens.id ? 'is-active' : ''} onClick={() => setSelected(lens.id)}>
            <span>{String(index + 1).padStart(2, '0')}</span>{lens.title}
          </button>
        ))}
      </nav>

      <section className="women-v13-card-grid">
        {lenses.map((lens) => (
          <article key={lens.id} className={`women-v13-card ${lens.tone} ${selected === lens.id ? 'is-active' : ''}`} onClick={() => setSelected(lens.id)}>
            <header>
              <span className="women-v13-card-icon">{lens.icon}</span>
              <div><small>{lens.year}</small><h3>{lens.title}</h3></div>
            </header>
            <p className="women-v13-question">{lens.question}</p>
            <div className="women-v13-number-row">
              <div><strong>{lens.main}</strong><span>{lens.mainLabel}</span></div>
              <div className="women-v13-vs">vs</div>
              <div><strong>{lens.compare}</strong><span>{lens.compareLabel}</span></div>
            </div>
            <MiniBars lens={lens} />
            <div className="women-v13-gap">{lens.gap}</div>
            <p className="women-v13-simple">{lens.simple}</p>
            <SourceLink href={lens.source} />
          </article>
        ))}
      </section>

      <section className={`women-v13-focus ${active.tone}`}>
        <div className="women-v13-focus-copy">
          <span className="women-v13-section-label">Selected lens · {active.title}</span>
          <h2>{active.question}</h2>
          <p>{active.simple}</p>
          <div className="women-v13-focus-stat">
            <div><strong>{active.main}</strong><span>{active.mainLabel}</span></div>
            <div><strong>{active.compare}</strong><span>{active.compareLabel}</span></div>
          </div>
          <SourceLink href={active.source} />
          {active.secondarySource && <SourceLink href={active.secondarySource}>Open comparison source</SourceLink>}
        </div>
        <div className="women-v13-focus-visual">
          <span>Comparison</span>
          <strong>{active.benchmark}</strong>
          <div className="women-v13-big-bars">
            <i><span style={{ width: `${Math.max(4, (active.a / active.max) * 100)}%` }} /></i>
            <i><span style={{ width: `${Math.max(4, (active.b / active.max) * 100)}%` }} /></i>
          </div>
          <p>{active.inverse ? 'For this measure, lower is better.' : 'Read the direction together with the definition; a bigger number is not always automatically better.'}</p>
        </div>
      </section>

      <section className="women-v13-reading-guide">
        <article><b>Do not mix definitions</b><p>“Ever used the internet”, “currently using the internet” and “owns a phone” measure different things.</p></article>
        <article><b>Do not treat reporting as prevalence</b><p>Violence and safety statistics can be affected by under-reporting, access to police and survey design.</p></article>
        <article><b>Do not confuse access with control</b><p>A bank account, land title or welfare benefit does not automatically mean equal control over money and decisions.</p></article>
      </section>
    </div>
  );
}
