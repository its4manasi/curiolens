import EducationDashboard from '../../components/EducationDashboard';

export const metadata = {
  title: 'Education in Bihar',
  description: 'Explore education indicators across Bihar, its divisions and districts, with Indian and world comparisons.',
};

export default function EducationPage() {
  return (
    <div className="education-page">
      <section className="education-page-hero">
        <div className="hero-text-block">
          <span className="section-tag">Education · Bihar first</span>
          <h1>How is education doing where you live?</h1>
          <p>Start with Bihar, move through division and district, switch between urban and rural areas, then compare the gaps with stronger states and ideas from around the world.</p>
        </div>
        <div className="hero-side-note"><strong>Built for quick understanding</strong><span>Big numbers, real maps, short explanations and source-aware comparisons.</span></div>
      </section>
      <EducationDashboard />
    </div>
  );
}
