import React from 'react';
import { Play, Pause, Heart, Plus, MoreVertical } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { getArtworkFallback } from '../../utils/imageFallback';
import './SongCard.css';

export function SongCard({ song, queueContext = [] }) {
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue } = usePlayer();
  const { isLiked, toggleLike } = useLibrary();

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
    >
      <div className="fs-song-thumb-wrap">
        <img
          src={song.thumbnail || '/images/freesonglogowebp.webp'}
          alt={song.title}
          className="fs-song-thumb"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getArtworkFallback(song.title);
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
      </div>
    </div>
  );
}
