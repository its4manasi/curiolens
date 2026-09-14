import Link from 'next/link';

const groups = [
  ['What contributes to it?',['Electricity & energy','Transport','Industry','Buildings','Agriculture','Livestock','Deforestation & land use','Waste']],
  ['What is changing?',['Temperature','Rainfall','Heatwaves','Drought','Floods','Glaciers','Sea level','Extreme weather']],
  ['Who is affected?',['Farmers','Cities','Children','Women','Coastal communities','Outdoor workers','Low-income households']],
  ['What can help?',['Renewable energy','Public transport','Forest protection','Energy efficiency','Climate-resilient farming','Adaptation & early warning']],
];

export const metadata = { title: 'Climate' };

export default function ClimatePage(){
  return <div className="topic-page-v5 climate-page">
    <section className="topic-hero-v5 climate-hero">
      <div><span className="section-tag">Climate change</span><h1>What is changing — and what is driving it?</h1><p>Explore emissions, heat, rainfall, extreme weather and practical responses from global level down to your local area.</p></div>
      <div className="topic-hero-art climate-art" aria-label="Climate visual placeholder"><span>Climate</span><b>Energy · Heat · Rain · Land · People</b></div>
    </section>
    <section className="topic-filter-row"><label>Country<select defaultValue="India"><option>India</option><option>Global view</option></select></label><label>State<select defaultValue="All"><option>All</option><option>Bihar</option><option>Punjab</option><option>Kerala</option></select></label><label>Area<select defaultValue="All"><option>All</option><option>District / local body</option></select></label></section>
    <section className="topic-question-grid">{groups.map(([title,items]) => <article className="topic-question-card" key={title}><h2>{title}</h2><div className="subtopic-cloud">{items.map(i=><button key={i}>{i}</button>)}</div></article>)}</section>
    <section className="topic-feature-story"><div className="feature-image-placeholder climate-photo"><span>Suggested public-domain image</span><strong>NASA Earth / heatwave / glacier / wildfire photography</strong><small>Use NASA, NOAA, USGS or properly licensed Wikimedia Commons images with attribution where required.</small></div><div><span className="section-tag">Featured explainer</span><h2>From global warming to a local heatwave</h2><p>CurioLens should connect the global cause to the local experience: long-term temperature trend, urban heat, tree cover, vulnerable groups and possible responses.</p><Link className="primary-button" href="/articles/">Read short explainers</Link></div></section>
  </div>
}
