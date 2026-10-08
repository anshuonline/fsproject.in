import React from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import './LibraryCard.css';

export function LibraryCard({ item }) {
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
    <div className="fs-lib-card" onClick={handleCardClick}>
      <div className="fs-lib-art-wrap">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="fs-lib-artwork"
          loading="lazy"
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
}
