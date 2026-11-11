import { Link } from 'react-router-dom';
import AdSenseBanner from '../components/AdSenseBanner';
import { sitePages } from '../data/sitePages';
import usePageMetadata from '../utils/usePageMetadata';
import './InfoPage.css';

export default function InfoPage({ page }) {
  const content = sitePages[page];
  usePageMetadata(content.title, content.description, content.path);

  return (
    <main className="text-page info-page">
      <Link to="/" className="back-link">
        ← Back to rooms
      </Link>
      <div className="eyebrow">GLOBALTALK</div>
      <h1>{content.title}</h1>
      <p className="lead">{content.description}</p>
      {content.sections.map((section) => (
        <section className="info-page-section" key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
      <AdSenseBanner />
      <p className="info-page-contact">
        Questions? Visit the <Link to="/contact">Contact page</Link>.
      </p>
    </main>
  );
}
