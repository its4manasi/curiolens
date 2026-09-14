import WomenDashboard from '../../components/WomenDashboard';

export const metadata = {
  title: 'Women & Gender | CurioLens',
  description: 'Compare nine dimensions of women’s opportunity in India: education, health, work, income, safety, representation, assets, digital access and welfare.',
};

export default function WomenPage() {
  return (
    <main className="women-v13-page">
      <section className="women-v13-hero">
        <div className="women-v13-hero-copy">
          <span className="women-v13-kicker">Women & gender · India</span>
          <h1>Half the population. Nine ways to ask if opportunity is equal.</h1>
          <p>
            No single ranking can explain women’s lives. CurioLens puts education, health,
            work, income, safety, political voice, assets, digital access and welfare side by side.
          </p>
          <div className="women-v13-pills">
            <span>Compare women ↔ men</span>
            <span>India ↔ world where comparable</span>
            <span>Verify every source</span>
          </div>
        </div>
        <aside className="women-v13-hero-note">
          <span>How to read this page</span>
          <strong>Gap first. Rank second.</strong>
          <p>A national average can hide large differences by state, income, rural/urban location and age.</p>
        </aside>
      </section>
      <WomenDashboard />
    </main>
  );
}
