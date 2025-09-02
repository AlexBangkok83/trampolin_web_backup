import { useEffect, useState, useCallback, useRef } from 'react';
import { ChartData, ChartDataset, Point } from 'chart.js';

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';

type DataPoint = number | [number, number] | Point | null;

export interface UseChartDataProps<T extends Record<string, unknown>, K extends ChartType> {
  // Either provide a data fetcher function or static data
  data?: T[];
  dataFetcher?: () => Promise<T[]> | T[];
  xField: keyof T;
  yField: keyof T;
  label?: string;
  type: K;
  refreshInterval?: number; // in seconds, 0 to disable
  autoRefresh?: boolean; // whether to auto-refresh on mount
  maxRetries?: number;
  retryDelay?: number; // in milliseconds
}

export type UseChartDataReturn<K extends ChartType> = {
  chartData: ChartData<K>;
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
  lastUpdated: Date | null;
  retryCount: number;
  isStale: boolean;
};

export function useChartData<T extends Record<string, unknown>, K extends ChartType = 'line'>({
  data: staticData,
  dataFetcher,
  xField,
  yField,
  label = 'Data',
  type = 'line' as K,
  refreshInterval = 0,
  autoRefresh = true,
  maxRetries = 3,
  retryDelay = 1000,
}: UseChartDataProps<T, K>): UseChartDataReturn<K> {
  const [state, setState] = useState({
    isLoading: true,
    error: null as Error | null,
    retryCount: 0,
    chartData: { labels: [], datasets: [] } as ChartData<K>,
    lastUpdated: null as Date | null,
  });
  const isMounted = useRef(true);
  const effectRan = useRef(false);

  // Calculate if data is stale (older than 10 minutes)
  const isStale = state.lastUpdated ? Date.now() - state.lastUpdated.getTime() > 600000 : true;

  // Process data and update chart
  const processData = useCallback(
    (data: T[]): ChartData<K> => {
      if (!data || data.length === 0) return { labels: [], datasets: [] };

      const labels = data.map((item) => item[xField]);
      const dataPoints = data.map((item) => item[yField]);

      return {
        labels,
        datasets: [
          {
            label,
            data: dataPoints as DataPoint[],
            backgroundColor: generateColors(data.length, type),
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            fill: false,
          },
        ] as unknown as ChartDataset<K>[],
      };
    },
    [xField, yField, label, type],
  );

  // Fetch data with retry logic
  const fetchData = useCallback(
    async (retryAttempt = 0) => {
      if (!dataFetcher) return;

      if (retryAttempt === 0) {
        setState((prevState) => ({ ...prevState, isLoading: true, error: null, retryCount: 0 }));
      }

      try {
        const result = await dataFetcher();
        if (isMounted.current) {
          const newChartData = processData(result);
          setState({
            isLoading: false,
            error: null,
            retryCount: 0,
            chartData: newChartData,
            lastUpdated: new Date(),
          });
        }
      } catch (err) {
        if (isMounted.current) {
          const error = err instanceof Error ? err : new Error('Failed to fetch chart data');
          setState((prevState) => ({ ...prevState, error, retryCount: retryAttempt + 1 }));

          if (retryAttempt < maxRetries) {
            const delay = retryDelay * Math.pow(2, retryAttempt);
            setTimeout(() => {
              if (isMounted.current) {
                fetchData(retryAttempt + 1);
              }
            }, delay);
          } else {
            setState((prevState) => ({ ...prevState, isLoading: false })); // Stop loading after all retries fail
          }
        }
      }
    },
    [dataFetcher, processData, maxRetries, retryDelay],
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

    // Prevent effect from running twice with React.StrictMode
    if (effectRan.current === false) {
      if (staticData) {
        const newChartData = processData(staticData);
        setState((prevState) => ({ ...prevState, chartData: newChartData, isLoading: false }));
      } else if (dataFetcher) {
        fetchData();
      }
    }

    // Set up auto-refresh if enabled
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh && refreshInterval > 0 && dataFetcher) {
      intervalId = setInterval(() => {
        fetchData();
      }, refreshInterval);
    }

    return () => {
      isMounted.current = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
      effectRan.current = true;
    };
  }, [autoRefresh, dataFetcher, fetchData, processData, refreshInterval, staticData]);

  return {
    ...state,
    isStale,
    refreshData,
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
