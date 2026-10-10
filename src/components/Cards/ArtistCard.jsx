import React, { memo } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getArtistAvatarFallback } from '../../utils/imageFallback';
import './ArtistCard.css';

function ArtistCardBase({ artist }) {
  const navigate = useNavigate();

  if (!artist) return null;

  const handleClick = () => {
    if (artist.id) {
      navigate(`/artist/${artist.id}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(artist.name)}`);
    }
  };

  const avatarSrc = artist.thumbnail || artist.image || artist.thumbnails?.[0]?.url;

  return (
    <div className="fs-artist-card" onClick={handleClick}>
      <div className="fs-artist-avatar-wrap">
        <img
          src={avatarSrc}
          alt={artist.name}
          className="fs-artist-avatar-img"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getArtistAvatarFallback(artist.name);
          }}
        />
        <button
          className="fs-artist-play-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          aria-label={`Open profile of ${artist.name}`}
        >
          <Play size={18} fill="#000000" />
        </button>
      </div>

      <div className="fs-artist-meta">
        <h4 className="fs-artist-name truncate" title={artist.name}>
          {artist.name}
        </h4>
        <p className="fs-artist-category truncate">
          {artist.subscribers ? `${artist.subscribers} • ` : ''}Artist
        </p>
      </div>
    </div>
  );
}

export const ArtistCard = memo(ArtistCardBase);
