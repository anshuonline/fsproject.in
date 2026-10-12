import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, MoreVertical, Trash2, Loader2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { useContextMenu } from '../../context/ContextMenuContext';
import { getArtworkFallback, isGrayPlaceholder, buildThumbFallbacks, advanceThumb } from '../../utils/imageFallback';
import { ArtistLinks } from '../Common/ArtistLinks';
import './SongCard.css';

function SongCardBase({
  song,
  queueContext = [],
  index = null,
  playlistId = null,
  isUserPlaylist = false,
  isHistory = false
}) {
  const { currentSong, isPlaying, isLoading, playSong, togglePlay, setIsFullScreen } = usePlayer();
  const { isLiked, toggleLike, removeSongFromPlaylist, removeFromHistory } = useLibrary();
  const { openMenu, showToast } = useContextMenu();
  const navigate = useNavigate();

  if (!song) return null;

  const isCurrent = currentSong?.videoId === song.videoId;
  const liked = isLiked(song.videoId);

  const thumbPrimary = song.thumbnail || (song.videoId ? `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg` : '/images/freesonglogowebp.webp');
  const thumbCandidates = buildThumbFallbacks(thumbPrimary, song.videoId);
  const handleThumbFail = (img) => advanceThumb(img, thumbCandidates, getArtworkFallback(song.title));

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
    const vid = song.videoId || song.id;
    if (vid && typeof removeFromHistory === 'function') {
      removeFromHistory(vid);
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
            isLoading ? (
              <Loader2 size={13} className="spin text-brand fs-song-index-loading" />
            ) : isPlaying ? (
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
          src={thumbPrimary}
          alt={song.title}
          className="fs-song-thumb"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => handleThumbFail(e.currentTarget)}
          onLoad={(e) => {
            if (isGrayPlaceholder(e.currentTarget)) handleThumbFail(e.currentTarget);
          }}
        />
        {index === null && (
          <div className={`fs-song-play-icon ${isCurrent ? 'show' : ''}`}>
            {isCurrent && isLoading ? (
              <Loader2 size={16} className="spin text-brand" />
            ) : isCurrent && isPlaying ? (
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
          <ArtistLinks
            artist={song.artist}
            className="fs-song-artist truncate fs-song-artist-link"
            onArtistClick={(name, e) => {
              // On touch devices or mobile viewports, tapping the song row
              // plays the song — prevent accidental artist navigation
              const isTouchOrMobile =
                (typeof window !== 'undefined' && window.innerWidth <= 768) ||
                e?.nativeEvent?.pointerType === 'touch';
              if (isTouchOrMobile) return;
              e.stopPropagation();
              if (typeof setIsFullScreen === 'function') {
                setIsFullScreen(false);
              }
              navigate(`/search?q=${encodeURIComponent(name)}`);
            }}
          />
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

export const SongCard = memo(SongCardBase);
