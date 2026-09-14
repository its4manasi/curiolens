import { getArticles } from '../lib/articles';

const topics = [
  ['Data & Society', 'Numbers that explain how people, economies and institutions are changing.'],
  ['Science', 'Short explanations of discoveries, mechanisms and evidence.'],
  ['Earth & Geography', 'Maps, climate, landscapes and events that shape our planet.'],
  ['World', 'Important developments explained without the endless scroll.'],
];

export default function HomePage() {
  const articles = getArticles();
  const featured = articles[0];
  const latest = articles.slice(1, 4);

  return (
    <>
      <section className="hero shell">
        <div className="eyebrow-row">
          <span className="kicker">Curiosity · Evidence · Visual stories</span>
          <span className="reading-promise">Built for a 3–7 minute read</span>
        </div>
        <h1>See the world<br />through a clearer lens.</h1>
        <p className="hero-copy">
          CurioLens turns credible data, science and geography into concise stories worth understanding.
        </p>
      </section>

      {featured && (
        <section className="shell featured-wrap">
          <a className="featured-card" href={`/articles/${featured.slug}/`}>
            <div className="featured-visual" aria-hidden="true">
              <div className="orb orb-one" />
              <div className="orb orb-two" />
              <div className="mini-grid" />
              <span>01</span>
            </div>
            <div className="featured-copy">
              <div className="kicker">Featured · {featured.category}</div>
              <h2>{featured.title}</h2>
              <p>{featured.description}</p>
              <div className="read-link">Read the story →</div>
            </div>
          </a>
        </section>
      )}

      <section id="topics" className="shell section-block">
        <div className="section-heading">
          <div>
            <div className="kicker">What CurioLens covers</div>
            <h2>Follow the question, not the category.</h2>
          </div>
        </div>
        <div className="topic-grid">
          {topics.map(([name, description], index) => (
            <div className="topic-card" key={name}>
              <span className="topic-index">0{index + 1}</span>
              <h3>{name}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {latest.length > 0 && (
        <section className="shell section-block">
          <div className="section-heading">
            <div>
              <div className="kicker">Latest</div>
              <h2>Recent stories</h2>
            </div>
            <a className="text-link" href="/articles/">View all →</a>
          </div>
          <div className="card-grid">
            {latest.map((article) => (
              <a className="card" key={article.slug} href={`/articles/${article.slug}/`}>
                <div className="kicker">{article.category}</div>
                <h3>{article.title}</h3>
                <p>{article.description}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
