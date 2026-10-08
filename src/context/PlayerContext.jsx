import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { storage } from '../services/storage';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => storage.getSettings().volume ?? 0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const playerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const ytApiReadyRef = useRef(false);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      ytApiReadyRef.current = true;
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      ytApiReadyRef.current = true;
    };
  }, []);

  // Initialize YT Player on container
  const ensurePlayer = useCallback((videoId) => {
    return new Promise((resolve) => {
      const checkAndInit = () => {
        if (!window.YT || !window.YT.Player) {
          setTimeout(checkAndInit, 100);
          return;
        }

        const containerId = 'fs-hidden-player';
        let container = document.getElementById(containerId);
        if (!container) {
          container = document.createElement('div');
          container.id = containerId;
          container.style.position = 'fixed';
          container.style.top = '-9999px';
          container.style.left = '-9999px';
          container.style.width = '1px';
          container.style.height = '1px';
          container.style.opacity = '0.01';
          container.style.pointerEvents = 'none';
          document.body.appendChild(container);
        }

        if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
          playerRef.current.loadVideoById(videoId);
          resolve(playerRef.current);
          return;
        }

        playerRef.current = new window.YT.Player(containerId, {
          height: '1',
          width: '1',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(volume * 100);
              event.target.playVideo();
              resolve(event.target);
            },
            onStateChange: (event) => {
              // YT.PlayerState: 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
                setIsLoading(false);
                if (event.target.getDuration) {
                  setDuration(event.target.getDuration());
                }
              } else if (event.data === 2) {
                setIsPlaying(false);
                setIsLoading(false);
              } else if (event.data === 3) {
                setIsLoading(true);
              } else if (event.data === 0) {
                handleSongEnded();
              }
            },
            onError: (e) => {
              console.warn('YT Player error:', e.data);
              setIsLoading(false);
              // Auto-skip unplayable/restricted track
              setTimeout(() => nextSong(), 1000);
            }
          }
        });
      };

      checkAndInit();
    });
  }, [volume]);

  // Track progress ticker
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const t = playerRef.current.getCurrentTime();
          setCurrentTime(t || 0);
          const d = playerRef.current.getDuration();
          if (d && d > 0) setDuration(d);
        }
      }, 500);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying]);

  // Handle track ending
  const handleSongEnded = useCallback(() => {
    if (repeatMode === 'one') {
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      }
      return;
    }

    nextSong();
  }, [repeatMode]);

  // Play a specific song
  const playSong = useCallback((song, customQueue = null) => {
    if (!song || !song.videoId) return;

    setCurrentSong(song);
    setIsLoading(true);
    setCurrentTime(0);

    // Save to history
    storage.addToHistory(song);

    if (customQueue && Array.isArray(customQueue) && customQueue.length > 0) {
      setQueue(customQueue);
      const idx = customQueue.findIndex(s => s.videoId === song.videoId);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else if (queue.length === 0) {
      setQueue([song]);
      setQueueIndex(0);
    }

    ensurePlayer(song.videoId).then(player => {
      if (player && typeof player.playVideo === 'function') {
        player.playVideo();
      }
    });
  }, [queue, ensurePlayer]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const nextSong = useCallback(() => {
    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    }

    if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    const nextTrack = queue[nextIdx];
    if (nextTrack) {
      setQueueIndex(nextIdx);
      playSong(nextTrack, queue);
    }
  }, [queue, queueIndex, isShuffle, repeatMode, playSong]);

  const prevSong = useCallback(() => {
    if (currentTime > 4 && playerRef.current?.seekTo) {
      playerRef.current.seekTo(0);
      setCurrentTime(0);
      return;
    }

    if (queue.length === 0) return;
    const prevIdx = queueIndex - 1 >= 0 ? queueIndex - 1 : queue.length - 1;
    const prevTrack = queue[prevIdx];
    if (prevTrack) {
      setQueueIndex(prevIdx);
      playSong(prevTrack, queue);
    }
  }, [currentTime, queue, queueIndex, playSong]);

  const seekTo = useCallback((seconds) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  const setVolumeLevel = useCallback((val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    setIsMuted(clamped === 0);
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(clamped * 100);
    }
    storage.saveSettings({ ...storage.getSettings(), volume: clamped });
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      setVolumeLevel(volume || 0.8);
    } else {
      setIsMuted(true);
      if (playerRef.current?.setVolume) playerRef.current.setVolume(0);
    }
  }, [isMuted, volume, setVolumeLevel]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const addToQueue = useCallback((song) => {
    setQueue(prev => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (index === queueIndex) {
      nextSong();
    } else if (index < queueIndex) {
      setQueueIndex(prev => prev - 1);
    }
  }, [queueIndex, nextSong]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(-1);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
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
        isQueueOpen,
        isLoading,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
        setVolumeLevel,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setIsFullScreen,
        setIsQueueOpen
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
