import React, { memo } from 'react';
import { Play, Disc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import { getArtworkFallback } from '../../utils/imageFallback';
import './AlbumCard.css';

export const AlbumCard = memo(function AlbumCard({ album }) {
  const { playSong } = usePlayer();
  const navigate = useNavigate();

  if (!album) return null;

  const albumId = album.id || album.albumId;
  const title = album.title || album.name || 'Untitled Album';
  const subtitle = [album.artist, album.year, 'Album'].filter(Boolean).join(' • ');

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (album.songs && album.songs.length > 0) {
      playSong(album.songs[0], album.songs);
    } else {
      navigate(`/album/${albumId}?name=${encodeURIComponent(title)}`);
    }
  };

  const handleCardClick = () => {
    navigate(`/album/${albumId}?name=${encodeURIComponent(title)}`);
  };

  return (
    <div className="fs-album-card" onClick={handleCardClick} role="button" tabIndex={0}>
      <div className="fs-album-card-art-wrap">
        <img
          src={album.thumbnail || ''}
          alt={title}
          className="fs-album-card-artwork"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getArtworkFallback(title);
          }}
        />

        <div className="fs-album-card-badge" title="Album">
          <Disc size={13} className="fs-album-disc-icon" />
          <span>ALBUM</span>
        </div>

        <button
          className="fs-album-card-play-btn"
          onClick={handlePlayClick}
          aria-label={`Play album ${title}`}
        >
          <Play size={20} fill="#000000" />
        </button>
      </div>

      <div className="fs-album-card-meta">
        <h4 className="fs-album-card-title truncate" title={title}>
          {title}
        </h4>
        <p className="fs-album-card-subtitle truncate">
          {subtitle}
        </p>
      </div>
    </div>
  );

});
