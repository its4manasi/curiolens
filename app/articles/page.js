import { getArticles } from '../../lib/articles';

export const metadata = { title: 'Stories' };

export default function ArticlesPage() {
  const articles = getArticles();
  return (
    <section className="shell archive">
      <div className="kicker">CurioLens archive</div>
      <h1>Stories</h1>
      <p className="archive-intro">Short explainers, visual stories and evidence-backed perspectives.</p>
      <div className="card-grid">
        {articles.map((article) => (
          <a className="card" key={article.slug} href={`/articles/${article.slug}/`}>
            <div className="kicker">{article.category}</div>
            <h3>{article.title}</h3>
            <p>{article.description}</p>
            <span className="card-date">{article.date}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
