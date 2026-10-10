import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Loader2
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import './MiniPlayer.css';

function formatTime(sec) {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function copyStylesToPip(win) {
  [...document.styleSheets].forEach((styleSheet) => {
    try {
      const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
      const style = document.createElement('style');
      style.textContent = cssRules;
      win.document.head.appendChild(style);
    } catch (err) {
      if (styleSheet.href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = styleSheet.type;
        link.media = styleSheet.media;
        link.href = styleSheet.href;
        win.document.head.appendChild(link);
      }
    }
  });
}

export function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    isMiniPlayer,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setIsFullScreen,
    setIsMiniPlayer
  } = usePlayer();

  const [pipWindow, setPipWindow] = useState(null);
  const progressRef = useRef(null);

  const supportsPip = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  // Request Chrome's native Document PiP window (always-on-top, works on any screen)
  useEffect(() => {
    if (!isMiniPlayer) return;

    if (!supportsPip) {
      setIsMiniPlayer(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const win = await window.documentPictureInPicture.requestWindow({
          width: 380,
          height: 230
        });

        if (cancelled) {
          win.close();
          return;
        }

        copyStylesToPip(win);
        win.document.title = 'FreeSong Mini Player';
        win.document.body.classList.add('fs-pip-body');

        win.addEventListener('pagehide', () => {
          setPipWindow(null);
          setIsMiniPlayer(false);
        });

        setPipWindow(win);
      } catch (err) {
        setIsMiniPlayer(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isMiniPlayer, supportsPip, setIsMiniPlayer]);

  // Close the OS PiP window when the miniplayer toggle is switched off
  useEffect(() => {
    if (!isMiniPlayer && pipWindow && !pipWindow.closed) {
      pipWindow.close();
      setPipWindow(null);
    }
  }, [isMiniPlayer, pipWindow]);

  const handleSeekClick = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    seekTo(ratio * duration);
  };

  const handleExpand = () => {
    setIsFullScreen(true);
    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
      setPipWindow(null);
    }
  };

  if (!pipWindow || !currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return createPortal(
    <div className="fs-mini-player">
      <div className="fs-mini-main">
        <img
          className="fs-mini-artwork"
          src={currentSong.thumbnail || (currentSong.videoId ? `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg` : '/images/freesonglogowebp.webp')}
          alt={currentSong.title}
          referrerPolicy="no-referrer"
          draggable={false}
        />

        <div className="fs-mini-info">
          <span className="fs-mini-title truncate">{currentSong.title}</span>
          <span className="fs-mini-artist truncate">{currentSong.artist}</span>

          <div className="fs-mini-controls">
            <button
              className="fs-mini-ctrl-btn"
              onClick={prevSong}
              title="Previous"
              aria-label="Previous"
            >
              <SkipBack size={19} fill="currentColor" />
            </button>

            <button
              className="fs-mini-play-btn"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 size={20} className="spin" />
              ) : isPlaying ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />
              )}
            </button>

            <button
              className="fs-mini-ctrl-btn"
              onClick={nextSong}
              title="Next"
              aria-label="Next"
            >
              <SkipForward size={19} fill="currentColor" />
            </button>

            <button
              className="fs-mini-ctrl-btn fs-mini-expand-btn"
              onClick={handleExpand}
              title="Open Full Screen"
              aria-label="Open Full Screen"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="fs-mini-progress-row">
        <span className="fs-mini-time">{formatTime(currentTime)}</span>
        <div
          className="fs-mini-progress"
          ref={progressRef}
          onClick={handleSeekClick}
          title="Seek"
        >
          <div
            className="fs-mini-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="fs-mini-time">{formatTime(duration)}</span>
      </div>
    </div>,
    pipWindow.document.body
  );
}
