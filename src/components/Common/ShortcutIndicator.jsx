import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Volume1, VolumeX } from 'lucide-react';
import './ShortcutIndicator.css';

const AUTO_HIDE_MS = 1200;
const VOLUME_LOW = 0.35;

// Centered fade-in/out overlay shown when a keyboard shortcut fires
// (YouTube-style "Space = Paused", with a live volume bar for volume keys)
export function ShortcutIndicator() {
  const [data, setData] = useState(null);
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    const show = (e) => {
      const detail = e.detail || {};
      if (!detail.kind) return;
      setData(detail);
      setVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setVisible(false), AUTO_HIDE_MS);
    };

    window.addEventListener('fs_shortcut_action', show);
    return () => {
      window.removeEventListener('fs_shortcut_action', show);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!data) return null;

  const volumePct = Math.round((data.value || 0) * 100);
  const meta = {
    play: { Icon: Play, label: 'Playing', filled: true },
    pause: { Icon: Pause, label: 'Paused', filled: true },
    next: { Icon: SkipForward, label: 'Next Song' },
    prev: { Icon: SkipBack, label: 'Previous Song' },
    volume: {
      Icon: data.value === 0 ? VolumeX : data.value <= VOLUME_LOW ? Volume1 : Volume2,
      label: data.value === 0 ? 'Muted' : `Volume ${volumePct}%`
    }
  }[data.kind];

  if (!meta) return null;

  return (
    <div className={`fs-shortcut-indicator ${visible ? 'visible' : ''}`} aria-hidden="true">
      <div className="fs-shortcut-indicator-card">
        <span className={`fs-shortcut-indicator-icon ${meta.filled ? 'filled' : ''}`}>
          <meta.Icon size={22} />
        </span>
        <div className="fs-shortcut-indicator-body">
          <span className="fs-shortcut-indicator-label">{meta.label}</span>
          {data.kind === 'volume' && (
            <div className="fs-shortcut-indicator-bar">
              <div className="fs-shortcut-indicator-bar-fill" style={{ width: `${volumePct}%` }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShortcutIndicator;
