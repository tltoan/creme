import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';
import './intro.css';
import introAnimation from '../mise-handwritten.gif';

function Entry() {
  const [loading, setLoading] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const playbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!loading) {
      document.body.style.removeProperty('background');
      return;
    }
    // Never leave visitors stuck if an image fails or a load event is missed.
    const fallback = setTimeout(() => setLoading(false), 10000);
    const skip = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLoading(false);
    };
    document.addEventListener('keydown', skip);
    return () => {
      clearTimeout(fallback);
      clearTimeout(playbackTimer.current);
      document.removeEventListener('keydown', skip);
    };
  }, [loading]);

  return <>
    {loading && <div className="intro-screen" role="status" aria-label="Loading CREME">
      <img src={introAnimation} alt="Mise" width={542} height={264}
        onLoad={() => {
          clearTimeout(playbackTimer.current);
          playbackTimer.current = setTimeout(() => setLoading(false), 3670);
        }}
        onError={() => setLoading(false)} />
    </div>}
    <div hidden={loading}><App/></div>
  </>;
}

createRoot(document.getElementById('root')!).render(<Entry/>);
