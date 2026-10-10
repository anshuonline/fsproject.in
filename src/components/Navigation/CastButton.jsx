import React, { useEffect, useState } from 'react';
import { Cast as CastIcon } from 'lucide-react';
import './CastButton.css';

// Official cast icon + Google Cast device picker (same dialog Chrome shows).
// The SDK's <google-cast-launcher> polymer element is unreliable inside
// React-managed buttons, so we render the icon ourselves and open the
// framework's native device picker via requestSession().
export function CastButton() {
  const [available, setAvailable] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    // Google Cast sender is unsupported on iOS WebKit (both Safari & Chrome) —
    // hide the button there instead of showing a picker that finds no devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) return undefined;

    const checkReady = () => {
      if (window.cast?.framework && window.chrome?.cast) setAvailable(true);
    };
    const onCastState = (e) => setConnected(Boolean(e.detail?.connected));

    checkReady();
    window.addEventListener('fs_cast_ready', checkReady);
    window.addEventListener('fs_cast_state', onCastState);
    return () => {
      window.removeEventListener('fs_cast_ready', checkReady);
      window.removeEventListener('fs_cast_state', onCastState);
    };
  }, []);

  if (!available) return null;

  const handleClick = () => {
    try {
      cast.framework.CastContext.getInstance().requestSession();
    } catch (e) {
      console.warn('Cast picker failed:', e);
    }
  };

  return (
    <button
      type="button"
      className={`fs-cast-btn ${connected ? 'connected' : ''}`}
      onClick={handleClick}
      title={connected ? 'Casting — manage session' : 'Cast to TV / speaker'}
      aria-label="Cast to TV or speaker"
    >
      <CastIcon size={22} strokeWidth={1.8} />
    </button>
  );
}
