import HealthDashboard from '../../components/HealthDashboard';

export const metadata = { title: 'Health | CurioLens' };

export default function Page(){
  return <main className="v9-topic-page">
    <section className="v9-topic-hero inner-compact-hero"><div><span className="section-tag">Health</span><h1>Health, made understandable.</h1><p>See the latest available India health indicators, their actual reference year and the source behind each number.</p></div></section>
    <HealthDashboard />
  </main>;
}
