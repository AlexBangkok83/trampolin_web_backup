import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface AnalyticsData {
  uploadsOverTime: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
  rowsOverTime: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
  fileSizeDistribution: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
    }>;
  };
  statusDistribution: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
    }>;
  };
}

export function useAnalyticsData() {
  const { data: session } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    if (!session) {
      setError(new Error('Not authenticated'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/analytics', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics data'));
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const refetch = () => {
    setError(null);
    fetchAnalyticsData();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}
