import React, { useState, useEffect, useRef } from 'react';
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
  Loader2,
  Mic2
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { api } from '../../services/api';
import './FullScreenPlayer.css';

function formatTime(sec) {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function parseLrc(lrc) {
  if (!lrc) return [];
  const lines = lrc.split('\n');
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
  const result = [];

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const ms = parseInt(match[3], 10) * (match[3].length === 2 ? 10 : 1);
      const text = match[4].trim();

      if (text) {
        const time = min * 60 + sec + ms / 1000;
        result.push({ time, text });
      }
    }
  }
  return result;
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
  const [lyricsData, setLyricsData] = useState({
    loading: false,
    syncedLyrics: [],
    plainLyrics: null,
    notFound: false
  });

  const lyricsContainerRef = useRef(null);

  // Fetch lyrics whenever currentSong changes
  useEffect(() => {
    if (!currentSong) return;

    let isCurrent = true;
    setLyricsData({
      loading: true,
      syncedLyrics: [],
      plainLyrics: null,
      notFound: false
    });

    api.getLyrics(currentSong.title, currentSong.artist)
      .then(res => {
        if (!isCurrent) return;
        if (res && res.syncedLyrics) {
          const parsed = parseLrc(res.syncedLyrics);
          setLyricsData({
            loading: false,
            syncedLyrics: parsed,
            plainLyrics: null,
            notFound: parsed.length === 0
          });
        } else if (res && res.plainLyrics) {
          setLyricsData({
            loading: false,
            syncedLyrics: [],
            plainLyrics: res.plainLyrics,
            notFound: false
          });
        } else {
          setLyricsData({
            loading: false,
            syncedLyrics: [],
            plainLyrics: null,
            notFound: true
          });
        }
      })
      .catch(err => {
        if (!isCurrent) return;
        console.warn('Failed to load lyrics:', err);
        setLyricsData({
          loading: false,
          syncedLyrics: [],
          plainLyrics: null,
          notFound: true
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [currentSong?.videoId, currentSong?.title, currentSong?.artist]);

  // Compute active lyric line
  let activeLyricIndex = -1;
  if (lyricsData.syncedLyrics.length > 0) {
    for (let i = 0; i < lyricsData.syncedLyrics.length; i++) {
      if (currentTime >= lyricsData.syncedLyrics[i].time) {
        activeLyricIndex = i;
      } else {
        break;
      }
    }
  }

  // Auto-scroll to active lyric line
  useEffect(() => {
    if (activeTab === 'lyrics' && activeLyricIndex !== -1 && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.querySelector('.fs-lyric-line.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIndex, activeTab]);

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

        {/* Main Content: Left Art & Right Up Next / Lyrics */}
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
                <div className="fs-fs-lyrics-panel" ref={lyricsContainerRef}>
                  {lyricsData.loading && (
                    <div className="fs-lyrics-loading">
                      <Loader2 size={32} className="spin text-brand" />
                      <span>Syncing lyrics...</span>
                    </div>
                  )}

                  {!lyricsData.loading && lyricsData.syncedLyrics.length > 0 && (
                    <div className="fs-synced-lyrics-text">
                      {lyricsData.syncedLyrics.map((line, idx) => {
                        const isActive = idx === activeLyricIndex;
                        const isPassed = idx < activeLyricIndex;
                        return (
                          <p
                            key={idx}
                            className={`fs-lyric-line ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                            onClick={() => seekTo(line.time)}
                          >
                            {line.text}
                          </p>
                        );
                      })}
                    </div>
                  )}

                  {!lyricsData.loading && lyricsData.syncedLyrics.length === 0 && lyricsData.plainLyrics && (
                    <div className="fs-plain-lyrics-text">
                      {lyricsData.plainLyrics}
                    </div>
                  )}

                  {!lyricsData.loading && lyricsData.notFound && (
                    <div className="fs-lyrics-not-found">
                      <Mic2 size={44} className="fs-lyrics-not-found-icon" />
                      <p>Looks like we don't have synchronized lyrics for this song yet.</p>
                      <span>Enjoy the high-fidelity audio stream!</span>
                    </div>
                  )}
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
