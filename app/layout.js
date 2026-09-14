import './styles.css';

export const metadata = {
  title: { default: 'CurioLens', template: '%s · CurioLens' },
  description: 'Short, credible stories powered by data, science, geography and curiosity.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header-full">
          <a className="brand-new" href="/"><span className="brand-lens">C</span><b>CurioLens</b></a>
          <nav className="main-nav-new" aria-label="Main navigation">
            <a href="/">Home</a><a href="/education/">Education</a><a href="/health/">Health</a><a href="/economy/">Economy</a><a href="/environment/">Environment</a><a href="/local-bodies/">Local Bodies</a><a href="/articles/">Stories</a><a href="/about/">About</a>
          </nav>
          <div className="nav-search">⌕</div>
        </header>
        <main>{children}</main>
        <footer className="footer-new"><div><b>CurioLens</b><span>Curiosity, backed by evidence.</span></div><small>Built to make public data easier to understand.</small></footer>
      </body>
    </html>
  );
}
