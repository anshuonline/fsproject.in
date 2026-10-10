import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { trackPlay } from '../services/analyticsService';
import { useAuth } from './AuthContext';
import { useLibrary } from './LibraryContext';

const PlayerContext = createContext(null);

// Fast-changing playback progress lives in its own lightweight context so that
// the 500ms progress tick never re-renders pages, cards or shelves — only the
// player UIs (bar, fullscreen, PiP) subscribe to this.
const PlayerProgressContext = createContext(null);

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
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
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

  // ── Dual playback engine ─────────────────────────────────────────
  // Primary: JioSaavn stream via HTML5 <audio> (true background playback,
  // lock-screen MediaSession controls). Fallback: YouTube IFrame player.
  // Cast: Google Cast session (Default Media Receiver) — TV pe official
  // receiver controls ke saath; Saavn stream hi cast hota hai.
  const audioRef = useRef(null);              // hidden HTML5 audio singleton
  const activeEngineRef = useRef('yt');       // 'saavn' | 'yt' | 'cast'
  const playTokenRef = useRef(0);             // races: async stream fetch vs user skip
  const saavnCacheRef = useRef(new Map());    // videoId -> { streamUrl, ... }
  const startYtFallbackRef = useRef(null);    // late-bound YT fallback starter

  // ── Cast (Chromecast) refs ───────────────────────────────────────
  const castPlayerRef = useRef(null);         // cast.framework.RemotePlayer
  const castCtrlRef = useRef(null);           // RemotePlayerController
  const castSessionRef = useRef(null);        // current CastSession
  const transferToCastRef = useRef(null);     // late-bound cast transfer

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
  const prevSongRef = useRef(null);
  const seekToRef = useRef(null);
  const historyRecordedVideoIdRef = useRef(null);
  const volumeSaveTimeoutRef = useRef(null);
  const autoplayUnblockRef = useRef(null);
  const currentTimeRef = useRef(0);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

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

  // Apply volume to the active engine (YT / audio / cast) with stable-volume leveling
  const applyPlayerVolume = useCallback((vol) => {
    const effective = computeEffectiveVolume(vol);
    const target = playerRef.current;
    if (target && typeof target.setVolume === 'function') {
      target.setVolume(Math.round(effective * 100));
    }
    if (audioRef.current) {
      audioRef.current.volume = effective;
    }
    if (activeEngineRef.current === 'cast' && castPlayerRef.current && castCtrlRef.current) {
      try {
        castPlayerRef.current.volumeLevel = effective;
        castCtrlRef.current.setVolumeLevel();
      } catch (e) {}
    }
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
      // HTML5 audio engine keeps playing in background natively — only the
      // YouTube IFrame needs the visibility-change auto-resume workaround
      if (activeEngineRef.current !== 'yt') return;

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

  // ── HTML5 Audio engine (JioSaavn streams) ────────────────────────
  // A real <audio> element plays unthrottled in background tabs / locked
  // screens — this is what enables true mobile background playback.
  useEffect(() => {
    const a = new Audio();
    a.preload = 'auto';
    audioRef.current = a;

    const isActiveEngine = () => activeEngineRef.current === 'saavn';

    const onPlaying = () => {
      if (!isActiveEngine()) return;
      setIsPlaying(true);
      setIsLoading(false);
      isTransitioningRef.current = false;
      disarmAutoplayUnblock();
    };
    const onPause = () => {
      if (!isActiveEngine()) return;
      if (isTransitioningRef.current) return;
      setIsPlaying(false);
      setIsLoading(false);
    };
    const onWaiting = () => {
      if (!isActiveEngine()) return;
      setIsLoading(true);
    };
    const onTimeUpdate = () => {
      if (!isActiveEngine()) return;
      setCurrentTime(a.currentTime || 0);
      if (a.duration && isFinite(a.duration)) setDuration(a.duration);
    };
    const onEnded = () => {
      if (!isActiveEngine()) return;
      isTransitioningRef.current = false;
      if (handleSongEndedRef.current) handleSongEndedRef.current();
    };
    const onError = () => {
      if (!isActiveEngine()) return;
      console.warn('Saavn stream error — falling back to YouTube engine');
      setIsLoading(false);
      const song = currentSongRef.current;
      activeEngineRef.current = 'yt';
      if (song?.videoId && startYtFallbackRef.current) startYtFallbackRef.current(song);
    };

    a.addEventListener('playing', onPlaying);
    a.addEventListener('pause', onPause);
    a.addEventListener('waiting', onWaiting);
    a.addEventListener('timeupdate', onTimeUpdate);
    a.addEventListener('ended', onEnded);
    a.addEventListener('error', onError);

    return () => {
      try {
        a.pause();
        a.removeAttribute('src');
        a.load();
      } catch {}
      a.removeEventListener('playing', onPlaying);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('waiting', onWaiting);
      a.removeEventListener('timeupdate', onTimeUpdate);
      a.removeEventListener('ended', onEnded);
      a.removeEventListener('error', onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Autoplay unblock (reload restore path) ──────────────────────
  // Browsers block unmuted autoplay right after a page reload (?v= deep link).
  // These global listeners retry playVideo() on ANY user interaction (tap,
  // click, keypress) until playback actually starts, then disarm themselves.
  const disarmAutoplayUnblock = useCallback(() => {
    if (autoplayUnblockRef.current) {
      autoplayUnblockRef.current();
      autoplayUnblockRef.current = null;
    }
  }, []);

  const armAutoplayUnblock = useCallback(() => {
    if (autoplayUnblockRef.current) return;
    const attempt = () => {
      if (activeEngineRef.current === 'saavn') {
        const a = audioRef.current;
        if (!a) return;
        if (!a.paused) {
          disarmAutoplayUnblock();
          return;
        }
        try { a.play().catch(() => {}); } catch (e) {}
        return;
      }
      const player = playerRef.current;
      if (!player || typeof player.playVideo !== 'function') return;
      let state = -1;
      try { state = player.getPlayerState(); } catch (e) {}
      if (state === 1) {
        disarmAutoplayUnblock();
        return;
      }
      try { player.playVideo(); } catch (e) {}
    };
    const events = ['pointerdown', 'touchend', 'keydown', 'click'];
    events.forEach((evt) => window.addEventListener(evt, attempt, { capture: true }));
    autoplayUnblockRef.current = () => {
      events.forEach((evt) => window.removeEventListener(evt, attempt, { capture: true }));
    };
  }, [disarmAutoplayUnblock]);

  // Shared state handler: only the active player drives global playback state
  const handlePlayerStateChange = useCallback((event) => {
    if (activeEngineRef.current !== 'yt') return;
    if (playerRef.current && event.target !== playerRef.current) return;

    // YT.PlayerState: 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 0 = ENDED, 5 = CUED
    if (event.data === 1) {
      setIsPlaying(true);
      setIsLoading(false);
      isTransitioningRef.current = false;
      disarmAutoplayUnblock();
      if (event.target.getDuration) {
        setDuration(event.target.getDuration());
      }
    } else if (event.data === 2) {
      setIsPlaying(false);
      setIsLoading(false);
      // Browser-forced pause while page is hidden (mobile background) → auto-resume once
      const isHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
      if (isHidden && !isTransitioningRef.current) {
        setTimeout(() => {
          try { event.target.playVideo(); } catch (e) {}
        }, 400);
      }
    } else if (event.data === 3) {
      setIsLoading(true);
    } else if (event.data === 5) {
      // Video cued but not playing — browser blocked autoplay. Stop the infinite
      // loading spinner so the play button becomes clearly tappable.
      setIsPlaying(false);
      setIsLoading(false);
    } else if (event.data === 0) {
      isTransitioningRef.current = false;
      if (handleSongEndedRef.current) {
        handleSongEndedRef.current();
      }
    }
  }, []);

  // Shared error handler: only the active player triggers skip-to-next
  const handlePlayerError = useCallback((event) => {
    if (activeEngineRef.current !== 'yt') return;
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

  // ── Dual-engine playback core ────────────────────────────────────

  // Pause whichever engine is currently active
  const pauseActiveEngine = useCallback(() => {
    if (activeEngineRef.current === 'saavn') {
      try { audioRef.current?.pause(); } catch (e) {}
    } else if (activeEngineRef.current === 'cast') {
      const rp = castPlayerRef.current;
      const rc = castCtrlRef.current;
      if (rp && rc && !rp.isPaused) {
        try { rc.playOrPause(); } catch (e) {}
      }
    } else if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try { playerRef.current.pauseVideo(); } catch (e) {}
    }
  }, []);

  // Resume whichever engine is currently active
  const resumeActiveEngine = useCallback(() => {
    if (activeEngineRef.current === 'saavn') {
      const a = audioRef.current;
      if (a) {
        try {
          const p = a.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch (e) {}
      }
    } else if (activeEngineRef.current === 'cast') {
      const rp = castPlayerRef.current;
      const rc = castCtrlRef.current;
      if (rp && rc && rp.isPaused) {
        try { rc.playOrPause(); } catch (e) {}
      }
    } else if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      try { playerRef.current.playVideo(); } catch (e) {}
    }
  }, []);

  // Start playback through the YouTube IFrame engine
  const startYtPlayback = useCallback((song) => {
    if (!song?.videoId) return;
    activeEngineRef.current = 'yt';
    try { audioRef.current?.pause(); } catch (e) {}
    ensurePlayer(song.videoId).then(player => {
      if (player && typeof player.playVideo === 'function') {
        player.playVideo();
      }
    });
  }, [ensurePlayer]);
  startYtFallbackRef.current = startYtPlayback;

  // Try resolving a JioSaavn stream for the song (with session cache)
  const resolveSaavnStream = useCallback(async (song) => {
    if (!song?.videoId || !song?.title) return null;
    const cached = saavnCacheRef.current.get(song.videoId);
    if (cached) return cached;

    const bitrateMap = { high: 320, normal: 160, 'data-saver': 96 };
    const bitrate = bitrateMap[audioQualityRef.current] || 320;

    try {
      const match = await Promise.race([
        api.getSaavnStream(song, bitrate),
        new Promise((_, reject) => setTimeout(() => reject(new Error('saavn timeout')), 4000))
      ]);
      if (match?.streamUrl) {
        saavnCacheRef.current.set(song.videoId, match);
        // Keep the session cache bounded
        if (saavnCacheRef.current.size > 120) {
          const oldest = saavnCacheRef.current.keys().next().value;
          saavnCacheRef.current.delete(oldest);
        }
        return match;
      }
    } catch {
      // no match / timeout — caller falls back to YouTube
    }
    return null;
  }, []);

  // Start playback: JioSaavn HTML5 audio first, YouTube IFrame as fallback.
  // When a Cast session is active, the Saavn stream is cast to the TV instead.
  const startPlayback = useCallback(async (song) => {
    if (!song) return;
    const token = ++playTokenRef.current;

    const match = await resolveSaavnStream(song);

    // A newer play request superseded this one while we were resolving
    if (token !== playTokenRef.current) return;

    const castActive = Boolean(
      castSessionRef.current && window.cast?.framework && window.chrome?.cast
    );

    if (match?.streamUrl && castActive) {
      const ok = await transferToCastRef.current?.(song, match);
      if (ok) return;
      // Cast load failed — continue locally below
    }

    if (match?.streamUrl) {
      activeEngineRef.current = 'saavn';
      // Silence the YouTube engine before switching
      try {
        if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
          playerRef.current.stopVideo();
        }
      } catch (e) {}

      const a = audioRef.current || null;
      if (!a) {
        startYtPlayback(song);
        return;
      }
      a.volume = computeEffectiveVolume(volumeRef.current);
      a.src = match.streamUrl;
      try {
        const p = a.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (e) {
        startYtPlayback(song);
      }
    } else {
      startYtPlayback(song);
    }
  }, [resolveSaavnStream, startYtPlayback, computeEffectiveVolume]);

  // ── Cast (Chromecast) core ───────────────────────────────────────
  // Receiver: Google's Default Media Receiver — TV par official cast UI
  // dikhta hai (artwork, title, artist, play/pause, seek bar, volume).
  const transferToCast = useCallback(async (song, matchOverride = null) => {
    const session = castSessionRef.current;
    if (!session || !window.cast?.framework || !window.chrome?.cast) return false;

    const match = matchOverride || await resolveSaavnStream(song);
    if (!match?.streamUrl) return false;

    activeEngineRef.current = 'cast';
    // Silence local engines first
    try { audioRef.current?.pause(); } catch (e) {}
    try {
      if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
        playerRef.current.stopVideo();
      }
    } catch (e) {}

    try {
      const mediaInfo = new window.chrome.cast.media.MediaInfo(match.streamUrl, 'audio/mp4');
      mediaInfo.streamType = window.chrome.cast.media.StreamType.BUFFERED;

      const art = song.thumbnail ||
        (song.videoId ? `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg` : '/images/freesonglogowebp.webp');
      const metadata = new window.chrome.cast.media.MusicTrackMediaMetadata();
      metadata.title = song.title || 'FreeSong.in';
      metadata.artist = song.artist || '';
      metadata.albumName = song.album || 'FreeSong.in';
      metadata.images = [new window.chrome.cast.Image(art)];
      mediaInfo.metadata = metadata;
      if (match.duration > 0) mediaInfo.duration = match.duration;

      const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
      await session.loadMedia(request);

      setIsPlaying(true);
      setIsLoading(false);
      isTransitioningRef.current = false;
      return true;
    } catch (err) {
      console.warn('Cast loadMedia failed:', err);
      return false;
    }
  }, [resolveSaavnStream]);
  transferToCastRef.current = transferToCast;

  // After a cast session ends, seamlessly continue on the device at the
  // same position (using the cached Saavn stream when available)
  const resumeLocalAfterCast = useCallback(async (song, position = 0) => {
    const match = await resolveSaavnStream(song);
    if (!match?.streamUrl) {
      startYtPlayback(song);
      return;
    }
    activeEngineRef.current = 'saavn';
    const a = audioRef.current;
    if (!a) {
      startYtPlayback(song);
      return;
    }
    a.volume = computeEffectiveVolume(volumeRef.current);
    a.src = match.streamUrl;
    try {
      const p = a.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
      const seekTarget = Number(position) || 0;
      if (seekTarget > 1) {
        const applySeek = () => {
          try { a.currentTime = seekTarget; } catch (e) {}
          a.removeEventListener('loadedmetadata', applySeek);
        };
        a.addEventListener('loadedmetadata', applySeek);
      }
    } catch (e) {
      startYtPlayback(song);
    }
  }, [resolveSaavnStream, startYtPlayback, computeEffectiveVolume]);

  // Cast SDK bootstrap: script load + session/remote-player event wiring
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const initCast = () => {
      if (!window.cast?.framework || !window.chrome?.cast) return;
      if (castCtrlRef.current) return; // already initialized

      try {
        const ctx = cast.framework.CastContext.getInstance();
        // CC1AD845 = Google's published Default Media Receiver sample app.
        // TV pe default cast controls render hote hain (artwork/seek/volume).
        // Apna registered receiver ID yahan replace kar sakte ho.
        ctx.setOptions({
          receiverApplicationId: 'CC1AD845',
          autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          language: 'en-IN'
        });

        const remotePlayer = new cast.framework.RemotePlayer();
        const remoteCtrl = new cast.framework.RemotePlayerController(remotePlayer);
        castPlayerRef.current = remotePlayer;
        castCtrlRef.current = remoteCtrl;

        // Play/pause state from the cast device drives the global UI state
        remoteCtrl.addEventListener(
          cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED,
          () => {
            if (activeEngineRef.current !== 'cast') return;
            setIsPlaying(!remotePlayer.isPaused);
            setIsLoading(false);
            isTransitioningRef.current = false;
          }
        );
        remoteCtrl.addEventListener(
          cast.framework.RemotePlayerEventType.DURATION_CHANGED,
          () => {
            if (activeEngineRef.current !== 'cast') return;
            const d = remotePlayer.duration || 0;
            if (d > 0) setDuration(d);
          }
        );

        ctx.addEventListener(
          cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          (event) => {
            const { sessionState } = event;
            if (
              sessionState === cast.framework.SessionState.SESSION_STARTED ||
              sessionState === cast.framework.SessionState.SESSION_RESUMED
            ) {
              castSessionRef.current = ctx.getCurrentSession();
              try { window.dispatchEvent(new CustomEvent('fs_cast_state', { detail: { connected: true } })); } catch (e) {}
              // Transfer whatever is currently loaded to the TV
              const song = currentSongRef.current;
              if (song) transferToCastRef.current?.(song);
            } else if (
              sessionState === cast.framework.SessionState.SESSION_ENDED ||
              sessionState === cast.framework.SessionState.SESSION_INTERRUPTED
            ) {
              const resumeAt = castPlayerRef.current?.currentTime || 0;
              castSessionRef.current = null;
              try { window.dispatchEvent(new CustomEvent('fs_cast_state', { detail: { connected: false } })); } catch (e) {}
              if (activeEngineRef.current === 'cast') {
                const song = currentSongRef.current;
                activeEngineRef.current = 'saavn';
                setIsPlaying(false);
                if (song) resumeLocalAfterCast(song, resumeAt);
              }
            }
          }
        );

        window.dispatchEvent(new CustomEvent('fs_cast_ready'));
      } catch (err) {
        console.warn('Cast init failed:', err);
      }
    };

    if (window.cast?.framework && window.chrome?.cast) {
      initCast();
      return undefined;
    }

    // Callback must be registered before the SDK script loads
    const prevHandler = window.__onGCastApiAvailable;
    window.__onGCastApiAvailable = (available) => {
      if (typeof prevHandler === 'function') prevHandler(available);
      if (available) initCast();
      else console.warn('Google Cast framework not available on this browser');
    };

    if (!document.getElementById('fs-cast-sdk')) {
      const script = document.createElement('script');
      script.id = 'fs-cast-sdk';
      script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
      script.async = true;
      document.head.appendChild(script);
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeLocalAfterCast]);

  // Track progress ticker + fallback threshold detector
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = setInterval(() => {
        let t = 0;
        let d = 0;

        if (activeEngineRef.current === 'saavn') {
          const a = audioRef.current;
          if (!a) return;
          t = a.currentTime || 0;
          d = (a.duration && isFinite(a.duration)) ? a.duration : 0;
          setCurrentTime(t);
          if (d > 0) setDuration(d);
        } else if (activeEngineRef.current === 'cast') {
          const rp = castPlayerRef.current;
          if (!rp) return;
          t = rp.currentTime || 0;
          d = rp.duration || 0;
          setCurrentTime(t);
          if (d > 0) setDuration(d);
          // Safety net: if the receiver reports paused but UI thinks playing
          if (rp.isPaused && isPlayingRef.current) setIsPlaying(false);
        } else if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          t = playerRef.current.getCurrentTime() || 0;
          d = playerRef.current.getDuration() || 0;
          if (typeof t === 'number') setCurrentTime(t || 0);
          if (typeof d === 'number' && d > 0) setDuration(d);
        } else {
          return;
        }

        // Lock-screen position sync
        if ('mediaSession' in navigator && d > 0) {
          try {
            navigator.mediaSession.setPositionState({
              duration: d,
              playbackRate: activeEngineRef.current === 'saavn' ? (audioRef.current?.playbackRate || 1) : 1,
              position: Math.min(t, d)
            });
          } catch (e) {}
        }

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

    // User-initiated playback replaces any pending autoplay-restore unblocking
    disarmAutoplayUnblock();

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

    startPlayback(song);

    // Auto-expand queue if small so queue is never just 1 song!
    if (isAutoplayRef.current && (initialQueue.length <= 2 || initialIdx >= initialQueue.length - 2)) {
      fetchAndAppendRelated(song);
    }
  }, [startPlayback, fetchAndAppendRelated, disarmAutoplayUnblock]);

  // Play song directly by YouTube videoId (used for shared URLs & deep links)
  const playByVideoId = useCallback(async (videoId) => {
    if (!videoId) return;

    if (currentSongRef.current?.videoId === videoId) {
      if (!isPlayingRef.current) {
        resumeActiveEngine();
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

    // Arm interaction unblocker for browser autoplay restrictions — any tap,
    // click or keypress retries playVideo() until playback actually starts
    armAutoplayUnblock();

    // Autoplay-block watchdog: if the browser silently blocked playback, stop
    // the infinite loading spinner so the play button becomes clearly tappable
    setTimeout(() => {
      if (activeEngineRef.current === 'cast') return; // state driven by cast events
      if (activeEngineRef.current === 'saavn') {
        const a = audioRef.current;
        if (a && a.paused && !a.ended) {
          setIsPlaying(false);
          setIsLoading(false);
        }
        return;
      }
      const player = playerRef.current;
      if (!player || typeof player.getPlayerState !== 'function') return;
      let state = -1;
      try { state = player.getPlayerState(); } catch (e) {}
      if (state !== 1 && state !== 3) {
        setIsPlaying(false);
        setIsLoading(false);
      }
    }, 4000);
  }, [playSong, armAutoplayUnblock, resumeActiveEngine]);

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
    if (activeEngineRef.current === 'saavn') {
      const a = audioRef.current;
      if (!a) return;
      if (isPlayingRef.current) {
        try { a.pause(); } catch (e) {}
      } else {
        try {
          const p = a.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch (e) {}
      }
      return;
    }
    if (activeEngineRef.current === 'cast') {
      const rc = castCtrlRef.current;
      if (rc) {
        try { rc.playOrPause(); } catch (e) {}
      }
      return;
    }
    if (!playerRef.current) return;
    if (isPlayingRef.current) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, []);

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
      pauseActiveEngine();
      return;
    }

    const currentRepeat = repeatModeRef.current;
    if (currentRepeat === 'one') {
      if (activeEngineRef.current === 'saavn') {
        const a = audioRef.current;
        if (a) {
          try {
            a.currentTime = 0;
            const p = a.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          } catch (e) {}
        }
      } else if (activeEngineRef.current === 'cast') {
        // Receiver is idle after ended — reload the same track on the TV
        const song = currentSongRef.current;
        if (song) transferToCastRef.current?.(song);
      } else if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      }
      return;
    }

    if (nextSongRef.current) {
      nextSongRef.current();
    }
  }, [pauseActiveEngine]);

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
      pauseActiveEngine();
      setIsPlaying(false);
      setSleepTimerState(null);
    }, mins * 60 * 1000);
  }, [pauseActiveEngine]);

  const prevSong = useCallback(() => {
    if (currentTimeRef.current > 4) {
      if (activeEngineRef.current === 'saavn' && audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        return;
      }
      if (activeEngineRef.current === 'cast' && castPlayerRef.current && castCtrlRef.current) {
        try {
          castPlayerRef.current.currentTime = 0;
          castCtrlRef.current.seek();
          setCurrentTime(0);
        } catch (e) {}
        return;
      }
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(0);
        setCurrentTime(0);
        return;
      }
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
  }, [playSong]);

  const seekTo = useCallback((seconds) => {
    if (activeEngineRef.current === 'saavn') {
      const a = audioRef.current;
      if (a) {
        try {
          a.currentTime = seconds;
          setCurrentTime(seconds);
        } catch (e) {}
      }
      return;
    }
    if (activeEngineRef.current === 'cast') {
      const rp = castPlayerRef.current;
      const rc = castCtrlRef.current;
      if (rp && rc) {
        try {
          rp.currentTime = seconds;
          rc.seek();
          setCurrentTime(seconds);
        } catch (e) {}
      }
      return;
    }
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  // Keep prevSong / seekTo refs updated (used by MediaSession handlers)
  useEffect(() => {
    prevSongRef.current = prevSong;
    seekToRef.current = seekTo;
  }, [prevSong, seekTo]);

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
      if (activeEngineRef.current === 'cast' && castPlayerRef.current && castCtrlRef.current) {
        try {
          castPlayerRef.current.isMuted = true;
          castCtrlRef.current.muteOrUnmute();
        } catch (e) {}
      }
      if (audioRef.current) audioRef.current.volume = 0;
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

  const toggleMiniPlayer = useCallback(() => {
    setIsMiniPlayer(prev => !prev);
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
    // Next Saavn resolutions pick up the new bitrate
    saavnCacheRef.current.clear();
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
        pauseActiveEngine();
        setIsPlaying(false);
        setIsInactiveModalOpen(true);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isPlaying, pauseActiveEngine]);

  // Resume playback from inactivity modal
  const resumeFromInactivity = useCallback(() => {
    lastInteractionTimeRef.current = Date.now();
    setIsInactiveModalOpen(false);
    resumeActiveEngine();
    setIsPlaying(true);
  }, [resumeActiveEngine]);

  // Dismiss inactivity modal
  const dismissInactiveModal = useCallback(() => {
    lastInteractionTimeRef.current = Date.now();
    setIsInactiveModalOpen(false);
  }, []);

  // ── MediaSession: lock-screen & notification controls ────────────
  // Works for both engines; with the JioSaavn HTML5 audio engine this gives
  // real lock-screen play/pause/next/previous on Android & iOS.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    try {
      ms.setActionHandler('play', () => resumeActiveEngine());
      ms.setActionHandler('pause', () => pauseActiveEngine());
      ms.setActionHandler('previoustrack', () => prevSongRef.current?.());
      ms.setActionHandler('nexttrack', () => nextSongRef.current?.());
      ms.setActionHandler('seekto', (details) => {
        if (details && typeof details.seekTime === 'number') {
          seekToRef.current?.(details.seekTime);
        }
      });
      ms.setActionHandler('stop', () => pauseActiveEngine());
    } catch (e) {}
    return () => {
      try {
        ['play', 'pause', 'previoustrack', 'nexttrack', 'seekto', 'stop'].forEach(action => {
          ms.setActionHandler(action, null);
        });
      } catch (e) {}
    };
  }, [resumeActiveEngine, pauseActiveEngine]);

  useEffect(() => {
    if (!('mediaSession' in navigator) || typeof window.MediaMetadata === 'undefined') return;
    if (!currentSong) return;
    try {
      const artwork = currentSong.thumbnail ||
        (currentSong.videoId ? `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg` : '/images/freesonglogowebp.webp');
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentSong.title || 'FreeSong.in',
        artist: currentSong.artist || '',
        album: currentSong.album || 'FreeSong.in',
        artwork: [
          { src: artwork, sizes: '96x96', type: 'image/jpeg' },
          { src: artwork, sizes: '256x256', type: 'image/jpeg' },
          { src: artwork, sizes: '512x512', type: 'image/jpeg' }
        ]
      });
    } catch (e) {}
  }, [currentSong]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (e) {}
  }, [isPlaying]);

  // Memoized main context value: during the 500ms progress tick only
  // currentTime/duration change, so this object keeps a stable identity and
  // every consumer (pages, cards, shelves) skips re-rendering entirely.
  const contextValue = useMemo(() => ({
    currentSong,
    isPlaying,
    volume,
    isMuted,
    stableVolume,
    setStableVolume,
    queue,
    queueIndex,
    isShuffle,
    repeatMode,
    isFullScreen,
    isMiniPlayer,
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
    setIsMiniPlayer,
    toggleMiniPlayer,
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
  }), [
    currentSong,
    isPlaying,
    volume,
    isMuted,
    stableVolume,
    setStableVolume,
    queue,
    queueIndex,
    isShuffle,
    repeatMode,
    isFullScreen,
    isMiniPlayer,
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
    setIsMiniPlayer,
    toggleMiniPlayer,
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
  ]);

  const progressValue = {
    currentTime,
    duration,
    seekTo
  };

  return (
    <PlayerProgressContext.Provider value={progressValue}>
      <PlayerContext.Provider value={contextValue}>
        {children}
      </PlayerContext.Provider>
    </PlayerProgressContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

export function usePlayerProgress() {
  const context = useContext(PlayerProgressContext);
  if (!context) {
    throw new Error('usePlayerProgress must be used within a PlayerProvider');
  }
  return context;
}

// Context modules must never be hot-swapped: re-running this file would create
// a fresh PlayerContext object while the mounted tree still holds the old
// provider, making usePlayer() read an empty context and crash. Declining HMR
// makes Vite do a full page reload for any edit to this file instead.
if (import.meta.hot) {
  import.meta.hot.decline();
}
