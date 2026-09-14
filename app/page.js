import Link from 'next/link';
import UiIcon from '../components/UiIcon';

const topics = [
  ['education','Education','Schools, learning, teachers and higher education.','/education/'],
  ['health','Health','Access, outcomes, nutrition and public health.','/health/'],
  ['women','Women & Society','Education, work, health, safety, assets and representation.','/women/'],
  ['economy','Economy & Development','Jobs, income, welfare, inequality, housing and infrastructure.','/development/'],
  ['democracy','Democracy & Governance','Elections, corruption, representation, public spending and local government.','/democracy/'],
  ['climate','Climate & Environment','Emissions, warming, air, water, forests, biodiversity and resilience.','/climate/'],
  ['science','Science','Discoveries, experiments, medicine and the ideas shaping how we understand the world.','/science/'],
  ['space','Space & Technology','ISRO, global missions, satellites, AI, semiconductors and frontier technology.','/space-tech/'],
];

export default function HomePage() {
  return <div className="v9-home">
    <section className="v9-home-hero">
      <div className="v9-hero-copy">
        <span className="section-tag">Public-interest data · explained simply</span>
        <h1>Understand your world through <em>evidence.</em></h1>
        <p>Choose a topic and a place. CurioLens turns public data into simple comparisons, clear explanations and links back to the original source.</p>
        <div className="hero-actions">
          <Link className="primary-button" href="/education/">Explore topics</Link>
          <Link className="ghost-button" href="/local-bodies/">Choose a place</Link>
        </div>
        <div className="v9-trust-line"><span>Simple language</span><i/><span>Local to global</span><i/><span>Source-linked</span></div>
      </div>

      <div className="v9-hero-explorer" aria-label="How CurioLens works">
        <div className="v9-explorer-head"><span className="v9-explorer-icon"><UiIcon name="map" size={22}/></span><div><small>Explore any place</small><strong>Country → State → District → Local body</strong></div></div>
        <div className="v9-explorer-place"><UiIcon name="pin" size={18}/><span>India</span><b>›</b><span>Choose a state</span><b>›</b><span>Go local</span></div>
        <div className="v9-explorer-divider"/>
        <small className="v9-explorer-label">Popular questions</small>
        <div className="v9-explorer-topics">
          {topics.slice(0,6).map(([icon,name,,href]) => <Link href={href} key={name}><UiIcon name={icon} size={20}/><span>{name}</span><b>›</b></Link>)}
        </div>
      </div>
    </section>

    <section className="v9-section">
      <div className="v9-section-head"><div><span className="section-tag">Explore by topic</span><h2>Start with a question that matters.</h2></div><p>Every topic follows the same structure: what is happening, why it matters, who is affected and what could help.</p></div>
      <div className="v9-topic-grid">
        {topics.map(([icon,name,desc,href]) => <Link key={href} href={href} className="v9-topic-card"><span className="v9-topic-card-icon"><UiIcon name={icon} size={25}/></span><div><strong>{name}</strong><p>{desc}</p></div><b>›</b></Link>)}
      </div>
    </section>

    <section className="v9-proof-band">
      <div><span className="section-tag light">Built to be checked</span><h2>Understand first. Verify when you want.</h2></div>
      <div><p>Important numbers are explained in plain language, compared with useful benchmarks and linked to official or credible sources.</p><Link href="/sources/">See our sources →</Link></div>
    </section>

    <section className="v9-method-section">
      <div className="v9-section-head"><div><span className="section-tag">The CurioLens method</span><h2>Four steps, used everywhere.</h2></div></div>
      <div className="v9-method-grid">
        {[
          ['01','See it','A clear number, map or trend.'],['02','Understand it','Plain words before technical terms.'],['03','Compare it','See local, state, national or global context.'],['04','Check it','Open the original source in one tap.']
        ].map(([n,t,d]) => <article key={n}><b>{n}</b><strong>{t}</strong><span>{d}</span></article>)}
      </div>
    </section>
  </div>;
}
