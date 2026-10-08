import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { storage } from '../../services/storage';

export function useHomeData() {
  const [data, setData] = useState({
    sections: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeed = useCallback(async (customPrefs = null) => {
    try {
      setLoading(true);
      const prefs = customPrefs || storage.getPreferences();
      const history = storage.getHistory() || [];
      const res = await api.getHomeFeed(prefs, history);
      setData(res || { sections: [] });
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
