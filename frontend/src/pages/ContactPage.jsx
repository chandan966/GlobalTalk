import { useState } from 'react';
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

// Toggle flag: Statutory Grievance Redressal enabled under Rule 3(2) of IT Rules, 2021
const ENABLE_STATUTORY_GRIEVANCE = true;

const GRIEVANCE_CATEGORIES = [
  'Rule 3(1)(b) Prohibited Content / Hate Speech / Defamation',
  'Rule 3(2)(b) Non-Consensual Intimate Imagery / Deepfakes',
  'Rule 3(1)(b) Child Sexual Abuse Material (CSAM)',
  'Intellectual Property / Copyright Infringement',
  'Impersonation / Synthetic Audio-Video Deception',
  'Privacy Violation / Personal Data Breach',
  'Court Order / Law Enforcement Directive',
  'Other Statutory Grievance',
];

export default function ContactPage() {
  usePageMetadata(
    'Contact & Grievance Redressal',
    'Contact GlobalTalk for general questions, abuse reports, privacy requests, and statutory grievance redressal under Indian IT Rules.',
    '/contact',
  );

  const [ticketCategory, setTicketCategory] = useState(GRIEVANCE_CATEGORIES[0]);
  const [ticketRoom, setTicketRoom] = useState('global');
  const [ticketDescription, setTicketDescription] = useState('');
  const [generatedTicket, setGeneratedTicket] = useState('');

  const handleCreateTicket = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const ticket = `GT-GRIEV-${dateStr}-${rand}`;
    setGeneratedTicket(ticket);
  };

  const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const emailSubject = generatedTicket
    ? `[TICKET: ${generatedTicket}] Statutory Grievance: ${ticketCategory}`
    : `Statutory Grievance Notice under IT Rules — GlobalTalk`;
  const emailBody = `Grievance Tracking Ticket: ${generatedTicket || '[Click Generate Ticket first]'}\nCategory: ${ticketCategory}\nRoom/Feature: ${ticketRoom}\nTimestamp (IST): ${istTime}\n\nDetailed Description of Incident / Content:\n${ticketDescription || '[Please describe the content, message ID, or violating conduct in detail]'}\n\nStatutory Declaration:\nI declare that the information provided in this grievance is true and correct to the best of my knowledge and belief.`;

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

      {/* Bottom General Email address line (Temporarily disabled - email is prominently featured in top action card) */}
      {/*
      {contactEmail ? (
        <p className="contact-address">
          General Email: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </p>
      ) : null}
      */}

      {/* Statutory Grievance Redressal Mechanism (Temporarily disabled by configuration flag) */}
      {ENABLE_STATUTORY_GRIEVANCE && (
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

          {!grievanceOfficer.hasPhysicalAddress && (
            <div className="prelaunch-warning-notice" role="note">
              <strong>Notice on Physical Office Address:</strong> Under Rule 3(2) of the Information
              Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, an
              intermediary must publish the verifiable physical office address of its designated
              Resident Grievance Officer in India. Currently,{' '}
              <code>VITE_GRIEVANCE_OFFICER_ADDRESS</code> is pending configuration by the platform
              owner in production settings.
            </div>
          )}

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
                <strong>Unlawful Content Removal (Rule 3(1)(b)):</strong> Reviewed and access
                disabled within <strong>36 hours</strong> upon valid notice.
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

          {/* Interactive Grievance Complaint & Tracking Ticket Generator */}
          <div className="grievance-ticket-box">
            <h3>File a Formal Grievance with Tracking Ticket</h3>
            <p className="grievance-ticket-subtitle">
              Select the statutory category, room name, and describe the issue to generate a unique
              tracking ticket ID and pre-fill your formal statutory grievance notice.
            </p>
            <div className="grievance-form-grid">
              <label>
                Statutory Violation Category
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="grievance-select"
                >
                  {GRIEVANCE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Room or Feature Concerned
                <input
                  type="text"
                  value={ticketRoom}
                  onChange={(e) => setTicketRoom(e.target.value)}
                  placeholder="e.g. global, india, random-video"
                  className="grievance-input"
                />
              </label>
              <label className="full-width">
                Description &amp; Specific Incident Details
                <textarea
                  rows={3}
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Describe the violating message, temporary nickname, date/time, and attach government order if applicable..."
                  className="grievance-textarea"
                />
              </label>
            </div>
            <div className="grievance-ticket-actions">
              {!generatedTicket ? (
                <button type="button" className="button primary" onClick={handleCreateTicket}>
                  🎟️ Generate Official Tracking Ticket ID
                </button>
              ) : (
                <div className="generated-ticket-display">
                  <div>
                    <span className="ticket-label">Your Generated Complaint Ticket:</span>
                    <strong className="ticket-code">{generatedTicket}</strong>
                  </div>
                  <a
                    href={`mailto:${grievanceOfficer.email || contactEmail}?subject=${encodeURIComponent(
                      emailSubject,
                    )}&body=${encodeURIComponent(emailBody)}`}
                    className="button primary email-ticket-btn"
                  >
                    ✉️ Open Email with Pre-filled Grievance Notice
                  </a>
                </div>
              )}
            </div>
          </div>

          <p className="grievance-safe-harbor-note">
            <em>
              Statutory Safe Harbor Advisory: Intermediary status under Section 79 of the
              Information Technology Act, 2000 is conditional on strict observance of statutory due
              diligence under the IT Rules, 2021 (as amended 2026) and does not represent an
              unconditional or judicial guarantee of immunity.
            </em>
          </p>
        </section>
      )}

      <AdSenseBanner />
    </main>
  );
}
