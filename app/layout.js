import './styles.css';
import SiteNav from '../components/SiteNav';

export const metadata = {
  title: { default: 'CurioLens', template: '%s · CurioLens' },
  description: 'Explore public-interest topics through credible data, visual comparisons and plain-language context — from countries to local communities.',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'CurioLens' },
};

export const viewport = {
  width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0f8d7b',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        <main>{children}</main>
        <footer className="footer-new">
          <div><b>CurioLens</b><span>Curiosity, backed by evidence.</span></div>
          <small>Public-interest data, explained simply. · <a href="/sources/">Verify our sources</a></small>
        </footer>
      </body>
    </html>
  );
}
