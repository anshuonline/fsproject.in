import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  ListMusic,
  FileText,
  Loader2
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import './FullScreenPlayer.css';

function formatTime(sec) {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function FullScreenPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    queueIndex,
    isShuffle,
    repeatMode,
    isFullScreen,
    isLoading,
    setIsFullScreen,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    playSong
  } = usePlayer();

  const { isLiked, toggleLike } = useLibrary();
  const [activeTab, setActiveTab] = useState('upnext'); // 'upnext' | 'lyrics'

  if (!isFullScreen || !currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentSong.videoId);

  return (
    <div className="fs-fullscreen-overlay">
      {/* Ambient background glow */}
      <div
        className="fs-fs-ambient-bg"
        style={{ backgroundImage: `url(${currentSong.thumbnail})` }}
      />

      <div className="fs-fs-container">
        {/* Top bar */}
        <div className="fs-fs-topbar">
          <button
            className="btn-icon fs-fs-collapse-btn"
            onClick={() => setIsFullScreen(false)}
            aria-label="Collapse player"
          >
            <ChevronDown size={28} />
          </button>
          <div className="fs-fs-header-title">
            <span>NOW PLAYING</span>
          </div>
          <div style={{ width: 40 }} />
        </div>

        {/* Main Content: Left Art & Right Up Next */}
        <div className="fs-fs-main">
          {/* Left / Center: Artwork & Details */}
          <div className="fs-fs-art-col">
            <div className="fs-fs-art-wrap">
              <img
                src={currentSong.thumbnail || '/images/freesonglogowebp.webp'}
                alt={currentSong.title}
                className="fs-fs-artwork"
              />
            </div>

            <div className="fs-fs-track-info">
              <div className="fs-fs-text-group">
                <h2 className="fs-fs-song-name truncate">{currentSong.title}</h2>
                <p className="fs-fs-song-artist truncate">{currentSong.artist}</p>
              </div>
              <button
                className={`btn-icon fs-fs-like-btn ${liked ? 'liked' : ''}`}
                onClick={() => toggleLike(currentSong)}
                aria-label={liked ? 'Unlike track' : 'Like track'}
              >
                <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Right: Tabs (Up Next / Lyrics) */}
          <div className="fs-fs-side-col">
            <div className="fs-fs-tabs">
              <button
                className={`fs-fs-tab-btn ${activeTab === 'upnext' ? 'active' : ''}`}
                onClick={() => setActiveTab('upnext')}
              >
                <ListMusic size={16} />
                <span>UP NEXT</span>
              </button>
              <button
                className={`fs-fs-tab-btn ${activeTab === 'lyrics' ? 'active' : ''}`}
                onClick={() => setActiveTab('lyrics')}
              >
                <FileText size={16} />
                <span>LYRICS</span>
              </button>
            </div>

            <div className="fs-fs-tab-content">
              {activeTab === 'upnext' ? (
                <div className="fs-fs-queue-list">
                  {queue.length === 0 ? (
                    <div className="fs-empty-queue">Queue is empty</div>
                  ) : (
                    queue.map((track, idx) => (
                      <div
                        key={`${track.videoId}-${idx}`}
                        className={`fs-fs-queue-item ${idx === queueIndex ? 'playing' : ''}`}
                        onClick={() => playSong(track, queue)}
                      >
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="fs-fs-queue-thumb"
                        />
                        <div className="fs-fs-queue-meta">
                          <span className="fs-fs-queue-title truncate">{track.title}</span>
                          <span className="fs-fs-queue-artist truncate">{track.artist}</span>
                        </div>
                        {idx === queueIndex && (
                          <div className="fs-fs-playing-indicator">
                            <span />
                            <span />
                            <span />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="fs-fs-lyrics-panel">
                  <p className="fs-lyrics-line highlight">{currentSong.title}</p>
                  <p className="fs-lyrics-line">Performed by {currentSong.artist}</p>
                  <p className="fs-lyrics-line italic">Lyrics synchronized via FreeSong.in stream</p>
                  <div className="fs-lyrics-placeholder">
                    <p>♪ Music playing in background ♪</p>
                    <p>Enjoy lossless high-fidelity audio on FreeSong.in</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Scrubber & Controls */}
        <div className="fs-fs-controls-section">
          {/* Progress Slider */}
          <div className="fs-fs-scrubber-row">
            <span className="fs-time-text">{formatTime(currentTime)}</span>
            <div className="fs-scrubber-track-wrap">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="fs-scrubber-input fs-large-scrubber"
                style={{
                  background: `linear-gradient(to right, var(--color-primary-hover) ${progressPercent}%, #333333 ${progressPercent}%)`
                }}
              />
            </div>
            <span className="fs-time-text">{formatTime(duration)}</span>
          </div>

          {/* Buttons Row */}
          <div className="fs-fs-buttons-row">
            <button
              className={`btn-icon ${isShuffle ? 'text-brand' : ''}`}
              onClick={toggleShuffle}
              aria-label="Shuffle"
            >
              <Shuffle size={20} />
            </button>

            <button className="btn-icon" onClick={prevSong} aria-label="Previous">
              <SkipBack size={26} />
            </button>

            <button
              className="btn-play-circle fs-fs-big-play"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 size={28} className="spin" />
              ) : isPlaying ? (
                <Pause size={28} fill="currentColor" />
              ) : (
                <Play size={28} fill="currentColor" style={{ marginLeft: 3 }} />
              )}
            </button>

            <button className="btn-icon" onClick={nextSong} aria-label="Next">
              <SkipForward size={26} />
            </button>

            <button
              className={`btn-icon ${repeatMode !== 'off' ? 'text-brand' : ''}`}
              onClick={toggleRepeat}
              aria-label="Repeat"
            >
              {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>
          </div>

          {/* Volume Row */}
          <div className="fs-fs-volume-row">
            <button className="btn-icon" onClick={toggleMute} aria-label="Toggle Mute">
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
              className="fs-volume-input fs-fs-vol-slider"
              style={{
                background: `linear-gradient(to right, var(--color-white) ${(isMuted ? 0 : volume) * 100}%, #333333 ${(isMuted ? 0 : volume) * 100}%)`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
