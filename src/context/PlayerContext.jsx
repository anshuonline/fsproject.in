import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useLibrary } from './LibraryContext';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { user } = useAuth();
  const { addToHistory } = useLibrary();
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
  const [isAutoplay, setIsAutoplay] = useState(true);

  const playerRef = useRef(null);
  const playerInitPromiseRef = useRef(null);
  const progressTimerRef = useRef(null);
  const sleepTimerTimeoutRef = useRef(null);
  const ytApiReadyRef = useRef(false);
  const isFetchingRelatedRef = useRef(false);
  const fetchedVideoIdsRef = useRef(new Set());
  const isTransitioningRef = useRef(false);
  const isAutoplayRef = useRef(true);

  // Synchronized refs to prevent stale closures in YouTube Player callbacks
  const userRef = useRef(user);
  const addToHistoryRef = useRef(addToHistory);
  const queueRef = useRef(queue);
  const queueIndexRef = useRef(queueIndex);
  const isShuffleRef = useRef(isShuffle);
  const repeatModeRef = useRef(repeatMode);
  const currentSongRef = useRef(currentSong);
  const sleepTimerRef = useRef(sleepTimer);
  const handleSongEndedRef = useRef(null);
  const nextSongRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    addToHistoryRef.current = addToHistory;
  }, [addToHistory]);

  useEffect(() => {
    isAutoplayRef.current = isAutoplay;
  }, [isAutoplay]);

  // Keep refs synchronized on every update
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    queueIndexRef.current = queueIndex;
  }, [queueIndex]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    sleepTimerRef.current = sleepTimer;
  }, [sleepTimer]);

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
    // If player is already initialized and functional
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById(videoId);
        playerRef.current.playVideo();
      } catch (err) {
        console.warn('Error loading video by ID:', err);
      }
      return Promise.resolve(playerRef.current);
    }

    // If initialization is already in flight, wait for it then load video
    if (playerInitPromiseRef.current) {
      return playerInitPromiseRef.current.then(player => {
        if (player && typeof player.loadVideoById === 'function') {
          try {
            player.loadVideoById(videoId);
            player.playVideo();
          } catch (e) {}
        }
        return player;
      });
    }

    playerInitPromiseRef.current = new Promise((resolve) => {
      const checkAndInit = () => {
        if (!window.YT || !window.YT.Player) {
          setTimeout(checkAndInit, 80);
          return;
        }

        const containerId = 'fs-hidden-player';
        let container = document.getElementById(containerId);
        if (!container) {
          container = document.createElement('div');
          container.id = containerId;
          container.style.position = 'fixed';
          container.style.bottom = '0';
          container.style.right = '0';
          container.style.width = '200px';
          container.style.height = '200px';
          container.style.opacity = '0.001';
          container.style.pointerEvents = 'none';
          container.style.zIndex = '-9999';
          document.body.appendChild(container);
        }

        try {
          new window.YT.Player(containerId, {
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
              enablejsapi: 1,
              origin: window.location.origin
            },
            events: {
              onReady: (event) => {
                playerRef.current = event.target;
                playerInitPromiseRef.current = null;
                event.target.setVolume(volume * 100);
                event.target.playVideo();
                resolve(event.target);
              },
              onStateChange: (event) => {
                // YT.PlayerState: 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 0 = ENDED
                if (event.data === 1) {
                  setIsPlaying(true);
                  setIsLoading(false);
                  isTransitioningRef.current = false;
                  if (event.target.getDuration) {
                    setDuration(event.target.getDuration());
                  }
                } else if (event.data === 2) {
                  setIsPlaying(false);
                  setIsLoading(false);
                } else if (event.data === 3) {
                  setIsLoading(true);
                } else if (event.data === 0) {
                  if (handleSongEndedRef.current) {
                    handleSongEndedRef.current();
                  }
                }
              },
              onError: (e) => {
                console.warn('YT Player error:', e.data);
                setIsLoading(false);
                playerInitPromiseRef.current = null;
                setTimeout(() => {
                  if (nextSongRef.current) {
                    nextSongRef.current();
                  }
                }, 1000);
              }
            }
          });
        } catch (initErr) {
          console.warn('Failed to construct YT.Player:', initErr);
          playerInitPromiseRef.current = null;
        }
      };

      checkAndInit();
    });

    return playerInitPromiseRef.current;
  }, [volume]);

  // Track progress ticker + fallback threshold detector
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const t = playerRef.current.getCurrentTime();
          const d = playerRef.current.getDuration();
          if (typeof t === 'number') setCurrentTime(t || 0);
          if (typeof d === 'number' && d > 0) setDuration(d);

          // Fallback autoplay trigger: if track reaches within 0.5s of the end and has not transitioned
          if (typeof d === 'number' && d > 5 && typeof t === 'number' && t > 0 && (d - t <= 0.6) && !isTransitioningRef.current) {
            isTransitioningRef.current = true;
            if (handleSongEndedRef.current) {
              handleSongEndedRef.current();
            }
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 3000);
          }
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
    if (!isAutoplayRef.current) return;
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

    isTransitioningRef.current = false;
    currentSongRef.current = song;
    setCurrentSong(song);
    setIsLoading(true);
    setCurrentTime(0);

    // Save to history (real-time UI, local storage & Hostinger MySQL database sync)
    if (addToHistoryRef.current) {
      addToHistoryRef.current(song);
    } else {
      storage.addToHistory(song);
      const currentUser = userRef.current || user || storage.getUser();
      if (currentUser?.email || currentUser?.dbId || currentUser?.id) {
        const identifier = currentUser.dbId || currentUser.email || currentUser.id;
        api.recordHistory(identifier, song, currentUser.email).catch(console.warn);
      }
    }

    let initialQueue = [song];
    let initialIdx = 0;

    if (customQueue && Array.isArray(customQueue) && customQueue.length > 0) {
      initialQueue = customQueue;
      const idx = customQueue.findIndex(s => s.videoId === song.videoId);
      initialIdx = idx !== -1 ? idx : 0;
      queueRef.current = customQueue;
      queueIndexRef.current = initialIdx;
      setQueue(customQueue);
      setQueueIndex(initialIdx);
    } else {
      queueRef.current = [song];
      queueIndexRef.current = 0;
      setQueue([song]);
      setQueueIndex(0);
    }

    ensurePlayer(song.videoId).then(player => {
      if (player && typeof player.playVideo === 'function') {
        player.playVideo();
      }
    });

    // Auto-expand queue if small so queue is never just 1 song!
    if (isAutoplayRef.current && (initialQueue.length <= 2 || initialIdx >= initialQueue.length - 2)) {
      fetchAndAppendRelated(song);
    }
  }, [ensurePlayer, fetchAndAppendRelated]);

  // Play song directly by YouTube videoId (used for shared URLs & deep links)
  const playByVideoId = useCallback(async (videoId) => {
    if (!videoId) return;

    if (currentSongRef.current?.videoId === videoId) {
      if (!isPlaying) {
        if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      }
      return;
    }

    setIsLoading(true);

    let songData = null;
    try {
      songData = await Promise.race([
        api.getSong(videoId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 800))
      ]);
    } catch {}

    const songToPlay = (songData && songData.title) ? songData : {
      videoId,
      title: 'Playing Track',
      artist: 'FreeSong.in',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      thumbnailLow: `https://i.ytimg.com/vi/${videoId}/default.jpg`,
      duration: 0,
      durationText: '',
      type: 'song'
    };

    playSong(songToPlay);

    // If placeholder was initially loaded, enrich with full metadata in background
    if (!songData || !songData.title) {
      api.getSong(videoId).then(fullData => {
        if (fullData && fullData.title) {
          setCurrentSong(prev => (prev && prev.videoId === videoId ? { ...prev, ...fullData } : prev));
          setQueue(prevQ => prevQ.map(s => (s.videoId === videoId ? { ...s, ...fullData } : s)));
        }
      }).catch(() => {});
    }

    // Attach one-time interaction unblocker for browser autoplay restrictions
    const unblockPlayback = () => {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
    };
    window.addEventListener('click', unblockPlayback, { once: true, capture: true });
    window.addEventListener('touchend', unblockPlayback, { once: true, capture: true });
  }, [playSong, isPlaying]);

  // Auto-fetch next batch of songs when approaching the end of queue
  useEffect(() => {
    if (isAutoplay && queue.length > 0 && queueIndex >= queue.length - 2) {
      const activeSong = queue[queueIndex] || currentSong;
      if (activeSong) {
        fetchAndAppendRelated(activeSong);
      }
    }
  }, [isAutoplay, queueIndex, queue.length, currentSong, fetchAndAppendRelated]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const toggleAutoplay = useCallback(() => {
    setIsAutoplay(prev => !prev);
  }, []);

  const nextSong = useCallback(async () => {
    const currentQ = queueRef.current;
    const currentIdx = queueIndexRef.current;
    const currentShuffle = isShuffleRef.current;
    const currentRepeat = repeatModeRef.current;

    if (!currentQ || currentQ.length === 0) return;

    let nextIdx = currentIdx + 1;
    if (currentShuffle) {
      if (currentQ.length > 1) {
        let randomIdx = Math.floor(Math.random() * currentQ.length);
        while (randomIdx === currentIdx && currentQ.length > 1) {
          randomIdx = Math.floor(Math.random() * currentQ.length);
        }
        nextIdx = randomIdx;
      } else {
        nextIdx = 0;
      }
    }

    if (nextIdx >= currentQ.length) {
      if (currentRepeat === 'all') {
        nextIdx = 0;
      } else if (isAutoplayRef.current) {
        // Continuous playback: Attempt fetching more songs or loop to beginning
        const activeSong = currentSongRef.current || currentQ[currentQ.length - 1];
        if (activeSong?.videoId && !isFetchingRelatedRef.current) {
          isFetchingRelatedRef.current = true;
          try {
            const res = await api.getRelatedSongs(activeSong.videoId, activeSong.artist);
            if (res && Array.isArray(res.songs) && res.songs.length > 0) {
              const existingIds = new Set(currentQ.map(s => s.videoId));
              const newSongs = res.songs.filter(s => !existingIds.has(s.videoId));
              if (newSongs.length > 0) {
                const updatedQueue = [...currentQ, ...newSongs.slice(0, 15)];
                queueRef.current = updatedQueue;
                queueIndexRef.current = nextIdx;
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
      } else {
        setIsPlaying(false);
        return;
      }
    }

    const nextTrack = currentQ[nextIdx];
    if (nextTrack) {
      queueIndexRef.current = nextIdx;
      setQueueIndex(nextIdx);
      playSong(nextTrack, currentQ);
    }
  }, [playSong]);

  // Keep nextSongRef updated
  useEffect(() => {
    nextSongRef.current = nextSong;
  }, [nextSong]);

  // Handle track ending
  const handleSongEnded = useCallback(() => {
    const timer = sleepTimerRef.current;
    if (timer?.type === 'end_of_song') {
      setSleepTimerState(null);
      setIsPlaying(false);
      if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo();
      return;
    }

    const currentRepeat = repeatModeRef.current;
    if (currentRepeat === 'one') {
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      }
      return;
    }

    if (nextSongRef.current) {
      nextSongRef.current();
    }
  }, []);

  // Keep handleSongEndedRef updated
  useEffect(() => {
    handleSongEndedRef.current = handleSongEnded;
  }, [handleSongEnded]);

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

  const playNextSongs = useCallback((songs) => {
    if (!songs || !songs.length) return;
    setQueue(prev => {
      if (prev.length === 0) {
        playSong(songs[0], songs);
        return songs;
      }
      const newQueue = [...prev];
      const insertAt = queueIndex >= 0 ? queueIndex + 1 : 0;
      newQueue.splice(insertAt, 0, ...songs);
      return newQueue;
    });
  }, [queueIndex, playSong]);

  const addSongsToQueue = useCallback((songs) => {
    if (!songs || !songs.length) return;
    setQueue(prev => [...prev, ...songs]);
  }, []);

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

    const currentQ = queueRef.current;
    const currentIdx = queueIndexRef.current;
    if (!currentQ || currentQ.length === 0) return;

    const prevIdx = currentIdx - 1 >= 0 ? currentIdx - 1 : currentQ.length - 1;
    const prevTrack = currentQ[prevIdx];
    if (prevTrack) {
      queueIndexRef.current = prevIdx;
      setQueueIndex(prevIdx);
      playSong(prevTrack, currentQ);
    }
  }, [currentTime, playSong]);

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
        playByVideoId,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
        setVolumeLevel,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        addSongsToQueue,
        removeFromQueue,
        clearQueue,
        playNext,
        playNextSongs,
        startRadio,
        sleepTimer,
        setSleepTimer,
        setIsFullScreen,
        setIsQueueOpen,
        isAutoplay,
        toggleAutoplay,
        setIsAutoplay
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
