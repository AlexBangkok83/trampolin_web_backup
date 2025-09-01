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
  const isMounted = useRef(true);

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

  // Fetch data from the provided dataFetcher
  const fetchData = useCallback(async () => {
    if (!dataFetcher) return;

    if (isLoading) return; // Prevent concurrent fetches

    setIsLoading(true);
    setError(null);

    try {
      const result = await dataFetcher();
      if (isMounted.current) {
        processData(result);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch chart data'));
        // Don't throw error here to allow retry on next interval
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [dataFetcher, processData, isLoading]);

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
