import { useEffect, useState, useCallback, useRef } from 'react';
import { ChartData, ChartDataset, Point } from 'chart.js';

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';

type DataPoint = number | [number, number] | Point | null;

type ChartDatasetWithType<T extends ChartType> = T extends 'line'
  ? ChartDataset<'line', DataPoint[]>
  : T extends 'bar'
    ? ChartDataset<'bar', DataPoint[]>
    : T extends 'pie'
      ? ChartDataset<'pie', number[]>
      : T extends 'doughnut'
        ? ChartDataset<'doughnut', number[]>
        : never;

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

interface UseChartDataReturn<T, K extends ChartType> {
  chartData: ChartData<K, DataPoint[], unknown> & { type?: K };
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useChartData<T extends Record<string, any>, K extends ChartType = 'line'>({
  data: staticData,
  dataFetcher,
  xField,
  yField,
  label = 'Data',
  type = 'line' as K,
  refreshInterval = 0,
  autoRefresh = true,
}: UseChartDataProps<T, K>): UseChartDataReturn<T, K> {
  const [chartData, setChartData] = useState<ChartData<K, DataPoint[], unknown>>({
    labels: [],
    datasets: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
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

      const dataPoints = values.map((value) => value);

      const backgroundColors = generateColors(labels.length, type);

      const baseDataset: ChartDatasetWithType<K> = {
        label,
        data:
          type === 'pie' || type === 'doughnut'
            ? values
            : values.map((value, index) => ({
                x: String(data[index][xField]),
                y: value,
              })),
        backgroundColor: backgroundColors,
        ...(type === 'line' || type === 'bar'
          ? {
              borderColor: 'rgba(59, 130, 246, 0.8)',
              borderWidth: 1,
            }
          : {}),
      } as unknown as ChartDatasetWithType<K>;

      const datasets = [baseDataset];

      setChartData({
        labels,
        datasets,
      });
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
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [dataFetcher, processData, isLoading]);

  // Manual refresh function
  const refreshData = useCallback(async () => {
    if (dataFetcher) {
      await fetchData();
    } else if (staticData) {
      processData(staticData);
    }
  }, [dataFetcher, fetchData, staticData, processData]);

  // Set up auto-refresh interval
  useEffect(() => {
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    // Set up new interval if refreshInterval is greater than 0
    if (refreshInterval > 0 && autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          refreshData();
        }
      }, refreshInterval * 1000);
    }

    // Initial data fetch if autoRefresh is true
    if (autoRefresh) {
      if (staticData) {
        processData(staticData);
      } else if (dataFetcher) {
        fetchData();
      }
    }

    // Cleanup function
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshInterval, autoRefresh, dataFetcher, fetchData, processData, staticData, refreshData]);

  // Process static data if provided
  useEffect(() => {
    if (staticData && !dataFetcher) {
      processData(staticData);
    }
  }, [staticData, dataFetcher, processData]);

  // Set up auto-refresh if enabled
  useEffect(() => {
    if (refreshInterval > 0 && autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        if (isMounted.current) {
          refreshData();
        }
      }, refreshInterval * 1000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [refreshInterval, autoRefresh, refreshData]);

  // Initial data load
  useEffect(() => {
    isMounted.current = true;

    if (staticData) {
      processData(staticData);
    } else if (dataFetcher && !staticData) {
      fetchData();
    }

    return () => {
      isMounted.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [dataFetcher, staticData, fetchData, processData]);

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
