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
  Loader2,
  Mic2,
  MoreVertical,
  BookmarkPlus,
  Moon,
  Sparkles,
  ListPlus,
  Search as SearchIcon
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlayer, usePlayerProgress } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { useContextMenu } from '../../context/ContextMenuContext';
import { api } from '../../services/api';
import { getArtworkFallback } from '../../utils/imageFallback';
import { PlayerSearch } from './PlayerSearch';
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
    volume,
    isMuted,
    queue,
    queueIndex,
    isShuffle,
    repeatMode,
    isFullScreen,
    isLoading,
    sleepTimer,
    isAutoplay,
    toggleAutoplay,
    setIsFullScreen,
    togglePlay,
    nextSong,
    prevSong,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    playSong,
    addToQueue
  } = usePlayer();

  const { currentTime, duration, seekTo } = usePlayerProgress();

  const { isLiked, toggleLike } = useLibrary();
  const { openMenu, setView: setContextView, showToast } = useContextMenu();
  const navigate = useNavigate();
  const location = useLocation();

  // Desktop active tab: 'upnext' | 'lyrics' | 'related'
  const [activeTab, setActiveTab] = useState('upnext');
  // Mobile segmented mode: 'song' | 'lyrics' | 'upnext'
  const [mobileMode, setMobileMode] = useState('song');

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 850 : false
  );

  const [lyricsData, setLyricsData] = useState({
    loading: false,
    syncedLyrics: [],
    plainLyrics: null,
    notFound: false
  });

  const [relatedSongs, setRelatedSongs] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const lyricsContainerRef = useRef(null);

  // Automatically close fullscreen overlay when route/URL changes
  useEffect(() => {
    if (isFullScreen) {
      setIsFullScreen(false);
    }
  }, [location.pathname, location.search]);

  // Navigate directly to artist page and close fullscreen
  const handleNavigateArtist = (artistName, artistId, e) => {
    if (e) {
      e.stopPropagation();
    }
    setIsFullScreen(false);
    if (artistId) {
      navigate(`/artist/${artistId}`);
    } else if (artistName) {
      navigate(`/search?q=${encodeURIComponent(artistName)}`);
    }
  };

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 850);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Escape key closes player
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsFullScreen(false);
      }
    };
    if (isFullScreen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen, setIsFullScreen]);

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

  // Fetch related songs for RELATED tab
  useEffect(() => {
    if (!currentSong?.videoId) return;
    setLoadingRelated(true);
    api.getRelatedSongs(currentSong.videoId, currentSong.artist)
      .then(res => {
        if (res && Array.isArray(res.songs)) {
          setRelatedSongs(res.songs);
        }
      })
      .catch(err => console.warn('Related fetch error:', err))
      .finally(() => setLoadingRelated(false));
  }, [currentSong?.videoId, currentSong?.artist]);

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
    const showLyrics = (!isMobile && activeTab === 'lyrics') || (isMobile && mobileMode === 'lyrics');
    if (showLyrics && activeLyricIndex !== -1 && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.querySelector('.fs-lyric-line.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIndex, activeTab, mobileMode, isMobile]);

  if (!isFullScreen || !currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentSong.videoId);

  const handleOpenPlaylistMenu = (e) => {
    e.stopPropagation();
    openMenu(currentSong, e);
    setContextView('playlist');
  };

  const handleOpenSleepTimerMenu = (e) => {
    e.stopPropagation();
    openMenu(currentSong, e);
    setContextView('sleep_timer');
  };

  return (
    <div
      className="fs-fullscreen-overlay"
      onContextMenu={(e) => {
        e.preventDefault();
        openMenu(currentSong, e);
      }}
    >
      {/* Ambient background glow */}
      <div
        className="fs-fs-ambient-bg"
        style={{ backgroundImage: `url(${currentSong.thumbnail})` }}
      />

      {/* Top minimal bar with Collapse button */}
      <div className="fs-fs-header">
        <button
          className="btn-icon fs-fs-collapse-btn"
          onClick={() => setIsFullScreen(false)}
          aria-label="Collapse player"
          title="Close player (Esc)"
        >
          <ChevronDown size={28} />
        </button>

        {isMobile ? (
          <div className="fs-fs-mobile-segments">
            <button
              className={`fs-fs-seg-btn ${mobileMode === 'song' ? 'active' : ''}`}
              onClick={() => setMobileMode('song')}
            >
              Song
            </button>
            <button
              className={`fs-fs-seg-btn ${mobileMode === 'lyrics' ? 'active' : ''}`}
              onClick={() => setMobileMode('lyrics')}
            >
              Lyrics
            </button>
            <button
              className={`fs-fs-seg-btn ${mobileMode === 'upnext' ? 'active' : ''}`}
              onClick={() => setMobileMode('upnext')}
            >
              Up Next {queue.length > 0 && `(${queue.length})`}
            </button>
            <button
              className={`fs-fs-seg-btn ${mobileMode === 'search' ? 'active' : ''}`}
              onClick={() => setMobileMode('search')}
              aria-label="Search"
              title="Search songs"
            >
              <SearchIcon size={15} />
            </button>
          </div>
        ) : (
          <div className="fs-fs-header-spacer" />
        )}

        <div className="fs-fs-top-actions">
          {sleepTimer && (
            <button
              className="fs-fs-timer-badge"
              onClick={handleOpenSleepTimerMenu}
              title="Sleep Timer Active"
            >
              <Moon size={14} />
              <span>{sleepTimer.label}</span>
            </button>
          )}
          <button
            className="btn-icon fs-fs-more-btn"
            onClick={(e) => openMenu(currentSong, e)}
            title="More options"
            aria-label="More options"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* ── Main 2-Column Stage (YouTube Music style) ── */}
      <div className={`fs-fs-stage ${isMobile ? `mobile-${mobileMode}` : ''}`}>
        {/* Left Column: Big Album Artwork */}
        {(!isMobile || mobileMode === 'song') && (
          <div className="fs-fs-art-column">
            <div className="fs-fs-art-wrapper">
              <img
                src={
                  currentSong.thumbnail ||
                  (currentSong.videoId
                    ? `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`
                    : '/images/freesonglogowebp.webp')
                }
                alt={currentSong.title}
                className="fs-fs-art-image"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const currentSrc = e.currentTarget.src || '';
                  if (currentSong.videoId && !currentSrc.includes('i.ytimg.com')) {
                    e.currentTarget.src = `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`;
                  } else {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getArtworkFallback(currentSong.title);
                  }
                }}
              />
            </div>

            {/* Mobile metadata underneath art in 'song' mode */}
            {isMobile && (
              <div className="fs-fs-mobile-art-meta">
                <div className="fs-fs-mobile-meta-text">
                  <h2 className="fs-fs-mobile-title truncate">{currentSong.title}</h2>
                  <p
                    className="fs-fs-mobile-artist truncate fs-clickable-artist"
                    onClick={(e) => handleNavigateArtist(currentSong.artist, currentSong.artistId, e)}
                    title={`Go to ${currentSong.artist}`}
                  >
                    {currentSong.artist}
                  </p>
                </div>
                <button
                  className={`btn-icon fs-fs-mobile-like-btn ${liked ? 'liked' : ''}`}
                  onClick={() => toggleLike(currentSong)}
                  aria-label={liked ? 'Unlike track' : 'Like track'}
                >
                  <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right Column: YouTube Music Tabs (UP NEXT / LYRICS / RELATED) */}
        {(!isMobile || mobileMode !== 'song') && (
          <div className={`fs-fs-panel-column ${isMobile ? 'mobile-panel-full' : ''}`}>
            {/* Desktop Tabs Header (UP NEXT | LYRICS | RELATED) */}
            {!isMobile && (
              <div className="fs-fs-tab-bar">
                <button
                  className={`fs-fs-tab-link ${activeTab === 'upnext' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upnext')}
                >
                  UP NEXT
                </button>
                <button
                  className={`fs-fs-tab-link ${activeTab === 'lyrics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('lyrics')}
                >
                  LYRICS
                </button>
                <button
                  className={`fs-fs-tab-link ${activeTab === 'related' ? 'active' : ''}`}
                  onClick={() => setActiveTab('related')}
                >
                  RELATED
                </button>
                <button
                  className={`fs-fs-tab-link ${activeTab === 'search' ? 'active' : ''}`}
                  onClick={() => setActiveTab('search')}
                >
                  SEARCH
                </button>
              </div>
            )}

            {/* Tab Body */}
            <div className="fs-fs-tab-body">
              {/* TAB 1: UP NEXT */}
              {((!isMobile && activeTab === 'upnext') || (isMobile && mobileMode === 'upnext')) && (
                <div className="fs-fs-upnext-container">
                  {/* Playing from row + Save button */}
                  <div className="fs-fs-queue-subheader">
                    <div className="fs-fs-source-meta">
                      <span className="fs-fs-playing-from">Playing from</span>
                      <span className="fs-fs-source-name truncate">
                        {currentSong.artist ? `${currentSong.artist} Radio` : 'FreeSong Queue'}
                      </span>
                    </div>
                    <button
                      className="fs-fs-save-btn"
                      onClick={handleOpenPlaylistMenu}
                      title="Save queue to playlist"
                    >
                      <BookmarkPlus size={16} />
                      <span>Save</span>
                    </button>
                  </div>

                  {/* Autoplay toggle switch row (YouTube Music style) */}
                  <div className="fs-fs-autoplay-row">
                    <div className="fs-fs-autoplay-info">
                      <span className="fs-fs-autoplay-title">Auto-play</span>
                      <span className="fs-fs-autoplay-desc">Add similar content to the end of the queue</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isAutoplay}
                      onClick={toggleAutoplay}
                      className={`fs-fs-switch ${isAutoplay ? 'active' : ''}`}
                      title={isAutoplay ? 'Auto-play is ON' : 'Auto-play is OFF'}
                    >
                      <span className="fs-fs-switch-knob" />
                    </button>
                  </div>

                  {/* Queue List with thumbnails, titles, artists and right-aligned durations */}
                  <div className="fs-fs-queue-list">
                    {queue.length === 0 ? (
                      <div className="fs-empty-queue">Queue is empty</div>
                    ) : (
                      queue.map((track, idx) => {
                        const isCurrent = idx === queueIndex;
                        return (
                          <div
                            key={`${track.videoId}-${idx}`}
                            className={`fs-fs-queue-item ${isCurrent ? 'playing' : ''}`}
                            onClick={() => playSong(track, queue)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openMenu(track, e);
                            }}
                          >
                            <div className="fs-fs-queue-thumb-wrap">
                              <img
                                src={
                                  track.thumbnail ||
                                  (track.videoId
                                    ? `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`
                                    : '/images/freesonglogowebp.webp')
                                }
                                alt={track.title}
                                className="fs-fs-queue-thumb"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  const currentSrc = e.currentTarget.src || '';
                                  if (track.videoId && !currentSrc.includes('i.ytimg.com')) {
                                    e.currentTarget.src = `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`;
                                  } else {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = getArtworkFallback(track.title);
                                  }
                                }}
                              />
                              {isCurrent && (
                                <div className="fs-fs-playing-speaker">
                                  <Volume2 size={15} />
                                </div>
                              )}
                            </div>

                            <div className="fs-fs-queue-meta">
                              <span className={`fs-fs-queue-title truncate ${isCurrent ? 'text-green' : ''}`}>
                                {track.title}
                              </span>
                              <span
                                className="fs-fs-queue-artist truncate fs-clickable-artist"
                                onClick={(e) => handleNavigateArtist(track.artist, track.artistId, e)}
                                title={`Go to ${track.artist}`}
                              >
                                {track.artist}
                              </span>
                            </div>

                            <span className="fs-fs-queue-duration">
                              {track.durationText || (track.duration ? formatTime(track.duration) : '3:30')}
                            </span>

                            <button
                              className="btn-icon fs-fs-queue-more"
                              onClick={(e) => {
                                e.stopPropagation();
                                openMenu(track, e);
                              }}
                              title="Track options"
                              aria-label="Track options"
                            >
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: LYRICS */}
              {((!isMobile && activeTab === 'lyrics') || (isMobile && mobileMode === 'lyrics')) && (
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
                      <p>No lyrics found for this song</p>
                      <span>Enjoy the high-fidelity audio stream</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RELATED */}
              {((!isMobile && activeTab === 'related') || (isMobile && mobileMode === 'related')) && (
                <div className="fs-fs-related-panel">
                  {/* Related Header */}
                  <div className="fs-fs-queue-subheader">
                    <div className="fs-fs-source-meta">
                      <span className="fs-fs-playing-from">YOU MIGHT ALSO LIKE</span>
                      <span className="fs-fs-source-name truncate">
                        Similar to "{currentSong.title}"
                      </span>
                    </div>
                    {relatedSongs.length > 0 && (
                      <button
                        className="fs-fs-save-btn"
                        onClick={() => {
                          relatedSongs.forEach(song => addToQueue(song));
                          showToast(`Added ${relatedSongs.length} songs to queue`);
                        }}
                        title="Add all to queue"
                      >
                        <ListPlus size={16} />
                        <span>Add all</span>
                      </button>
                    )}
                  </div>

                  {loadingRelated ? (
                    <div className="fs-lyrics-loading">
                      <Loader2 size={32} className="spin text-brand" />
                      <span>Finding related tracks...</span>
                    </div>
                  ) : relatedSongs.length === 0 ? (
                    <div className="fs-lyrics-not-found">
                      <Sparkles size={40} className="fs-lyrics-not-found-icon" />
                      <p>No related songs found right now</p>
                    </div>
                  ) : (
                    <div className="fs-fs-related-list">
                      {relatedSongs.map((track, idx) => (
                        <div
                          key={`rel-${track.videoId}-${idx}`}
                          className="fs-fs-queue-item"
                          onClick={() => playSong(track)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openMenu(track, e);
                          }}
                        >
                          <div className="fs-fs-queue-thumb-wrap">
                            <img
                              src={
                                track.thumbnail ||
                                (track.videoId
                                  ? `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`
                                  : '/images/freesonglogowebp.webp')
                              }
                              alt={track.title}
                              className="fs-fs-queue-thumb"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const currentSrc = e.currentTarget.src || '';
                                if (track.videoId && !currentSrc.includes('i.ytimg.com')) {
                                  e.currentTarget.src = `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`;
                                } else {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = getArtworkFallback(track.title);
                                }
                              }}
                            />
                          </div>
                          <div className="fs-fs-queue-meta">
                            <span className="fs-fs-queue-title truncate">{track.title}</span>
                            <span
                              className="fs-fs-queue-artist truncate fs-clickable-artist"
                              onClick={(e) => handleNavigateArtist(track.artist, track.artistId, e)}
                              title={`Go to ${track.artist}`}
                            >
                              {track.artist}
                            </span>
                          </div>
                          <span className="fs-fs-queue-duration">
                            {track.durationText || (track.duration ? formatTime(track.duration) : '3:30')}
                          </span>
                          <button
                            className="btn-icon fs-fs-queue-more"
                            onClick={(e) => {
                              e.stopPropagation();
                              openMenu(track, e);
                            }}
                            title="Track options"
                            aria-label="Track options"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SEARCH */}
              {((!isMobile && activeTab === 'search') || (isMobile && mobileMode === 'search')) && (
                <PlayerSearch
                  onPlayed={() => {
                    if (isMobile) setMobileMode('upnext');
                    else setActiveTab('upnext');
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed Bottom Player Bar (Exact YouTube Music Layout) ── */}
      <div className="fs-fs-bottom-player">
        {/* Full width Scrubber along the top edge */}
        <div className="fs-fs-scrubber-top">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="fs-fs-scrubber-range"
            style={{
              background: `linear-gradient(to right, var(--color-primary) ${progressPercent}%, rgba(255, 255, 255, 0.18) ${progressPercent}%)`
            }}
          />
        </div>

        <div className="fs-fs-bottom-content">
          {/* LEFT: Controls (Prev, Play/Pause, Next) + Time display */}
          <div className="fs-fs-bar-left">
            <button
              className="btn-icon fs-fs-bar-btn"
              onClick={prevSong}
              title="Previous Track"
              aria-label="Previous Track"
            >
              <SkipBack size={20} />
            </button>

            <button
              className="btn-icon fs-fs-bar-play-btn"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 size={24} className="spin" />
              ) : isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" style={{ marginLeft: 2 }} />
              )}
            </button>

            <button
              className="btn-icon fs-fs-bar-btn"
              onClick={nextSong}
              title="Next Track"
              aria-label="Next Track"
            >
              <SkipForward size={20} />
            </button>

            <span className="fs-fs-time-counter">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* CENTER: Mini Thumbnail + Song Meta + Like + More */}
          <div className="fs-fs-bar-center">
            <img
              src={
                currentSong.thumbnail ||
                (currentSong.videoId
                  ? `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`
                  : '/images/freesonglogowebp.webp')
              }
              alt={currentSong.title}
              className="fs-fs-bar-thumb"
              referrerPolicy="no-referrer"
            />
            <div className="fs-fs-bar-meta">
              <span className="fs-fs-bar-title truncate">{currentSong.title}</span>
              <span
                className="fs-fs-bar-artist truncate fs-clickable-artist"
                onClick={(e) => handleNavigateArtist(currentSong.artist, currentSong.artistId, e)}
                title={`Go to ${currentSong.artist}`}
              >
                {currentSong.artist}
              </span>
            </div>
            <button
              className={`btn-icon fs-fs-bar-like ${liked ? 'liked' : ''}`}
              onClick={() => toggleLike(currentSong)}
              aria-label={liked ? 'Unlike' : 'Like'}
              title={liked ? 'Liked' : 'Like'}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button
              className="btn-icon fs-fs-bar-more"
              onClick={(e) => openMenu(currentSong, e)}
              title="More options"
              aria-label="More options"
            >
              <MoreVertical size={18} />
            </button>
          </div>

          {/* RIGHT: Volume slider + Repeat + Shuffle + Collapse Down Chevron */}
          <div className="fs-fs-bar-right">
            {/* Volume */}
            <div className="fs-fs-bar-volume">
              <button
                className="btn-icon fs-fs-vol-icon-btn"
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label="Volume"
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
                className="fs-fs-bar-vol-slider"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.2) ${(isMuted ? 0 : volume) * 100}%)`
                }}
              />
            </div>

            {/* Repeat (Active bright green with dot) */}
            <button
              className={`btn-icon fs-fs-bar-btn ${repeatMode !== 'off' ? 'active' : ''}`}
              onClick={toggleRepeat}
              title={`Repeat: ${repeatMode.toUpperCase()}`}
              aria-label={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>

            {/* Shuffle (Active bright green with dot) */}
            <button
              className={`btn-icon fs-fs-bar-btn ${isShuffle ? 'active' : ''}`}
              onClick={toggleShuffle}
              title={isShuffle ? 'Shuffle is ON' : 'Shuffle is OFF'}
              aria-label="Shuffle"
            >
              <Shuffle size={18} />
            </button>

            {/* Down Chevron to collapse */}
            <button
              className="btn-icon fs-fs-bar-btn fs-fs-bar-collapse"
              onClick={() => setIsFullScreen(false)}
              title="Close player"
              aria-label="Close player"
            >
              <ChevronDown size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
