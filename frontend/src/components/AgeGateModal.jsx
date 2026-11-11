import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AgeGateModal.css';

const CURRENT_YEAR = new Date().getFullYear();
const MIN_ADULT_YEAR = CURRENT_YEAR - 18;
const MIN_SELECTABLE_YEAR = CURRENT_YEAR - 100;

export default function AgeGateModal({ onVerified }) {
  const [birthYear, setBirthYear] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [isUnderage, setIsUnderage] = useState(false);

  const years = [];
  for (let y = CURRENT_YEAR - 5; y >= MIN_SELECTABLE_YEAR; y--) {
    years.push(y);
  }

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');

    if (!birthYear) {
      setError('Please select your birth year.');
      return;
    }

    const yearNum = parseInt(birthYear, 10);
    if (yearNum > MIN_ADULT_YEAR) {
      setIsUnderage(true);
      try {
        sessionStorage.setItem('gt-age-gate-status', 'denied');
      } catch {
        // Storage fallback
      }
      return;
    }

    if (!agreedToTerms) {
      setError('You must confirm your declaration of age of majority and agreement to terms.');
      return;
    }

    try {
      sessionStorage.setItem('gt-age-gate-status', 'verified');
    } catch {
      // Storage fallback
    }

    if (typeof onVerified === 'function') {
      onVerified();
    }
  };

  const handleUnderageRefusal = () => {
    setIsUnderage(true);
    try {
      sessionStorage.setItem('gt-age-gate-status', 'denied');
    } catch {
      // Storage fallback
    }
  };

  if (isUnderage) {
    return (
      <div
        className="age-gate-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-block-title"
      >
        <div className="age-gate-card age-gate-blocked">
          <div className="age-gate-icon">🛑</div>
          <h2 id="age-block-title">Access Restricted (Under 18)</h2>
          <p className="age-gate-desc">
            GlobalTalk provides unmoderated electronic chat rooms and random one-to-one video calls.
            In accordance with{' '}
            <strong>Section 9 of the Digital Personal Data Protection Act, 2023</strong> and child
            protection provisions under the <strong>POCSO Act, 2012</strong>, access for individuals
            under the age of majority (18 years) is strictly prohibited.
          </p>
          <div className="child-helpline-box">
            <span>Child Protection Helpline (India):</span>
            <b>National Childline: Dial 1098</b>
          </div>
          <div className="age-gate-actions">
            <Link to="/" className="button primary age-gate-home-btn">
              ← Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="age-gate-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="age-gate-card">
        <div className="age-gate-badge">
          <span>🛡️ Statutory Age Assurance</span>
        </div>
        <h2 id="age-gate-title">Age &amp; Safety Verification</h2>
        <p className="age-gate-desc">
          To comply with child protection regulations (DPDP Act 2023 &amp; IT Rules 2021),
          GlobalTalk requires all participants in chat rooms and video streams to have reached the
          age of majority (18+ in India).
        </p>

        <form onSubmit={handleVerify} className="age-gate-form">
          {error && (
            <div className="age-gate-error" role="alert">
              {error}
            </div>
          )}

          <label className="age-gate-label">
            Year of Birth
            <select
              value={birthYear}
              onChange={(e) => {
                setBirthYear(e.target.value);
                setError('');
              }}
              className="age-gate-select"
            >
              <option value="">Select your birth year...</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y} {y <= MIN_ADULT_YEAR ? '(18+ Eligible)' : '(Under 18)'}
                </option>
              ))}
            </select>
          </label>

          <label className="age-gate-checkbox-label">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="age-gate-checkbox"
            />
            <span>
              I confirm that I am at least 18 years old, and I agree to the{' '}
              <Link to="/terms" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </Link>
              ,{' '}
              <Link to="/guidelines" target="_blank" rel="noopener noreferrer">
                Community Guidelines
              </Link>
              , and{' '}
              <Link to="/safety" target="_blank" rel="noopener noreferrer">
                Safety Rules
              </Link>
              .
            </span>
          </label>

          <div className="age-gate-actions">
            <button type="submit" className="button primary age-gate-submit-btn">
              Confirm &amp; Enter
            </button>
            <button
              type="button"
              onClick={handleUnderageRefusal}
              className="button secondary age-gate-underage-btn"
            >
              I am under 18
            </button>
          </div>
        </form>

        <p className="age-gate-privacy-note">
          🔒 <strong>Privacy Assurance:</strong> Your birth year is evaluated purely inside your
          browser memory for this session and is never uploaded, stored in a database, or shared.
        </p>
      </div>
    </div>
  );
}
