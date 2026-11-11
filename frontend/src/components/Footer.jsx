import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer>
      <Link to="/" className="brand">
        <span className="brand-mark">G</span>GlobalTalk
      </Link>
      <span className="footer-tagline">
        College Engineering Project · Built for Fun &amp; Learning
      </span>
      <nav className="footer-links" aria-label="Footer">
        <Link to="/about">About</Link>
        <Link to="/safety">Safety</Link>
        <Link to="/guidelines">Community Guidelines</Link>
        <Link to="/contact">Support</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
      </nav>
      <span className="footer-copyright">© {new Date().getFullYear()} GlobalTalk</span>
    </footer>
  );
}
