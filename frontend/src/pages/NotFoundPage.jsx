import { Link } from 'react-router-dom';
import usePageMetadata from '../utils/usePageMetadata';
import './NotFoundPage.css';

export default function NotFoundPage() {
  usePageMetadata(
    'Page not found',
    'The requested GlobalTalk page could not be found.',
    '/',
    'noindex, nofollow',
  );

  return (
    <main className="not-found-page">
      <div className="eyebrow">404</div>
      <h1>Page not found</h1>
      <p>That page may have moved or does not exist.</p>
      <Link className="button primary" to="/">
        Back to rooms
      </Link>
    </main>
  );
}
