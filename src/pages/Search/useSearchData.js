import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { trackSearch } from '../../services/analyticsService';

export function useSearchData() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [filterType, setFilterType] = useState('all'); // all, song, album, playlist, artist
  const [results, setResults] = useState({ songs: [], albums: [], playlists: [], artists: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ songs: [], albums: [], playlists: [], artists: [] });
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    api.search(query, filterType, 24)
      .then(res => {
        if (isMounted) {
          setResults(res);
          setError(null);
          const total = (res.songs?.length || 0) + (res.albums?.length || 0) + (res.playlists?.length || 0) + (res.artists?.length || 0);
          trackSearch(query, total);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query, filterType]);

  return { query, filterType, setFilterType, results, loading, error };
}
