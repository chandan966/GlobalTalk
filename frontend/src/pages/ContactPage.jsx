import { Link } from 'react-router-dom';
import { contactEmail } from '../config/site';
import usePageMetadata from '../utils/usePageMetadata';
import './ContactPage.css';

const contactTopics = [
  ['General questions', 'Questions about the service or room features.'],
  ['Abuse reports', 'Include the room and message ID if available. Do not send sensitive personal information.'],
  ['Privacy requests', 'Describe your request without including passwords or unnecessary private data.'],
  ['Advertising', 'Questions about advertising or a future AdSense integration.'],
];

export default function ContactPage() {
  usePageMetadata(
    'Contact',
    'Contact GlobalTalk for general questions, abuse reports, privacy requests, or advertising issues.',
    '/contact',
  );

  return (
    <main className="text-page contact-page">
      <Link to="/" className="back-link">
        ← Back to rooms
      </Link>
      <div className="eyebrow">GET IN TOUCH</div>
      <h1>Contact GlobalTalk</h1>
      <p className="lead">
        Choose a topic below. Do not include passwords, financial details, or other sensitive
        information.
      </p>

      <div className="contact-topics">
        {contactTopics.map(([heading, description]) => (
          <section className="contact-topic" key={heading}>
            <h2>{heading}</h2>
            <p>{description}</p>
            {contactEmail && (
              <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(heading)}`}>
                Email about {heading.toLowerCase()}
              </a>
            )}
          </section>
        ))}
      </div>

      {contactEmail ? (
        <p className="contact-address">
          Email: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </p>
      ) : (
        <p className="contact-not-configured" role="status">
          A public contact email has not been configured yet. The site owner must set
          <code> VITE_CONTACT_EMAIL</code> in the frontend deployment environment before launch.
        </p>
      )}
    </main>
  );
}
