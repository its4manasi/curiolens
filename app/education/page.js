import EducationDashboard from '../../components/EducationDashboard';

export const metadata = {
  title: 'Education explorer',
  description: 'Explore Bihar education from state comparisons down to urban and rural local areas.',
};

export default function EducationPage() {
  return (
    <>
      <section className="education-hero shell compact-education-hero">
        <div className="kicker">Education · Bihar</div>
        <h1>How is education doing where you live?</h1>
        <p>Start with Bihar, compare it with five benchmark states, then move down to districts and urban or rural local bodies. Every number should answer a simple question, not create another spreadsheet.</p>
      </section>
      <section className="shell education-section">
        <EducationDashboard />
      </section>
    </>
  );
}
