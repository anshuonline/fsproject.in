import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Split a multi-artist string into individual artist names.
 * "Arijit Singh, Pritam & Shreya Ghoshal" → ['Arijit Singh', 'Pritam', 'Shreya Ghoshal']
 */
export function splitArtists(artist) {
  return String(artist || '')
    .split(/\s*(?:,|&|\bft\.|\bfeat\.)\s*/i)
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Renders a multi-artist string with EACH artist individually clickable —
 * separators stay as plain text so the display matches the original string.
 *
 * Click contract: when `onArtistClick(name, e)` is provided it OWNS the event
 * (stopPropagation included); when omitted the default is stopPropagation +
 * navigate to /search?q={name}.
 */
export function ArtistLinks({ artist, className = '', onArtistClick }) {
  const navigate = useNavigate();

  const go = (name, e) => {
    if (onArtistClick) {
      onArtistClick(name, e);
      return;
    }
    e.stopPropagation();
    navigate(`/search?q=${encodeURIComponent(name)}`);
  };

  const raw = String(artist || '').trim();
  if (!raw) return null;

  // Split keeping separators so the display matches the original string
  const parts = raw.split(/(,|&|\bft\.|\bfeat\.)/i);

  if (parts.length <= 1) {
    // Single artist — one clickable span, no separator
    return (
      <span
        className={`fs-artist-link ${className}`}
        role="link"
        tabIndex={0}
        onClick={(e) => go(raw, e)}
        onKeyDown={(e) => { if (e.key === 'Enter') go(raw, e); }}
        title={`Go to ${raw}`}
      >
        {raw}
      </span>
    );
  }

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const isSep = i % 2 === 1;
        if (isSep) {
          return <span key={`sep-${i}`} className="fs-artist-sep">{`${part.trim()} `}</span>;
        }
        const name = part.trim();
        if (!name) return null;
        return (
          <span
            key={`${name}-${i}`}
            className="fs-artist-link"
            role="link"
            tabIndex={0}
            onClick={(e) => go(name, e)}
            onKeyDown={(e) => { if (e.key === 'Enter') go(name, e); }}
            title={`Go to ${name}`}
          >
            {name}
          </span>
        );
      })}
    </span>
  );
}
