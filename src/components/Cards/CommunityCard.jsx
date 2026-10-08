import React from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import './CommunityCard.css';

export function CommunityCard({ item }) {
  const { playSong } = usePlayer();
  const navigate = useNavigate();

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (item.songs && item.songs.length > 0) {
      playSong(item.songs[0], item.songs);
    } else {
      navigate(`/playlist/${item.id}?name=${encodeURIComponent(item.title)}`);
    }
  };

  const handleCardClick = () => {
    navigate(`/playlist/${item.id}?name=${encodeURIComponent(item.title)}`);
  };

  return (
    <div className="fs-comm-card" onClick={handleCardClick}>
      {/* Artwork container */}
      <div className="fs-comm-art-wrap">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="fs-comm-artwork"
          loading="lazy"
        />

        {/* Creator avatar badge on bottom-left */}
        <div className="fs-comm-avatar-badge" title={item.creator}>
          <span>{item.badge || (item.creator ? item.creator[0].toUpperCase() : 'C')}</span>
        </div>

        {/* Hover play button */}
        <button
          className="fs-comm-play-btn"
          onClick={handlePlayClick}
          aria-label={`Play ${item.title}`}
        >
          <Play size={20} fill="#000000" />
        </button>
      </div>

      {/* Meta text */}
      <div className="fs-comm-meta">
        <h4 className="fs-comm-title truncate" title={item.title}>
          {item.title}
        </h4>
        <p className="fs-comm-subtitle truncate">
          {item.creator} • {item.views}
        </p>
      </div>
    </div>
  );
}
