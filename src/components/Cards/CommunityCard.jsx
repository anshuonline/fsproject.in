import React, { memo } from 'react';
import { Play, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import { useContextMenu } from '../../context/ContextMenuContext';
import { getArtworkFallback } from '../../utils/imageFallback';
import './CommunityCard.css';

function CommunityCardBase({ item, queueContext = null }) {
  const { playSong } = usePlayer();
  const { openMenu, openPlaylistMenu } = useContextMenu();
  const navigate = useNavigate();

  const targetSong = item.videoId
    ? item
    : item.songs && item.songs[0]
    ? item.songs[0]
    : null;

  const isAlbum = item.type === 'album' || Boolean(item.albumId);
  const effectiveQueue = (queueContext && queueContext.length > 0) ? queueContext : [item];

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (item.videoId) {
      playSong(item, effectiveQueue);
    } else if (item.songs && item.songs.length > 0) {
      playSong(item.songs[0], item.songs);
    } else if (isAlbum) {
      navigate(`/album/${item.albumId || item.id}?name=${encodeURIComponent(item.title)}`);
    } else {
      navigate(`/playlist/${item.id}?name=${encodeURIComponent(item.title)}`);
    }
  };

  const handleCardClick = () => {
    if (item.videoId) {
      playSong(item, effectiveQueue);
    } else if (item.songs && item.songs.length > 0) {
      // Custom mixes (Made for you): play the embedded mix instantly
      playSong(item.songs[0], item.songs);
    } else if (isAlbum) {
      navigate(`/album/${item.albumId || item.id}?name=${encodeURIComponent(item.title)}`);
    } else {
      navigate(`/playlist/${item.id}?name=${encodeURIComponent(item.title)}`);
    }
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    if (item.videoId || item.type === 'song') {
      if (targetSong) openMenu(targetSong, e);
    } else if (!isAlbum) {
      openPlaylistMenu(item, e);
    } else if (targetSong) {
      openMenu(targetSong, e);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.videoId || item.type === 'song') {
      if (targetSong) openMenu(targetSong, e);
    } else if (!isAlbum) {
      openPlaylistMenu(item, e);
    } else if (targetSong) {
      openMenu(targetSong, e);
    }
  };

  return (
    <div
      className="fs-comm-card"
      onClick={handleCardClick}
      onContextMenu={handleContextMenu}
    >
      {/* Artwork container */}
      <div className="fs-comm-art-wrap">
        <img
          src={item.thumbnail || item.coverImage || (item.songs && item.songs[0]?.thumbnail) || (item.videoId ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : '')}
          alt={item.title}
          className="fs-comm-artwork"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const currentSrc = e.currentTarget.src || '';
            if (item.videoId && !currentSrc.includes('i.ytimg.com')) {
              e.currentTarget.src = `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`;
            } else {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getArtworkFallback(item.title);
            }
          }}
        />

        {/* Creator avatar badge on bottom-left */}
        <div className="fs-comm-avatar-badge" title={item.creator || item.artist}>
          <span>{item.badge || (item.creator ? item.creator[0] : item.artist ? item.artist[0] : 'F').toUpperCase()}</span>
        </div>

        {/* More options button on top-right */}
        {targetSong && (
          <button
            className="fs-comm-more-btn"
            onClick={handleMoreClick}
            aria-label="Options"
            title="Options"
          >
            <MoreVertical size={16} />
          </button>
        )}

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
          {item.creator || item.artist} • {item.views || item.durationText || 'FreeSong'}
        </p>
      </div>
    </div>
  );
}

export const CommunityCard = memo(CommunityCardBase);
