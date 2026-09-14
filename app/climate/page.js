import Link from 'next/link';
import UiIcon from '../../components/UiIcon';
import ClimateDashboard from '../../components/ClimateDashboard';

const groups = [
  ['climate','What contributes?',['Electricity & energy','Transport','Industry','Buildings','Agriculture','Livestock','Deforestation & land use','Waste']],
  ['environment','What is changing?',['Temperature','Rainfall','Heatwaves','Drought','Floods','Glaciers','Sea level','Extreme weather']],
  ['women','Who is affected?',['Farmers','Cities','Children','Women','Coastal communities','Outdoor workers','Low-income households']],
  ['development','What can help?',['Renewable energy','Public transport','Forest protection','Energy efficiency','Climate-resilient farming','Adaptation & early warning']],
];

export const metadata = { title: 'Climate' };

export default function ClimatePage(){
  return <div className="v9-topic-page climate-v10-page">
    <section className="v9-topic-hero climate-v10-hero">
      <div><span className="section-tag">Climate change</span><h1>See the warming. Follow the emissions. Understand the impact.</h1><p>Start with the planet, compare India with the world, then see how greenhouse gases connect to states, glaciers and everyday risks.</p><div className="hero-actions"><a className="primary-button" href="#climate-data">See the numbers</a><Link className="ghost-button" href="/sources/">Verify climate sources</Link></div></div>
      <div className="v9-climate-visual climate-v10-visual" aria-hidden="true"><span><UiIcon name="climate" size={44}/></span><strong>Temperature → CO₂ → Methane → Ice</strong><small>Big climate ideas, explained with source-backed numbers.</small><div className="climate-hero-orbit orbit-one">+1.19°C</div><div className="climate-hero-orbit orbit-two">425.6 ppm CO₂</div></div>
    </section>

    <section className="v9-place-strip"><span><UiIcon name="pin" size={18}/> Viewing</span><button>Global</button><b>›</b><button>India</button><b>›</b><button>State view</button><a href="#state-view">Jump to states</a></section>

    <div id="climate-data"><ClimateDashboard /></div>

    <section className="v9-climate-grid" id="questions">
      {groups.map(([icon,title,items],idx) => <article className="v9-climate-card" key={title}><div className="v9-climate-card-head"><span><UiIcon name={icon} size={23}/></span><div><small>0{idx+1}</small><h2>{title}</h2></div></div><ul>{items.map(item=><li key={item}><span>{item}</span><b>›</b></li>)}</ul></article>)}
    </section>
  </div>;
}
