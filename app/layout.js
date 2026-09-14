import './styles.css';

export const metadata = {
  title: {
    default: 'CurioLens',
    template: '%s · CurioLens',
  },
  description: 'Short, credible stories powered by data, science, geography and curiosity.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header shell">
          <a className="brand" href="/" aria-label="CurioLens home">
            <span className="brand-mark">C</span>
            <span>CurioLens</span>
          </a>
          <nav aria-label="Main navigation">
            <a href="/articles/">Stories</a>
            <a href="/#topics">Topics</a>
            <a href="/about/">About</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <div className="shell footer-inner">
            <div>
              <div className="brand footer-brand"><span className="brand-mark">C</span><span>CurioLens</span></div>
              <p>Curious stories. Credible facts. No endless scroll.</p>
            </div>
            <div className="footer-meta">© {new Date().getFullYear()} CurioLens</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
