import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export function useHomeData() {
  const [data, setData] = useState({
    community: [],
    library: [],
    quickPicks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const res = await api.getHomeFeed();
        if (isMounted) {
          setData(res);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Home data load failed:', err);
          setError(err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}
