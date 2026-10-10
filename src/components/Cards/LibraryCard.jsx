import React, { memo } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import { getArtworkFallback } from '../../utils/imageFallback';
import './LibraryCard.css';

export const LibraryCard = memo(function LibraryCard({ item }) {
  const { playSong } = usePlayer();
  const navigate = useNavigate();

  const isAlbum = item?.type === 'album' || (typeof item?.id === 'string' && item.id.startsWith('MPREb_'));
  const targetRoute = isAlbum
    ? `/album/${item.id}?name=${encodeURIComponent(item.title || '')}`
    : `/playlist/${item.id}?name=${encodeURIComponent(item.title || '')}`;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (item.songs && item.songs.length > 0) {
      playSong(item.songs[0], item.songs);
    } else {
      navigate(targetRoute);
    }
  };

  const handleCardClick = () => {
    navigate(targetRoute);
  };

  return (
    <div className="fs-lib-card" onClick={handleCardClick}>
      <div className="fs-lib-art-wrap">
        <img
          src={item.thumbnail || item.coverImage || (item.songs && item.songs[0]?.thumbnail) || ''}
          alt={item.title}
          className="fs-lib-artwork"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getArtworkFallback(item.title);
          }}
        />
        <button
          className="fs-lib-play-btn"
          onClick={handlePlayClick}
          aria-label={`Play ${item.title}`}
        >
          <Play size={20} fill="#000000" />
        </button>
      </div>

      <div className="fs-lib-meta">
        <h4 className="fs-lib-title truncate" title={item.title}>
          {item.title}
        </h4>
        <p className="fs-lib-subtitle truncate">
          {item.subtitle}
        </p>
      </div>
    </div>
  );

});
