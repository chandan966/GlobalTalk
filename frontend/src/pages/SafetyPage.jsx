import { Link } from 'react-router-dom';
import usePageMetadata from '../utils/usePageMetadata';
import './SafetyPage.css';

const safetyTips = [
  [
    'Protect your identity',
    'Do not share your address, phone number, passwords, financial information, or live location.',
  ],
  [
    'Be cautious with links',
    'Avoid unknown links, downloads, requests for money, and suspicious offers.',
  ],
  [
    'Respect others',
    'Harassment, threats, hate speech, impersonation, and illegal content are not acceptable.',
  ],
  [
    'Report messages',
    'Use the flag icon to hide a message and send a report to the service logs. Reports are not automatically reviewed in this starter version.',
  ],
  ['Leave when uncomfortable', 'Close the tab or leave the room if a conversation feels unsafe.'],
];

export default function SafetyPage() {
  usePageMetadata(
    'Safety',
    'Safety advice and reporting information for public GlobalTalk chat rooms.',
    '/safety',
  );

  return (
    <main className="text-page">
      <Link to="/" className="back-link">
        ← Back to rooms
      </Link>
      <div className="eyebrow">STAY SAFE</div>
      <h1>Chat smart. Stay safe.</h1>
      <p className="lead">Anonymity does not remove the need for good judgment.</p>
      {safetyTips.map(([heading, description]) => (
        <section className="safety-item" key={heading}>
          <h3>{heading}</h3>
          <p>{description}</p>
        </section>
      ))}
      <p className="notice">
        GlobalTalk is an MVP. It does not provide emergency support, identity verification, or a
        staffed moderation team.
      </p>
    </main>
  );
}
