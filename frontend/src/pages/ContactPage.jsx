import { Link } from 'react-router-dom';
import AdSenseBanner from '../components/AdSenseBanner';
import { contactEmail, grievanceOfficer } from '../config/site';
import usePageMetadata from '../utils/usePageMetadata';
import './ContactPage.css';

const contactTopics = [
  ['General questions', 'Questions about the service or room features.'],
  [
    'Abuse reports',
    'Include the room and message ID if available. Do not send sensitive personal information.',
  ],
  [
    'Privacy requests',
    'Describe your request without including passwords or unnecessary private data.',
  ],
  ['Advertising', 'Inquiries regarding compliant static advertising partnerships.'],
];

export default function ContactPage() {
  usePageMetadata(
    'Contact & Grievance Redressal',
    'Contact GlobalTalk for general questions, abuse reports, privacy requests, and statutory grievance redressal under Indian IT Rules.',
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
        Have questions, feedback, or need assistance? Reach out directly below. Do not include
        passwords, financial details, or sensitive personal data.
      </p>

      {/* Prominent Direct Email Contact Banner */}
      <div className="contact-action-card">
        <div className="contact-action-text">
          <h2>Direct Email Support</h2>
          <p>
            Tap below to open your email client directly or write to us at{' '}
            <strong className="contact-highlight-email">{contactEmail}</strong>.
          </p>
        </div>
        <div className="contact-action-buttons">
          <a
            href={`mailto:${contactEmail}?subject=GlobalTalk%20Inquiry`}
            className="button primary contact-direct-btn"
          >
            <span>✉️</span> Email Me (Open Mail App)
          </a>
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}&su=GlobalTalk%20Inquiry`}
            target="_blank"
            rel="noopener noreferrer"
            className="button secondary contact-gmail-btn"
          >
            <span>📧</span> Open in Gmail Web
          </a>
        </div>
      </div>

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
          General Email: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </p>
      ) : (
        <p className="contact-not-configured" role="status">
          A public contact email has not been configured yet. The site owner must set
          <code> VITE_CONTACT_EMAIL</code> in the frontend deployment environment before launch.
        </p>
      )}

      {/* Statutory Grievance Redressal Mechanism complying with Rule 3(2) of Indian IT Rules (2021/2026) */}
      <section className="grievance-section" aria-labelledby="grievance-heading">
        <h2 id="grievance-heading">Statutory Grievance Redressal (India)</h2>
        <p className="grievance-lead">
          In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and
          Digital Media Ethics Code) Rules, 2021, and the February 2026 MeitY amendments, the
          contact details of the Resident Grievance Officer for GlobalTalk are published below.
        </p>

        <div className="grievance-card">
          <div className="grievance-row">
            <span>Designation:</span>
            <b>{grievanceOfficer.designation}</b>
          </div>
          <div className="grievance-row">
            <span>Officer Name:</span>
            <b>
              {grievanceOfficer.name ||
                '[Designated Resident Grievance Officer - Pending VITE_GRIEVANCE_OFFICER_NAME]'}
            </b>
          </div>
          <div className="grievance-row">
            <span>Official Email:</span>
            {grievanceOfficer.email ? (
              <a href={`mailto:${grievanceOfficer.email}?subject=Statutory%20Grievance%20Notice`}>
                {grievanceOfficer.email}
              </a>
            ) : (
              <b>[Pending Configuration - VITE_GRIEVANCE_OFFICER_EMAIL]</b>
            )}
          </div>
          <div className="grievance-row">
            <span>Physical Address:</span>
            <b>
              {grievanceOfficer.address || '[Physical Address in India - Pending Configuration]'}
            </b>
          </div>
          <div className="grievance-row">
            <span>Country:</span>
            <b>{grievanceOfficer.country}</b>
          </div>
        </div>

        {!grievanceOfficer.name || !grievanceOfficer.email ? (
          <div className="prelaunch-blocker" role="alert">
            <h3>⚠️ Pre-Launch Legal Blocker: Resident Grievance Officer Unconfigured</h3>
            <p>
              Under Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital
              Media Ethics Code) Rules, 2021, an intermediary must publish the true name, official
              email address, and physical office address of its designated Resident Grievance
              Officer in India before opening the platform to the public.
            </p>
            <p>
              <strong>Required Action:</strong> Set <code>VITE_GRIEVANCE_OFFICER_NAME</code>,{' '}
              <code>VITE_GRIEVANCE_OFFICER_EMAIL</code>, and{' '}
              <code>VITE_GRIEVANCE_OFFICER_ADDRESS</code> in your production environment settings
              prior to launch.
            </p>
          </div>
        ) : null}

        <div className="grievance-timelines">
          <h3>Statutory Response Schedules (IT Rules, as amended 2026)</h3>
          <ul>
            <li>
              <strong>General Grievance Acknowledgement:</strong> Formally acknowledged within{' '}
              <strong>24 hours</strong> with a unique complaint ticket.
            </li>
            <li>
              <strong>General Grievance Resolution:</strong> Investigated and disposed of within{' '}
              <strong>7 days</strong> of receipt.
            </li>
            <li>
              <strong>Unlawful Content Removal (Rule 3(1)(b)):</strong> Reviewed and access disabled
              within <strong>36 hours</strong> upon valid notice.
            </li>
            <li>
              <strong>Non-Consensual Intimate Imagery / Deepfakes (Rule 3(2)(b)):</strong> Acted
              upon within <strong>2 hours</strong> to disable access.
            </li>
            <li>
              <strong>Court Orders / Government Directives (Rule 3(1)(d)):</strong> Takedown
              executed within <strong>3 hours</strong> upon receipt of lawful direction.
            </li>
          </ul>
        </div>

        <p className="grievance-instructions">
          <strong>How to file a formal grievance:</strong> Send an email to the official grievance
          address above. Please specify the room name, exact date and time (IST), description of the
          violating content or conduct, and attach a copy of the formal government/court order if
          applicable.
        </p>
      </section>

      <AdSenseBanner />
    </main>
  );
}
