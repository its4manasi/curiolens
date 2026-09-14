import Link from 'next/link';

const topics = [
  ['Education','Schools, learning, teachers and higher education.','/education/','01'],
  ['Health','Access, outcomes, nutrition and public health.','/health/','02'],
  ['Women','Education, health, work, safety and representation.','/women/','03'],
  ['Development','Jobs, housing, infrastructure and human development.','/development/','04'],
  ['Democracy','Participation, representation and local government.','/democracy/','05'],
  ['Welfare','Food, pensions, housing, scholarships and social protection.','/welfare/','06'],
  ['Climate','Causes, impacts, exposure and solutions.','/climate/','07'],
  ['Economy','Income, jobs, prices and opportunity.','/economy/','08'],
  ['Local Bodies','Move from country to state, district and local area.','/local-bodies/','09'],
];

export default function HomePage() {
  return (
    <div className="home-v5">
      <section className="home-global-hero">
        <div className="home-global-copy">
          <span className="section-tag">Public-interest data · explained simply</span>
          <h1>Understand your world through <em>evidence.</em></h1>
          <p>Pick a topic, choose a place, and see what is happening, why it matters and what the data suggests could improve.</p>
          <div className="hero-actions">
            <Link className="primary-button" href="/education/">Explore a topic</Link>
            <Link className="ghost-button" href="/local-bodies/">Explore a place</Link>
          </div>
          <div className="geo-chooser-demo">
            <label>Country <select defaultValue="India"><option>India</option><option>Other countries soon</option></select></label>
            <label>State <select defaultValue="Bihar"><option>Bihar</option><option>Punjab</option><option>Kerala</option><option>Tamil Nadu</option></select></label>
            <label>District / local body <select defaultValue="All"><option>All</option><option>Choose after state</option></select></label>
          </div>
        </div>
        <div className="home-global-visual" aria-hidden="true">
          <div className="visual-globe"><span>WORLD</span><b>Country → State → District → Local body</b></div>
          <div className="visual-topic-chip t1">Education</div><div className="visual-topic-chip t2">Climate</div><div className="visual-topic-chip t3">Women</div><div className="visual-topic-chip t4">Democracy</div>
        </div>
      </section>

      <section className="home-section-wide">
        <div className="wide-section-head">
          <div><span className="section-tag">Explore by topic</span><h2>Start with a question that matters.</h2></div>
          <p>Every section follows the same pattern: what is happening, why it is happening, who is affected, and what could help.</p>
        </div>
        <div className="theme-card-grid v5-grid">
          {topics.map(([name,desc,href,index]) => <Link key={href} href={href} className="theme-card"><i>{index}</i><strong>{name}</strong><span>{desc}</span><b>Explore →</b></Link>)}
        </div>
      </section>

      <section className="credibility-strip-v5">
        <div><span className="section-tag">Built to be checked</span><h2>Simple enough to understand. Easy enough to verify.</h2></div>
        <div><p>CurioLens explains a number in plain words first, adds a useful comparison, then puts the official source one tap away for anyone who wants to check it.</p><Link className="ghost-button" href="/sources/">View credible data sources →</Link></div>
      </section>

      <section className="curiolens-method">
        <div><span className="section-tag light">The CurioLens method</span><h2>Four questions on every topic.</h2></div>
        <div className="method-steps"><article><b>1</b><strong>What is happening?</strong><span>Show the trend and current position.</span></article><article><b>2</b><strong>Why?</strong><span>Explore contributors without oversimplifying cause.</span></article><article><b>3</b><strong>Who is affected?</strong><span>Bring geography, gender and inequality into view.</span></article><article><b>4</b><strong>What could help?</strong><span>Compare evidence from stronger performers and global examples.</span></article></div>
      </section>
    </div>
  );
}
