import EducationDashboard from '../../components/EducationDashboard';

export const metadata = {
  title: 'Education explorer',
  description: 'Explore education from state level to districts and local bodies, with simple comparisons and source links.',
};

export default function EducationPage() {
  return (
    <div className="education-page">
      <section className="education-page-hero">
        <div className="hero-text-block">
          <span className="section-tag">Education explorer</span>
          <h1>How is education doing where you live?</h1>
          <p>Choose a place, move from state to district and local body, then compare education outcomes with useful benchmarks and source-backed context.</p>
        </div>
        <div className="hero-side-note"><strong>Built for quick understanding</strong><span>Big numbers, real maps, short explanations and source-aware comparisons.</span></div>
      </section>
      <EducationDashboard />
    </div>
  );
}
