import Link from 'next/link';
import UiIcon from '../../components/UiIcon';

export const metadata = {
  title: 'Space & Technology',
  description: 'Explore space missions, satellites, AI, semiconductors and frontier technology through credible data.',
};

const lenses = [
  ['ISRO & India','Launches, satellites, Chandrayaan, Gaganyaan and India’s space ecosystem.'],
  ['Global missions','NASA, ESA, JAXA and other missions to the Moon, Mars and beyond.'],
  ['Satellites','How satellites support weather, navigation, communication, farming and disaster response.'],
  ['Astronomy','Stars, galaxies, exoplanets, telescopes and what we are learning about the universe.'],
  ['AI & computing','Artificial intelligence, compute, models, adoption and real-world impact.'],
  ['Semiconductors & quantum','Chips, manufacturing, quantum research and strategic technology capacity.'],
];

export default function SpaceTechPage(){
  return <main className="frontier-page">
    <section className="frontier-hero space-hero">
      <div><span className="section-tag">Space & technology</span><h1>From orbit to algorithms.</h1><p>Follow missions, satellites and frontier technologies through numbers that explain what happened, why it matters and what comes next.</p><div className="hero-actions"><a className="primary-button" href="#space-topics">Explore topics</a><Link className="ghost-button" href="/sources/">Verify sources</Link></div></div>
      <aside className="frontier-visual"><span><UiIcon name="space" size={44}/></span><strong>Mission → technology → impact</strong><small>Space, AI and strategic technology in plain language.</small></aside>
    </section>
    <section id="space-topics" className="frontier-grid">{lenses.map(([t,d],i)=><article key={t}><b>0{i+1}</b><h2>{t}</h2><p>{d}</p><span>Explore soon →</span></article>)}</section>
    <section className="frontier-band"><div><span className="section-tag light">A global lens</span><h2>India in context, not in isolation.</h2></div><p>CurioLens will compare ISRO and Indian technology trends with credible international data from agencies such as NASA, ESA, ITU, OECD and other public sources.</p></section>
  </main>;
}
