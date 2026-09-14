import EconomyDashboard from '../../components/EconomyDashboard';

export const metadata = {
  title: 'Economy | CurioLens',
  description: 'Understand India’s economy through GDP, jobs, wages, household consumption and state income — not one headline number.'
};

export default function EconomyPage(){
  return <main className="topic-dashboard-page economy-page">
    <section className="topic-dashboard-hero economy-hero">
      <div>
        <span className="section-kicker">Economy · India</span>
        <h1>Is growth reaching everyday life?</h1>
        <p>GDP tells us how large and fast the economy is growing. CurioLens puts it beside jobs, wages, household spending and state income so the ground picture is easier to understand.</p>
      </div>
      <aside className="economy-hero-card"><span>4 lenses</span><b>Growth · Work · Spending · Distribution</b><p>No single number can describe how an economy feels to everyone.</p></aside>
    </section>
    <EconomyDashboard />
  </main>
}
