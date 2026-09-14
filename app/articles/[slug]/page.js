import ReactMarkdown from 'react-markdown';
import { getArticle, getArticles } from '../../../lib/articles';
import WorldBankStat from '../../../components/WorldBankStat';

export function generateStaticParams() {
  return getArticles().map((article) => ({ slug: article.slug }));
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = getArticle(slug);

  return (
    <article className="article">
      <div className="kicker">{article.category} · {article.date}</div>
      <h1>{article.title}</h1>
      <p className="article-deck">{article.description}</p>

      {article.liveWorldBankIndicator && (
        <WorldBankStat
          country={article.worldBankCountry || 'IND'}
          indicator={article.liveWorldBankIndicator}
        />
      )}

      <div className="article-body">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>
    </article>
  );
}
