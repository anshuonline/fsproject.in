import { useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';

/**
 * SharedSongHandler
 * Listens for shared song URLs (e.g. `/?v=Ys6iPqfvmI0`, `/watch?v=...`, `/song/:id`)
 * and triggers immediate playback via PlayerContext.
 */
export function SharedSongHandler() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { playByVideoId, currentSong } = usePlayer();
  const lastHandledVideoIdRef = useRef(null);

  // Keep ?v= in the URL synced with the currently playing song (YT Music style),
  // so a reload restores the song. replaceState keeps history clean & avoids
  // re-triggering React Router.
  useEffect(() => {
    if (!currentSong?.videoId) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('v') === currentSong.videoId) return;
    params.set('v', currentSong.videoId);
    ['videoId', 'video', 'track'].forEach((key) => params.delete(key));
    const query = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
  }, [location.pathname, searchParams, currentSong?.videoId]);

  useEffect(() => {
    // 1. Check query parameters (?v=..., ?videoId=..., ?video=..., ?track=...)
    const queryVideoId =
      searchParams.get('v') ||
      searchParams.get('videoId') ||
      searchParams.get('video') ||
      searchParams.get('track');

    // 2. Check path parameters (/song/:id or /track/:id)
    let pathVideoId = null;
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (
      pathParts.length >= 2 &&
      (pathParts[0] === 'song' || pathParts[0] === 'track')
    ) {
      pathVideoId = pathParts[1];
    }

    const targetVideoId = queryVideoId || pathVideoId;

    if (!targetVideoId) return;

    const cleanVideoId = targetVideoId.trim();
    if (!cleanVideoId) return;

    // Prevent duplicate triggers for the same video ID
    if (lastHandledVideoIdRef.current === cleanVideoId) return;
    if (currentSong?.videoId === cleanVideoId) {
      lastHandledVideoIdRef.current = cleanVideoId;
      return;
    }

    lastHandledVideoIdRef.current = cleanVideoId;

    // Start playback
    if (typeof playByVideoId === 'function') {
      playByVideoId(cleanVideoId);
    }
  }, [location.pathname, searchParams, playByVideoId, currentSong?.videoId]);

  return null;
}
