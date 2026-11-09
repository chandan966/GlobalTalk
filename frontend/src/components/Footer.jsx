import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer>
      <Link to="/" className="brand">
        <span className="brand-mark">G</span>GlobalTalk
      </Link>
      <span className="footer-tagline">Open conversations. Respectful connections.</span>
      <nav className="footer-links" aria-label="Footer">
        <Link to="/about">About</Link>
        <Link to="/safety">Safety</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/guidelines">Guidelines</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      <span className="footer-copyright">© {new Date().getFullYear()} GlobalTalk</span>
    </footer>
  );
}
