import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer>
      <Link to="/" className="brand">
        <span className="brand-mark">G</span>GlobalTalk
      </Link>
      <span>Open conversations. Respectful connections.</span>
      <span>© {new Date().getFullYear()} GlobalTalk</span>
    </footer>
  );
}
