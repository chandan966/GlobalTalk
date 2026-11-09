import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-mark">G</span>GlobalTalk
      </Link>
      <nav>
        <Link to="/">Rooms</Link>
        <Link to="/about">About</Link>
        <Link to="/safety">Safety</Link>
      </nav>
      <span className="live-label">
        <i /> LIVE CHAT
      </span>
    </header>
  );
}
