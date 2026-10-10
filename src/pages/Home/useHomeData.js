import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { storage } from '../../services/storage';

// In-memory feed cache: revisiting Home re-renders instantly from cache and
// only refetches when the cache is older than 5 minutes (or forced by prefs).
const FEED_CACHE_TTL = 5 * 60 * 1000;
let feedCache = null; // { data, timestamp }

export function useHomeData() {
  const [data, setData] = useState(() => feedCache?.data || { sections: [] });
  const [loading, setLoading] = useState(() => !feedCache);
  const [error, setError] = useState(null);

  const fetchFeed = useCallback(async (customPrefs = null, force = false) => {
    const prefs = customPrefs || storage.getPreferences();
    const history = storage.getHistory() || [];
    const likes = storage.getLikedSongs() || [];
    const cacheKey = JSON.stringify({ prefs, likesCount: likes.length });

    // Serve fresh cache instantly (skip network) unless forced or expired
    if (
      !force &&
      feedCache &&
      feedCache.key === cacheKey &&
      Date.now() - feedCache.timestamp < FEED_CACHE_TTL
    ) {
      setData(feedCache.data);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      const user = storage.getUser() || null;
      const res = await api.getHomeFeed(prefs, history, likes, user);
      const nextData = res || { sections: [] };
      feedCache = { data: nextData, timestamp: Date.now(), key: cacheKey };
      setData(nextData);
      setError(null);
    } catch (err) {
      console.error('Home feed fetch failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return { data, loading, error, refetch: fetchFeed };
}
