import EducationPTR from '../../components/EducationPTR';

export const metadata = {
  title: 'Education data',
  description: 'Explore official Indian education data through a concise CurioLens view.',
};

export default function EducationPage() {
  return (
    <>
      <section className="education-hero shell">
        <div className="kicker">Education · India</div>
        <h1>School education,<br />without the spreadsheet.</h1>
        <p>
          A concise view of official education indicators. CurioLens requests the source data dynamically and turns it into something easier to explore.
        </p>
      </section>

      <section className="shell education-section">
        <EducationPTR />
      </section>

      <section className="shell education-explainer">
        <div>
          <span className="kicker">What this means</span>
          <h2>One number, with context.</h2>
        </div>
        <div>
          <p>
            Pupil–teacher ratio is the average number of enrolled students per teacher at a given level of education. It is useful as a broad capacity indicator, but it does not by itself measure teaching quality or classroom experience.
          </p>
          <p>
            This is the first CurioLens government-data module. The same pattern can later support enrolment, school infrastructure, gender, dropout rates and district-level comparisons.
          </p>
        </div>
      </section>
    </>
  );
}
