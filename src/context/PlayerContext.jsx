import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { storage } from '../services/storage';
import { api } from '../services/api';

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
  const [sleepTimer, setSleepTimerState] = useState(null); // null | { type: 'time'|'end_of_song', minutes, label, endTime }

  const playerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const sleepTimerTimeoutRef = useRef(null);
  const ytApiReadyRef = useRef(false);
  const isFetchingRelatedRef = useRef(false);
  const fetchedVideoIdsRef = useRef(new Set());

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

  // Auto-fetch related tracks and append to queue for infinite playback
  const fetchAndAppendRelated = useCallback(async (baseSong) => {
    if (!baseSong?.videoId || isFetchingRelatedRef.current) return;
    if (fetchedVideoIdsRef.current.has(baseSong.videoId)) return;

    try {
      isFetchingRelatedRef.current = true;
      fetchedVideoIdsRef.current.add(baseSong.videoId);

      const res = await api.getRelatedSongs(baseSong.videoId, baseSong.artist);
      if (res && Array.isArray(res.songs) && res.songs.length > 0) {
        setQueue(prevQueue => {
          const existingIds = new Set(prevQueue.map(s => s.videoId));
          const newSongs = res.songs.filter(s => !existingIds.has(s.videoId));
          if (newSongs.length === 0) return prevQueue;
          return [...prevQueue, ...newSongs.slice(0, 15)];
        });
      }
    } catch (err) {
      console.warn('Failed to auto-fetch related songs:', err);
    } finally {
      isFetchingRelatedRef.current = false;
    }
  }, []);

  // Play a specific song
  const playSong = useCallback((song, customQueue = null) => {
    if (!song || !song.videoId) return;

    setCurrentSong(song);
    setIsLoading(true);
    setCurrentTime(0);

    // Save to history
    storage.addToHistory(song);

    let initialQueue = [song];
    let initialIdx = 0;

    if (customQueue && Array.isArray(customQueue) && customQueue.length > 0) {
      initialQueue = customQueue;
      const idx = customQueue.findIndex(s => s.videoId === song.videoId);
      initialIdx = idx !== -1 ? idx : 0;
      setQueue(customQueue);
      setQueueIndex(initialIdx);
    } else {
      setQueue([song]);
      setQueueIndex(0);
    }

    ensurePlayer(song.videoId).then(player => {
      if (player && typeof player.playVideo === 'function') {
        player.playVideo();
      }
    });

    // Auto-expand queue if small so queue is never just 1 song!
    if (initialQueue.length <= 2 || initialIdx >= initialQueue.length - 2) {
      fetchAndAppendRelated(song);
    }
  }, [ensurePlayer, fetchAndAppendRelated]);

  // Auto-fetch next batch of songs when approaching the end of queue
  useEffect(() => {
    if (queue.length > 0 && queueIndex >= queue.length - 2) {
      const activeSong = queue[queueIndex] || currentSong;
      if (activeSong) {
        fetchAndAppendRelated(activeSong);
      }
    }
  }, [queueIndex, queue.length, currentSong, fetchAndAppendRelated]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const nextSong = useCallback(async () => {
    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    }

    if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        // Continuous playback: Attempt fetching more songs or loop to beginning
        const activeSong = currentSong || queue[queue.length - 1];
        if (activeSong?.videoId && !isFetchingRelatedRef.current) {
          isFetchingRelatedRef.current = true;
          try {
            const res = await api.getRelatedSongs(activeSong.videoId, activeSong.artist);
            if (res && Array.isArray(res.songs) && res.songs.length > 0) {
              const existingIds = new Set(queue.map(s => s.videoId));
              const newSongs = res.songs.filter(s => !existingIds.has(s.videoId));
              if (newSongs.length > 0) {
                const updatedQueue = [...queue, ...newSongs.slice(0, 15)];
                setQueue(updatedQueue);
                setQueueIndex(nextIdx);
                playSong(updatedQueue[nextIdx], updatedQueue);
                return;
              }
            }
          } catch (e) {
            console.warn('Continuous queue fetch error:', e);
          } finally {
            isFetchingRelatedRef.current = false;
          }
        }

        // Loop back to index 0 so music never stops
        nextIdx = 0;
      }
    }

    const nextTrack = queue[nextIdx];
    if (nextTrack) {
      setQueueIndex(nextIdx);
      playSong(nextTrack, queue);
    }
  }, [queue, queueIndex, isShuffle, repeatMode, currentSong, playSong]);

  // Handle track ending
  const handleSongEnded = useCallback(() => {
    if (sleepTimer?.type === 'end_of_song') {
      setSleepTimerState(null);
      setIsPlaying(false);
      if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo();
      return;
    }

    if (repeatMode === 'one') {
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      }
      return;
    }

    nextSong();
  }, [repeatMode, nextSong, sleepTimer]);

  const playNext = useCallback((song) => {
    if (!song || !song.videoId) return;
    setQueue(prev => {
      if (prev.length === 0) {
        playSong(song);
        return [song];
      }
      const newQueue = [...prev];
      const insertAt = queueIndex >= 0 ? queueIndex + 1 : 0;
      newQueue.splice(insertAt, 0, song);
      return newQueue;
    });
  }, [queueIndex, playSong]);

  const startRadio = useCallback((song) => {
    if (!song || !song.videoId) return;
    setQueue([song]);
    setQueueIndex(0);
    playSong(song, [song]);
    fetchAndAppendRelated(song);
  }, [playSong, fetchAndAppendRelated]);

  const setSleepTimer = useCallback((minutes) => {
    if (sleepTimerTimeoutRef.current) {
      clearTimeout(sleepTimerTimeoutRef.current);
      sleepTimerTimeoutRef.current = null;
    }

    if (!minutes || minutes === 'off') {
      setSleepTimerState(null);
      return;
    }

    if (minutes === 'end_of_song') {
      setSleepTimerState({ type: 'end_of_song', label: 'End of track' });
      return;
    }

    const mins = parseInt(minutes, 10);
    if (isNaN(mins) || mins <= 0) {
      setSleepTimerState(null);
      return;
    }

    const endTime = Date.now() + mins * 60 * 1000;
    setSleepTimerState({ type: 'time', minutes: mins, endTime, label: `${mins}m` });

    sleepTimerTimeoutRef.current = setTimeout(() => {
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
      setIsPlaying(false);
      setSleepTimerState(null);
    }, mins * 60 * 1000);
  }, []);

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
        playNext,
        startRadio,
        sleepTimer,
        setSleepTimer,
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
