import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { trackPlay } from '../services/analyticsService';
import { useAuth } from './AuthContext';
import { useLibrary } from './LibraryContext';

const PlayerContext = createContext(null);

const QUALITY_MAP = {
  'high': 'hd1080',
  'normal': 'medium',
  'data-saver': 'small'
};

export function PlayerProvider({ children }) {
  const { user } = useAuth();
  const { addToHistory } = useLibrary();
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => storage.getSettings().volume ?? 1);
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
  const [audioQuality, setAudioQualityState] = useState(() => storage.getSettings().audioQuality || 'high');
  const [inactivityTimeout, setInactivityTimeoutState] = useState(() => {
    const val = storage.getSettings().inactivityTimeout;
    return val !== undefined ? Number(val) : 60;
  });
  const [isInactiveModalOpen, setIsInactiveModalOpen] = useState(false);
  const [stableVolume, setStableVolumeState] = useState(() => storage.getSettings().stableVolume === true);
  const [crossfade, setCrossfadeState] = useState(() => Math.min(8, Number(storage.getSettings().crossfade) || 0));

  const audioQualityRef = useRef(audioQuality);
  const inactivityTimeoutRef = useRef(inactivityTimeout);
  const lastInteractionTimeRef = useRef(Date.now());

  const playerRef = useRef(null);
  const playerInitPromiseRef = useRef(null);
  const progressTimerRef = useRef(null);
  const sleepTimerTimeoutRef = useRef(null);
  const ytApiReadyRef = useRef(false);
  const isFetchingRelatedRef = useRef(false);
  const fetchedVideoIdsRef = useRef(new Set());
  const isTransitioningRef = useRef(false);
  const isAutoplayRef = useRef(true);
  const isPlayingRef = useRef(false);
  const volumeRef = useRef(volume);
  const stableVolumeRef = useRef(stableVolume);
  const crossfadeRef = useRef(crossfade);
  const crossfadeTokenRef = useRef(0);
  const crossfadeRampRef = useRef(null);
  const fadeInRampRef = useRef(null);
  const lastFadedVideoIdRef = useRef(null);

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
  const playSongRef = useRef(null);
  const historyRecordedVideoIdRef = useRef(null);
  const volumeSaveTimeoutRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    addToHistoryRef.current = addToHistory;
  }, [addToHistory]);

  useEffect(() => {
    isAutoplayRef.current = isAutoplay;
  }, [isAutoplay]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    stableVolumeRef.current = stableVolume;
  }, [stableVolume]);

  useEffect(() => {
    crossfadeRef.current = crossfade;
  }, [crossfade]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Convert raw volume into effective volume (applies stable-volume leveling)
  const computeEffectiveVolume = useCallback((vol) => {
    let effective = Math.max(0, Math.min(1, vol));
    if (stableVolumeRef.current && effective > 0) {
      effective = effective <= 0.5 ? effective * 1.15 : 0.575 + (effective - 0.5) * 0.55;
    }
    return effective;
  }, []);

  // Apply volume to the YT player with optional stable-volume leveling
  const applyPlayerVolume = useCallback((vol) => {
    const target = playerRef.current;
    if (!target || typeof target.setVolume !== 'function') return;
    target.setVolume(Math.round(computeEffectiveVolume(vol) * 100));
  }, [computeEffectiveVolume]);

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

  // Background playback keep-alive: YouTube IFrame pauses when the page is hidden on
  // mobile browsers. Auto-resume via playVideo() retries keeps audio streaming in the
  // background (works on Android Chrome; iOS Safari blocks web background audio by
  // platform design).
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') return;
      if (!isPlayingRef.current) return;

      const player = playerRef.current;
      if (!player) return;

      let attempts = 0;
      const tryResume = () => {
        let state = -1;
        try { state = player.getPlayerState(); } catch (e) {}
        if (state === 1) return;
        try { player.playVideo(); } catch (e) {}
        attempts += 1;
        if (attempts < 5) setTimeout(tryResume, 500);
      };
      setTimeout(tryResume, 300);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Quick fade-in during the first moments of a newly started track when crossfade is enabled
  const maybeStartFadeIn = useCallback((player) => {
    const cf = Number(crossfadeRef.current) || 0;
    if (cf <= 0 || crossfadeRampRef.current) return;
    let vid = null;
    try { vid = player.getVideoData ? player.getVideoData().videoId : null; } catch (e) {}
    if (!vid || vid === lastFadedVideoIdRef.current) return;
    lastFadedVideoIdRef.current = vid;
    if (fadeInRampRef.current) {
      clearInterval(fadeInRampRef.current);
      fadeInRampRef.current = null;
    }
    const targetEff = computeEffectiveVolume(volumeRef.current);
    const fadeMs = Math.min(3000, Math.max(400, cf * 500));
    const start = performance.now();
    try { player.setVolume(0); } catch (e) {}
    fadeInRampRef.current = setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / fadeMs);
      try { player.setVolume(Math.round(targetEff * p)); } catch (e) {}
      if (p >= 1) {
        clearInterval(fadeInRampRef.current);
        fadeInRampRef.current = null;
      }
    }, 60);
  }, [computeEffectiveVolume]);

  // Shared state handler: only the active player drives global playback state
  const handlePlayerStateChange = useCallback((event) => {
    if (playerRef.current && event.target !== playerRef.current) return;

    // YT.PlayerState: 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 0 = ENDED
    if (event.data === 1) {
      setIsPlaying(true);
      setIsLoading(false);
      isTransitioningRef.current = false;
      if (event.target.getDuration) {
        setDuration(event.target.getDuration());
      }
      maybeStartFadeIn(event.target);
    } else if (event.data === 2) {
      setIsPlaying(false);
      setIsLoading(false);
      // Browser-forced pause while page is hidden (mobile background) → auto-resume once
      const isHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
      if (isHidden && !isTransitioningRef.current && !crossfadeRampRef.current) {
        setTimeout(() => {
          try { event.target.playVideo(); } catch (e) {}
        }, 400);
      }
    } else if (event.data === 3) {
      setIsLoading(true);
    } else if (event.data === 0) {
      // Track ended: clear any running fade ramp, restore volume, then advance.
      // A stale ramp used to keep the player at volume 0 ("sudden stop" bug).
      const ramp = crossfadeRampRef.current;
      if (ramp) {
        if (ramp.intervalId) clearInterval(ramp.intervalId);
        crossfadeRampRef.current = null;
        applyPlayerVolume(volumeRef.current);
        isTransitioningRef.current = false;
      }
      if (handleSongEndedRef.current) {
        handleSongEndedRef.current();
      }
    }
  }, [applyPlayerVolume]);

  // Shared error handler: only the active player triggers skip-to-next
  const handlePlayerError = useCallback((event) => {
    if (playerRef.current && event.target !== playerRef.current) return;
    console.warn('YT Player error:', event.data);
    setIsLoading(false);
    playerInitPromiseRef.current = null;
    setTimeout(() => {
      if (nextSongRef.current) {
        nextSongRef.current();
      }
    }, 1000);
  }, []);

  // ─── Crossfade Engine (simple & bulletproof) ──────────────────────────────
  // Fade-out the current track over its final seconds, switch instantly at the end,
  // fade-in the next track. Single player = no stuck states, no dead air, instant advance.

  // Cancel any running fade and restore normal volume
  const abortCrossfade = useCallback(() => {
    crossfadeTokenRef.current += 1;
    const ramp = crossfadeRampRef.current;
    if (ramp) {
      if (ramp.intervalId) clearInterval(ramp.intervalId);
      crossfadeRampRef.current = null;
    }
    if (fadeInRampRef.current) {
      clearInterval(fadeInRampRef.current);
      fadeInRampRef.current = null;
    }
    applyPlayerVolume(volumeRef.current);
    isTransitioningRef.current = false;
  }, [applyPlayerVolume]);

  // Natural song ending: fade the current track out over its final `cf` seconds
  const startEndFadeOut = useCallback((remainingSec) => {
    const player = playerRef.current;
    if (!player || typeof player.setVolume !== 'function') {
      isTransitioningRef.current = false;
      return;
    }
    isTransitioningRef.current = true;
    const token = crossfadeTokenRef.current;
    const cfMs = (Number(crossfadeRef.current) || 0) * 1000;
    const rampMs = Math.max(300, Math.min(cfMs, remainingSec * 1000 - 200));
    const baseEff = computeEffectiveVolume(volumeRef.current);
    const start = performance.now();
    const intervalId = setInterval(() => {
      if (token !== crossfadeTokenRef.current) {
        clearInterval(intervalId);
        return;
      }
      const p = Math.min(1, (performance.now() - start) / rampMs);
      try { player.setVolume(Math.round(baseEff * (1 - p))); } catch (e) {}
      if (p >= 1) {
        clearInterval(intervalId);
        // Guard: if the track keeps playing past the estimated end (bad duration estimate),
        // bring the audio back but do not re-trigger the fade; state 0 will advance.
        setTimeout(() => {
          if (token !== crossfadeTokenRef.current) return;
          let state = -1;
          try { state = player.getPlayerState ? player.getPlayerState() : -1; } catch (e) {}
          if (state === 1) {
            applyPlayerVolume(volumeRef.current);
          }
        }, 1200);
      }
    }, 60);
    crossfadeRampRef.current = { intervalId, token };
  }, [computeEffectiveVolume, applyPlayerVolume]);

  // Manual skip / auto-advance: quick fade-out (≤400ms), instant switch, new track fades in
  const crossfadeToTrack = useCallback((track, nextIdx) => {
    const cf = Number(crossfadeRef.current) || 0;
    if (cf <= 0 || !track?.videoId || !playerRef.current) return false;
    if (!isPlayingRef.current) return false;
    if (repeatModeRef.current === 'one' || sleepTimerRef.current?.type === 'end_of_song') return false;

    const player = playerRef.current;
    const token = ++crossfadeTokenRef.current;

    // Track already ended (natural end) → switch instantly, zero delay
    let state = -1;
    try { state = player.getPlayerState ? player.getPlayerState() : -1; } catch (e) {}
    if (state === 0 || state === 5 || state === -1) {
      queueIndexRef.current = nextIdx;
      setQueueIndex(nextIdx);
      if (playSongRef.current) playSongRef.current(track, queueRef.current);
      return true;
    }

    const baseEff = computeEffectiveVolume(volumeRef.current);
    const fadeMs = Math.min(400, cf * 1000);
    const start = performance.now();
    const intervalId = setInterval(() => {
      if (token !== crossfadeTokenRef.current) {
        clearInterval(intervalId);
        return;
      }
      const p = Math.min(1, (performance.now() - start) / fadeMs);
      try { player.setVolume(Math.round(baseEff * (1 - p))); } catch (e) {}
      if (p >= 1) {
        clearInterval(intervalId);
        if (token !== crossfadeTokenRef.current) return;
        crossfadeRampRef.current = null;
        isTransitioningRef.current = false;
        queueIndexRef.current = nextIdx;
        setQueueIndex(nextIdx);
        if (playSongRef.current) playSongRef.current(track, queueRef.current);
      }
    }, 40);
    crossfadeRampRef.current = { intervalId, token };
    return true;
  }, [computeEffectiveVolume]);

  // Initialize YT Player on container
  const ensurePlayer = useCallback((videoId) => {
    const quality = QUALITY_MAP[audioQualityRef.current] || 'hd1080';

    // If player is already initialized and functional
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById({
          videoId,
          suggestedQuality: quality
        });
        if (typeof playerRef.current.setPlaybackQuality === 'function') {
          playerRef.current.setPlaybackQuality(quality);
        }
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
            player.loadVideoById({
              videoId,
              suggestedQuality: quality
            });
            if (typeof player.setPlaybackQuality === 'function') {
              player.setPlaybackQuality(quality);
            }
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
                applyPlayerVolume(volumeRef.current);
                if (typeof event.target.setPlaybackQuality === 'function') {
                  event.target.setPlaybackQuality(quality);
                }
                event.target.playVideo();
                resolve(event.target);
              },
              onStateChange: handlePlayerStateChange,
              onError: handlePlayerError
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
  }, [volume, applyPlayerVolume, handlePlayerStateChange, handlePlayerError]);

  // Track progress ticker + fallback threshold detector
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const t = playerRef.current.getCurrentTime();
          const d = playerRef.current.getDuration();
          if (typeof t === 'number') setCurrentTime(t || 0);
          if (typeof d === 'number' && d > 0) setDuration(d);

          // Record history only after the song has actually played 10+ seconds
          // (once per song; skips & quick switches never count as plays)
          if (
            currentSongRef.current?.videoId &&
            historyRecordedVideoIdRef.current !== currentSongRef.current.videoId &&
            t >= 10
          ) {
            historyRecordedVideoIdRef.current = currentSongRef.current.videoId;
            const playedSong = currentSongRef.current;
            if (addToHistoryRef.current) {
              addToHistoryRef.current(playedSong);
            } else {
              storage.addToHistory(playedSong);
              const currentUser = userRef.current || storage.getUser();
              if (currentUser?.email || currentUser?.dbId || currentUser?.id) {
                const identifier = currentUser.dbId || currentUser.email || currentUser.id;
                api.recordHistory(identifier, playedSong, currentUser.email).catch(console.warn);
              }
            }
          }

          // Crossfade trigger: fade the current track out over its final N seconds
          const cf = Number(crossfadeRef.current) || 0;
          if (cf > 0 && !isTransitioningRef.current && d > cf + 2 && t > 0 && (d - t) <= cf) {
            startEndFadeOut(d - t);
          }

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
  }, [isPlaying, startEndFadeOut]);

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

    abortCrossfade();
    isTransitioningRef.current = false;
    currentSongRef.current = song;
    setCurrentSong(song);
    setIsLoading(true);
    setCurrentTime(0);

    // History is recorded by the progress ticker only after 10+ seconds of playback
    historyRecordedVideoIdRef.current = null;

    // Track play for GAnalytics (fire and forget)
    trackPlay(song, userRef.current || user || storage.getUser());

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

    // Restore normal volume (a crossfade fade-out may have left it low)
    applyPlayerVolume(volumeRef.current);

    ensurePlayer(song.videoId).then(player => {
      if (player && typeof player.playVideo === 'function') {
        player.playVideo();
      }
    });

    // Auto-expand queue if small so queue is never just 1 song!
    if (isAutoplayRef.current && (initialQueue.length <= 2 || initialIdx >= initialQueue.length - 2)) {
      fetchAndAppendRelated(song);
    }
  }, [ensurePlayer, fetchAndAppendRelated, abortCrossfade, applyPlayerVolume]);

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
    abortCrossfade();
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying, abortCrossfade]);

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
      // Crossfade enabled: blend gradually into the next track instead of an instant switch
      if (Number(crossfadeRef.current) > 0) {
        const blended = await crossfadeToTrack(nextTrack, nextIdx);
        if (blended) return;
      }
      queueIndexRef.current = nextIdx;
      setQueueIndex(nextIdx);
      playSong(nextTrack, currentQ);
    }
  }, [playSong, crossfadeToTrack]);

  // Keep nextSongRef updated
  useEffect(() => {
    nextSongRef.current = nextSong;
  }, [nextSong]);

  // Keep playSongRef updated (used by the crossfade engine for instant switches)
  useEffect(() => {
    playSongRef.current = playSong;
  }, [playSong]);

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
      abortCrossfade();
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, [abortCrossfade]);

  const setVolumeLevel = useCallback((val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    setIsMuted(clamped === 0);
    applyPlayerVolume(clamped);
    // Debounce localStorage write — a write on every drag tick makes the slider feel laggy
    if (volumeSaveTimeoutRef.current) clearTimeout(volumeSaveTimeoutRef.current);
    volumeSaveTimeoutRef.current = setTimeout(() => {
      storage.saveSettings({ ...storage.getSettings(), volume: clamped });
    }, 400);
  }, [applyPlayerVolume]);

  // Imperative-only volume apply (zero React re-renders) — used by slider drag for buttery
  // smoothness; state is committed afterwards via setVolumeLevel on drag end
  const setVolumeDirect = useCallback((val) => {
    const clamped = Math.max(0, Math.min(1, val));
    applyPlayerVolume(clamped);
  }, [applyPlayerVolume]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      setVolumeLevel(volume || 1);
    } else {
      setIsMuted(true);
      if (playerRef.current?.setVolume) playerRef.current.setVolume(0);
    }
  }, [isMuted, volume, setVolumeLevel]);

  const setStableVolume = useCallback((enabled) => {
    const val = Boolean(enabled);
    setStableVolumeState(val);
    stableVolumeRef.current = val;
    storage.saveSettings({ ...storage.getSettings(), stableVolume: val });
    applyPlayerVolume(volumeRef.current);
  }, [applyPlayerVolume]);

  // Configure crossfade seconds (0 = off, max 8s)
  const setCrossfade = useCallback((seconds) => {
    const val = Math.max(0, Math.min(8, Number(seconds) || 0));
    setCrossfadeState(val);
    crossfadeRef.current = val;
    storage.saveSettings({ ...storage.getSettings(), crossfade: val });
    if (val === 0) {
      abortCrossfade();
    }
  }, [abortCrossfade]);

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

  // Update real audio streaming quality
  const setAudioQuality = useCallback((quality) => {
    setAudioQualityState(quality);
    audioQualityRef.current = quality;
    const currentSettings = storage.getSettings();
    storage.saveSettings({ ...currentSettings, audioQuality: quality });
    if (playerRef.current && typeof playerRef.current.setPlaybackQuality === 'function') {
      try {
        playerRef.current.setPlaybackQuality(QUALITY_MAP[quality] || 'hd1080');
      } catch (err) {
        console.warn('Set playback quality warning:', err);
      }
    }
  }, []);

  // Update inactivity timeout minutes
  const setInactivityTimeout = useCallback((mins) => {
    const num = Number(mins);
    setInactivityTimeoutState(num);
    inactivityTimeoutRef.current = num;
    const currentSettings = storage.getSettings();
    storage.saveSettings({ ...currentSettings, inactivityTimeout: num });
  }, []);

  // Track global user interactions across page
  useEffect(() => {
    const handleUserActivity = () => {
      lastInteractionTimeRef.current = Date.now();
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'pointerdown'];
    activityEvents.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, handleUserActivity));
    };
  }, []);

  // Monitor auto-inactivity timeout while audio is playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const timeoutMins = inactivityTimeoutRef.current;
      if (timeoutMins <= 0) return; // 0 = Never / Disabled

      const elapsedMins = (Date.now() - lastInteractionTimeRef.current) / (60 * 1000);
      if (elapsedMins >= timeoutMins) {
        console.log(`[Player] Pausing playback: Inactive for ${Math.round(elapsedMins)}m (timeout: ${timeoutMins}m)`);
        if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
        setIsPlaying(false);
        setIsInactiveModalOpen(true);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Resume playback from inactivity modal
  const resumeFromInactivity = useCallback(() => {
    lastInteractionTimeRef.current = Date.now();
    setIsInactiveModalOpen(false);
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, []);

  // Dismiss inactivity modal
  const dismissInactiveModal = useCallback(() => {
    lastInteractionTimeRef.current = Date.now();
    setIsInactiveModalOpen(false);
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
        stableVolume,
        setStableVolume,
        crossfade,
        setCrossfade,
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
        setVolumeDirect,
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
        setIsAutoplay,
        audioQuality,
        setAudioQuality,
        inactivityTimeout,
        setInactivityTimeout,
        isInactiveModalOpen,
        resumeFromInactivity,
        dismissInactiveModal
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
