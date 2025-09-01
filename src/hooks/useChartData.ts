import { useEffect, useState } from 'react';
import { ChartData } from 'chart.js';

type ChartDataType = 'line' | 'bar' | 'pie' | 'doughnut';

interface UseChartDataProps<T> {
  data: T[];
  xField: keyof T;
  yField: keyof T;
  label?: string;
  type?: ChartDataType;
}

export function useChartData<T>({
  data,
  xField,
  yField,
  label = 'Data',
  type = 'line',
}: UseChartDataProps<T>) {
  const [chartData, setChartData] = useState<ChartData<ChartDataType>>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    if (!data || data.length === 0) return;

    const labels = data.map((item) => String(item[xField]));
    const values = data.map((item) => {
      const value = Number(item[yField]);
      return isNaN(value) ? 0 : value;
    });

    // Generate colors based on chart type
    const backgroundColors = generateColors(values.length, type);

    const datasets = [
      {
        label,
        data: values,
        backgroundColor: backgroundColors,
        borderColor: type === 'line' || type === 'bar' ? '#3b82f6' : undefined,
        borderWidth: type === 'line' || type === 'bar' ? 2 : 1,
      },
    ];

    setChartData({
      labels,
      datasets,
    });
  }, [data, xField, yField, label, type]);

  return { chartData };
}

// Helper function to generate colors for charts
function generateColors(count: number, type: ChartDataType): string[] {
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
