import React from 'react';
import { Play, Pause, Heart, Plus, MoreVertical } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { useContextMenu } from '../../context/ContextMenuContext';
import { getArtworkFallback } from '../../utils/imageFallback';
import './SongCard.css';

export function SongCard({ song, queueContext = [] }) {
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue } = usePlayer();
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
      className={`fs-song-row ${isCurrent ? 'active' : ''}`}
      onClick={handlePlay}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openMenu(song, e);
      }}
    >
      <div className="fs-song-thumb-wrap">
        <img
          src={song.thumbnail || (song.videoId ? `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg` : '/images/freesonglogowebp.webp')}
          alt={song.title}
          className="fs-song-thumb"
          loading="lazy"
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
        <div className={`fs-song-play-icon ${isCurrent ? 'show' : ''}`}>
          {isCurrent && isPlaying ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
        </div>
      </div>

      <div className="fs-song-info">
        <span className="fs-song-title truncate">{song.title}</span>
        <span className="fs-song-artist truncate">{song.artist}</span>
      </div>

      <div className="fs-song-duration">
        <span>{song.durationText || ''}</span>
      </div>

      <div className="fs-song-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className={`btn-icon fs-song-btn ${liked ? 'liked' : ''}`}
          onClick={() => toggleLike(song)}
          title={liked ? 'Unlike' : 'Like'}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
        </button>

        <button
          className="btn-icon fs-song-btn"
          onClick={() => addToQueue(song)}
          title="Add to queue"
          aria-label="Add to queue"
        >
          <Plus size={18} />
        </button>

        <button
          className="btn-icon fs-song-btn"
          onClick={(e) => openMenu(song, e)}
          title="More actions"
          aria-label="More actions"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}
