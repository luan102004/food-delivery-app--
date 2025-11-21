import { useEffect, useState } from 'react';

export function useRealtime<T>(endpoint: string, interval: number = 5000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const result = await response.json();
        
        if (isMounted) {
          setData(result.data || result);
          setError(null);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
      
      if (isMounted) {
        timeoutId = setTimeout(fetchData, interval);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [endpoint, interval]);

  return { data, loading, error };
}