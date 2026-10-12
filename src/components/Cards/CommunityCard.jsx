import React, { memo } from 'react';
import { Play, Pause, Loader2, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import { useContextMenu } from '../../context/ContextMenuContext';
import { getArtworkFallback, isGrayPlaceholder, buildThumbFallbacks, advanceThumb } from '../../utils/imageFallback';
import './CommunityCard.css';

function CommunityCardBase({ item, queueContext = null }) {
  const { currentSong, isPlaying, isLoading, playSong, togglePlay } = usePlayer();
  const { openMenu, openPlaylistMenu } = useContextMenu();
  const navigate = useNavigate();

  const targetSong = item.videoId
    ? item
    : item.songs && item.songs[0]
    ? item.songs[0]
    : null;

  const isCurrent = Boolean(targetSong?.videoId && currentSong?.videoId === targetSong.videoId);
  const isAlbum = item.type === 'album' || Boolean(item.albumId);
  const effectiveQueue = (queueContext && queueContext.length > 0) ? queueContext : [item];

  const thumbPrimary = item.thumbnail || item.coverImage || (item.songs && item.songs[0]?.thumbnail) || '';
  const thumbCandidates = buildThumbFallbacks(thumbPrimary, item.videoId);
  const handleThumbFail = (img) => advanceThumb(img, thumbCandidates, getArtworkFallback(item.title));

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
      return;
    }
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
      className={`fs-comm-card ${isCurrent ? 'active' : ''}`}
      onClick={handleCardClick}
      onContextMenu={handleContextMenu}
    >
      {/* Artwork container */}
      <div className="fs-comm-art-wrap">
        <img
          src={thumbPrimary || (item.videoId ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : getArtworkFallback(item.title))}
          alt={item.title}
          className="fs-comm-artwork"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => handleThumbFail(e.currentTarget)}
          onLoad={(e) => {
            if (isGrayPlaceholder(e.currentTarget)) handleThumbFail(e.currentTarget);
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

        {/* Hover / Active play button */}
        <button
          className={`fs-comm-play-btn ${isCurrent ? 'active' : ''}`}
          onClick={handlePlayClick}
          aria-label={isCurrent && isPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
        >
          {isCurrent && isLoading ? (
            <Loader2 size={20} className="spin" color="#000000" />
          ) : isCurrent && isPlaying ? (
            <Pause size={20} fill="#000000" />
          ) : (
            <Play size={20} fill="#000000" />
          )}
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
