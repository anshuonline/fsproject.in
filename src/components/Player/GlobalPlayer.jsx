import React, { useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListMusic,
  Maximize2,
  Heart,
  Loader2
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import './GlobalPlayer.css';

function formatTime(sec) {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function GlobalPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    isShuffle,
    repeatMode,
    isLoading,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setIsFullScreen,
    setIsQueueOpen
  } = usePlayer();

  const { isLiked, toggleLike } = useLibrary();
  const progressBarRef = useRef(null);

  if (!currentSong) return null;

  const handleSeekChange = (e) => {
    const val = parseFloat(e.target.value);
    seekTo(val);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentSong.videoId);

  return (
    <div className="fs-global-player">
      {/* Top micro progress bar for mobile */}
      <div className="fs-player-micro-progress">
        <div
          className="fs-micro-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="fs-player-inner">
        {/* Left: Song Meta & Artwork */}
        <div
          className="fs-player-left"
          onClick={() => setIsFullScreen(true)}
          role="button"
          tabIndex={0}
        >
          <div className="fs-player-artwork-wrap">
            <img
              src={currentSong.thumbnail || '/images/freesonglogowebp.webp'}
              alt={currentSong.title}
              className="fs-player-artwork"
            />
          </div>
          <div className="fs-player-meta">
            <span className="fs-player-song-title truncate">{currentSong.title}</span>
            <span className="fs-player-song-artist truncate">{currentSong.artist}</span>
          </div>
          <button
            className={`btn-icon fs-player-like-btn ${liked ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(currentSong);
            }}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Center: Controls & Scrub Bar */}
        <div className="fs-player-center">
          <div className="fs-player-controls">
            <button
              className={`btn-icon fs-ctrl-btn ${isShuffle ? 'active' : ''}`}
              onClick={toggleShuffle}
              title="Shuffle"
              aria-label="Shuffle"
            >
              <Shuffle size={18} />
            </button>

            <button
              className="btn-icon fs-ctrl-btn"
              onClick={prevSong}
              title="Previous"
              aria-label="Previous"
            >
              <SkipBack size={20} />
            </button>

            <button
              className="btn-play-circle fs-main-play-btn"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 size={22} className="spin" />
              ) : isPlaying ? (
                <Pause size={22} fill="currentColor" />
              ) : (
                <Play size={22} fill="currentColor" style={{ marginLeft: 2 }} />
              )}
            </button>

            <button
              className="btn-icon fs-ctrl-btn"
              onClick={nextSong}
              title="Next"
              aria-label="Next"
            >
              <SkipForward size={20} />
            </button>

            <button
              className={`btn-icon fs-ctrl-btn ${repeatMode !== 'off' ? 'active' : ''}`}
              onClick={toggleRepeat}
              title={`Repeat: ${repeatMode}`}
              aria-label={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>

          {/* Time scrubber */}
          <div className="fs-player-scrubber-row">
            <span className="fs-time-text">{formatTime(currentTime)}</span>
            <div className="fs-scrubber-track-wrap">
              <input
                ref={progressBarRef}
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeekChange}
                className="fs-scrubber-input"
                style={{
                  background: `linear-gradient(to right, var(--color-primary-hover) ${progressPercent}%, #333333 ${progressPercent}%)`
                }}
              />
            </div>
            <span className="fs-time-text">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume, Queue, Fullscreen */}
        <div className="fs-player-right">
          <div className="fs-player-volume-wrap">
            <button
              className="btn-icon fs-volume-btn"
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
              className="fs-volume-input"
              style={{
                background: `linear-gradient(to right, var(--color-white) ${(isMuted ? 0 : volume) * 100}%, #333333 ${(isMuted ? 0 : volume) * 100}%)`
              }}
            />
          </div>

          <button
            className="btn-icon fs-queue-btn"
            onClick={() => setIsQueueOpen(prev => !prev)}
            title="Queue"
            aria-label="Queue"
          >
            <ListMusic size={19} />
            {queue.length > 0 && <span className="fs-queue-count">{queue.length}</span>}
          </button>

          <button
            className="btn-icon fs-fullscreen-btn"
            onClick={() => setIsFullScreen(true)}
            title="Full Screen Player"
            aria-label="Full Screen Player"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
