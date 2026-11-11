import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <>
      <div className="top-notice-bar" role="banner">
        <span>
          🎓 <strong>College Project Notice:</strong> Built for fun &amp; educational learning.
          Please treat conversations with kindness!
        </span>
      </div>
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">G</span>GlobalTalk
        </Link>
        <nav>
          <Link to="/">Rooms</Link>
          <Link to="/random-video">Video</Link>
          <Link to="/about">About</Link>
          <Link to="/safety">Safety</Link>
        </nav>
        <span className="live-label">
          <i /> LIVE CHAT
        </span>
      </header>
    </>
  );
}
