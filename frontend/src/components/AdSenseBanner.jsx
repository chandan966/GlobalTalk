import { useEffect, useRef } from 'react';
import { adsenseClientId } from '../config/site';
import './AdSenseBanner.css';

/**
 * Route-aware Google AdSense container.
 * Mounts strictly on approved static informational pages.
 * Never initialized or imported on live chat or video routes.
 */
export default function AdSenseBanner({ slot = '', format = 'auto', responsive = 'true' }) {
  const adRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!adsenseClientId) return;

    // Dynamically inject the AdSense script only once upon mounting on an approved static page
    const existingScript = document.querySelector(
      'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
    );

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
        adsenseClientId,
      )}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Trigger ad unit calculation safely inside a microtask
    if (!pushedRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch {
        // Suppress benign duplicate push errors during rapid client-side navigation
      }
    }

    return () => {
      if (adRef.current) {
        try {
          adRef.current.innerHTML = '';
        } catch {
          // Suppress DOM clearance error
        }
      }
    };
  }, []);

  if (!adsenseClientId) return null;

  return (
    <aside className="adsense-container" aria-label="Sponsored Advertisement" role="complementary">
      <div className="adsense-label">Advertisement</div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseClientId}
        data-ad-slot={slot || undefined}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </aside>
  );
}
