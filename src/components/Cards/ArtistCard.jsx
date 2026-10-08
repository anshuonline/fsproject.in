import React from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getArtistAvatarFallback } from '../../utils/imageFallback';
import './ArtistCard.css';

export function ArtistCard({ artist }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/search?q=${encodeURIComponent(artist.name)}`);
  };

  return (
    <div className="fs-artist-card" onClick={handleClick}>
      <div className="fs-artist-avatar-wrap">
        <img
          src={artist.image}
          alt={artist.name}
          className="fs-artist-avatar-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getArtistAvatarFallback(artist.name);
          }}
        />
        <button
          className="fs-artist-play-btn"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/search?q=${encodeURIComponent(artist.name)}`);
          }}
          aria-label={`Play songs by ${artist.name}`}
        >
          <Play size={18} fill="#000000" />
        </button>
      </div>

      <div className="fs-artist-meta">
        <h4 className="fs-artist-name truncate" title={artist.name}>
          {artist.name}
        </h4>
        <p className="fs-artist-category truncate">
          Artist • {artist.genre || artist.category}
        </p>
      </div>
    </div>
  );
}
