import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="home-redesign">
      <section className="home-hero-full">
        <div className="home-hero-copy">
          <span className="section-tag">Curious stories · credible facts</span>
          <h1>Data for a<br/><em>brighter Bihar.</em></h1>
          <p>Explore what is changing, where the gaps are, and what the evidence suggests — without reading a 100-page report.</p>
          <div className="hero-actions"><Link className="primary-button" href="/education/">Explore education</Link><Link className="ghost-button" href="/articles/">Read short stories</Link></div>
        </div>
        <div className="home-hero-visual">
          <div className="visual-orbit one"/><div className="visual-orbit two"/><div className="visual-grid"/>
          <div className="visual-caption"><span>Bihar</span><strong>See your state.<br/>Understand your place.</strong></div>
        </div>
      </section>

      <section className="home-quick-stats">
        <article><span>Education</span><strong>62%</strong><small>Prototype literacy view</small></article>
        <article><span>Health</span><strong>Next</strong><small>Public health indicators</small></article>
        <article><span>Economy</span><strong>Next</strong><small>Jobs, income and growth</small></article>
        <article><span>Environment</span><strong>Next</strong><small>Air, water and climate</small></article>
      </section>

      <section className="home-section-wide">
        <div className="wide-section-head"><div><span className="section-tag">Explore by theme</span><h2>One place to understand your state.</h2></div><p>Each section uses the same idea: official data, visual comparison, plain-language context and a clear path from state to local area.</p></div>
        <div className="theme-card-grid">
          <Link href="/education/" className="theme-card is-live"><i>01</i><strong>Education</strong><span>Schools, learning, teachers and higher education.</span><b>Explore →</b></Link>
          <Link href="/health/" className="theme-card"><i>02</i><strong>Health</strong><span>Healthcare access, outcomes and local gaps.</span><b>Coming next</b></Link>
          <Link href="/economy/" className="theme-card"><i>03</i><strong>Economy</strong><span>Jobs, income, prices and opportunity.</span><b>Coming next</b></Link>
          <Link href="/environment/" className="theme-card"><i>04</i><strong>Environment</strong><span>Air, water, land and climate resilience.</span><b>Coming next</b></Link>
          <Link href="/local-bodies/" className="theme-card"><i>05</i><strong>Local bodies</strong><span>Move from state to district, urban and rural areas.</span><b>Explore structure</b></Link>
        </div>
      </section>

      <section className="home-feature-band">
        <div><span className="section-tag light">Live section</span><h2>Bihar education,<br/>from state to local area.</h2><p>Compare Bihar with benchmark states, click real map boundaries, move through all nine divisions and 38 districts, and use world comparisons only where they add useful context.</p><Link className="light-button" href="/education/">Open education explorer →</Link></div>
        <div className="feature-mini-board"><div><span>State</span><strong>Bihar</strong></div><div><span>Division</span><strong>9</strong></div><div><span>Districts</span><strong>38</strong></div><div><span>View</span><strong>Urban + Rural</strong></div></div>
      </section>
    </div>
  );
}
