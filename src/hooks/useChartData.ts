import { useEffect, useState, useCallback, useRef } from 'react';
import { ChartData, ChartDataset, Point } from 'chart.js';

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';

type DataPoint = number | [number, number] | Point | null;

interface UseChartDataProps<T extends Record<string, unknown>, K extends ChartType> {
  // Either provide a data fetcher function or static data
  data?: T[];
  dataFetcher?: () => Promise<T[]> | T[];
  xField: keyof T;
  yField: keyof T;
  label?: string;
  type: K;
  refreshInterval?: number; // in seconds, 0 to disable
  autoRefresh?: boolean; // whether to auto-refresh on mount
}

interface UseChartDataReturn<K extends ChartType> {
  chartData: ChartData<K>;
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
  lastUpdated: Date | null;
  retryCount: number;
  isStale: boolean;
}

export function useChartData<T extends Record<string, unknown>, K extends ChartType = 'line'>({
  data: staticData,
  dataFetcher,
  xField,
  yField,
  label = 'Data',
  type = 'line' as K,
  refreshInterval = 0,
  autoRefresh = true,
}: UseChartDataProps<T, K>): UseChartDataReturn<K> {
  const [chartData, setChartData] = useState<ChartData<K>>({
    labels: [],
    datasets: [],
  } as ChartData<K>);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const isMounted = useRef(true);
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  // Calculate if data is stale (older than 10 minutes)
  const isStale = lastUpdated ? Date.now() - lastUpdated.getTime() > 600000 : true;

  // Process data and update chart
  const processData = useCallback(
    (data: T[]) => {
      if (!data || data.length === 0) return;

      const labels = data.map((item) => String(item[xField]));
      const values = data.map((item) => {
        const value = Number(item[yField]);
        return isNaN(value) ? 0 : value;
      });

      const backgroundColors = generateColors(labels.length, type);

      const baseDataset: ChartDataset = {
        type,
        label,
        data: values,
        backgroundColor: backgroundColors,
        ...(type === 'line' || type === 'bar'
          ? {
              borderColor: 'rgba(59, 130, 246, 0.8)',
              borderWidth: 1,
            }
          : {}),
      };

      setChartData({
        labels,
        datasets: [baseDataset as ChartDataset<K, DataPoint>],
      } as ChartData<K>);
      setLastUpdated(new Date());
    },
    [xField, yField, label, type],
  );

  // Fetch data with retry logic
  const fetchData = useCallback(
    async (retryAttempt = 0) => {
      if (!dataFetcher) return;

      if (isLoading && retryAttempt === 0) return; // Prevent concurrent fetches on initial call

      setIsLoading(true);
      if (retryAttempt === 0) {
        setError(null);
        setRetryCount(0);
      }

      try {
        const result = await dataFetcher();
        if (isMounted.current) {
          processData(result);
          setRetryCount(0); // Reset retry count on success
        }
      } catch (err) {
        if (isMounted.current) {
          const error = err instanceof Error ? err : new Error('Failed to fetch chart data');
          setError(error);
          setRetryCount(retryAttempt + 1);

          // Retry logic with exponential backoff
          if (retryAttempt < maxRetries) {
            const delay = retryDelay * Math.pow(2, retryAttempt);
            setTimeout(() => {
              if (isMounted.current) {
                fetchData(retryAttempt + 1);
              }
            }, delay);
          }
        }
      } finally {
        if (isMounted.current && retryAttempt === 0) {
          setIsLoading(false);
        }
      }
    },
    [dataFetcher, processData, isLoading, maxRetries, retryDelay],
  );

  // Manual refresh function exposed to consumers
  const refreshData = useCallback(async () => {
    if (dataFetcher) {
      await fetchData();
    }
  }, [dataFetcher, fetchData]);

  // Initial data load
  useEffect(() => {
    isMounted.current = true;

    const loadInitialData = async () => {
      if (staticData) {
        processData(staticData);
      } else if (dataFetcher) {
        await fetchData();
      }
    };

    if (autoRefresh) {
      loadInitialData();
    }

    // Set up refresh interval if enabled
    let intervalId: NodeJS.Timeout;
    if (refreshInterval > 0 && autoRefresh) {
      intervalId = setInterval(fetchData, refreshInterval * 1000);
    }

    return () => {
      isMounted.current = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchData, processData, refreshInterval, staticData, autoRefresh, dataFetcher]);

  return {
    chartData,
    isLoading,
    error,
    refreshData,
    lastUpdated,
    retryCount,
    isStale,
  };
}

// Helper function to generate colors for charts
function generateColors(count: number, type: ChartType): string[] {
  if (type === 'line' || type === 'bar') {
    // Single color for line/bar charts
    return Array(count).fill('rgba(59, 130, 246, 0.5)');
  }

  // Multiple colors for pie/doughnut charts
  const colors = [
    'rgba(59, 130, 246, 0.7)', // blue
    'rgba(16, 185, 129, 0.7)', // green
    'rgba(245, 158, 11, 0.7)', // yellow
    'rgba(239, 68, 68, 0.7)', // red
    'rgba(139, 92, 246, 0.7)', // purple
    'rgba(20, 184, 166, 0.7)', // teal
    'rgba(249, 115, 22, 0.7)', // orange
    'rgba(236, 72, 153, 0.7)', // pink
  ];

  return Array(count)
    .fill('')
    .map((_, i) => colors[i % colors.length]);
}
