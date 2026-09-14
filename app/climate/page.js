import Link from 'next/link';
import UiIcon from '../../components/UiIcon';

const groups = [
  ['climate','What contributes?',['Electricity & energy','Transport','Industry','Buildings','Agriculture','Livestock','Deforestation & land use','Waste']],
  ['environment','What is changing?',['Temperature','Rainfall','Heatwaves','Drought','Floods','Glaciers','Sea level','Extreme weather']],
  ['women','Who is affected?',['Farmers','Cities','Children','Women','Coastal communities','Outdoor workers','Low-income households']],
  ['development','What can help?',['Renewable energy','Public transport','Forest protection','Energy efficiency','Climate-resilient farming','Adaptation & early warning']],
];

export const metadata = { title: 'Climate' };

export default function ClimatePage(){
  return <div className="v9-topic-page">
    <section className="v9-topic-hero">
      <div><span className="section-tag">Climate change</span><h1>What is changing — and what is driving it?</h1><p>Follow the chain from emissions and land use to heat, rainfall, extreme weather and practical responses.</p><div className="hero-actions"><a className="primary-button" href="#questions">Explore the questions</a><Link className="ghost-button" href="/sources/">Check climate sources</Link></div></div>
      <div className="v9-climate-visual" aria-hidden="true"><span><UiIcon name="climate" size={44}/></span><strong>Cause → Change → People → Response</strong><small>One story, viewed at global, national and local level.</small></div>
    </section>

    <section className="v9-place-strip"><span><UiIcon name="pin" size={18}/> Viewing</span><button>India</button><b>›</b><button>All states</button><b>›</b><button>All local areas</button><a href="#questions">Change place</a></section>

    <section className="v9-climate-grid" id="questions">
      {groups.map(([icon,title,items],idx) => <article className="v9-climate-card" key={title}><div className="v9-climate-card-head"><span><UiIcon name={icon} size={23}/></span><div><small>0{idx+1}</small><h2>{title}</h2></div></div><ul>{items.map(item=><li key={item}><span>{item}</span><b>›</b></li>)}</ul></article>)}
    </section>

    <section className="v9-climate-feature"><div className="v9-climate-image" aria-label="Climate image placeholder"><span>Public-domain image area</span><strong>NASA / NOAA / USGS / licensed Wikimedia imagery</strong></div><div><span className="section-tag">Featured explainer</span><h2>From global warming to a local heatwave</h2><p>Connect the global trend to what people experience locally: rising temperatures, urban heat, tree cover, outdoor work and public-health risk.</p><Link className="primary-button" href="/articles/">Read short explainers</Link></div></section>
  </div>;
}
