export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <article className="article">
      <div className="kicker">About CurioLens</div>
      <h1>Curiosity deserves good evidence.</h1>
      <p className="article-deck">
        CurioLens is a short-form publication for people who want to understand the world without spending an hour on every question.
      </p>
      <div className="article-body">
        <h2>What we aim for</h2>
        <p>Concise writing, credible sources, useful visuals and a clear distinction between reported facts, public data and interpretation.</p>
        <h2>What can live here</h2>
        <p>Government data, science, geography, climate, economics and major world events — connected by curiosity rather than a single subject.</p>
        <h2>How data works</h2>
        <p>Where practical, public datasets are fetched from their original APIs instead of copied into CurioLens. Articles and opinions remain independent editorial content.</p>
      </div>
    </article>
  );
}
