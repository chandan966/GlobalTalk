import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import ContactPage from './pages/ContactPage.jsx';
import HomePage from './pages/HomePage.jsx';
import InfoPage from './pages/InfoPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RoomPage from './pages/RoomPage.jsx';
import SafetyPage from './pages/SafetyPage.jsx';
import VideoChatPage from './pages/VideoChatPage.jsx';
import './App.css';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const isChatOrVideo =
      location.pathname.startsWith('/room/') || location.pathname === '/random-video';

    if (isChatOrVideo) {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        try {
          window.adsbygoogle.pauseAdRequests = 1;
        } catch {
          // Suppress benign runtime error if adsbygoogle is not yet initialized
        }
      }
      try {
        document.querySelectorAll('.google-auto-placed').forEach((el) => el.remove());
      } catch {
        // Suppress DOM query error
      }
    } else {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        try {
          window.adsbygoogle.pauseAdRequests = 0;
        } catch {
          // Suppress benign runtime error
        }
      }
    }
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<InfoPage page="about" />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/random-video" element={<VideoChatPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/privacy" element={<InfoPage page="privacy" />} />
        <Route path="/terms" element={<InfoPage page="terms" />} />
        <Route path="/guidelines" element={<InfoPage page="guidelines" />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  );
}
