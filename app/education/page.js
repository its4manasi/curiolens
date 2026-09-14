import EducationDashboard from '../../components/EducationDashboard';

export const metadata = {
  title: 'Education explorer',
  description: 'Choose any Indian state and district, then explore concise education indicators, comparisons, maps and source links.',
};

export default function EducationPage() {
  return (
    <div className="education-page">
      <section className="education-page-hero education-hero-compact-v132">
        <div className="hero-text-block">
          <span className="section-tag">Education explorer</span>
          <h1>How is education doing where you live?</h1>
          <p>Choose a state and district. CurioLens keeps the numbers short, explains what they mean, compares them fairly, and points back to the official source.</p>
        </div>
        <div className="hero-side-note"><strong>State → District</strong><span>One simple geography path. No crowded chain of dropdowns.</span></div>
      </section>
      <EducationDashboard />
    </div>
  );
}
