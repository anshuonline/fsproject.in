import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, MoreVertical, Trash2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { useContextMenu } from '../../context/ContextMenuContext';
import { getArtworkFallback } from '../../utils/imageFallback';
import './SongCard.css';

export function SongCard({
  song,
  queueContext = [],
  index = null,
  playlistId = null,
  isUserPlaylist = false,
  isHistory = false
}) {
  const { currentSong, isPlaying, playSong, togglePlay, setIsFullScreen } = usePlayer();
  const { isLiked, toggleLike, removeSongFromPlaylist, removeFromHistory } = useLibrary();
  const { openMenu, showToast } = useContextMenu();
  const navigate = useNavigate();

  if (!song) return null;

  const isCurrent = currentSong?.videoId === song.videoId;
  const liked = isLiked(song.videoId);

  const handleArtistClick = (e) => {
    // On touch devices or mobile viewports, tapping the song row plays the song.
    // Prevent accidental artist navigation when tapping with fingers/thumbs.
    const isTouchOrMobile =
      (typeof window !== 'undefined' && window.innerWidth <= 768) ||
      e.nativeEvent?.pointerType === 'touch';

    if (isTouchOrMobile) {
      // Do not stop propagation; allow parent row handlePlay to fire cleanly!
      return;
    }

    e.stopPropagation();
    if (typeof setIsFullScreen === 'function') {
      setIsFullScreen(false);
    }
    if (song.artistId) {
      navigate(`/artist/${song.artistId}`);
    } else if (song.artist) {
      navigate(`/search?q=${encodeURIComponent(song.artist)}`);
    }
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, queueContext.length > 0 ? queueContext : [song]);
    }
  };

  const songWithContext = {
    ...song,
    ...(playlistId && isUserPlaylist ? { _playlistId: playlistId } : {}),
    ...(isHistory ? { _isHistory: true } : {})
  };

  const handleRemoveFromPlaylist = (e) => {
    e.stopPropagation();
    if (playlistId && song.videoId) {
      removeSongFromPlaylist(playlistId, song.videoId);
      showToast(`Removed "${song.title}" from playlist`, 'info');
    }
  };

  const handleRemoveFromHistory = (e) => {
    e.stopPropagation();
    if (song.videoId && typeof removeFromHistory === 'function') {
      removeFromHistory(song.videoId);
      showToast(`Removed "${song.title}" from history`, 'info');
    }
  };

  return (
    <div
      className={`fs-song-row ${isCurrent ? 'active' : ''}`}
      onClick={handlePlay}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openMenu(songWithContext, e);
      }}
    >
      {/* Track Index Column (Spotify Style) */}
      {index !== null && (
        <div className="fs-song-index-col">
          {isCurrent ? (
            isPlaying ? (
              <span className="fs-song-playing-bars" title="Playing">
                <span className="fs-bar fs-bar-1" />
                <span className="fs-bar fs-bar-2" />
                <span className="fs-bar fs-bar-3" />
              </span>
            ) : (
              <Play size={13} fill="var(--color-primary)" className="text-brand fs-song-index-play" />
            )
          ) : (
            <>
              <span className="fs-song-index-num">{index + 1}</span>
              <Play size={13} fill="currentColor" className="fs-song-index-hover-play" />
            </>
          )}
        </div>
      )}

      {/* Artwork Thumbnail */}
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
        {index === null && (
          <div className={`fs-song-play-icon ${isCurrent ? 'show' : ''}`}>
            {isCurrent && isPlaying ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
          </div>
        )}
      </div>

      {/* Title & Artist Info */}
      <div className="fs-song-info">
        <span className={`fs-song-title truncate ${isCurrent ? 'text-brand' : ''}`} title={song.title}>
          {song.title}
        </span>
        <div className="fs-song-artist-wrap">
          <span
            className="fs-song-artist truncate fs-song-artist-link"
            title={song.artist}
            onClick={handleArtistClick}
          >
            {song.artist}
          </span>
        </div>
      </div>

      {/* Right Area: Duration first, then Actions (Heart & Three Dots) */}
      <div className="fs-song-right">
        <div className="fs-song-duration">
          <span>{song.durationText || ''}</span>
        </div>

        <div className={`fs-song-actions ${liked ? 'has-liked' : ''} ${isUserPlaylist ? 'has-playlist' : ''}`} onClick={(e) => e.stopPropagation()}>
          <button
            className={`btn-icon fs-song-btn ${liked ? 'liked' : ''}`}
            onClick={() => toggleLike(song)}
            title={liked ? 'Unlike' : 'Like'}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>

          {isUserPlaylist && playlistId && (
            <button
              className="btn-icon fs-song-btn fs-song-remove-btn"
              onClick={handleRemoveFromPlaylist}
              title="Remove from this playlist"
              aria-label="Remove from this playlist"
            >
              <Trash2 size={15} />
            </button>
          )}

          {isHistory && (
            <button
              className="btn-icon fs-song-btn fs-song-remove-btn"
              onClick={handleRemoveFromHistory}
              title="Remove from history"
              aria-label="Remove from history"
            >
              <Trash2 size={15} />
            </button>
          )}

          <button
            className="btn-icon fs-song-btn"
            onClick={(e) => openMenu(songWithContext, e)}
            title="More actions"
            aria-label="More actions"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
