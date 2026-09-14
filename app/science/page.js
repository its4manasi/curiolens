import Link from 'next/link';
import UiIcon from '../../components/UiIcon';

export const metadata = {
  title: 'Science',
  description: 'Explore science through discoveries, experiments, medicine and credible public evidence.',
};

const lenses = [
  ['Physics','Energy, matter, motion and the experiments that test our ideas.'],
  ['Biology','Life, evolution, ecosystems, genetics and the human body.'],
  ['Chemistry','Materials, reactions, molecules and how matter changes.'],
  ['Medicine','Evidence behind prevention, treatments, vaccines and public health.'],
  ['Earth science','Oceans, geology, weather, climate and a changing planet.'],
  ['Research','Indian and global institutions, major papers and scientific breakthroughs.'],
];

export default function SciencePage(){
  return <main className="frontier-page">
    <section className="frontier-hero science-hero">
      <div><span className="section-tag">Science</span><h1>Big questions. Clear evidence. No jargon first.</h1><p>CurioLens will turn major scientific ideas and discoveries into short visual explanations, with links to the research behind them.</p><div className="hero-actions"><a className="primary-button" href="#science-topics">Explore science</a><Link className="ghost-button" href="/sources/">See credible sources</Link></div></div>
      <aside className="frontier-visual"><span><UiIcon name="science" size={44}/></span><strong>Observe → test → compare → learn</strong><small>From classroom concepts to frontier research.</small></aside>
    </section>
    <section id="science-topics" className="frontier-grid">{lenses.map(([t,d],i)=><article key={t}><b>0{i+1}</b><h2>{t}</h2><p>{d}</p><span>Explore soon →</span></article>)}</section>
    <section className="frontier-band"><div><span className="section-tag light">How CurioLens will cover science</span><h2>Explain the idea, show the evidence, link the source.</h2></div><p>NASA, ISRO, WHO, peer-reviewed journals, government research institutions and trusted scientific databases will be prioritised over unsupported claims.</p></section>
  </main>;
}
