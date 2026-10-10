import React, { memo } from 'react';
import { Play, Pause, Heart, MoreVertical } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { useContextMenu } from '../../context/ContextMenuContext';
import { getArtworkFallback } from '../../utils/imageFallback';
import './SongTileCard.css';

function SongTileCardBase({ song, queueContext = [], rank = null }) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isLiked, toggleLike } = useLibrary();
  const { openMenu } = useContextMenu();

  if (!song) return null;

  const isCurrent = currentSong?.videoId === song.videoId;
  const liked = isLiked(song.videoId);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, queueContext.length > 0 ? queueContext : [song]);
    }
  };

  return (
    <div
      className={`fs-song-tile ${isCurrent ? 'active' : ''}`}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openMenu(song, e);
      }}
    >
      {/* Square artwork with hover play & optional chart rank */}
      <div className="fs-song-tile-art" onClick={handlePlay}>
        <img
          src={song.thumbnail || (song.videoId ? `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg` : '/images/freesonglogowebp.webp')}
          alt={song.title}
          className="fs-song-tile-img"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const currentSrc = e.currentTarget.src || '';
            if (song.videoId && !currentSrc.includes('i.ytimg.com')) {
              e.currentTarget.src = `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`;
            } else {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getArtworkFallback(song.title);
            }
          }}
        />
        {rank !== null && <span className="fs-song-tile-rank">#{rank}</span>}
        <span className={`fs-song-tile-play ${isCurrent ? 'show' : ''}`}>
          {isCurrent && isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
        </span>
      </div>

      {/* Title, artist & quick actions */}
      <div className="fs-song-tile-meta">
        <div className="fs-song-tile-text">
          <span className={`fs-song-tile-title truncate ${isCurrent ? 'text-brand' : ''}`} title={song.title}>
            {song.title}
          </span>
          <span className="fs-song-tile-artist truncate" title={song.artist}>
            {song.artist}
          </span>
        </div>
        <div className="fs-song-tile-actions">
          <button
            className={`fs-song-tile-btn ${liked ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(song);
            }}
            title={liked ? 'Unlike' : 'Like'}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button
            className="fs-song-tile-btn"
            onClick={(e) => openMenu(song, e)}
            title="More actions"
            aria-label="More actions"
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export const SongTileCard = memo(SongTileCardBase);
