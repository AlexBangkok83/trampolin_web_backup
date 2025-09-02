import { renderHook, act, waitFor } from '@testing-library/react';
import { useChartData, UseChartDataProps } from '../useChartData';

jest.useFakeTimers();

type MockData = { x: string; y: number };

describe('useChartData', () => {
  const mockDataFetcher = jest.fn();
  const initialProps: UseChartDataProps<MockData, 'line'> = {
    dataFetcher: mockDataFetcher,
    xField: 'x',
    yField: 'y',
    label: 'Test Data',
    type: 'line' as const,
    autoRefresh: false, // Disable auto-refresh for predictable tests
  };

  beforeEach(() => {
    mockDataFetcher.mockClear();
    jest.clearAllTimers();
  });

  it('should return correct initial state', () => {
    const { result } = renderHook(() => useChartData(initialProps));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
  });

  it('should fetch and process data successfully', async () => {
    const mockData = [
      { x: 'A', y: 10 },
      { x: 'B', y: 20 },
    ];
    mockDataFetcher.mockResolvedValue(mockData);

    const { result } = renderHook(() => useChartData(initialProps));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockDataFetcher).toHaveBeenCalledTimes(1);
    expect(result.current.chartData.labels).toEqual(['A', 'B']);
    expect(result.current.chartData.datasets[0].data).toEqual([10, 20]);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error and retry successfully', async () => {
    const error = new Error('Fetch failed');
    mockDataFetcher
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce([{ x: 'C', y: 30 }]);

    const { result } = renderHook(() =>
      useChartData({ ...initialProps, maxRetries: 2, retryDelay: 100 }),
    );

    // Wait for the first retry attempt
    await waitFor(() => expect(result.current.retryCount).toBe(1));
    expect(result.current.error).toEqual(error);

    // Advance timers to trigger the next retry, which should succeed
    act(() => {
      jest.runAllTimers();
    });

    // Wait for the hook to finish loading and for the error to be cleared
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.chartData.labels).toEqual(['C']);
    expect(result.current.retryCount).toBe(0);
    expect(mockDataFetcher).toHaveBeenCalledTimes(3);
  });

  it('should stop retrying after maxRetries', async () => {
    const error = new Error('Fetch failed consistently');
    mockDataFetcher.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useChartData({ ...initialProps, maxRetries: 1, retryDelay: 100 }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // The initial call + 1 retry = 2 calls.
    expect(mockDataFetcher).toHaveBeenCalledTimes(2);
    expect(result.current.error).toEqual(error);
    // The retryCount becomes 2 after the initial call (retryAttempt=0) and one retry (retryAttempt=1)
    expect(result.current.retryCount).toBe(2);

    // Ensure no more retries are attempted by advancing timers again
    act(() => {
      jest.runAllTimers();
    });

    // The number of calls should not increase
    expect(mockDataFetcher).toHaveBeenCalledTimes(2);
  });
});
